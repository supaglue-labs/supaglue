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
 * CreateUpdateLead
 */

@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.JavaClientCodegen", date = "2023-03-07T15:50:51.298786-08:00[America/Los_Angeles]")
public class CreateUpdateLead {
  @SerializedName("company")
  private String company = null;

  @SerializedName("first_name")
  private String firstName = null;

  @SerializedName("last_name")
  private String lastName = null;

  @SerializedName("lead_source")
  private String leadSource = null;

  @SerializedName("title")
  private String title = null;

  @SerializedName("converted_account_id")
  private String convertedAccountId = null;

  @SerializedName("converted_contact_id")
  private String convertedContactId = null;

  public CreateUpdateLead company(String company) {
    this.company = company;
    return this;
  }

   /**
   * Get company
   * @return company
  **/
  @Schema(example = "Supaglue", description = "")
  public String getCompany() {
    return company;
  }

  public void setCompany(String company) {
    this.company = company;
  }

  public CreateUpdateLead firstName(String firstName) {
    this.firstName = firstName;
    return this;
  }

   /**
   * Get firstName
   * @return firstName
  **/
  @Schema(example = "George", description = "")
  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public CreateUpdateLead lastName(String lastName) {
    this.lastName = lastName;
    return this;
  }

   /**
   * Get lastName
   * @return lastName
  **/
  @Schema(example = "Xing", description = "")
  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public CreateUpdateLead leadSource(String leadSource) {
    this.leadSource = leadSource;
    return this;
  }

   /**
   * Get leadSource
   * @return leadSource
  **/
  @Schema(example = "API Blogger", description = "")
  public String getLeadSource() {
    return leadSource;
  }

  public void setLeadSource(String leadSource) {
    this.leadSource = leadSource;
  }

  public CreateUpdateLead title(String title) {
    this.title = title;
    return this;
  }

   /**
   * Get title
   * @return title
  **/
  @Schema(example = "Co-Founder", description = "")
  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public CreateUpdateLead convertedAccountId(String convertedAccountId) {
    this.convertedAccountId = convertedAccountId;
    return this;
  }

   /**
   * Get convertedAccountId
   * @return convertedAccountId
  **/
  @Schema(example = "ab849b1c-c36b-4d8b-9e45-679b48fc4de7", description = "")
  public String getConvertedAccountId() {
    return convertedAccountId;
  }

  public void setConvertedAccountId(String convertedAccountId) {
    this.convertedAccountId = convertedAccountId;
  }

  public CreateUpdateLead convertedContactId(String convertedContactId) {
    this.convertedContactId = convertedContactId;
    return this;
  }

   /**
   * Get convertedContactId
   * @return convertedContactId
  **/
  @Schema(example = "64571bff-48ea-4469-9fa0-ee1a0bab38bd", description = "")
  public String getConvertedContactId() {
    return convertedContactId;
  }

  public void setConvertedContactId(String convertedContactId) {
    this.convertedContactId = convertedContactId;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CreateUpdateLead createUpdateLead = (CreateUpdateLead) o;
    return Objects.equals(this.company, createUpdateLead.company) &&
        Objects.equals(this.firstName, createUpdateLead.firstName) &&
        Objects.equals(this.lastName, createUpdateLead.lastName) &&
        Objects.equals(this.leadSource, createUpdateLead.leadSource) &&
        Objects.equals(this.title, createUpdateLead.title) &&
        Objects.equals(this.convertedAccountId, createUpdateLead.convertedAccountId) &&
        Objects.equals(this.convertedContactId, createUpdateLead.convertedContactId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(company, firstName, lastName, leadSource, title, convertedAccountId, convertedContactId);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class CreateUpdateLead {\n");
    
    sb.append("    company: ").append(toIndentedString(company)).append("\n");
    sb.append("    firstName: ").append(toIndentedString(firstName)).append("\n");
    sb.append("    lastName: ").append(toIndentedString(lastName)).append("\n");
    sb.append("    leadSource: ").append(toIndentedString(leadSource)).append("\n");
    sb.append("    title: ").append(toIndentedString(title)).append("\n");
    sb.append("    convertedAccountId: ").append(toIndentedString(convertedAccountId)).append("\n");
    sb.append("    convertedContactId: ").append(toIndentedString(convertedContactId)).append("\n");
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
