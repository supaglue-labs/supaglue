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
import io.swagger.client.model.Contact;
import io.swagger.client.model.Errors;
import io.swagger.client.model.Logs;
import io.swagger.client.model.Warnings;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.IOException;
/**
 * InlineResponse2011
 */

@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.JavaClientCodegen", date = "2023-03-07T15:49:43.015334-08:00[America/Los_Angeles]")
public class InlineResponse2011 {
  @SerializedName("errors")
  private Errors errors = null;

  @SerializedName("logs")
  private Logs logs = null;

  @SerializedName("model")
  private Contact model = null;

  @SerializedName("warnings")
  private Warnings warnings = null;

  public InlineResponse2011 errors(Errors errors) {
    this.errors = errors;
    return this;
  }

   /**
   * Get errors
   * @return errors
  **/
  @Schema(description = "")
  public Errors getErrors() {
    return errors;
  }

  public void setErrors(Errors errors) {
    this.errors = errors;
  }

  public InlineResponse2011 logs(Logs logs) {
    this.logs = logs;
    return this;
  }

   /**
   * Get logs
   * @return logs
  **/
  @Schema(description = "")
  public Logs getLogs() {
    return logs;
  }

  public void setLogs(Logs logs) {
    this.logs = logs;
  }

  public InlineResponse2011 model(Contact model) {
    this.model = model;
    return this;
  }

   /**
   * Get model
   * @return model
  **/
  @Schema(description = "")
  public Contact getModel() {
    return model;
  }

  public void setModel(Contact model) {
    this.model = model;
  }

  public InlineResponse2011 warnings(Warnings warnings) {
    this.warnings = warnings;
    return this;
  }

   /**
   * Get warnings
   * @return warnings
  **/
  @Schema(description = "")
  public Warnings getWarnings() {
    return warnings;
  }

  public void setWarnings(Warnings warnings) {
    this.warnings = warnings;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    InlineResponse2011 inlineResponse2011 = (InlineResponse2011) o;
    return Objects.equals(this.errors, inlineResponse2011.errors) &&
        Objects.equals(this.logs, inlineResponse2011.logs) &&
        Objects.equals(this.model, inlineResponse2011.model) &&
        Objects.equals(this.warnings, inlineResponse2011.warnings);
  }

  @Override
  public int hashCode() {
    return Objects.hash(errors, logs, model, warnings);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class InlineResponse2011 {\n");
    
    sb.append("    errors: ").append(toIndentedString(errors)).append("\n");
    sb.append("    logs: ").append(toIndentedString(logs)).append("\n");
    sb.append("    model: ").append(toIndentedString(model)).append("\n");
    sb.append("    warnings: ").append(toIndentedString(warnings)).append("\n");
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
