/*
 * Supaglue Customer API
 * # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ``` 
 *
 * OpenAPI spec version: 0.3.3
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

package io.swagger.client.model;

import java.util.Objects;
import java.util.Arrays;
import com.google.gson.annotations.SerializedName;
import java.io.IOException;
import com.google.gson.TypeAdapter;
import com.google.gson.annotations.JsonAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

/**
 * Gets or Sets provider_name
 */
@JsonAdapter(ProviderName.Adapter.class)
public enum ProviderName {
  HUBSPOT("hubspot"),
  SALESFORCE("salesforce"),
  PIPEDRIVE("pipedrive"),
  ZENDESK_SELL("zendesk_sell"),
  MS_DYNAMICS_365_SALES("ms_dynamics_365_sales"),
  ZOHO_CRM("zoho_crm"),
  CAPSULE("capsule");

  private String value;

  ProviderName(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }

  @Override
  public String toString() {
    return String.valueOf(value);
  }

  public static ProviderName fromValue(String input) {
    for (ProviderName b : ProviderName.values()) {
      if (b.value.equals(input)) {
        return b;
      }
    }
    return null;
  }

  public static class Adapter extends TypeAdapter<ProviderName> {
    @Override
    public void write(final JsonWriter jsonWriter, final ProviderName enumeration) throws IOException {
      jsonWriter.value(String.valueOf(enumeration.getValue()));
    }

    @Override
    public ProviderName read(final JsonReader jsonReader) throws IOException {
      Object value = jsonReader.nextString();
      return ProviderName.fromValue((String)(value));
    }
  }
}
