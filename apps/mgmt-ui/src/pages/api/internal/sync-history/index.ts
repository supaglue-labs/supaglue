// import type { NextApiRequest, NextApiResponse } from 'next';
// import { API_HOST, APPLICATION_ID, CUSTOMER_ID, PROVIDER_NAME, SG_INTERNAL_TOKEN } from '../..';

// export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
//   const result = await fetch(`${API_HOST}/internal/v1/sync-history`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-provider-name': PROVIDER_NAME,
//       'x-customer-id': CUSTOMER_ID,
//       'x-application-id': APPLICATION_ID,
//       'x-sg-internal-token': SG_INTERNAL_TOKEN,
//     },
//   });

//   const r = await result.json();

//   return res.status(200).json(r);
// }
