import { createRouter, Response } from 'fets';
import { createServer } from 'node:http';

export const router = createRouter({
  swaggerUI: {
    endpoint: '/api/docs',
  },
  openAPI: {
    openapi: '3.1.0', // This is wrong...
    endpoint: '/api/openapi.json',
  },
}).route({
  method: 'GET',
  path: '/api/greetings',
  schemas: {
    responses: {
      200: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            nullable: true, // can only be openapi 3.0.
          },
        },
        additionalProperties: false,
      },
      // Adding components and such is still a whole bunch of work!
    },
  },
  handler: () => Response.json({ message: 'Hello World!' }),
});

if (require.main === module) {
  createServer(router).listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log('Swagger UI is available at http://localhost:3000/api/docs');
  });
}
