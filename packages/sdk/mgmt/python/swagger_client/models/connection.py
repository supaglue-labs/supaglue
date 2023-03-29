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

class Connection(object):
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
        'id': 'object',
        'status': 'object',
        'application_id': 'object',
        'customer_id': 'object',
        'integration_id': 'object',
        'provider_name': 'ProviderName',
        'category': 'Category',
        'remote_id': 'object'
    }

    attribute_map = {
        'id': 'id',
        'status': 'status',
        'application_id': 'application_id',
        'customer_id': 'customer_id',
        'integration_id': 'integration_id',
        'provider_name': 'provider_name',
        'category': 'category',
        'remote_id': 'remote_id'
    }

    def __init__(self, id=None, status=None, application_id=None, customer_id=None, integration_id=None, provider_name=None, category=None, remote_id=None):  # noqa: E501
        """Connection - a model defined in Swagger"""  # noqa: E501
        self._id = None
        self._status = None
        self._application_id = None
        self._customer_id = None
        self._integration_id = None
        self._provider_name = None
        self._category = None
        self._remote_id = None
        self.discriminator = None
        self.id = id
        self.status = status
        self.application_id = application_id
        self.customer_id = customer_id
        self.integration_id = integration_id
        self.provider_name = provider_name
        self.category = category
        self.remote_id = remote_id

    @property
    def id(self):
        """Gets the id of this Connection.  # noqa: E501


        :return: The id of this Connection.  # noqa: E501
        :rtype: object
        """
        return self._id

    @id.setter
    def id(self, id):
        """Sets the id of this Connection.


        :param id: The id of this Connection.  # noqa: E501
        :type: object
        """
        if id is None:
            raise ValueError("Invalid value for `id`, must not be `None`")  # noqa: E501

        self._id = id

    @property
    def status(self):
        """Gets the status of this Connection.  # noqa: E501


        :return: The status of this Connection.  # noqa: E501
        :rtype: object
        """
        return self._status

    @status.setter
    def status(self, status):
        """Sets the status of this Connection.


        :param status: The status of this Connection.  # noqa: E501
        :type: object
        """
        if status is None:
            raise ValueError("Invalid value for `status`, must not be `None`")  # noqa: E501

        self._status = status

    @property
    def application_id(self):
        """Gets the application_id of this Connection.  # noqa: E501


        :return: The application_id of this Connection.  # noqa: E501
        :rtype: object
        """
        return self._application_id

    @application_id.setter
    def application_id(self, application_id):
        """Sets the application_id of this Connection.


        :param application_id: The application_id of this Connection.  # noqa: E501
        :type: object
        """
        if application_id is None:
            raise ValueError("Invalid value for `application_id`, must not be `None`")  # noqa: E501

        self._application_id = application_id

    @property
    def customer_id(self):
        """Gets the customer_id of this Connection.  # noqa: E501


        :return: The customer_id of this Connection.  # noqa: E501
        :rtype: object
        """
        return self._customer_id

    @customer_id.setter
    def customer_id(self, customer_id):
        """Sets the customer_id of this Connection.


        :param customer_id: The customer_id of this Connection.  # noqa: E501
        :type: object
        """
        if customer_id is None:
            raise ValueError("Invalid value for `customer_id`, must not be `None`")  # noqa: E501

        self._customer_id = customer_id

    @property
    def integration_id(self):
        """Gets the integration_id of this Connection.  # noqa: E501


        :return: The integration_id of this Connection.  # noqa: E501
        :rtype: object
        """
        return self._integration_id

    @integration_id.setter
    def integration_id(self, integration_id):
        """Sets the integration_id of this Connection.


        :param integration_id: The integration_id of this Connection.  # noqa: E501
        :type: object
        """
        if integration_id is None:
            raise ValueError("Invalid value for `integration_id`, must not be `None`")  # noqa: E501

        self._integration_id = integration_id

    @property
    def provider_name(self):
        """Gets the provider_name of this Connection.  # noqa: E501


        :return: The provider_name of this Connection.  # noqa: E501
        :rtype: ProviderName
        """
        return self._provider_name

    @provider_name.setter
    def provider_name(self, provider_name):
        """Sets the provider_name of this Connection.


        :param provider_name: The provider_name of this Connection.  # noqa: E501
        :type: ProviderName
        """
        if provider_name is None:
            raise ValueError("Invalid value for `provider_name`, must not be `None`")  # noqa: E501

        self._provider_name = provider_name

    @property
    def category(self):
        """Gets the category of this Connection.  # noqa: E501


        :return: The category of this Connection.  # noqa: E501
        :rtype: Category
        """
        return self._category

    @category.setter
    def category(self, category):
        """Sets the category of this Connection.


        :param category: The category of this Connection.  # noqa: E501
        :type: Category
        """
        if category is None:
            raise ValueError("Invalid value for `category`, must not be `None`")  # noqa: E501

        self._category = category

    @property
    def remote_id(self):
        """Gets the remote_id of this Connection.  # noqa: E501


        :return: The remote_id of this Connection.  # noqa: E501
        :rtype: object
        """
        return self._remote_id

    @remote_id.setter
    def remote_id(self, remote_id):
        """Sets the remote_id of this Connection.


        :param remote_id: The remote_id of this Connection.  # noqa: E501
        :type: object
        """
        if remote_id is None:
            raise ValueError("Invalid value for `remote_id`, must not be `None`")  # noqa: E501

        self._remote_id = remote_id

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
        if issubclass(Connection, dict):
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
        if not isinstance(other, Connection):
            return False

        return self.__dict__ == other.__dict__

    def __ne__(self, other):
        """Returns true if both objects are not equal"""
        return not self == other
