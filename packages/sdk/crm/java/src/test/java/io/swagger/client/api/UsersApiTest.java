/*
 * Supaglue CRM API
 * # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/api/crm/v1 ``` 
 *
 * OpenAPI spec version: 0.3.4
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

package io.swagger.client.api;

import io.swagger.client.model.InlineResponse2003;
import org.threeten.bp.OffsetDateTime;
import io.swagger.client.model.User;
import org.junit.Test;
import org.junit.Ignore;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * API tests for UsersApi
 */
@Ignore
public class UsersApiTest {

    private final UsersApi api = new UsersApi();

    /**
     * Get user
     *
     * 
     *
     * @throws Exception
     *          if the Api call fails
     */
    @Test
    public void getUserTest() throws Exception {
        String customerId = null;
        String providerName = null;
        String userId = null;
        User response = api.getUser(customerId, providerName, userId);

        // TODO: test validations
    }
    /**
     * List users
     *
     * Get a list of users
     *
     * @throws Exception
     *          if the Api call fails
     */
    @Test
    public void getUsersTest() throws Exception {
        String customerId = null;
        String providerName = null;
        OffsetDateTime createdAfter = null;
        OffsetDateTime createdBefore = null;
        OffsetDateTime updatedAfter = null;
        OffsetDateTime updatedBefore = null;
        String cursor = null;
        String expand = null;
        String pageSize = null;
        InlineResponse2003 response = api.getUsers(customerId, providerName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize);

        // TODO: test validations
    }
}
