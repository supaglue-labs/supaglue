# coding: utf-8

"""
    Supaglue Customer API

    # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ```   # noqa: E501

    OpenAPI spec version: 0.3.3
    Contact: docs@supaglue.com
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

from __future__ import absolute_import

import unittest

import swagger_client
from swagger_client.api.integrations_api import IntegrationsApi  # noqa: E501
from swagger_client.rest import ApiException


class TestIntegrationsApi(unittest.TestCase):
    """IntegrationsApi unit test stubs"""

    def setUp(self):
        self.api = IntegrationsApi()  # noqa: E501

    def tearDown(self):
        pass

    def test_create_integration(self):
        """Test case for create_integration

        Create integration  # noqa: E501
        """
        pass

    def test_delete_integration(self):
        """Test case for delete_integration

        Delete integration  # noqa: E501
        """
        pass

    def test_get_integration(self):
        """Test case for get_integration

        Get integration  # noqa: E501
        """
        pass

    def test_get_integrations(self):
        """Test case for get_integrations

        List integrations  # noqa: E501
        """
        pass

    def test_update_integration(self):
        """Test case for update_integration

        Update integration  # noqa: E501
        """
        pass


if __name__ == '__main__':
    unittest.main()
