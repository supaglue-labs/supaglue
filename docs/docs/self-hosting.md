# Self hosting

## docker compose-based AWS deployment

**IMPORTANT NOTE:** This is very insecure and should only be used for POCs.

For more advanced configuration, such as attaching to an existing load balancer, a custom VPC, and the like, modify the `docker-compose-aws.yml` file per the [docker compose ecs integration docs](https://docs.docker.com/cloud/ecs-integration/).

### Prerequisites

1. Install Docker Desktop:
    - [Mac](https://docs.docker.com/desktop/install/mac-install/)
    - [Windows](https://docs.docker.com/desktop/install/windows-install/)
    - [Linux](https://docs.docker.com/desktop/install/linux-install/)
1. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
1. Install [jq](https://stedolan.github.io/jq/download/)

### Deploying

1. Set up the repo and a docker context to talk to AWS:

    ```shell
    git clone -b v0.3.3 https://github.com/supaglue-labs/supaglue.git && cd supaglue
    ./scripts/create_quickstart_env.sh
    docker context create ecs ecscontext
    ```

1. Create a certificate in AWS ACM for the hostname where you want to host the supaglue API and copy the ARN:

    ```shell
    aws acm request-certificate --domain-name your.hostname.here --validation-method DNS
    ```

1. Validate your domain for the certificate by following this [guide](https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html#setting-up-dns-validation).

1. Append the following config to your `.env`:

    ```env
    SUPAGLUE_API_CERTIFICATE_ARN=certificate-arn-here
    SUPERGRAIN_SERVER_URL=https://your.hostname.here
    ```

1. Deploy the stack using `docker compose`:

   ```shell
   docker --context ecscontext compose --file docker-compose.yml --file docker-compose-aws.yml up
   ```

1. Find the domain name for the load balancer that was created:

    ```shell
    docker --context myecscontext compose --file docker-compose.yml --file docker-compose-aws.yml ps --format json | jq -r 'map(select(.Service=="api"))[0].Publishers[0].URL' | cut -d ':' -f1
    ```

1. Add a CNAME record for your hostname to point to the load balancer domain name in route53:

    ```shell
    aws route53 change-resource-record-sets --hosted-zone-id your-hosted-zone-id-here --change-batch file://- <<EOF
    {
      "Comment": "Add CNAME for supaglue",
      "Changes": [
        {
          "Action": "CREATE",
          "ResourceRecordSet": {
            "Name": "your.hostname.here",
            "Type": "CNAME",
            "TTL": 300,
            "ResourceRecords": [
              {
                "Value": "load-balancer-domain-name-here"
              }
            ]
          }
        }
      ]
    }
   ```
