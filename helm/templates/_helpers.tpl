{{/* vim: set filetype=mustache: */}}
{{- define "supaglue.name" -}}
{{- template "common.names.name" . -}}
{{- end -}}

{{- define "supaglue.chart" -}}
{{- template "common.names.chart" . -}}
{{- end -}}

{{- define "supaglue.fullname" -}}
{{- template "common.names.fullname" . -}}
{{- end -}}

{{/*
Create the name of the service account
*/}}
{{- define "supaglue.serviceAccountName" -}}
{{ default (include "supaglue.fullname" .) .Values.serviceAccount.name }}
{{- end -}}

{{/*
Define the service account as needed
*/}}
{{- define "supaglue.serviceAccount" -}}
{{- if .Values.serviceAccount.create -}}
serviceAccountName: {{ include "supaglue.serviceAccountName" . }}
{{- end -}}
{{- end -}}

{{/*
Create a default fully qualified component name from the full app name and a component name.
We truncate the full name at 63 - 1 (last dash) - len(component name) chars because some Kubernetes name fields are limited to this (by the DNS naming spec)
and we want to make sure that the component is included in the name.
*/}}
{{- define "supaglue.componentname" -}}
{{- $global := index . 0 -}}
{{- $component := index . 1 | trimPrefix "-" -}}
{{- printf "%s-%s" (include "supaglue.fullname" $global | trunc (sub 62 (len $component) | int) | trimSuffix "-" ) $component | trimSuffix "-" -}}
{{- end -}}

{{- define "supaglue.databaseName" -}}
{{- template "postgresql.database" .Subcharts.postgresql -}}
{{- end -}}

{{- define "supaglue.databaseUsername" -}}
{{- template "postgresql.username" .Subcharts.postgresql -}}
{{- end -}}

# the postgresql chart doesn't have a template to get this easily, so just fetch from the values
{{- define "supaglue.databasePassword" -}}
{{- required "A value for global.postgres.auth.password must be set." .Values.global.postgresql.auth.password -}}
{{- end -}}

# TODO we should also allow this to be configured in values
{{- define "supaglue.databasePort" -}}
{{- template "postgresql.service.port" .Subcharts.postgresql -}}
{{- end -}}

# TODO we should also allow this to be configured in values
{{- define "supaglue.databaseHost" -}}
{{- printf "%s-postgresql.%s.svc.cluster.local" .Chart.Name $.Release.Namespace -}}
{{- end -}}

# TODO we should also allow this to be configured in values
{{- define "supaglue.temporalPort" -}}
{{- template "temporal.frontend.grpcPort" .Subcharts.temporal -}}
{{- end -}}

# TODO we should also allow this to be configured in values
{{- define "supaglue.temporalHost" -}}
{{- printf "%s-temporal-frontend.%s.svc.cluster.local" .Chart.Name $.Release.Namespace -}}
{{- end -}}

{{- define "supaglue.databaseUrl" -}}
{{- $database := include "supaglue.databaseName" . -}}
{{- $username := include "supaglue.databaseUsername" . -}}
{{- $password := include "supaglue.databasePassword" . -}}
{{- $host := include "supaglue.databaseHost" . -}}
{{- $port := include "supaglue.databasePort" . -}}
{{- printf "postgres://%s:%s@%s:%s/%s" $username $password $host $port $database -}}
{{- end -}}

{{- define "supaglue.secretName" -}}
{{- if .Values.existingSecret -}}
    {{- printf "%s" (tpl .Values.existingSecret $) -}}
{{- else -}}
    {{- print "supaglue-secret" -}}
{{- end -}}
{{- end -}}

{{- define "supaglue.deploymentId" -}}
{{- required "A value for deploymentId must be set." .Values.deploymentId -}}
{{- end -}}
