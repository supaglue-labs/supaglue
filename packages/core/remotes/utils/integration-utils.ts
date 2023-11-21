import type { ZodOpenApiMediaTypeObject, ZodOpenApiOperationObject, ZodOpenApiParameters } from 'zod-openapi';

export function jsonOperation(
  id: string,
  {
    body,
    response,
    ...params
  }: {
    body?: ZodOpenApiMediaTypeObject['schema'];
    response: ZodOpenApiMediaTypeObject['schema'];
  } & ZodOpenApiParameters
) {
  return {
    operationId: id,
    requestParams: params,
    requestBody: { content: { 'application/json': { schema: body } } },
    responses: {
      200: { content: { 'application/json': { schema: response } } },
    },
  } satisfies ZodOpenApiOperationObject;
}
