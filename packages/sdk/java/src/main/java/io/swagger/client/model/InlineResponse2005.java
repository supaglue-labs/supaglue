/*
 * Supaglue CRM API
 * # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/api/crm/v1 ``` 
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
import com.google.gson.TypeAdapter;
import com.google.gson.annotations.JsonAdapter;
import com.google.gson.annotations.SerializedName;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.IOException;
/**
 * InlineResponse2005
 */

@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.JavaClientCodegen", date = "2023-03-07T15:50:51.298786-08:00[America/Los_Angeles]")
public class InlineResponse2005 {
  @SerializedName("model_name")
  private String modelName = null;

  @SerializedName("last_sync_start")
  private String lastSyncStart = null;

  @SerializedName("next_sync_start")
  private String nextSyncStart = null;

  @SerializedName("status")
  private String status = null;

  public InlineResponse2005 modelName(String modelName) {
    this.modelName = modelName;
    return this;
  }

   /**
   * Get modelName
   * @return modelName
  **/
  @Schema(example = "Account", description = "")
  public String getModelName() {
    return modelName;
  }

  public void setModelName(String modelName) {
    this.modelName = modelName;
  }

  public InlineResponse2005 lastSyncStart(String lastSyncStart) {
    this.lastSyncStart = lastSyncStart;
    return this;
  }

   /**
   * Get lastSyncStart
   * @return lastSyncStart
  **/
  @Schema(example = "2023-02-22T19:55:17.559Z", description = "")
  public String getLastSyncStart() {
    return lastSyncStart;
  }

  public void setLastSyncStart(String lastSyncStart) {
    this.lastSyncStart = lastSyncStart;
  }

  public InlineResponse2005 nextSyncStart(String nextSyncStart) {
    this.nextSyncStart = nextSyncStart;
    return this;
  }

   /**
   * Get nextSyncStart
   * @return nextSyncStart
  **/
  @Schema(example = "2023-02-22T20:55:17.559Z", description = "")
  public String getNextSyncStart() {
    return nextSyncStart;
  }

  public void setNextSyncStart(String nextSyncStart) {
    this.nextSyncStart = nextSyncStart;
  }

  public InlineResponse2005 status(String status) {
    this.status = status;
    return this;
  }

   /**
   * Get status
   * @return status
  **/
  @Schema(example = "SYNCING", description = "")
  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    InlineResponse2005 inlineResponse2005 = (InlineResponse2005) o;
    return Objects.equals(this.modelName, inlineResponse2005.modelName) &&
        Objects.equals(this.lastSyncStart, inlineResponse2005.lastSyncStart) &&
        Objects.equals(this.nextSyncStart, inlineResponse2005.nextSyncStart) &&
        Objects.equals(this.status, inlineResponse2005.status);
  }

  @Override
  public int hashCode() {
    return Objects.hash(modelName, lastSyncStart, nextSyncStart, status);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class InlineResponse2005 {\n");
    
    sb.append("    modelName: ").append(toIndentedString(modelName)).append("\n");
    sb.append("    lastSyncStart: ").append(toIndentedString(lastSyncStart)).append("\n");
    sb.append("    nextSyncStart: ").append(toIndentedString(nextSyncStart)).append("\n");
    sb.append("    status: ").append(toIndentedString(status)).append("\n");
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
