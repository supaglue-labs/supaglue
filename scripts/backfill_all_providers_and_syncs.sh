BASE_URL=https://api.supaglue.io
SG_INTERNAL_TOKEN='FILL HERE'
APPLICATION_AND_ORG_IDS_CSV='FILL HERE'


while IFS=',' read -r applicationId orgId
do
  echo "Processing applicationId $applicationId"
  echo "Processing orgId $orgId"

  curl -X POST "$BASE_URL/internal/providers/_backfill" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -H "x-sg-internal-token: $SG_INTERNAL_TOKEN" \
    -H "x-application-id: $applicationId" \
    -H "x-org-id: $orgId";

    fetch_all_fields_into_raw=true
    if [[ orgId == "org_2PqRYfRWiUfRa2A1SfPbw0cvnxy" ]]
    then
      $fetch_all_fields_into_raw=false
    fi
  curl -X POST "$BASE_URL/internal/sync_configs/_backfill" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -H "x-sg-internal-token: $SG_INTERNAL_TOKEN" \
    -H "x-application-id: $applicationId" \
    -H "x-org-id: $orgId" \
    -d '{"fetch_all_fields_into_raw": '$fetch_all_fields_into_raw'}';
done < $APPLICATION_AND_ORG_IDS_CSV
