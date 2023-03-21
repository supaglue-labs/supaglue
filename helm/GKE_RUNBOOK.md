# GKE Runbook

## Prerequisites

Install kubectl, watch, gcloud cli, helm

```shell
brew install kubectl watch helm
brew install --cask google-cloud-sdk
```

Set up a GKE cluster in your region using the console

Set up your environment variables:

```shell
export DEPLOYMENT_ID=<a unique id for this deployment, usually your company name>
export PROJECT_ID=<your GCS project id>
export REGION=<your region>
export CLUSTER_NAME=<your GKE cluster>
export API_HOST=supaglue-api.<your domain>
export MANAGEMENT_HOST=supaglue-management.<your domain>
export OAUTH_RETURN_URL=<the url you want users to return to by default after auth (usually your app)>
export POSTGRES_PASSWORD=<a strong password for the postgres database>
```

Get your kubeconfig

```shell
gcloud auth login
gcloud components install gke-gcloud-auth-plugin
gcloud config set project $PROJECT_ID
gcloud container clusters get-credentials --region $REGION $CLUSTER_NAME
```

Set up a static IP address for the load balancer

```shell
gcloud compute addresses create supaglue-lb --global
```

Get the IP address

```shell
gcloud compute addresses describe supaglue-lb --global --format="value(address)"
```

And add it to your DNS records as an A record:

```dns
$API_HOST. 300 IN A <ip address>
$MANAGEMENT_HOST. 300 IN A <ip address>
```

Install the helm chart

```shell
helm upgrade --install --namespace supaglue --create-namespace \
  --timeout 15m0s \
  supaglue ./helm \
  --set "ingress.annotations.kubernetes\\.io/ingress\\.global-static-ip-name=supaglue-lb" \
  --set "ingress.annotations.kubernetes\\.io/ingress\\.class=gce" \
  --set "api.ingressHosts={$API_HOST}" \
  --set "management.ingressHosts={$MANAGEMENT_HOST}" \
  --set "managedCertificate.enabled=true" \
  --set "api.serverUrl=https://$API_HOST" \
  --set management.frontendUrl=https://$MANAGEMENT_HOST \
  --set api.corsOrigin=https://$MANAGEMENT_HOST \
  --set "temporal.cassandra.resources.requests.cpu=2" \
  --set "temporal.cassandra.resources.requests.memory=4Gi" \
  --set "temporal.cassandra.resources.limits.cpu=2" \
  --set "temporal.cassandra.resources.limits.memory=4Gi" \
  --set "temporal.cassandra.config.max_heap_size=2G" \
  --set "temporal.cassandra.config.heap_new_size=400M" \
  --set "global.postgresql.auth.password=$POSTGRES_PASSWORD" \
  --set api.oauthReturnUrl=$OAUTH_RETURN_URL \
  --set "deploymentId=$DEPLOYMENT_ID"
```

Monitor the deployment:

```shell
watch kubectl get pods -n supaglue
```

Once the `supaglue-api-*` pods are in `Running` state and `Ready 1/1`, wait about 5 minutes for the load balancer to be ready.

Then you can check the health of the API via HTTP:

```shell
curl http://$API_HOST/health
```

Monitor the status of the managed certificate

```shell
watch kubectl get managedcertificate supaglue-api-cert -n supaglue -o jsonpath='{.status.certificateStatus}'
```

When it is `Active`, you can disable HTTP traffic (this can take a few minutes to take effect):

```shell
helm upgrade --namespace supaglue \
  supaglue ./helm \
  --reuse-values \
  --set-string "ingress.annotations.kubernetes\\.io/ingress\\.allow-http=false"
```

Create a new connected app with `https://$API_HOST/oauth/callback` as the callback URL.

Update the salesforce integration config via postman UI.

Get your admin password:

```shell
echo $(kubectl get secret supaglue-secret -n supaglue -o jsonpath='{.data.admin-password}' | base64 --decode)
```

Log into the management UI at `https://$MANAGEMENT_HOST` with the 'admin' user and  password from above.

Create a test customer using postman.

Go to
<https://$API_HOST/oauth/connect?applicationId=a4398523-03a2-42dd-9681-c91e3e2efaf4&customerId=external-customer-hubspot&returnUrl=https://$MANAGEMENT_HOST>

## Upgrading

### Upgrading to 0.5.x

We have some backward-incompatible changes in 0.5.x. You will need to run the following process to upgrade.

```shell
kubectl port-forward deployment/supaglue-temporal-web 8080:8080 -n supaglue
```

Log into <http://localhost:8080/> and terminate any running workflows.

ctrl-C to kill the port-forward process.

```shell
brew install postgresql
kubectl port-forward statefulset/supaglue-postgresql 5432:5432 -n supaglue
```

Then in a new terminal:

```shell
export PGPASSWORD=$(kubectl get secrets supaglue-postgresql -n supaglue -o jsonpath='{.data.password}' | base64 --decode)
psql -U supaglue -d supaglue -h localhost -c "TRUNCATE customers CASCADE;"
```

This will remove all your customers from the system, so be sure to re-add them after the upgrade.

Then follow the standard upgrade process below.

### Standard upgrade process

Pull the latest `supaglue` repo:

```shell
git pull
```

Then deploy the latest helm chart:

```shell
helm upgrade --namespace supaglue \
  supaglue ./helm \
  --reuse-values
```
