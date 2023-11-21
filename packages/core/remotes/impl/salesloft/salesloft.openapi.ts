import { z } from 'zod';
import { createDocument, extendZodWithOpenApi } from 'zod-openapi';
import { jsonOperation } from '../../utils/integration-utils';
import salesloftSpec from './salesloft.orig.openapi.json';

extendZodWithOpenApi(z);

const cadenceSettings = z
  .object({
    name: z.string(),
    target_daily_people: z.number(),
    remove_replied: z.boolean(),
    remove_bounced: z.boolean(),
    remove_people_when_meeting_booked: z.boolean().optional(),
    external_identifier: z.union([z.string(), z.number()]).nullable(),
    cadence_function: z.enum(['outbound', 'inbound', 'event', 'other']),
  })
  .openapi({ ref: 'CadenceSettings' });

const cadenceSharingSettings = z
  .object({
    team_cadence: z.boolean(),
    shared: z.boolean(),
  })
  .openapi({ ref: 'CadenceSharingSettings' });

const automatedSettingsSchema = z
  .object({
    allow_send_on_weekends: z
      .boolean()
      .optional()
      .describe('Determines whether or not the step is able to be sent on weekends'),
  })
  .and(
    z.discriminatedUnion('send_type', [
      z.object({
        send_type: z.literal('at_time').describe(`Describes if the step is due immediately or not.
        Must be either "at_time" or "after_time_delay".`),
        time_of_day: z.string().describe('The time that the automated action will happen. e.g. 09:00'),
        timezone_mode: z.union([z.literal('person'), z.literal('user')])
          .describe(`Specifies whether the email is sent after the person's timezone
        or the user's timezone.
        Must be either "person" or "user".`),
      }),
      z.object({
        send_type: z.literal('after_time_delay').describe(`Describes if the step is due immediately or not.
        Must be either "at_time" or "after_time_delay".`),
        delay_time: z.number().describe('must be a number between 0 and 720 (minutes'),
      }),
    ])
  )
  .openapi({ ref: 'StepGroupAutomatedSettings' });

const stepSchema = z
  .object({
    enabled: z.boolean(),
    name: z.string(),
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('Phone'),
        type_settings: z.object({
          instructions: z.string(),
        }),
      }),
      z.object({
        type: z.literal('Other'),
        type_settings: z.object({
          instructions: z.string(),
        }),
      }),
      z.object({
        type: z.literal('Integration'),
        type_settings: z.object({
          instructions: z.string(),
          integration_id: z.number(),
          integration_step_type_guid: z.string(),
        }),
      }),
      z.object({
        type: z.literal('Email'),
        type_settings: z.object({
          previous_email_step_group_reference_id: z.number().optional(),
          email_template: z
            .object({
              title: z.string().optional(),
              subject: z.string().optional(),
              body: z.string().optional(),
            })
            .optional(),
        }),
      }),
    ])
  )
  .openapi({ ref: 'Step' });

const stepGroupSchema = z
  .object({
    automated_settings: automatedSettingsSchema.optional(),
    automated: z.boolean(),
    day: z.number(),
    due_immediately: z.boolean(),
    reference_id: z.number().optional().nullable(),
    steps: z.array(stepSchema),
  })
  .openapi({ ref: 'StepGroup' });

const cadenceImport = z
  .object({
    settings: cadenceSettings.optional(),
    sharing_settings: cadenceSharingSettings.optional(),
    cadence_content: z.object({
      cadence_id: z.number().optional(),
      step_groups: z.array(stepGroupSchema),
    }),
  })
  .openapi({ ref: 'CadenceImport' });

const cadenceExport = z
  .object({
    data: z.object({
      cadence_content: z.object({
        settings: cadenceSettings.optional(),
        sharing_settings: cadenceSharingSettings.optional(),
        step_groups: z.array(stepGroupSchema),
      }),
    }),
  })
  .openapi({ ref: 'CadenceExport' });

export function outputOpenApi() {
  const overwrites = createDocument({
    openapi: '3.0.0',
    info: salesloftSpec.info,
    paths: {
      '/v2/cadence_imports': {
        post: jsonOperation('importCadence', {
          body: cadenceImport,
          response: z.object({ data: z.object({ cadence: z.object({ id: z.number() }) }) }),
        }),
      },
      '/v2/cadence_exports/{id}': {
        get: jsonOperation('exportCadence', {
          path: z.object({ id: z.number() }),
          response: cadenceExport,
        }),
      },
    },
    components: {
      schemas: {
        cadenceImport,
        cadenceExport,
      },
    },
  });
  // maybe use Immer if we cared about not modifying the original
  const paths = salesloftSpec.paths as Partial<typeof salesloftSpec.paths>;
  delete paths['/v2/cadence_imports.json'];
  delete paths['/v2/cadence_exports/{id}.json'];
  Object.assign(salesloftSpec.paths, overwrites.paths);
  Object.assign(salesloftSpec.components.schemas, overwrites.components?.schemas);
  return salesloftSpec;
}

if (require.main === module) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(outputOpenApi()));
}
