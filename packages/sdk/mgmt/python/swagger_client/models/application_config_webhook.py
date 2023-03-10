# coding: utf-8

"""
    Supaglue Management API

    # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ```   # noqa: E501

    OpenAPI spec version: 0.3.3
    Contact: docs@supaglue.com
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

import pprint
import re  # noqa: F401

import six

class ApplicationConfigWebhook(object):
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
        'url': 'str',
        'request_type': 'str',
        'notify_on_sync_success': 'bool',
        'notify_on_sync_error': 'bool',
        'notify_on_connection_success': 'bool',
        'notify_on_connection_error': 'bool',
        'headers': 'dict(str, object)'
    }

    attribute_map = {
        'url': 'url',
        'request_type': 'request_type',
        'notify_on_sync_success': 'notify_on_sync_success',
        'notify_on_sync_error': 'notify_on_sync_error',
        'notify_on_connection_success': 'notify_on_connection_success',
        'notify_on_connection_error': 'notify_on_connection_error',
        'headers': 'headers'
    }

    def __init__(self, url=None, request_type=None, notify_on_sync_success=None, notify_on_sync_error=None, notify_on_connection_success=None, notify_on_connection_error=None, headers=None):  # noqa: E501
        """ApplicationConfigWebhook - a model defined in Swagger"""  # noqa: E501
        self._url = None
        self._request_type = None
        self._notify_on_sync_success = None
        self._notify_on_sync_error = None
        self._notify_on_connection_success = None
        self._notify_on_connection_error = None
        self._headers = None
        self.discriminator = None
        self.url = url
        self.request_type = request_type
        self.notify_on_sync_success = notify_on_sync_success
        self.notify_on_sync_error = notify_on_sync_error
        self.notify_on_connection_success = notify_on_connection_success
        self.notify_on_connection_error = notify_on_connection_error
        if headers is not None:
            self.headers = headers

    @property
    def url(self):
        """Gets the url of this ApplicationConfigWebhook.  # noqa: E501


        :return: The url of this ApplicationConfigWebhook.  # noqa: E501
        :rtype: str
        """
        return self._url

    @url.setter
    def url(self, url):
        """Sets the url of this ApplicationConfigWebhook.


        :param url: The url of this ApplicationConfigWebhook.  # noqa: E501
        :type: str
        """
        if url is None:
            raise ValueError("Invalid value for `url`, must not be `None`")  # noqa: E501

        self._url = url

    @property
    def request_type(self):
        """Gets the request_type of this ApplicationConfigWebhook.  # noqa: E501


        :return: The request_type of this ApplicationConfigWebhook.  # noqa: E501
        :rtype: str
        """
        return self._request_type

    @request_type.setter
    def request_type(self, request_type):
        """Sets the request_type of this ApplicationConfigWebhook.


        :param request_type: The request_type of this ApplicationConfigWebhook.  # noqa: E501
        :type: str
        """
        if request_type is None:
            raise ValueError("Invalid value for `request_type`, must not be `None`")  # noqa: E501
        allowed_values = ["GET", "POST", "PUT", "DELETE", "PATCH"]  # noqa: E501
        if request_type not in allowed_values:
            raise ValueError(
                "Invalid value for `request_type` ({0}), must be one of {1}"  # noqa: E501
                .format(request_type, allowed_values)
            )

        self._request_type = request_type

    @property
    def notify_on_sync_success(self):
        """Gets the notify_on_sync_success of this ApplicationConfigWebhook.  # noqa: E501


        :return: The notify_on_sync_success of this ApplicationConfigWebhook.  # noqa: E501
        :rtype: bool
        """
        return self._notify_on_sync_success

    @notify_on_sync_success.setter
    def notify_on_sync_success(self, notify_on_sync_success):
        """Sets the notify_on_sync_success of this ApplicationConfigWebhook.


        :param notify_on_sync_success: The notify_on_sync_success of this ApplicationConfigWebhook.  # noqa: E501
        :type: bool
        """
        if notify_on_sync_success is None:
            raise ValueError("Invalid value for `notify_on_sync_success`, must not be `None`")  # noqa: E501

        self._notify_on_sync_success = notify_on_sync_success

    @property
    def notify_on_sync_error(self):
        """Gets the notify_on_sync_error of this ApplicationConfigWebhook.  # noqa: E501


        :return: The notify_on_sync_error of this ApplicationConfigWebhook.  # noqa: E501
        :rtype: bool
        """
        return self._notify_on_sync_error

    @notify_on_sync_error.setter
    def notify_on_sync_error(self, notify_on_sync_error):
        """Sets the notify_on_sync_error of this ApplicationConfigWebhook.


        :param notify_on_sync_error: The notify_on_sync_error of this ApplicationConfigWebhook.  # noqa: E501
        :type: bool
        """
        if notify_on_sync_error is None:
            raise ValueError("Invalid value for `notify_on_sync_error`, must not be `None`")  # noqa: E501

        self._notify_on_sync_error = notify_on_sync_error

    @property
    def notify_on_connection_success(self):
        """Gets the notify_on_connection_success of this ApplicationConfigWebhook.  # noqa: E501


        :return: The notify_on_connection_success of this ApplicationConfigWebhook.  # noqa: E501
        :rtype: bool
        """
        return self._notify_on_connection_success

    @notify_on_connection_success.setter
    def notify_on_connection_success(self, notify_on_connection_success):
        """Sets the notify_on_connection_success of this ApplicationConfigWebhook.


        :param notify_on_connection_success: The notify_on_connection_success of this ApplicationConfigWebhook.  # noqa: E501
        :type: bool
        """
        if notify_on_connection_success is None:
            raise ValueError("Invalid value for `notify_on_connection_success`, must not be `None`")  # noqa: E501

        self._notify_on_connection_success = notify_on_connection_success

    @property
    def notify_on_connection_error(self):
        """Gets the notify_on_connection_error of this ApplicationConfigWebhook.  # noqa: E501


        :return: The notify_on_connection_error of this ApplicationConfigWebhook.  # noqa: E501
        :rtype: bool
        """
        return self._notify_on_connection_error

    @notify_on_connection_error.setter
    def notify_on_connection_error(self, notify_on_connection_error):
        """Sets the notify_on_connection_error of this ApplicationConfigWebhook.


        :param notify_on_connection_error: The notify_on_connection_error of this ApplicationConfigWebhook.  # noqa: E501
        :type: bool
        """
        if notify_on_connection_error is None:
            raise ValueError("Invalid value for `notify_on_connection_error`, must not be `None`")  # noqa: E501

        self._notify_on_connection_error = notify_on_connection_error

    @property
    def headers(self):
        """Gets the headers of this ApplicationConfigWebhook.  # noqa: E501


        :return: The headers of this ApplicationConfigWebhook.  # noqa: E501
        :rtype: dict(str, object)
        """
        return self._headers

    @headers.setter
    def headers(self, headers):
        """Sets the headers of this ApplicationConfigWebhook.


        :param headers: The headers of this ApplicationConfigWebhook.  # noqa: E501
        :type: dict(str, object)
        """

        self._headers = headers

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
        if issubclass(ApplicationConfigWebhook, dict):
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
        if not isinstance(other, ApplicationConfigWebhook):
            return False

        return self.__dict__ == other.__dict__

    def __ne__(self, other):
        """Returns true if both objects are not equal"""
        return not self == other
