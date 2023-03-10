# coding: utf-8

"""
    Supaglue Management API

    # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ```   # noqa: E501

    OpenAPI spec version: 0.3.3
    Contact: docs@supaglue.com
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

from __future__ import absolute_import

import re  # noqa: F401

# python 2 and python 3 compatibility library
import six

from swagger_client.api_client import ApiClient


class IntegrationsApi(object):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    Ref: https://github.com/swagger-api/swagger-codegen
    """

    def __init__(self, api_client=None):
        if api_client is None:
            api_client = ApiClient()
        self.api_client = api_client

    def create_integration(self, body, application_id, **kwargs):  # noqa: E501
        """Create integration  # noqa: E501

        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True
        >>> thread = api.create_integration(body, application_id, async_req=True)
        >>> result = thread.get()

        :param async_req bool
        :param CreateUpdateIntegration body: (required)
        :param str application_id: (required)
        :return: Integration
                 If the method is called asynchronously,
                 returns the request thread.
        """
        kwargs['_return_http_data_only'] = True
        if kwargs.get('async_req'):
            return self.create_integration_with_http_info(body, application_id, **kwargs)  # noqa: E501
        else:
            (data) = self.create_integration_with_http_info(body, application_id, **kwargs)  # noqa: E501
            return data

    def create_integration_with_http_info(self, body, application_id, **kwargs):  # noqa: E501
        """Create integration  # noqa: E501

        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True
        >>> thread = api.create_integration_with_http_info(body, application_id, async_req=True)
        >>> result = thread.get()

        :param async_req bool
        :param CreateUpdateIntegration body: (required)
        :param str application_id: (required)
        :return: Integration
                 If the method is called asynchronously,
                 returns the request thread.
        """

        all_params = ['body', 'application_id']  # noqa: E501
        all_params.append('async_req')
        all_params.append('_return_http_data_only')
        all_params.append('_preload_content')
        all_params.append('_request_timeout')

        params = locals()
        for key, val in six.iteritems(params['kwargs']):
            if key not in all_params:
                raise TypeError(
                    "Got an unexpected keyword argument '%s'"
                    " to method create_integration" % key
                )
            params[key] = val
        del params['kwargs']
        # verify the required parameter 'body' is set
        if ('body' not in params or
                params['body'] is None):
            raise ValueError("Missing the required parameter `body` when calling `create_integration`")  # noqa: E501
        # verify the required parameter 'application_id' is set
        if ('application_id' not in params or
                params['application_id'] is None):
            raise ValueError("Missing the required parameter `application_id` when calling `create_integration`")  # noqa: E501

        collection_formats = {}

        path_params = {}
        if 'application_id' in params:
            path_params['application_id'] = params['application_id']  # noqa: E501

        query_params = []

        header_params = {}

        form_params = []
        local_var_files = {}

        body_params = None
        if 'body' in params:
            body_params = params['body']
        # HTTP header `Accept`
        header_params['Accept'] = self.api_client.select_header_accept(
            ['application/json'])  # noqa: E501

        # HTTP header `Content-Type`
        header_params['Content-Type'] = self.api_client.select_header_content_type(  # noqa: E501
            ['application/json'])  # noqa: E501

        # Authentication setting
        auth_settings = []  # noqa: E501

        return self.api_client.call_api(
            '/applications/{application_id}/integrations', 'POST',
            path_params,
            query_params,
            header_params,
            body=body_params,
            post_params=form_params,
            files=local_var_files,
            response_type='Integration',  # noqa: E501
            auth_settings=auth_settings,
            async_req=params.get('async_req'),
            _return_http_data_only=params.get('_return_http_data_only'),
            _preload_content=params.get('_preload_content', True),
            _request_timeout=params.get('_request_timeout'),
            collection_formats=collection_formats)

    def delete_integration(self, application_id, integration_id, **kwargs):  # noqa: E501
        """Delete integration  # noqa: E501

        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True
        >>> thread = api.delete_integration(application_id, integration_id, async_req=True)
        >>> result = thread.get()

        :param async_req bool
        :param str application_id: (required)
        :param str integration_id: (required)
        :return: Integration
                 If the method is called asynchronously,
                 returns the request thread.
        """
        kwargs['_return_http_data_only'] = True
        if kwargs.get('async_req'):
            return self.delete_integration_with_http_info(application_id, integration_id, **kwargs)  # noqa: E501
        else:
            (data) = self.delete_integration_with_http_info(application_id, integration_id, **kwargs)  # noqa: E501
            return data

    def delete_integration_with_http_info(self, application_id, integration_id, **kwargs):  # noqa: E501
        """Delete integration  # noqa: E501

        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True
        >>> thread = api.delete_integration_with_http_info(application_id, integration_id, async_req=True)
        >>> result = thread.get()

        :param async_req bool
        :param str application_id: (required)
        :param str integration_id: (required)
        :return: Integration
                 If the method is called asynchronously,
                 returns the request thread.
        """

        all_params = ['application_id', 'integration_id']  # noqa: E501
        all_params.append('async_req')
        all_params.append('_return_http_data_only')
        all_params.append('_preload_content')
        all_params.append('_request_timeout')

        params = locals()
        for key, val in six.iteritems(params['kwargs']):
            if key not in all_params:
                raise TypeError(
                    "Got an unexpected keyword argument '%s'"
                    " to method delete_integration" % key
                )
            params[key] = val
        del params['kwargs']
        # verify the required parameter 'application_id' is set
        if ('application_id' not in params or
                params['application_id'] is None):
            raise ValueError("Missing the required parameter `application_id` when calling `delete_integration`")  # noqa: E501
        # verify the required parameter 'integration_id' is set
        if ('integration_id' not in params or
                params['integration_id'] is None):
            raise ValueError("Missing the required parameter `integration_id` when calling `delete_integration`")  # noqa: E501

        collection_formats = {}

        path_params = {}
        if 'application_id' in params:
            path_params['application_id'] = params['application_id']  # noqa: E501
        if 'integration_id' in params:
            path_params['integration_id'] = params['integration_id']  # noqa: E501

        query_params = []

        header_params = {}

        form_params = []
        local_var_files = {}

        body_params = None
        # HTTP header `Accept`
        header_params['Accept'] = self.api_client.select_header_accept(
            ['application/json'])  # noqa: E501

        # Authentication setting
        auth_settings = []  # noqa: E501

        return self.api_client.call_api(
            '/applications/{application_id}/integrations/{integration_id}', 'DELETE',
            path_params,
            query_params,
            header_params,
            body=body_params,
            post_params=form_params,
            files=local_var_files,
            response_type='Integration',  # noqa: E501
            auth_settings=auth_settings,
            async_req=params.get('async_req'),
            _return_http_data_only=params.get('_return_http_data_only'),
            _preload_content=params.get('_preload_content', True),
            _request_timeout=params.get('_request_timeout'),
            collection_formats=collection_formats)

    def get_integration(self, application_id, integration_id, **kwargs):  # noqa: E501
        """Get integration  # noqa: E501

        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True
        >>> thread = api.get_integration(application_id, integration_id, async_req=True)
        >>> result = thread.get()

        :param async_req bool
        :param str application_id: (required)
        :param str integration_id: (required)
        :return: Integration
                 If the method is called asynchronously,
                 returns the request thread.
        """
        kwargs['_return_http_data_only'] = True
        if kwargs.get('async_req'):
            return self.get_integration_with_http_info(application_id, integration_id, **kwargs)  # noqa: E501
        else:
            (data) = self.get_integration_with_http_info(application_id, integration_id, **kwargs)  # noqa: E501
            return data

    def get_integration_with_http_info(self, application_id, integration_id, **kwargs):  # noqa: E501
        """Get integration  # noqa: E501

        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True
        >>> thread = api.get_integration_with_http_info(application_id, integration_id, async_req=True)
        >>> result = thread.get()

        :param async_req bool
        :param str application_id: (required)
        :param str integration_id: (required)
        :return: Integration
                 If the method is called asynchronously,
                 returns the request thread.
        """

        all_params = ['application_id', 'integration_id']  # noqa: E501
        all_params.append('async_req')
        all_params.append('_return_http_data_only')
        all_params.append('_preload_content')
        all_params.append('_request_timeout')

        params = locals()
        for key, val in six.iteritems(params['kwargs']):
            if key not in all_params:
                raise TypeError(
                    "Got an unexpected keyword argument '%s'"
                    " to method get_integration" % key
                )
            params[key] = val
        del params['kwargs']
        # verify the required parameter 'application_id' is set
        if ('application_id' not in params or
                params['application_id'] is None):
            raise ValueError("Missing the required parameter `application_id` when calling `get_integration`")  # noqa: E501
        # verify the required parameter 'integration_id' is set
        if ('integration_id' not in params or
                params['integration_id'] is None):
            raise ValueError("Missing the required parameter `integration_id` when calling `get_integration`")  # noqa: E501

        collection_formats = {}

        path_params = {}
        if 'application_id' in params:
            path_params['application_id'] = params['application_id']  # noqa: E501
        if 'integration_id' in params:
            path_params['integration_id'] = params['integration_id']  # noqa: E501

        query_params = []

        header_params = {}

        form_params = []
        local_var_files = {}

        body_params = None
        # HTTP header `Accept`
        header_params['Accept'] = self.api_client.select_header_accept(
            ['application/json'])  # noqa: E501

        # Authentication setting
        auth_settings = []  # noqa: E501

        return self.api_client.call_api(
            '/applications/{application_id}/integrations/{integration_id}', 'GET',
            path_params,
            query_params,
            header_params,
            body=body_params,
            post_params=form_params,
            files=local_var_files,
            response_type='Integration',  # noqa: E501
            auth_settings=auth_settings,
            async_req=params.get('async_req'),
            _return_http_data_only=params.get('_return_http_data_only'),
            _preload_content=params.get('_preload_content', True),
            _request_timeout=params.get('_request_timeout'),
            collection_formats=collection_formats)

    def get_integrations(self, application_id, **kwargs):  # noqa: E501
        """List integrations  # noqa: E501

        Get a list of integrations  # noqa: E501
        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True
        >>> thread = api.get_integrations(application_id, async_req=True)
        >>> result = thread.get()

        :param async_req bool
        :param str application_id: (required)
        :return: list[Integration]
                 If the method is called asynchronously,
                 returns the request thread.
        """
        kwargs['_return_http_data_only'] = True
        if kwargs.get('async_req'):
            return self.get_integrations_with_http_info(application_id, **kwargs)  # noqa: E501
        else:
            (data) = self.get_integrations_with_http_info(application_id, **kwargs)  # noqa: E501
            return data

    def get_integrations_with_http_info(self, application_id, **kwargs):  # noqa: E501
        """List integrations  # noqa: E501

        Get a list of integrations  # noqa: E501
        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True
        >>> thread = api.get_integrations_with_http_info(application_id, async_req=True)
        >>> result = thread.get()

        :param async_req bool
        :param str application_id: (required)
        :return: list[Integration]
                 If the method is called asynchronously,
                 returns the request thread.
        """

        all_params = ['application_id']  # noqa: E501
        all_params.append('async_req')
        all_params.append('_return_http_data_only')
        all_params.append('_preload_content')
        all_params.append('_request_timeout')

        params = locals()
        for key, val in six.iteritems(params['kwargs']):
            if key not in all_params:
                raise TypeError(
                    "Got an unexpected keyword argument '%s'"
                    " to method get_integrations" % key
                )
            params[key] = val
        del params['kwargs']
        # verify the required parameter 'application_id' is set
        if ('application_id' not in params or
                params['application_id'] is None):
            raise ValueError("Missing the required parameter `application_id` when calling `get_integrations`")  # noqa: E501

        collection_formats = {}

        path_params = {}
        if 'application_id' in params:
            path_params['application_id'] = params['application_id']  # noqa: E501

        query_params = []

        header_params = {}

        form_params = []
        local_var_files = {}

        body_params = None
        # HTTP header `Accept`
        header_params['Accept'] = self.api_client.select_header_accept(
            ['application/json'])  # noqa: E501

        # Authentication setting
        auth_settings = []  # noqa: E501

        return self.api_client.call_api(
            '/applications/{application_id}/integrations', 'GET',
            path_params,
            query_params,
            header_params,
            body=body_params,
            post_params=form_params,
            files=local_var_files,
            response_type='list[Integration]',  # noqa: E501
            auth_settings=auth_settings,
            async_req=params.get('async_req'),
            _return_http_data_only=params.get('_return_http_data_only'),
            _preload_content=params.get('_preload_content', True),
            _request_timeout=params.get('_request_timeout'),
            collection_formats=collection_formats)

    def update_integration(self, body, application_id, integration_id, **kwargs):  # noqa: E501
        """Update integration  # noqa: E501

        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True
        >>> thread = api.update_integration(body, application_id, integration_id, async_req=True)
        >>> result = thread.get()

        :param async_req bool
        :param CreateUpdateIntegration body: (required)
        :param str application_id: (required)
        :param str integration_id: (required)
        :return: Integration
                 If the method is called asynchronously,
                 returns the request thread.
        """
        kwargs['_return_http_data_only'] = True
        if kwargs.get('async_req'):
            return self.update_integration_with_http_info(body, application_id, integration_id, **kwargs)  # noqa: E501
        else:
            (data) = self.update_integration_with_http_info(body, application_id, integration_id, **kwargs)  # noqa: E501
            return data

    def update_integration_with_http_info(self, body, application_id, integration_id, **kwargs):  # noqa: E501
        """Update integration  # noqa: E501

        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True
        >>> thread = api.update_integration_with_http_info(body, application_id, integration_id, async_req=True)
        >>> result = thread.get()

        :param async_req bool
        :param CreateUpdateIntegration body: (required)
        :param str application_id: (required)
        :param str integration_id: (required)
        :return: Integration
                 If the method is called asynchronously,
                 returns the request thread.
        """

        all_params = ['body', 'application_id', 'integration_id']  # noqa: E501
        all_params.append('async_req')
        all_params.append('_return_http_data_only')
        all_params.append('_preload_content')
        all_params.append('_request_timeout')

        params = locals()
        for key, val in six.iteritems(params['kwargs']):
            if key not in all_params:
                raise TypeError(
                    "Got an unexpected keyword argument '%s'"
                    " to method update_integration" % key
                )
            params[key] = val
        del params['kwargs']
        # verify the required parameter 'body' is set
        if ('body' not in params or
                params['body'] is None):
            raise ValueError("Missing the required parameter `body` when calling `update_integration`")  # noqa: E501
        # verify the required parameter 'application_id' is set
        if ('application_id' not in params or
                params['application_id'] is None):
            raise ValueError("Missing the required parameter `application_id` when calling `update_integration`")  # noqa: E501
        # verify the required parameter 'integration_id' is set
        if ('integration_id' not in params or
                params['integration_id'] is None):
            raise ValueError("Missing the required parameter `integration_id` when calling `update_integration`")  # noqa: E501

        collection_formats = {}

        path_params = {}
        if 'application_id' in params:
            path_params['application_id'] = params['application_id']  # noqa: E501
        if 'integration_id' in params:
            path_params['integration_id'] = params['integration_id']  # noqa: E501

        query_params = []

        header_params = {}

        form_params = []
        local_var_files = {}

        body_params = None
        if 'body' in params:
            body_params = params['body']
        # HTTP header `Accept`
        header_params['Accept'] = self.api_client.select_header_accept(
            ['application/json'])  # noqa: E501

        # HTTP header `Content-Type`
        header_params['Content-Type'] = self.api_client.select_header_content_type(  # noqa: E501
            ['application/json'])  # noqa: E501

        # Authentication setting
        auth_settings = []  # noqa: E501

        return self.api_client.call_api(
            '/applications/{application_id}/integrations/{integration_id}', 'PUT',
            path_params,
            query_params,
            header_params,
            body=body_params,
            post_params=form_params,
            files=local_var_files,
            response_type='Integration',  # noqa: E501
            auth_settings=auth_settings,
            async_req=params.get('async_req'),
            _return_http_data_only=params.get('_return_http_data_only'),
            _preload_content=params.get('_preload_content', True),
            _request_timeout=params.get('_request_timeout'),
            collection_formats=collection_formats)
