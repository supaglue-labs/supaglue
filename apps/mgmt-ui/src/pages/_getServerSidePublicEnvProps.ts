// import { API_HOST, IS_CLOUD, LEKKO_API_KEY } from '@/pages/api';
// import { ClientContext, initAPIClient } from '@lekko/node-server-sdk';

// type HomeCtaButton = {
//   buttonMessage: string;
//   buttonLink: string;
// };

// export type PublicEnvProps = {
//   API_HOST: string;
//   IS_CLOUD: boolean;
//   CLERK_ACCOUNT_URL: string;
//   CLERK_ORGANIZATION_URL: string;
//   lekko: {
//     homeCtaButtonConfig: HomeCtaButton;
//   };
// };

// export const getServerSidePublicEnvProps = async () => {
//   // Lekko defaults
//   let homeCtaButtonConfig: HomeCtaButton = {
//     buttonMessage: 'Quickstart Guide',
//     buttonLink: 'https://docs.supaglue.io/docs/quickstart',
//   };

//   if (LEKKO_API_KEY) {
//     const client = await initAPIClient({
//       apiKey: LEKKO_API_KEY,
//       repositoryOwner: 'supaglue-labs',
//       repositoryName: 'dynamic-config',
//     });

//     homeCtaButtonConfig = (await client.getJSONFeature('mgmt-ui', 'home_cta', new ClientContext())) as HomeCtaButton;
//   }

//   const CLERK_ACCOUNT_URL =
//     API_HOST === 'https://api.supaglue.io'
//       ? 'https://accounts.supaglue.io/user'
//       : 'https://witty-eft-29.accounts.dev/user';

//   const CLERK_ORGANIZATION_URL =
//     API_HOST === 'https://api.supaglue.io'
//       ? 'https://accounts.supaglue.io/organization'
//       : 'https://witty-eft-29.accounts.dev/organization';

//   return {
//     props: {
//       API_HOST,
//       IS_CLOUD,
//       CLERK_ACCOUNT_URL,
//       CLERK_ORGANIZATION_URL,
//       lekko: {
//         homeCtaButtonConfig,
//       },
//     },
//   };
// };
