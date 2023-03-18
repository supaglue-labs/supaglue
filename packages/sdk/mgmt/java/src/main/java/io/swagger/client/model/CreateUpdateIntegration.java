/*
 * Supaglue Management API
 * # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ``` 
 *
 * OpenAPI spec version: 0.4.1
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
import io.swagger.client.model.Category;
import io.swagger.client.model.IntegrationConfig;
import io.swagger.client.model.ProviderName;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.IOException;
/**
 * CreateUpdateIntegration
 */


public class CreateUpdateIntegration {
  @SerializedName("application_id")
  private Object applicationId = null;

  @SerializedName("category")
  private Category category = null;

  @SerializedName("auth_type")
  private Object authType = null;

  @SerializedName("provider_name")
  private ProviderName providerName = null;

  @SerializedName("config")
  private IntegrationConfig config = null;

  public CreateUpdateIntegration applicationId(Object applicationId) {
    this.applicationId = applicationId;
    return this;
  }

   /**
   * Get applicationId
   * @return applicationId
  **/
  @Schema(example = "9572d08b-f19f-48cc-a992-1eb7031d3f6a", required = true, description = "")
  public Object getApplicationId() {
    return applicationId;
  }

  public void setApplicationId(Object applicationId) {
    this.applicationId = applicationId;
  }

  public CreateUpdateIntegration category(Category category) {
    this.category = category;
    return this;
  }

   /**
   * Get category
   * @return category
  **/
  @Schema(required = true, description = "")
  public Category getCategory() {
    return category;
  }

  public void setCategory(Category category) {
    this.category = category;
  }

  public CreateUpdateIntegration authType(Object authType) {
    this.authType = authType;
    return this;
  }

   /**
   * Get authType
   * @return authType
  **/
  @Schema(required = true, description = "")
  public Object getAuthType() {
    return authType;
  }

  public void setAuthType(Object authType) {
    this.authType = authType;
  }

  public CreateUpdateIntegration providerName(ProviderName providerName) {
    this.providerName = providerName;
    return this;
  }

   /**
   * Get providerName
   * @return providerName
  **/
  @Schema(required = true, description = "")
  public ProviderName getProviderName() {
    return providerName;
  }

  public void setProviderName(ProviderName providerName) {
    this.providerName = providerName;
  }

  public CreateUpdateIntegration config(IntegrationConfig config) {
    this.config = config;
    return this;
  }

   /**
   * Get config
   * @return config
  **/
  @Schema(description = "")
  public IntegrationConfig getConfig() {
    return config;
  }

  public void setConfig(IntegrationConfig config) {
    this.config = config;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CreateUpdateIntegration createUpdateIntegration = (CreateUpdateIntegration) o;
    return Objects.equals(this.applicationId, createUpdateIntegration.applicationId) &&
        Objects.equals(this.category, createUpdateIntegration.category) &&
        Objects.equals(this.authType, createUpdateIntegration.authType) &&
        Objects.equals(this.providerName, createUpdateIntegration.providerName) &&
        Objects.equals(this.config, createUpdateIntegration.config);
  }

  @Override
  public int hashCode() {
    return Objects.hash(applicationId, category, authType, providerName, config);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class CreateUpdateIntegration {\n");
    
    sb.append("    applicationId: ").append(toIndentedString(applicationId)).append("\n");
    sb.append("    category: ").append(toIndentedString(category)).append("\n");
    sb.append("    authType: ").append(toIndentedString(authType)).append("\n");
    sb.append("    providerName: ").append(toIndentedString(providerName)).append("\n");
    sb.append("    config: ").append(toIndentedString(config)).append("\n");
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
