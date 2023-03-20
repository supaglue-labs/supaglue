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
 * PhoneNumbersInner
 */


public class PhoneNumbersInner {
  @SerializedName("phone_number")
  private String phoneNumber = null;

  /**
   * Gets or Sets phoneNumberType
   */
  @JsonAdapter(PhoneNumberTypeEnum.Adapter.class)
  public enum PhoneNumberTypeEnum {
    PRIMARY("primary"),
    MOBILE("mobile"),
    FAX("fax");

    private String value;

    PhoneNumberTypeEnum(String value) {
      this.value = value;
    }
    public String getValue() {
      return value;
    }

    @Override
    public String toString() {
      return String.valueOf(value);
    }
    public static PhoneNumberTypeEnum fromValue(String input) {
      for (PhoneNumberTypeEnum b : PhoneNumberTypeEnum.values()) {
        if (b.value.equals(input)) {
          return b;
        }
      }
      return null;
    }
    public static class Adapter extends TypeAdapter<PhoneNumberTypeEnum> {
      @Override
      public void write(final JsonWriter jsonWriter, final PhoneNumberTypeEnum enumeration) throws IOException {
        jsonWriter.value(String.valueOf(enumeration.getValue()));
      }

      @Override
      public PhoneNumberTypeEnum read(final JsonReader jsonReader) throws IOException {
        Object value = jsonReader.nextString();
        return PhoneNumberTypeEnum.fromValue((String)(value));
      }
    }
  }  @SerializedName("phone_number_type")
  private PhoneNumberTypeEnum phoneNumberType = null;

  public PhoneNumbersInner phoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
    return this;
  }

   /**
   * Get phoneNumber
   * @return phoneNumber
  **/
  @Schema(example = "+14151234567", required = true, description = "")
  public String getPhoneNumber() {
    return phoneNumber;
  }

  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  public PhoneNumbersInner phoneNumberType(PhoneNumberTypeEnum phoneNumberType) {
    this.phoneNumberType = phoneNumberType;
    return this;
  }

   /**
   * Get phoneNumberType
   * @return phoneNumberType
  **/
  @Schema(required = true, description = "")
  public PhoneNumberTypeEnum getPhoneNumberType() {
    return phoneNumberType;
  }

  public void setPhoneNumberType(PhoneNumberTypeEnum phoneNumberType) {
    this.phoneNumberType = phoneNumberType;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    PhoneNumbersInner phoneNumbersInner = (PhoneNumbersInner) o;
    return Objects.equals(this.phoneNumber, phoneNumbersInner.phoneNumber) &&
        Objects.equals(this.phoneNumberType, phoneNumbersInner.phoneNumberType);
  }

  @Override
  public int hashCode() {
    return Objects.hash(phoneNumber, phoneNumberType);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class PhoneNumbersInner {\n");
    
    sb.append("    phoneNumber: ").append(toIndentedString(phoneNumber)).append("\n");
    sb.append("    phoneNumberType: ").append(toIndentedString(phoneNumberType)).append("\n");
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
