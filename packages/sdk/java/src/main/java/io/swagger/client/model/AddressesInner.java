/*
 * Supaglue API
 * # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/api/crm/v1 ``` 
 *
 * OpenAPI spec version: 0.3.0
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
 * AddressesInner
 */

@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.JavaClientCodegen", date = "2023-03-07T14:01:12.375882-08:00[America/Los_Angeles]")
public class AddressesInner {
  @SerializedName("address_type")
  private String addressType = null;

  @SerializedName("city")
  private String city = null;

  @SerializedName("country")
  private String country = null;

  @SerializedName("postal_code")
  private String postalCode = null;

  @SerializedName("state")
  private String state = null;

  @SerializedName("street_1")
  private String street1 = null;

  @SerializedName("street_2")
  private String street2 = null;

  public AddressesInner addressType(String addressType) {
    this.addressType = addressType;
    return this;
  }

   /**
   * Get addressType
   * @return addressType
  **/
  @Schema(example = "Shipping", description = "")
  public String getAddressType() {
    return addressType;
  }

  public void setAddressType(String addressType) {
    this.addressType = addressType;
  }

  public AddressesInner city(String city) {
    this.city = city;
    return this;
  }

   /**
   * Get city
   * @return city
  **/
  @Schema(example = "San Francisco", description = "")
  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public AddressesInner country(String country) {
    this.country = country;
    return this;
  }

   /**
   * Get country
   * @return country
  **/
  @Schema(example = "USA", description = "")
  public String getCountry() {
    return country;
  }

  public void setCountry(String country) {
    this.country = country;
  }

  public AddressesInner postalCode(String postalCode) {
    this.postalCode = postalCode;
    return this;
  }

   /**
   * Get postalCode
   * @return postalCode
  **/
  @Schema(example = "94107", description = "")
  public String getPostalCode() {
    return postalCode;
  }

  public void setPostalCode(String postalCode) {
    this.postalCode = postalCode;
  }

  public AddressesInner state(String state) {
    this.state = state;
    return this;
  }

   /**
   * Get state
   * @return state
  **/
  @Schema(example = "CA", description = "")
  public String getState() {
    return state;
  }

  public void setState(String state) {
    this.state = state;
  }

  public AddressesInner street1(String street1) {
    this.street1 = street1;
    return this;
  }

   /**
   * Get street1
   * @return street1
  **/
  @Schema(example = "525 Brannan", description = "")
  public String getStreet1() {
    return street1;
  }

  public void setStreet1(String street1) {
    this.street1 = street1;
  }

  public AddressesInner street2(String street2) {
    this.street2 = street2;
    return this;
  }

   /**
   * Get street2
   * @return street2
  **/
  @Schema(description = "")
  public String getStreet2() {
    return street2;
  }

  public void setStreet2(String street2) {
    this.street2 = street2;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    AddressesInner addressesInner = (AddressesInner) o;
    return Objects.equals(this.addressType, addressesInner.addressType) &&
        Objects.equals(this.city, addressesInner.city) &&
        Objects.equals(this.country, addressesInner.country) &&
        Objects.equals(this.postalCode, addressesInner.postalCode) &&
        Objects.equals(this.state, addressesInner.state) &&
        Objects.equals(this.street1, addressesInner.street1) &&
        Objects.equals(this.street2, addressesInner.street2);
  }

  @Override
  public int hashCode() {
    return Objects.hash(addressType, city, country, postalCode, state, street1, street2);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class AddressesInner {\n");
    
    sb.append("    addressType: ").append(toIndentedString(addressType)).append("\n");
    sb.append("    city: ").append(toIndentedString(city)).append("\n");
    sb.append("    country: ").append(toIndentedString(country)).append("\n");
    sb.append("    postalCode: ").append(toIndentedString(postalCode)).append("\n");
    sb.append("    state: ").append(toIndentedString(state)).append("\n");
    sb.append("    street1: ").append(toIndentedString(street1)).append("\n");
    sb.append("    street2: ").append(toIndentedString(street2)).append("\n");
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
