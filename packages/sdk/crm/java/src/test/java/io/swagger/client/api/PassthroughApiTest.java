/*
 * Supaglue CRM API
 * # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/crm/v1 ``` 
 *
 * OpenAPI spec version: 0.4.1
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

package io.swagger.client.api;

import io.swagger.client.model.InlineResponse200;
import io.swagger.client.model.PassthroughBody;
import org.junit.Test;
import org.junit.Ignore;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * API tests for PassthroughApi
 */
@Ignore
public class PassthroughApiTest {

    private final PassthroughApi api = new PassthroughApi();

    /**
     * Send passthrough request
     *
     * Send request directly to a provider
     *
     * @throws Exception
     *          if the Api call fails
     */
    @Test
    public void sendPassthroughRequestTest() throws Exception {
        PassthroughBody body = null;
        InlineResponse200 response = api.sendPassthroughRequest(body);

        // TODO: test validations
    }
}
