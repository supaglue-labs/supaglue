# coding: utf-8

# flake8: noqa

"""
    Supaglue Management API

    # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ```   # noqa: E501

    OpenAPI spec version: 0.6.0
    Contact: docs@supaglue.com
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

from __future__ import absolute_import

# import apis into sdk package
from swagger_client.api.connections_api import ConnectionsApi
from swagger_client.api.customers_api import CustomersApi
from swagger_client.api.integrations_api import IntegrationsApi
from swagger_client.api.sync_api import SyncApi
from swagger_client.api.webhook_api import WebhookApi
# import ApiClient
from swagger_client.api_client import ApiClient
from swagger_client.configuration import Configuration
# import models into sdk package
from swagger_client.models.category import Category
from swagger_client.models.connection import Connection
from swagger_client.models.create_update_customer import CreateUpdateCustomer
from swagger_client.models.create_update_integration import CreateUpdateIntegration
from swagger_client.models.customer import Customer
from swagger_client.models.integration import Integration
from swagger_client.models.integration_config import IntegrationConfig
from swagger_client.models.integration_config_oauth import IntegrationConfigOauth
from swagger_client.models.integration_config_oauth_credentials import IntegrationConfigOauthCredentials
from swagger_client.models.integration_config_sync import IntegrationConfigSync
from swagger_client.models.provider_name import ProviderName
from swagger_client.models.sync_history import SyncHistory
from swagger_client.models.sync_info import SyncInfo
from swagger_client.models.webhook import Webhook
from swagger_client.models.webhook_payload import WebhookPayload
