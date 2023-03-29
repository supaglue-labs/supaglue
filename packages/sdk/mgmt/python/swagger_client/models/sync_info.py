# coding: utf-8

"""
    Supaglue Management API

    # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ```   # noqa: E501

    OpenAPI spec version: 0.6.0
    Contact: docs@supaglue.com
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

import pprint
import re  # noqa: F401

import six

class SyncInfo(object):
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
        'model_name': 'object',
        'last_sync_start': 'object',
        'next_sync_start': 'object',
        'status': 'object',
        'application_id': 'object',
        'customer_id': 'object',
        'provider_name': 'object',
        'category': 'object',
        'connection_id': 'object'
    }

    attribute_map = {
        'model_name': 'model_name',
        'last_sync_start': 'last_sync_start',
        'next_sync_start': 'next_sync_start',
        'status': 'status',
        'application_id': 'application_id',
        'customer_id': 'customer_id',
        'provider_name': 'provider_name',
        'category': 'category',
        'connection_id': 'connection_id'
    }

    def __init__(self, model_name=None, last_sync_start=None, next_sync_start=None, status=None, application_id=None, customer_id=None, provider_name=None, category=None, connection_id=None):  # noqa: E501
        """SyncInfo - a model defined in Swagger"""  # noqa: E501
        self._model_name = None
        self._last_sync_start = None
        self._next_sync_start = None
        self._status = None
        self._application_id = None
        self._customer_id = None
        self._provider_name = None
        self._category = None
        self._connection_id = None
        self.discriminator = None
        self.model_name = model_name
        self.last_sync_start = last_sync_start
        self.next_sync_start = next_sync_start
        self.status = status
        self.application_id = application_id
        self.customer_id = customer_id
        self.provider_name = provider_name
        self.category = category
        self.connection_id = connection_id

    @property
    def model_name(self):
        """Gets the model_name of this SyncInfo.  # noqa: E501


        :return: The model_name of this SyncInfo.  # noqa: E501
        :rtype: object
        """
        return self._model_name

    @model_name.setter
    def model_name(self, model_name):
        """Sets the model_name of this SyncInfo.


        :param model_name: The model_name of this SyncInfo.  # noqa: E501
        :type: object
        """
        if model_name is None:
            raise ValueError("Invalid value for `model_name`, must not be `None`")  # noqa: E501

        self._model_name = model_name

    @property
    def last_sync_start(self):
        """Gets the last_sync_start of this SyncInfo.  # noqa: E501


        :return: The last_sync_start of this SyncInfo.  # noqa: E501
        :rtype: object
        """
        return self._last_sync_start

    @last_sync_start.setter
    def last_sync_start(self, last_sync_start):
        """Sets the last_sync_start of this SyncInfo.


        :param last_sync_start: The last_sync_start of this SyncInfo.  # noqa: E501
        :type: object
        """
        if last_sync_start is None:
            raise ValueError("Invalid value for `last_sync_start`, must not be `None`")  # noqa: E501

        self._last_sync_start = last_sync_start

    @property
    def next_sync_start(self):
        """Gets the next_sync_start of this SyncInfo.  # noqa: E501


        :return: The next_sync_start of this SyncInfo.  # noqa: E501
        :rtype: object
        """
        return self._next_sync_start

    @next_sync_start.setter
    def next_sync_start(self, next_sync_start):
        """Sets the next_sync_start of this SyncInfo.


        :param next_sync_start: The next_sync_start of this SyncInfo.  # noqa: E501
        :type: object
        """
        if next_sync_start is None:
            raise ValueError("Invalid value for `next_sync_start`, must not be `None`")  # noqa: E501

        self._next_sync_start = next_sync_start

    @property
    def status(self):
        """Gets the status of this SyncInfo.  # noqa: E501


        :return: The status of this SyncInfo.  # noqa: E501
        :rtype: object
        """
        return self._status

    @status.setter
    def status(self, status):
        """Sets the status of this SyncInfo.


        :param status: The status of this SyncInfo.  # noqa: E501
        :type: object
        """
        if status is None:
            raise ValueError("Invalid value for `status`, must not be `None`")  # noqa: E501

        self._status = status

    @property
    def application_id(self):
        """Gets the application_id of this SyncInfo.  # noqa: E501


        :return: The application_id of this SyncInfo.  # noqa: E501
        :rtype: object
        """
        return self._application_id

    @application_id.setter
    def application_id(self, application_id):
        """Sets the application_id of this SyncInfo.


        :param application_id: The application_id of this SyncInfo.  # noqa: E501
        :type: object
        """
        if application_id is None:
            raise ValueError("Invalid value for `application_id`, must not be `None`")  # noqa: E501

        self._application_id = application_id

    @property
    def customer_id(self):
        """Gets the customer_id of this SyncInfo.  # noqa: E501


        :return: The customer_id of this SyncInfo.  # noqa: E501
        :rtype: object
        """
        return self._customer_id

    @customer_id.setter
    def customer_id(self, customer_id):
        """Sets the customer_id of this SyncInfo.


        :param customer_id: The customer_id of this SyncInfo.  # noqa: E501
        :type: object
        """
        if customer_id is None:
            raise ValueError("Invalid value for `customer_id`, must not be `None`")  # noqa: E501

        self._customer_id = customer_id

    @property
    def provider_name(self):
        """Gets the provider_name of this SyncInfo.  # noqa: E501


        :return: The provider_name of this SyncInfo.  # noqa: E501
        :rtype: object
        """
        return self._provider_name

    @provider_name.setter
    def provider_name(self, provider_name):
        """Sets the provider_name of this SyncInfo.


        :param provider_name: The provider_name of this SyncInfo.  # noqa: E501
        :type: object
        """
        if provider_name is None:
            raise ValueError("Invalid value for `provider_name`, must not be `None`")  # noqa: E501

        self._provider_name = provider_name

    @property
    def category(self):
        """Gets the category of this SyncInfo.  # noqa: E501


        :return: The category of this SyncInfo.  # noqa: E501
        :rtype: object
        """
        return self._category

    @category.setter
    def category(self, category):
        """Sets the category of this SyncInfo.


        :param category: The category of this SyncInfo.  # noqa: E501
        :type: object
        """
        if category is None:
            raise ValueError("Invalid value for `category`, must not be `None`")  # noqa: E501

        self._category = category

    @property
    def connection_id(self):
        """Gets the connection_id of this SyncInfo.  # noqa: E501


        :return: The connection_id of this SyncInfo.  # noqa: E501
        :rtype: object
        """
        return self._connection_id

    @connection_id.setter
    def connection_id(self, connection_id):
        """Sets the connection_id of this SyncInfo.


        :param connection_id: The connection_id of this SyncInfo.  # noqa: E501
        :type: object
        """
        if connection_id is None:
            raise ValueError("Invalid value for `connection_id`, must not be `None`")  # noqa: E501

        self._connection_id = connection_id

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
        if issubclass(SyncInfo, dict):
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
        if not isinstance(other, SyncInfo):
            return False

        return self.__dict__ == other.__dict__

    def __ne__(self, other):
        """Returns true if both objects are not equal"""
        return not self == other
