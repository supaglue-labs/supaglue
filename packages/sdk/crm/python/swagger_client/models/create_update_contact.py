# coding: utf-8

"""
    Supaglue CRM API

    # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/crm/v1 ```   # noqa: E501

    OpenAPI spec version: 0.4.1
    Contact: docs@supaglue.com
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

import pprint
import re  # noqa: F401

import six

class CreateUpdateContact(object):
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
        'first_name': 'str',
        'last_name': 'str',
        'account_id': 'str',
        'addresses': 'Addresses',
        'email_addresses': 'EmailAddresses',
        'phone_numbers': 'PhoneNumbers',
        'owner_id': 'str',
        'custom_fields': 'CustomFields'
    }

    attribute_map = {
        'first_name': 'first_name',
        'last_name': 'last_name',
        'account_id': 'account_id',
        'addresses': 'addresses',
        'email_addresses': 'email_addresses',
        'phone_numbers': 'phone_numbers',
        'owner_id': 'owner_id',
        'custom_fields': 'custom_fields'
    }

    def __init__(self, first_name=None, last_name=None, account_id=None, addresses=None, email_addresses=None, phone_numbers=None, owner_id=None, custom_fields=None):  # noqa: E501
        """CreateUpdateContact - a model defined in Swagger"""  # noqa: E501
        self._first_name = None
        self._last_name = None
        self._account_id = None
        self._addresses = None
        self._email_addresses = None
        self._phone_numbers = None
        self._owner_id = None
        self._custom_fields = None
        self.discriminator = None
        if first_name is not None:
            self.first_name = first_name
        if last_name is not None:
            self.last_name = last_name
        if account_id is not None:
            self.account_id = account_id
        if addresses is not None:
            self.addresses = addresses
        if email_addresses is not None:
            self.email_addresses = email_addresses
        if phone_numbers is not None:
            self.phone_numbers = phone_numbers
        if owner_id is not None:
            self.owner_id = owner_id
        if custom_fields is not None:
            self.custom_fields = custom_fields

    @property
    def first_name(self):
        """Gets the first_name of this CreateUpdateContact.  # noqa: E501


        :return: The first_name of this CreateUpdateContact.  # noqa: E501
        :rtype: str
        """
        return self._first_name

    @first_name.setter
    def first_name(self, first_name):
        """Sets the first_name of this CreateUpdateContact.


        :param first_name: The first_name of this CreateUpdateContact.  # noqa: E501
        :type: str
        """

        self._first_name = first_name

    @property
    def last_name(self):
        """Gets the last_name of this CreateUpdateContact.  # noqa: E501


        :return: The last_name of this CreateUpdateContact.  # noqa: E501
        :rtype: str
        """
        return self._last_name

    @last_name.setter
    def last_name(self, last_name):
        """Sets the last_name of this CreateUpdateContact.


        :param last_name: The last_name of this CreateUpdateContact.  # noqa: E501
        :type: str
        """

        self._last_name = last_name

    @property
    def account_id(self):
        """Gets the account_id of this CreateUpdateContact.  # noqa: E501


        :return: The account_id of this CreateUpdateContact.  # noqa: E501
        :rtype: str
        """
        return self._account_id

    @account_id.setter
    def account_id(self, account_id):
        """Sets the account_id of this CreateUpdateContact.


        :param account_id: The account_id of this CreateUpdateContact.  # noqa: E501
        :type: str
        """

        self._account_id = account_id

    @property
    def addresses(self):
        """Gets the addresses of this CreateUpdateContact.  # noqa: E501


        :return: The addresses of this CreateUpdateContact.  # noqa: E501
        :rtype: Addresses
        """
        return self._addresses

    @addresses.setter
    def addresses(self, addresses):
        """Sets the addresses of this CreateUpdateContact.


        :param addresses: The addresses of this CreateUpdateContact.  # noqa: E501
        :type: Addresses
        """

        self._addresses = addresses

    @property
    def email_addresses(self):
        """Gets the email_addresses of this CreateUpdateContact.  # noqa: E501


        :return: The email_addresses of this CreateUpdateContact.  # noqa: E501
        :rtype: EmailAddresses
        """
        return self._email_addresses

    @email_addresses.setter
    def email_addresses(self, email_addresses):
        """Sets the email_addresses of this CreateUpdateContact.


        :param email_addresses: The email_addresses of this CreateUpdateContact.  # noqa: E501
        :type: EmailAddresses
        """

        self._email_addresses = email_addresses

    @property
    def phone_numbers(self):
        """Gets the phone_numbers of this CreateUpdateContact.  # noqa: E501


        :return: The phone_numbers of this CreateUpdateContact.  # noqa: E501
        :rtype: PhoneNumbers
        """
        return self._phone_numbers

    @phone_numbers.setter
    def phone_numbers(self, phone_numbers):
        """Sets the phone_numbers of this CreateUpdateContact.


        :param phone_numbers: The phone_numbers of this CreateUpdateContact.  # noqa: E501
        :type: PhoneNumbers
        """

        self._phone_numbers = phone_numbers

    @property
    def owner_id(self):
        """Gets the owner_id of this CreateUpdateContact.  # noqa: E501


        :return: The owner_id of this CreateUpdateContact.  # noqa: E501
        :rtype: str
        """
        return self._owner_id

    @owner_id.setter
    def owner_id(self, owner_id):
        """Sets the owner_id of this CreateUpdateContact.


        :param owner_id: The owner_id of this CreateUpdateContact.  # noqa: E501
        :type: str
        """

        self._owner_id = owner_id

    @property
    def custom_fields(self):
        """Gets the custom_fields of this CreateUpdateContact.  # noqa: E501


        :return: The custom_fields of this CreateUpdateContact.  # noqa: E501
        :rtype: CustomFields
        """
        return self._custom_fields

    @custom_fields.setter
    def custom_fields(self, custom_fields):
        """Sets the custom_fields of this CreateUpdateContact.


        :param custom_fields: The custom_fields of this CreateUpdateContact.  # noqa: E501
        :type: CustomFields
        """

        self._custom_fields = custom_fields

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
        if issubclass(CreateUpdateContact, dict):
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
        if not isinstance(other, CreateUpdateContact):
            return False

        return self.__dict__ == other.__dict__

    def __ne__(self, other):
        """Returns true if both objects are not equal"""
        return not self == other
