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
import io.swagger.client.model.Filter;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.IOException;
/**
 * OpportunitiesSearchFilters
 */


public class OpportunitiesSearchFilters {
  @SerializedName("account_id")
  private Filter accountId = null;

  public OpportunitiesSearchFilters accountId(Filter accountId) {
    this.accountId = accountId;
    return this;
  }

   /**
   * Get accountId
   * @return accountId
  **/
  @Schema(description = "")
  public Filter getAccountId() {
    return accountId;
  }

  public void setAccountId(Filter accountId) {
    this.accountId = accountId;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    OpportunitiesSearchFilters opportunitiesSearchFilters = (OpportunitiesSearchFilters) o;
    return Objects.equals(this.accountId, opportunitiesSearchFilters.accountId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(accountId);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class OpportunitiesSearchFilters {\n");
    
    sb.append("    accountId: ").append(toIndentedString(accountId)).append("\n");
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
