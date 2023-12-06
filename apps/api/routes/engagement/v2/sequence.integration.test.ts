/**
 * Tests sequences endpoints
 *
 * @group integration/engagement/v2/sequences
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateContactRequest,
  CreateContactSuccessfulResponse,
  CreateSequenceRequest,
  CreateSequenceStateRequest,
  CreateSequenceStateSuccessfulResponse,
  CreateSequenceSuccessfulResponse,
  GetSequenceSuccessfulResponse,
  ListSequencesSuccessfulResponse,
  SearchSequenceStatesRequest,
  SearchSequenceStatesSuccessfulResponse,
} from '@supaglue/sdk/v2/engagement';

jest.retryTimes(3);

export function getTestContact() {
  return {
    first_name: `first ${Math.random().toString()}`,
    last_name: `last ${Math.random().toString()}`,
    job_title: 'job title',
    email_addresses: [
      {
        email_address: `test${Math.random().toString()}@mydomain.com`,
        email_address_type: 'primary' as 'primary' | null,
      },
    ],
  } satisfies CreateContactRequest['record'];
}

function getTestSequence() {
  return {
    name: `Test Sequence ${Math.random().toString()}`,
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
        interval_seconds: 172800,
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
        interval_seconds: 0,
        is_reply: true,
        type: 'task',
        task_note: 'my task notes',
        template: {
          name: 'what is up~!',
          subject: 'hello world again',
          body: 'Hi there, how are you doing?',
        },
      },
    ],
  } satisfies CreateSequenceRequest['record'];
}

describe('sequence', () => {
  let testSequence: ReturnType<typeof getTestSequence>;

  beforeEach(() => {
    testSequence = getTestSequence();
  });

  test(`Error body`, async () => {
    testSequence.steps[0].interval_seconds = 123;

    const res = await supaglueClient.engagement.POST('/sequences', {
      body: { record: testSequence },
      // TODO: Make it so that x-customer-id can be omitted if it was passed into the client at creation time.
      params: { header: { 'x-provider-name': 'salesloft', 'x-customer-id': process.env.CUSTOMER_ID! } },
    });

    expect(res.response.status).toEqual(400);
    // Our API spec is wrong and should specify 400 return code with ability to have errors
    expect(res.error?.errors?.[0].title).toMatch('Salesloft only supports intervals in whole days');
  });

  describe.each(['outreach', 'salesloft'])('%s', (providerName) => {
    test(`Test that POST followed by GET has correct data and properly cache invalidates`, async () => {
      const response = await apiClient.post<CreateSequenceSuccessfulResponse>(
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
        objectName: 'sequence',
      });
      const getResponse = await apiClient.get<GetSequenceSuccessfulResponse>(
        `/engagement/v2/sequences/${response.data.record?.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.name).toEqual(testSequence.name);
      expect(getResponse.data.num_steps).toEqual(testSequence.steps?.length);
      expect(getResponse.data.share_type).toEqual('team');
      expect(getResponse.data.steps).toHaveLength(testSequence.steps?.length);

      // Salesloft does not support updating email template / body
      if (providerName !== 'salesloft') {
        const header = { 'x-customer-id': process.env.CUSTOMER_ID!, 'x-provider-name': providerName };
        const stepId = getResponse.data.steps?.[0].id;
        await supaglueClient.engagement.PATCH('/sequences/{sequence_id}/sequence_steps/{sequence_step_id}', {
          params: { header, path: { sequence_id: response.data.record!.id, sequence_step_id: stepId! } },
          body: { record: { template: { body: 'Updated body', subject: 'modified subject' } } },
        });
        const res = await supaglueClient.engagement.GET('/sequences/{sequence_id}', {
          params: { header, path: { sequence_id: response.data.record!.id } },
        });
        expect(res.response.status).toEqual(200);
        const step = res.data?.steps?.find((s) => s.id === stepId);
        expect(step?.template?.body).toEqual(expect.stringContaining('Updated body'));
        expect(step?.template?.subject).toEqual('modified subject');
      }

      const contactRes = await apiClient.post<CreateContactSuccessfulResponse>(
        '/engagement/v2/contacts',
        { record: getTestContact() },
        { headers: { 'x-provider-name': providerName } }
      );
      expect(contactRes.status).toEqual(201);
      expect(contactRes.data.record?.id).toBeTruthy();

      addedObjects.push({
        id: contactRes.data.record?.id as string,
        providerName,
        objectName: 'contact',
      });

      /** Required for sequence state creation. Hard coding as a result */
      const getMailboxId = async () => {
        if (providerName === 'outreach') {
          const res = await apiClient.post<{
            body: { data: Array<{ id: number; attributes: { sendDisabled: boolean } }> };
          }>(
            '/actions/v2/passthrough',
            { path: '/api/v2/mailboxes', method: 'GET' },
            { headers: { 'x-provider-name': providerName } }
          );
          const id = res.data.body.data.find((e) => !e.attributes.sendDisabled)?.id;
          if (!id) {
            throw new Error('Unable to find an active mailbox inside Outreach for integration test');
          }
          return `${id}`;
        }
        return undefined;
      };

      const mailboxId = await getMailboxId();

      const addContactToSequence = async () => {
        return apiClient.post<CreateSequenceStateSuccessfulResponse>(
          '/engagement/v2/sequence_states',
          {
            record: {
              contact_id: contactRes.data.record!.id,
              sequence_id: response.data.record!.id,
              mailbox_id: mailboxId,
            } satisfies CreateSequenceStateRequest['record'],
          },
          { headers: { 'x-provider-name': providerName } }
        );
      };
      const stateResponse = await addContactToSequence();
      expect(stateResponse.status).toEqual(201);
      expect(stateResponse.data.record?.id).toBeTruthy();

      addedObjects.push({
        id: stateResponse.data.record?.id as string,
        providerName,
        objectName: 'sequence_state',
      });

      // test that the db was updated
      const cachedReadResponse = await apiClient.get<ListSequencesSuccessfulResponse>(
        `/engagement/v2/sequences?read_from_cache=true&modified_after=${encodeURIComponent(
          testStartTime.toISOString()
        )}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(cachedReadResponse.status).toEqual(200);
      const found = cachedReadResponse.data.records.find((r) => r.id === response.data.record?.id);
      expect(found).toBeTruthy();
      expect(found?.name).toEqual(testSequence.name);

      // Test that you can search sequence state by contact ID
      const searchSequenceStates = async () => {
        return await apiClient.post<SearchSequenceStatesSuccessfulResponse>(
          '/engagement/v2/sequence_states/_search',
          {
            filter: {
              contact_id: contactRes.data.record!.id,
            } satisfies SearchSequenceStatesRequest['filter'],
          },
          { headers: { 'x-provider-name': providerName } }
        );
      };
      const searchResponse = await searchSequenceStates();
      expect(searchResponse.status).toEqual(200);
      expect(searchResponse.data.records.length).toEqual(1);
      expect(searchResponse.data.records[0].sequence_id).toEqual(response.data.record?.id);
    }, 120000);
  });
});
