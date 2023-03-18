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
import io.swagger.client.model.CreateUpdateLead;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.IOException;
/**
 * LeadsBody
 */


public class LeadsBody {
  @SerializedName("model")
  private CreateUpdateLead model = null;

  public LeadsBody model(CreateUpdateLead model) {
    this.model = model;
    return this;
  }

   /**
   * Get model
   * @return model
  **/
  @Schema(required = true, description = "")
  public CreateUpdateLead getModel() {
    return model;
  }

  public void setModel(CreateUpdateLead model) {
    this.model = model;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    LeadsBody leadsBody = (LeadsBody) o;
    return Objects.equals(this.model, leadsBody.model);
  }

  @Override
  public int hashCode() {
    return Objects.hash(model);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class LeadsBody {\n");
    
    sb.append("    model: ").append(toIndentedString(model)).append("\n");
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
