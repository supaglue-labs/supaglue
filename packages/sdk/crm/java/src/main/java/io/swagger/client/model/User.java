/*
 * Supaglue CRM API
 * # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/crm/v1 ``` 
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
import org.threeten.bp.OffsetDateTime;
/**
 * User
 */


public class User {
  @SerializedName("id")
  private String id = null;

  @SerializedName("remote_id")
  private String remoteId = null;

  @SerializedName("name")
  private String name = null;

  @SerializedName("email")
  private String email = null;

  @SerializedName("is_active")
  private Boolean isActive = null;

  @SerializedName("remote_created_at")
  private OffsetDateTime remoteCreatedAt = null;

  @SerializedName("remote_updated_at")
  private OffsetDateTime remoteUpdatedAt = null;

  @SerializedName("remote_was_deleted")
  private Boolean remoteWasDeleted = null;

  @SerializedName("last_modified_at")
  private OffsetDateTime lastModifiedAt = null;

  public User id(String id) {
    this.id = id;
    return this;
  }

   /**
   * Get id
   * @return id
  **/
  @Schema(example = "e888cedf-e9d0-42c5-9485-2d72984faef2", required = true, description = "")
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public User remoteId(String remoteId) {
    this.remoteId = remoteId;
    return this;
  }

   /**
   * Get remoteId
   * @return remoteId
  **/
  @Schema(example = "54312", required = true, description = "")
  public String getRemoteId() {
    return remoteId;
  }

  public void setRemoteId(String remoteId) {
    this.remoteId = remoteId;
  }

  public User name(String name) {
    this.name = name;
    return this;
  }

   /**
   * Get name
   * @return name
  **/
  @Schema(example = "George Xing", required = true, description = "")
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public User email(String email) {
    this.email = email;
    return this;
  }

   /**
   * Get email
   * @return email
  **/
  @Schema(example = "george@supaglue.com", required = true, description = "")
  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public User isActive(Boolean isActive) {
    this.isActive = isActive;
    return this;
  }

   /**
   * Get isActive
   * @return isActive
  **/
  @Schema(required = true, description = "")
  public Boolean isIsActive() {
    return isActive;
  }

  public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
  }

  public User remoteCreatedAt(OffsetDateTime remoteCreatedAt) {
    this.remoteCreatedAt = remoteCreatedAt;
    return this;
  }

   /**
   * Get remoteCreatedAt
   * @return remoteCreatedAt
  **/
  @Schema(example = "2022-02-27T00:00Z", description = "")
  public OffsetDateTime getRemoteCreatedAt() {
    return remoteCreatedAt;
  }

  public void setRemoteCreatedAt(OffsetDateTime remoteCreatedAt) {
    this.remoteCreatedAt = remoteCreatedAt;
  }

  public User remoteUpdatedAt(OffsetDateTime remoteUpdatedAt) {
    this.remoteUpdatedAt = remoteUpdatedAt;
    return this;
  }

   /**
   * Get remoteUpdatedAt
   * @return remoteUpdatedAt
  **/
  @Schema(example = "2022-02-27T00:00Z", description = "")
  public OffsetDateTime getRemoteUpdatedAt() {
    return remoteUpdatedAt;
  }

  public void setRemoteUpdatedAt(OffsetDateTime remoteUpdatedAt) {
    this.remoteUpdatedAt = remoteUpdatedAt;
  }

  public User remoteWasDeleted(Boolean remoteWasDeleted) {
    this.remoteWasDeleted = remoteWasDeleted;
    return this;
  }

   /**
   * Get remoteWasDeleted
   * @return remoteWasDeleted
  **/
  @Schema(example = "false", description = "")
  public Boolean isRemoteWasDeleted() {
    return remoteWasDeleted;
  }

  public void setRemoteWasDeleted(Boolean remoteWasDeleted) {
    this.remoteWasDeleted = remoteWasDeleted;
  }

  public User lastModifiedAt(OffsetDateTime lastModifiedAt) {
    this.lastModifiedAt = lastModifiedAt;
    return this;
  }

   /**
   * Get lastModifiedAt
   * @return lastModifiedAt
  **/
  @Schema(example = "2022-02-27T00:00Z", description = "")
  public OffsetDateTime getLastModifiedAt() {
    return lastModifiedAt;
  }

  public void setLastModifiedAt(OffsetDateTime lastModifiedAt) {
    this.lastModifiedAt = lastModifiedAt;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    User user = (User) o;
    return Objects.equals(this.id, user.id) &&
        Objects.equals(this.remoteId, user.remoteId) &&
        Objects.equals(this.name, user.name) &&
        Objects.equals(this.email, user.email) &&
        Objects.equals(this.isActive, user.isActive) &&
        Objects.equals(this.remoteCreatedAt, user.remoteCreatedAt) &&
        Objects.equals(this.remoteUpdatedAt, user.remoteUpdatedAt) &&
        Objects.equals(this.remoteWasDeleted, user.remoteWasDeleted) &&
        Objects.equals(this.lastModifiedAt, user.lastModifiedAt);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, remoteId, name, email, isActive, remoteCreatedAt, remoteUpdatedAt, remoteWasDeleted, lastModifiedAt);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class User {\n");
    
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    remoteId: ").append(toIndentedString(remoteId)).append("\n");
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
    sb.append("    email: ").append(toIndentedString(email)).append("\n");
    sb.append("    isActive: ").append(toIndentedString(isActive)).append("\n");
    sb.append("    remoteCreatedAt: ").append(toIndentedString(remoteCreatedAt)).append("\n");
    sb.append("    remoteUpdatedAt: ").append(toIndentedString(remoteUpdatedAt)).append("\n");
    sb.append("    remoteWasDeleted: ").append(toIndentedString(remoteWasDeleted)).append("\n");
    sb.append("    lastModifiedAt: ").append(toIndentedString(lastModifiedAt)).append("\n");
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
