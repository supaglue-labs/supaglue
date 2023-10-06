#!/bin/bash

check_checkly_checks() {
    eval $(op signin --account supaglue.1password.com)
    CHECKLY_API_KEY=$(op read op://engineering/2zhaab3p357nz7jtp5efssb6ce/credential)
    CHECKLY_ACCOUNT_ID=$(op read op://engineering/2zhaab3p357nz7jtp5efssb6ce/username)

    # get ids of checkly checks that should be successful
    PAGE=1
    CHECKLY_CHECKS=()
    while true; do
        CHECKS=$(curl -s -H "Authorization: Bearer $CHECKLY_API_KEY" -H "X-Checkly-Account: $CHECKLY_ACCOUNT_ID" "https://api.checklyhq.com/v1/checks?limit=100&page=${PAGE}" | jq -r '.[] | select((.tags[]? | contains("staging")) and (.activated == true) and (.muted == false) and (.shouldFail == false)) | .id')
        if [ "$CHECKS" == "" ]; then
            break
        fi
        PAGE=$((PAGE+1))
        CHECKLY_CHECKS+=($CHECKS)
    done

    # get ids of checkly checks that are failing
    FAILING_CHECKS=$(curl -s -H "Authorization: Bearer $CHECKLY_API_KEY" -H "X-Checkly-Account: $CHECKLY_ACCOUNT_ID" https://api.checklyhq.com/v1/check-statuses | jq -rc '.[] | select(.hasFailures == true)')

    FAILING_CHECK_OUTPUT=""

    if [ -n "$FAILING_CHECKS" ]; then
        while read -r FAILING_CHECK; do
            CHECK_ID=($(echo $FAILING_CHECK | jq -r '.checkId'))
            if [[ " ${CHECKLY_CHECKS[@]} " =~ " ${CHECK_ID} " ]]; then
                FAILING_CHECK_OUTPUT+="* $(echo "$FAILING_CHECK" | jq -r .name)"$'\n'
            fi
        done <<< "$FAILING_CHECKS"
    fi

    if [ -n "$FAILING_CHECK_OUTPUT" ]; then
        echo
        echo "Failing staging Checkly checks found:"
        echo "$FAILING_CHECK_OUTPUT"
        echo "Aborting release due to failing staging Checkly checks."
        exit 1
    fi
}

check_github_checks() {
    # get the latest run of the workflow that deploys and runs integration tests in staging
    LATEST_RUN=$(curl -L -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" https://api.github.com/repos/supaglue-labs/supaglue/actions/workflows/api_build_docker.yml/runs | jq -rc '.workflow_runs | map(select(.head_branch == "main")) | .[0]')

    # extract the conclussion and url
    CONCLUSION=$(echo "$LATEST_RUN" | jq -r '.conclusion')
    URL=$(echo "$LATEST_RUN" | jq -r '.html_url')

    # if the conclusion is not success, then fail
    if [ "$CONCLUSION" != "success" ]; then
        echo "Latest integration tests failing in staging. Aborting release."
        echo "Latest run: $URL"
        exit 1
    fi
}
