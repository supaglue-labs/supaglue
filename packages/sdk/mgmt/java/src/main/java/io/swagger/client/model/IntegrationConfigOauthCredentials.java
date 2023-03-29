/*
 * Supaglue Management API
 * # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ``` 
 *
 * OpenAPI spec version: 0.6.0
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

package io.swagger.client.model;

import java.util.Objects;
import java.util.Arrays;
import com.google.gson.TypeAdapter;
import com.google.gson.annotations.JsonAdapter;
import com.google.gson.annotations.SerializedName;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.IOException;
/**
 * IntegrationConfigOauthCredentials
 */


public class IntegrationConfigOauthCredentials {
  @SerializedName("oauth_client_id")
  private Object oauthClientId = null;

  @SerializedName("oauth_client_secret")
  private Object oauthClientSecret = null;

  public IntegrationConfigOauthCredentials oauthClientId(Object oauthClientId) {
    this.oauthClientId = oauthClientId;
    return this;
  }

   /**
   * Get oauthClientId
   * @return oauthClientId
  **/
  @Schema(example = "7393b5a4-5e20-4648-87af-b7b297793fd1", required = true, description = "")
  public Object getOauthClientId() {
    return oauthClientId;
  }

  public void setOauthClientId(Object oauthClientId) {
    this.oauthClientId = oauthClientId;
  }

  public IntegrationConfigOauthCredentials oauthClientSecret(Object oauthClientSecret) {
    this.oauthClientSecret = oauthClientSecret;
    return this;
  }

   /**
   * Get oauthClientSecret
   * @return oauthClientSecret
  **/
  @Schema(example = "941b846a-5a8c-48b8-b0e1-41b6d4bc4f1a", required = true, description = "")
  public Object getOauthClientSecret() {
    return oauthClientSecret;
  }

  public void setOauthClientSecret(Object oauthClientSecret) {
    this.oauthClientSecret = oauthClientSecret;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    IntegrationConfigOauthCredentials integrationConfigOauthCredentials = (IntegrationConfigOauthCredentials) o;
    return Objects.equals(this.oauthClientId, integrationConfigOauthCredentials.oauthClientId) &&
        Objects.equals(this.oauthClientSecret, integrationConfigOauthCredentials.oauthClientSecret);
  }

  @Override
  public int hashCode() {
    return Objects.hash(oauthClientId, oauthClientSecret);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class IntegrationConfigOauthCredentials {\n");
    
    sb.append("    oauthClientId: ").append(toIndentedString(oauthClientId)).append("\n");
    sb.append("    oauthClientSecret: ").append(toIndentedString(oauthClientSecret)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }

}
