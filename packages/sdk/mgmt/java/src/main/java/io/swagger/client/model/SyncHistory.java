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
 * SyncHistory
 */


public class SyncHistory {
  @SerializedName("model_name")
  private Object modelName = null;

  @SerializedName("error_message")
  private Object errorMessage = null;

  @SerializedName("start_timestamp")
  private Object startTimestamp = null;

  @SerializedName("end_timestamp")
  private Object endTimestamp = null;

  @SerializedName("application_id")
  private Object applicationId = null;

  @SerializedName("customer_id")
  private Object customerId = null;

  @SerializedName("provider_name")
  private Object providerName = null;

  @SerializedName("category")
  private Object category = null;

  @SerializedName("connection_id")
  private Object connectionId = null;

  @SerializedName("status")
  private Object status = null;

  public SyncHistory modelName(Object modelName) {
    this.modelName = modelName;
    return this;
  }

   /**
   * Get modelName
   * @return modelName
  **/
  @Schema(example = "Account", required = true, description = "")
  public Object getModelName() {
    return modelName;
  }

  public void setModelName(Object modelName) {
    this.modelName = modelName;
  }

  public SyncHistory errorMessage(Object errorMessage) {
    this.errorMessage = errorMessage;
    return this;
  }

   /**
   * Get errorMessage
   * @return errorMessage
  **/
  @Schema(required = true, description = "")
  public Object getErrorMessage() {
    return errorMessage;
  }

  public void setErrorMessage(Object errorMessage) {
    this.errorMessage = errorMessage;
  }

  public SyncHistory startTimestamp(Object startTimestamp) {
    this.startTimestamp = startTimestamp;
    return this;
  }

   /**
   * Get startTimestamp
   * @return startTimestamp
  **/
  @Schema(example = "2023-02-22T19:55:17.559Z", required = true, description = "")
  public Object getStartTimestamp() {
    return startTimestamp;
  }

  public void setStartTimestamp(Object startTimestamp) {
    this.startTimestamp = startTimestamp;
  }

  public SyncHistory endTimestamp(Object endTimestamp) {
    this.endTimestamp = endTimestamp;
    return this;
  }

   /**
   * Get endTimestamp
   * @return endTimestamp
  **/
  @Schema(example = "2023-02-22T20:55:17.559Z", required = true, description = "")
  public Object getEndTimestamp() {
    return endTimestamp;
  }

  public void setEndTimestamp(Object endTimestamp) {
    this.endTimestamp = endTimestamp;
  }

  public SyncHistory applicationId(Object applicationId) {
    this.applicationId = applicationId;
    return this;
  }

   /**
   * Get applicationId
   * @return applicationId
  **/
  @Schema(example = "974125fa-ffb6-47fc-b12f-44c566fc5da1", required = true, description = "")
  public Object getApplicationId() {
    return applicationId;
  }

  public void setApplicationId(Object applicationId) {
    this.applicationId = applicationId;
  }

  public SyncHistory customerId(Object customerId) {
    this.customerId = customerId;
    return this;
  }

   /**
   * Get customerId
   * @return customerId
  **/
  @Schema(example = "my-customer-1", required = true, description = "")
  public Object getCustomerId() {
    return customerId;
  }

  public void setCustomerId(Object customerId) {
    this.customerId = customerId;
  }

  public SyncHistory providerName(Object providerName) {
    this.providerName = providerName;
    return this;
  }

   /**
   * Get providerName
   * @return providerName
  **/
  @Schema(example = "hubspot", required = true, description = "")
  public Object getProviderName() {
    return providerName;
  }

  public void setProviderName(Object providerName) {
    this.providerName = providerName;
  }

  public SyncHistory category(Object category) {
    this.category = category;
    return this;
  }

   /**
   * Get category
   * @return category
  **/
  @Schema(required = true, description = "")
  public Object getCategory() {
    return category;
  }

  public void setCategory(Object category) {
    this.category = category;
  }

  public SyncHistory connectionId(Object connectionId) {
    this.connectionId = connectionId;
    return this;
  }

   /**
   * Get connectionId
   * @return connectionId
  **/
  @Schema(example = "3217ea51-11c8-43c9-9547-6f197e02e5e4", required = true, description = "")
  public Object getConnectionId() {
    return connectionId;
  }

  public void setConnectionId(Object connectionId) {
    this.connectionId = connectionId;
  }

  public SyncHistory status(Object status) {
    this.status = status;
    return this;
  }

   /**
   * Get status
   * @return status
  **/
  @Schema(required = true, description = "")
  public Object getStatus() {
    return status;
  }

  public void setStatus(Object status) {
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
    SyncHistory syncHistory = (SyncHistory) o;
    return Objects.equals(this.modelName, syncHistory.modelName) &&
        Objects.equals(this.errorMessage, syncHistory.errorMessage) &&
        Objects.equals(this.startTimestamp, syncHistory.startTimestamp) &&
        Objects.equals(this.endTimestamp, syncHistory.endTimestamp) &&
        Objects.equals(this.applicationId, syncHistory.applicationId) &&
        Objects.equals(this.customerId, syncHistory.customerId) &&
        Objects.equals(this.providerName, syncHistory.providerName) &&
        Objects.equals(this.category, syncHistory.category) &&
        Objects.equals(this.connectionId, syncHistory.connectionId) &&
        Objects.equals(this.status, syncHistory.status);
  }

  @Override
  public int hashCode() {
    return Objects.hash(modelName, errorMessage, startTimestamp, endTimestamp, applicationId, customerId, providerName, category, connectionId, status);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class SyncHistory {\n");
    
    sb.append("    modelName: ").append(toIndentedString(modelName)).append("\n");
    sb.append("    errorMessage: ").append(toIndentedString(errorMessage)).append("\n");
    sb.append("    startTimestamp: ").append(toIndentedString(startTimestamp)).append("\n");
    sb.append("    endTimestamp: ").append(toIndentedString(endTimestamp)).append("\n");
    sb.append("    applicationId: ").append(toIndentedString(applicationId)).append("\n");
    sb.append("    customerId: ").append(toIndentedString(customerId)).append("\n");
    sb.append("    providerName: ").append(toIndentedString(providerName)).append("\n");
    sb.append("    category: ").append(toIndentedString(category)).append("\n");
    sb.append("    connectionId: ").append(toIndentedString(connectionId)).append("\n");
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
