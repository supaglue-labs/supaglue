# coding: utf-8

"""
    Supaglue CRM API

    # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/api/crm/v1 ```   # noqa: E501

    OpenAPI spec version: 0.3.3
    Contact: docs@supaglue.com
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

import pprint
import re  # noqa: F401

import six

class Account(object):
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
        'addresses': 'Addresses',
        'description': 'str',
        'id': 'str',
        'industry': 'str',
        'last_activity_at': 'datetime',
        'name': 'str',
        'number_of_employees': 'int',
        'owner': 'str',
        'phone_numbers': 'PhoneNumbers',
        'created_at': 'datetime',
        'updated_at': 'datetime',
        'website': 'str'
    }

    attribute_map = {
        'addresses': 'addresses',
        'description': 'description',
        'id': 'id',
        'industry': 'industry',
        'last_activity_at': 'last_activity_at',
        'name': 'name',
        'number_of_employees': 'number_of_employees',
        'owner': 'owner',
        'phone_numbers': 'phone_numbers',
        'created_at': 'created_at',
        'updated_at': 'updated_at',
        'website': 'website'
    }

    def __init__(self, addresses=None, description=None, id=None, industry=None, last_activity_at=None, name=None, number_of_employees=None, owner=None, phone_numbers=None, created_at=None, updated_at=None, website=None):  # noqa: E501
        """Account - a model defined in Swagger"""  # noqa: E501
        self._addresses = None
        self._description = None
        self._id = None
        self._industry = None
        self._last_activity_at = None
        self._name = None
        self._number_of_employees = None
        self._owner = None
        self._phone_numbers = None
        self._created_at = None
        self._updated_at = None
        self._website = None
        self.discriminator = None
        if addresses is not None:
            self.addresses = addresses
        if description is not None:
            self.description = description
        if id is not None:
            self.id = id
        if industry is not None:
            self.industry = industry
        if last_activity_at is not None:
            self.last_activity_at = last_activity_at
        if name is not None:
            self.name = name
        if number_of_employees is not None:
            self.number_of_employees = number_of_employees
        if owner is not None:
            self.owner = owner
        if phone_numbers is not None:
            self.phone_numbers = phone_numbers
        if created_at is not None:
            self.created_at = created_at
        if updated_at is not None:
            self.updated_at = updated_at
        if website is not None:
            self.website = website

    @property
    def addresses(self):
        """Gets the addresses of this Account.  # noqa: E501


        :return: The addresses of this Account.  # noqa: E501
        :rtype: Addresses
        """
        return self._addresses

    @addresses.setter
    def addresses(self, addresses):
        """Sets the addresses of this Account.


        :param addresses: The addresses of this Account.  # noqa: E501
        :type: Addresses
        """

        self._addresses = addresses

    @property
    def description(self):
        """Gets the description of this Account.  # noqa: E501


        :return: The description of this Account.  # noqa: E501
        :rtype: str
        """
        return self._description

    @description.setter
    def description(self, description):
        """Sets the description of this Account.


        :param description: The description of this Account.  # noqa: E501
        :type: str
        """

        self._description = description

    @property
    def id(self):
        """Gets the id of this Account.  # noqa: E501


        :return: The id of this Account.  # noqa: E501
        :rtype: str
        """
        return self._id

    @id.setter
    def id(self, id):
        """Sets the id of this Account.


        :param id: The id of this Account.  # noqa: E501
        :type: str
        """

        self._id = id

    @property
    def industry(self):
        """Gets the industry of this Account.  # noqa: E501


        :return: The industry of this Account.  # noqa: E501
        :rtype: str
        """
        return self._industry

    @industry.setter
    def industry(self, industry):
        """Sets the industry of this Account.


        :param industry: The industry of this Account.  # noqa: E501
        :type: str
        """

        self._industry = industry

    @property
    def last_activity_at(self):
        """Gets the last_activity_at of this Account.  # noqa: E501


        :return: The last_activity_at of this Account.  # noqa: E501
        :rtype: datetime
        """
        return self._last_activity_at

    @last_activity_at.setter
    def last_activity_at(self, last_activity_at):
        """Sets the last_activity_at of this Account.


        :param last_activity_at: The last_activity_at of this Account.  # noqa: E501
        :type: datetime
        """

        self._last_activity_at = last_activity_at

    @property
    def name(self):
        """Gets the name of this Account.  # noqa: E501


        :return: The name of this Account.  # noqa: E501
        :rtype: str
        """
        return self._name

    @name.setter
    def name(self, name):
        """Sets the name of this Account.


        :param name: The name of this Account.  # noqa: E501
        :type: str
        """

        self._name = name

    @property
    def number_of_employees(self):
        """Gets the number_of_employees of this Account.  # noqa: E501


        :return: The number_of_employees of this Account.  # noqa: E501
        :rtype: int
        """
        return self._number_of_employees

    @number_of_employees.setter
    def number_of_employees(self, number_of_employees):
        """Sets the number_of_employees of this Account.


        :param number_of_employees: The number_of_employees of this Account.  # noqa: E501
        :type: int
        """

        self._number_of_employees = number_of_employees

    @property
    def owner(self):
        """Gets the owner of this Account.  # noqa: E501


        :return: The owner of this Account.  # noqa: E501
        :rtype: str
        """
        return self._owner

    @owner.setter
    def owner(self, owner):
        """Sets the owner of this Account.


        :param owner: The owner of this Account.  # noqa: E501
        :type: str
        """

        self._owner = owner

    @property
    def phone_numbers(self):
        """Gets the phone_numbers of this Account.  # noqa: E501


        :return: The phone_numbers of this Account.  # noqa: E501
        :rtype: PhoneNumbers
        """
        return self._phone_numbers

    @phone_numbers.setter
    def phone_numbers(self, phone_numbers):
        """Sets the phone_numbers of this Account.


        :param phone_numbers: The phone_numbers of this Account.  # noqa: E501
        :type: PhoneNumbers
        """

        self._phone_numbers = phone_numbers

    @property
    def created_at(self):
        """Gets the created_at of this Account.  # noqa: E501


        :return: The created_at of this Account.  # noqa: E501
        :rtype: datetime
        """
        return self._created_at

    @created_at.setter
    def created_at(self, created_at):
        """Sets the created_at of this Account.


        :param created_at: The created_at of this Account.  # noqa: E501
        :type: datetime
        """

        self._created_at = created_at

    @property
    def updated_at(self):
        """Gets the updated_at of this Account.  # noqa: E501


        :return: The updated_at of this Account.  # noqa: E501
        :rtype: datetime
        """
        return self._updated_at

    @updated_at.setter
    def updated_at(self, updated_at):
        """Sets the updated_at of this Account.


        :param updated_at: The updated_at of this Account.  # noqa: E501
        :type: datetime
        """

        self._updated_at = updated_at

    @property
    def website(self):
        """Gets the website of this Account.  # noqa: E501


        :return: The website of this Account.  # noqa: E501
        :rtype: str
        """
        return self._website

    @website.setter
    def website(self, website):
        """Sets the website of this Account.


        :param website: The website of this Account.  # noqa: E501
        :type: str
        """

        self._website = website

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
        if issubclass(Account, dict):
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
        if not isinstance(other, Account):
            return False

        return self.__dict__ == other.__dict__

    def __ne__(self, other):
        """Returns true if both objects are not equal"""
        return not self == other
