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
 * LogsInner
 */

@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.JavaClientCodegen", date = "2023-03-07T15:50:51.298786-08:00[America/Los_Angeles]")
public class LogsInner {
  @SerializedName("dashboard_view")
  private String dashboardView = null;

  @SerializedName("log_id")
  private String logId = null;

  @SerializedName("log_summary")
  private Object logSummary = null;

  public LogsInner dashboardView(String dashboardView) {
    this.dashboardView = dashboardView;
    return this;
  }

   /**
   * Get dashboardView
   * @return dashboardView
  **/
  @Schema(example = "https://api.supaglue.com/logs/99433219-8017-4acd-bb3c-ceb23d663832", description = "")
  public String getDashboardView() {
    return dashboardView;
  }

  public void setDashboardView(String dashboardView) {
    this.dashboardView = dashboardView;
  }

  public LogsInner logId(String logId) {
    this.logId = logId;
    return this;
  }

   /**
   * Get logId
   * @return logId
  **/
  @Schema(example = "99433219-8017-4acd-bb3c-ceb23d663832", description = "")
  public String getLogId() {
    return logId;
  }

  public void setLogId(String logId) {
    this.logId = logId;
  }

  public LogsInner logSummary(Object logSummary) {
    this.logSummary = logSummary;
    return this;
  }

   /**
   * Get logSummary
   * @return logSummary
  **/
  @Schema(description = "")
  public Object getLogSummary() {
    return logSummary;
  }

  public void setLogSummary(Object logSummary) {
    this.logSummary = logSummary;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    LogsInner logsInner = (LogsInner) o;
    return Objects.equals(this.dashboardView, logsInner.dashboardView) &&
        Objects.equals(this.logId, logsInner.logId) &&
        Objects.equals(this.logSummary, logsInner.logSummary);
  }

  @Override
  public int hashCode() {
    return Objects.hash(dashboardView, logId, logSummary);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class LogsInner {\n");
    
    sb.append("    dashboardView: ").append(toIndentedString(dashboardView)).append("\n");
    sb.append("    logId: ").append(toIndentedString(logId)).append("\n");
    sb.append("    logSummary: ").append(toIndentedString(logSummary)).append("\n");
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
