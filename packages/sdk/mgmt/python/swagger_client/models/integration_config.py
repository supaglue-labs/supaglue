# coding: utf-8

"""
    Supaglue Management API

    # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ```   # noqa: E501

    OpenAPI spec version: 0.4.1
    Contact: docs@supaglue.com
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

import pprint
import re  # noqa: F401

import six

class IntegrationConfig(object):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    """
    Attributes:
      swagger_types (dict): The key is attribute name
                            and the value is attribute type.
      attribute_map (dict): The key is attribute name
                            and the value is json key in definition.
    """
    swagger_types = {
        'provider_app_id': 'object',
        'oauth': 'IntegrationConfigOauth',
        'sync': 'IntegrationConfigSync'
    }

    attribute_map = {
        'provider_app_id': 'provider_app_id',
        'oauth': 'oauth',
        'sync': 'sync'
    }

    def __init__(self, provider_app_id=None, oauth=None, sync=None):  # noqa: E501
        """IntegrationConfig - a model defined in Swagger"""  # noqa: E501
        self._provider_app_id = None
        self._oauth = None
        self._sync = None
        self.discriminator = None
        self.provider_app_id = provider_app_id
        self.oauth = oauth
        self.sync = sync

    @property
    def provider_app_id(self):
        """Gets the provider_app_id of this IntegrationConfig.  # noqa: E501


        :return: The provider_app_id of this IntegrationConfig.  # noqa: E501
        :rtype: object
        """
        return self._provider_app_id

    @provider_app_id.setter
    def provider_app_id(self, provider_app_id):
        """Sets the provider_app_id of this IntegrationConfig.


        :param provider_app_id: The provider_app_id of this IntegrationConfig.  # noqa: E501
        :type: object
        """
        if provider_app_id is None:
            raise ValueError("Invalid value for `provider_app_id`, must not be `None`")  # noqa: E501

        self._provider_app_id = provider_app_id

    @property
    def oauth(self):
        """Gets the oauth of this IntegrationConfig.  # noqa: E501


        :return: The oauth of this IntegrationConfig.  # noqa: E501
        :rtype: IntegrationConfigOauth
        """
        return self._oauth

    @oauth.setter
    def oauth(self, oauth):
        """Sets the oauth of this IntegrationConfig.


        :param oauth: The oauth of this IntegrationConfig.  # noqa: E501
        :type: IntegrationConfigOauth
        """
        if oauth is None:
            raise ValueError("Invalid value for `oauth`, must not be `None`")  # noqa: E501

        self._oauth = oauth

    @property
    def sync(self):
        """Gets the sync of this IntegrationConfig.  # noqa: E501


        :return: The sync of this IntegrationConfig.  # noqa: E501
        :rtype: IntegrationConfigSync
        """
        return self._sync

    @sync.setter
    def sync(self, sync):
        """Sets the sync of this IntegrationConfig.


        :param sync: The sync of this IntegrationConfig.  # noqa: E501
        :type: IntegrationConfigSync
        """
        if sync is None:
            raise ValueError("Invalid value for `sync`, must not be `None`")  # noqa: E501

        self._sync = sync

    def to_dict(self):
        """Returns the model properties as a dict"""
        result = {}

        for attr, _ in six.iteritems(self.swagger_types):
            value = getattr(self, attr)
            if isinstance(value, list):
                result[attr] = list(map(
                    lambda x: x.to_dict() if hasattr(x, "to_dict") else x,
                    value
                ))
            elif hasattr(value, "to_dict"):
                result[attr] = value.to_dict()
            elif isinstance(value, dict):
                result[attr] = dict(map(
                    lambda item: (item[0], item[1].to_dict())
                    if hasattr(item[1], "to_dict") else item,
                    value.items()
                ))
            else:
                result[attr] = value
        if issubclass(IntegrationConfig, dict):
            for key, value in self.items():
                result[key] = value

        return result

    def to_str(self):
        """Returns the string representation of the model"""
        return pprint.pformat(self.to_dict())

    def __repr__(self):
        """For `print` and `pprint`"""
        return self.to_str()

    def __eq__(self, other):
        """Returns true if both objects are equal"""
        if not isinstance(other, IntegrationConfig):
            return False

        return self.__dict__ == other.__dict__

    def __ne__(self, other):
        """Returns true if both objects are not equal"""
        return not self == other
