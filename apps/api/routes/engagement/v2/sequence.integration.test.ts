/**
 * Tests accounts endpoints
 *
 * @group integration/engagement/v2/accounts
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateSequenceRequest,
  CreateSequenceResponse,
  GetSequenceResponse,
} from '@supaglue/schemas/v2/engagement';

describe('sequence', () => {
  let testSequence: CreateSequenceRequest['record'];

  beforeEach(() => {
    testSequence = {
      name: `Sequence ${Math.random().toString()}`,
      type: 'team',
      steps: [
        {
          type: 'manual_email',
          is_reply: false,
          template: {
            name: 'what is up~!',
            subject: 'hello world again',
            body: 'Hi there, how are you doing?',
          },
        },
        {
          interval_seconds: 86400,
          is_reply: true,
          type: 'auto_email',
          template: {
            name: 'what is up~!',
            subject: 'hello world again',
            body: 'Hi there, how are you doing?',
          },
        },
        {
          interval_seconds: 90000,
          is_reply: true,
          type: 'call',
          task_note: 'my call notes',
          template: {
            name: 'what is up~!',
            subject: 'hello world again',
            body: 'Hi there, how are you doing?',
          },
        },
        {
          interval_seconds: 2160,
          is_reply: true,
          type: 'task',
          task_note: 'my task notes',
          template: {
            name: 'what is up~!',
            subject: 'hello world again',
            body: 'Hi there, how are you doing?',
          },
        },
        {
          interval_seconds: 30,
          is_reply: true,
          type: 'linkedin_send_message',
          task_note: 'my task notes',
          template: {
            name: 'what is up~!',
            subject: 'hello world again',
            body: 'Hi there, how are you doing?',
          },
        },
      ],
    };
  });

  describe.each(['outreach', 'apollo', 'salesloft'])('%s', (providerName) => {
    test(`POST /`, async () => {
      const response = await apiClient.post<CreateSequenceResponse>(
        '/engagement/v2/sequences',
        { record: testSequence },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();
      addedObjects.push({
        id: response.data.record?.id as string,
        providerName,
        objectName: 'account',
      });
      const getResponse = await apiClient.get<GetSequenceResponse>(
        `/engagement/v2/sequences/${response.data.record?.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.name).toEqual(testSequence.name);
      expect(getResponse.data.num_steps).toEqual(testSequence.steps?.length);

      // test that the db was updated
      const dbSequence = await db.query('SELECT * FROM engagement_sequences WHERE id = $1', [response.data.record?.id]);
      expect(dbSequence.rows[0].name).toEqual(testSequence.name);
    }, 120000);
  });
});
