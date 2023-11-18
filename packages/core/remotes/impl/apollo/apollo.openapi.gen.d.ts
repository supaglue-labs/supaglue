/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/v1/emailer_campaigns/{id}": {
    get: operations["getEmailerCampaign"];
  };
  "/v1/emailer_campaigns": {
    post: operations["createEmailerCampaign"];
  };
  "/v1/emailer_campaigns/{id}/add_contact_ids": {
    post: operations["addContactIdsToEmailerCampaign"];
  };
  "/v1/emailer_steps": {
    post: operations["createEmailerStep"];
  };
  "/v1/emailer_steps/{id}": {
    delete: operations["deleteEmailerStep"];
  };
  "/v1/emailer_touches/{id}": {
    put: operations["updateEmailerTouch"];
  };
  "/v1/contacts/{id}": {
    get: operations["getContact"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    emailer_campaign: {
      id: string;
      name?: string | null;
      /** Format: date-time */
      created_at: string;
      /** @enum {string} */
      permissions?: "team_can_use" | "team_can_view" | "private";
      active: boolean;
      archived: boolean;
      label_ids: string[];
      num_steps?: number | null;
      user_id?: string | null;
      unique_scheduled?: components["schemas"]["metric"];
      unique_delivered?: components["schemas"]["metric"];
      unique_bounced?: components["schemas"]["metric"];
      unique_opened?: components["schemas"]["metric"];
      unique_replied?: components["schemas"]["metric"];
      unique_demoed?: components["schemas"]["metric"];
      unique_clicked?: components["schemas"]["metric"];
      unique_unsubscribed?: components["schemas"]["metric"];
      bounce_rate?: components["schemas"]["metric"];
      open_rate?: components["schemas"]["metric"];
      click_rate?: components["schemas"]["metric"];
      reply_rate?: components["schemas"]["metric"];
      spam_blocked_rate?: components["schemas"]["metric"];
      opt_out_rate?: components["schemas"]["metric"];
      demo_rate?: components["schemas"]["metric"];
    };
    metric: number | "loading" | null;
    emailer_step: {
      id: string;
      emailer_campaign_id: string;
      position?: number | null;
      wait_time?: number | null;
      type: components["schemas"]["emailer_step_type"];
      wait_mode: components["schemas"]["emailer_step_wait_mode"];
      note?: string | null;
      max_emails_per_day?: number | null;
      exact_datetime?: string | null;
      priority?: string | null;
      auto_skip_in_x_days?: number | null;
      counts?: ({
        active?: number | null;
        paused?: number | null;
        finished?: number | null;
        bounced?: number | null;
        spam_blocked?: number | null;
        hard_bounced?: number | null;
        not_sent?: number | null;
      }) | null;
    };
    /** @enum {string} */
    emailer_step_type: "auto_email" | "manual_email" | "call" | "action_item" | "linkedin_step_message" | "linkedin_step_connect" | "linkedin_step_view_profile" | "linkedin_step_interact_post";
    /** @enum {string} */
    emailer_step_wait_mode: "second" | "minute" | "hour" | "day";
    emailer_touch: {
      id: string;
      emailer_step_id?: string | null;
      emailer_template_id?: string | null;
      emailer_template?: components["schemas"]["emailer_template"] | null;
      status?: string | null;
      /** @enum {string|null} */
      type?: "reply_to_thread" | "new_thread";
      include_signature?: boolean | null;
      has_personalized_opener?: boolean | null;
      personalized_opener_fallback_option?: string | null;
      generic_personalized_opener?: string | null;
      unique_scheduled?: components["schemas"]["metric"];
      unique_delivered?: components["schemas"]["metric"];
      unique_bounced?: components["schemas"]["metric"];
      unique_opened?: components["schemas"]["metric"];
      unique_replied?: components["schemas"]["metric"];
      bounce_rate?: components["schemas"]["metric"];
      open_rate?: components["schemas"]["metric"];
      reply_rate?: components["schemas"]["metric"];
      demo_rate?: components["schemas"]["metric"];
      unique_demoed?: components["schemas"]["metric"];
      unique_clicked?: components["schemas"]["metric"];
      click_rate?: components["schemas"]["metric"];
      unique_unsubscribed?: components["schemas"]["metric"];
      opt_out_rate?: components["schemas"]["metric"];
      unique_hard_bounced?: components["schemas"]["metric"];
      unique_spam_blocked?: components["schemas"]["metric"];
      hard_bounce_rate?: components["schemas"]["metric"];
      spam_block_rate?: components["schemas"]["metric"];
    };
    emailer_template: {
      id: string;
      name?: string | null;
      user_id?: string | null;
      subject?: string | null;
      archived?: boolean | null;
      /** Format: date-time */
      created_at?: string | null;
      global?: boolean | null;
      body_text?: string | null;
      folder_id?: string | null;
      body_html?: string | null;
      creation_type?: string | null;
      label_ids?: string[] | null;
      prompt_id?: string | null;
    };
    contact: {
      id: string;
      emailer_campaign_ids?: string[];
      contact_campaign_statuses: {
          id: string;
          send_email_from_email_account_id: string;
          emailer_campaign_id: string;
        }[];
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {

  getEmailerCampaign: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            emailer_campaign: components["schemas"]["emailer_campaign"];
            emailer_steps?: components["schemas"]["emailer_step"][] | null;
            emailer_touches?: components["schemas"]["emailer_touch"][] | null;
            emailer_templates?: components["schemas"]["emailer_template"][] | null;
          };
        };
      };
    };
  };
  createEmailerCampaign: {
    requestBody?: {
      content: {
        "application/json": {
          name?: string | null;
          /** @enum {string} */
          permissions?: "team_can_use" | "team_can_view" | "private";
          user_id?: string | null;
          label_ids?: string[];
          active?: boolean;
        };
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            emailer_campaign: components["schemas"]["emailer_campaign"];
            emailer_steps?: components["schemas"]["emailer_step"][] | null;
            emailer_touches?: components["schemas"]["emailer_touch"][] | null;
            emailer_templates?: components["schemas"]["emailer_template"][] | null;
          };
        };
      };
    };
  };
  addContactIdsToEmailerCampaign: {
    parameters: {
      path: {
        id: string;
      };
    };
    requestBody?: {
      content: {
        "application/json": {
          contact_ids: string[];
          emailer_campaign_id: string;
          send_email_from_email_account_id?: string | null;
          userId?: string | null;
        };
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            contacts: components["schemas"]["contact"][];
          };
        };
      };
    };
  };
  createEmailerStep: {
    requestBody?: {
      content: {
        "application/json": {
          emailer_campaign_id: string;
          priority?: string | null;
          position?: number | null;
          type: components["schemas"]["emailer_step_type"];
          wait_mode: components["schemas"]["emailer_step_wait_mode"];
          wait_time?: number | null;
          exact_datetime?: string | null;
          note?: string | null;
        };
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            emailer_step: components["schemas"]["emailer_step"];
            emailer_touch?: components["schemas"]["emailer_touch"] | null;
            emailer_template?: components["schemas"]["emailer_template"] | null;
          };
        };
      };
    };
  };
  deleteEmailerStep: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            emailer_step: {
              id: string;
              deleted: boolean;
            };
          };
        };
      };
    };
  };
  updateEmailerTouch: {
    parameters: {
      path: {
        id: string;
      };
    };
    requestBody?: {
      content: {
        "application/json": {
          id: string;
          emailer_step_id?: string | null;
          emailer_template?: components["schemas"]["emailer_template"] | null;
          /** @enum {string|null} */
          type?: "reply_to_thread" | "new_thread";
        };
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            emailer_touch: components["schemas"]["emailer_touch"];
          };
        };
      };
    };
  };
  getContact: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            contact: components["schemas"]["contact"];
          };
        };
      };
    };
  };
}