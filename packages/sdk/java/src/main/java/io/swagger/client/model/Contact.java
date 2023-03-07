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
import io.swagger.client.model.Account;
import io.swagger.client.model.Addresses;
import io.swagger.client.model.EmailAddresses;
import io.swagger.client.model.PhoneNumbers;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.IOException;
import org.threeten.bp.OffsetDateTime;
/**
 * Contact
 */

@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.JavaClientCodegen", date = "2023-03-07T15:50:51.298786-08:00[America/Los_Angeles]")
public class Contact {
  @SerializedName("account_id")
  private String accountId = null;

  @SerializedName("account")
  private Account account = null;

  @SerializedName("addresses")
  private Addresses addresses = null;

  @SerializedName("email_addresses")
  private EmailAddresses emailAddresses = null;

  @SerializedName("first_name")
  private String firstName = null;

  @SerializedName("id")
  private String id = null;

  @SerializedName("last_activity_at")
  private OffsetDateTime lastActivityAt = null;

  @SerializedName("last_name")
  private String lastName = null;

  @SerializedName("phone_numbers")
  private PhoneNumbers phoneNumbers = null;

  @SerializedName("created_at")
  private OffsetDateTime createdAt = null;

  @SerializedName("updated_at")
  private OffsetDateTime updatedAt = null;

  public Contact accountId(String accountId) {
    this.accountId = accountId;
    return this;
  }

   /**
   * Get accountId
   * @return accountId
  **/
  @Schema(example = "fd089246-09b1-4e3b-a60a-7a76314bbcce", description = "")
  public String getAccountId() {
    return accountId;
  }

  public void setAccountId(String accountId) {
    this.accountId = accountId;
  }

  public Contact account(Account account) {
    this.account = account;
    return this;
  }

   /**
   * Get account
   * @return account
  **/
  @Schema(description = "")
  public Account getAccount() {
    return account;
  }

  public void setAccount(Account account) {
    this.account = account;
  }

  public Contact addresses(Addresses addresses) {
    this.addresses = addresses;
    return this;
  }

   /**
   * Get addresses
   * @return addresses
  **/
  @Schema(description = "")
  public Addresses getAddresses() {
    return addresses;
  }

  public void setAddresses(Addresses addresses) {
    this.addresses = addresses;
  }

  public Contact emailAddresses(EmailAddresses emailAddresses) {
    this.emailAddresses = emailAddresses;
    return this;
  }

   /**
   * Get emailAddresses
   * @return emailAddresses
  **/
  @Schema(description = "")
  public EmailAddresses getEmailAddresses() {
    return emailAddresses;
  }

  public void setEmailAddresses(EmailAddresses emailAddresses) {
    this.emailAddresses = emailAddresses;
  }

  public Contact firstName(String firstName) {
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

  public Contact id(String id) {
    this.id = id;
    return this;
  }

   /**
   * Get id
   * @return id
  **/
  @Schema(example = "88cc44ca-7a34-4e8b-b0da-51c3aae34daf", description = "")
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public Contact lastActivityAt(OffsetDateTime lastActivityAt) {
    this.lastActivityAt = lastActivityAt;
    return this;
  }

   /**
   * Get lastActivityAt
   * @return lastActivityAt
  **/
  @Schema(example = "2022-02-27T00:00Z", description = "")
  public OffsetDateTime getLastActivityAt() {
    return lastActivityAt;
  }

  public void setLastActivityAt(OffsetDateTime lastActivityAt) {
    this.lastActivityAt = lastActivityAt;
  }

  public Contact lastName(String lastName) {
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

  public Contact phoneNumbers(PhoneNumbers phoneNumbers) {
    this.phoneNumbers = phoneNumbers;
    return this;
  }

   /**
   * Get phoneNumbers
   * @return phoneNumbers
  **/
  @Schema(description = "")
  public PhoneNumbers getPhoneNumbers() {
    return phoneNumbers;
  }

  public void setPhoneNumbers(PhoneNumbers phoneNumbers) {
    this.phoneNumbers = phoneNumbers;
  }

  public Contact createdAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
    return this;
  }

   /**
   * Get createdAt
   * @return createdAt
  **/
  @Schema(example = "2022-02-27T00:00Z", description = "")
  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public Contact updatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
    return this;
  }

   /**
   * Get updatedAt
   * @return updatedAt
  **/
  @Schema(example = "2022-02-27T00:00Z", description = "")
  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Contact contact = (Contact) o;
    return Objects.equals(this.accountId, contact.accountId) &&
        Objects.equals(this.account, contact.account) &&
        Objects.equals(this.addresses, contact.addresses) &&
        Objects.equals(this.emailAddresses, contact.emailAddresses) &&
        Objects.equals(this.firstName, contact.firstName) &&
        Objects.equals(this.id, contact.id) &&
        Objects.equals(this.lastActivityAt, contact.lastActivityAt) &&
        Objects.equals(this.lastName, contact.lastName) &&
        Objects.equals(this.phoneNumbers, contact.phoneNumbers) &&
        Objects.equals(this.createdAt, contact.createdAt) &&
        Objects.equals(this.updatedAt, contact.updatedAt);
  }

  @Override
  public int hashCode() {
    return Objects.hash(accountId, account, addresses, emailAddresses, firstName, id, lastActivityAt, lastName, phoneNumbers, createdAt, updatedAt);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Contact {\n");
    
    sb.append("    accountId: ").append(toIndentedString(accountId)).append("\n");
    sb.append("    account: ").append(toIndentedString(account)).append("\n");
    sb.append("    addresses: ").append(toIndentedString(addresses)).append("\n");
    sb.append("    emailAddresses: ").append(toIndentedString(emailAddresses)).append("\n");
    sb.append("    firstName: ").append(toIndentedString(firstName)).append("\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    lastActivityAt: ").append(toIndentedString(lastActivityAt)).append("\n");
    sb.append("    lastName: ").append(toIndentedString(lastName)).append("\n");
    sb.append("    phoneNumbers: ").append(toIndentedString(phoneNumbers)).append("\n");
    sb.append("    createdAt: ").append(toIndentedString(createdAt)).append("\n");
    sb.append("    updatedAt: ").append(toIndentedString(updatedAt)).append("\n");
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
