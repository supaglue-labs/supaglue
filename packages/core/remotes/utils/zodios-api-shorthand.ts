// Copied from https://github.com/thelinuxlich/zodios-api-shorthand/blob/main/src/index.ts 2023-10-23_2319
// because the published version is broken (typescript was published)

import type { Status } from '@tshttp/status';
import type { ZodiosEndpointDefinition, ZodiosEndpointParameters } from '@zodios/core';
import { makeErrors, makeParameters } from '@zodios/core';
import type { U } from 'ts-toolbelt';
import type { z } from 'zod';

const zodiosTypes = {
  Query: 'queries',
  Body: 'body',
  Header: 'headers',
  Path: 'params',
} as const;

type ZodiosTypes = {
  Query: 'queries';
  Body: 'body';
  Header: 'headers';
  Path: 'params';
};
type LiteralUnion<T extends U, U = string> = T | (U & { zz_IGNORE_ME?: never });
type StatusCode = LiteralUnion<`${(typeof Status)[keyof typeof Status]}`>;
type Narrow<T> = Try<T, [], NarrowNotZod<T>>;
type Try<A, B, C> = A extends B ? A : C;

type NarrowRaw<T> =
  | (T extends Function ? T : never) // eslint-disable-line
  | (T extends string | number | bigint | boolean ? T : T)
  | (T extends [] ? [] : never)
  | {
      [K in keyof T]: K extends 'description' ? T[K] : NarrowNotZod<T[K]>;
    };

type NarrowNotZod<T> = Try<T, z.ZodType, NarrowRaw<T>>;
type HTTPMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type _HTTPMethods = Lowercase<HTTPMethods>;
type MethodAndAlias = `${HTTPMethods} ${string}`;

type DescriptionObject = {
  path?: string;
  response?: string;
  queries?: Record<string, string>;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
  errors?: {
    [k in StatusCode]?: string;
  };
};
type APIEndpoint = {
  path: string;
  response: z.ZodType<unknown, z.ZodTypeDef, unknown>;
  queries?: Record<string, z.ZodType<unknown, z.ZodTypeDef, unknown>>;
  headers?: Record<string, z.ZodType<unknown, z.ZodTypeDef, unknown>>;
  params?: Record<string, z.ZodType<unknown, z.ZodTypeDef, unknown>>;
  description?: DescriptionObject;
  body?: z.ZodType<unknown, z.ZodTypeDef, unknown>;
  errors?: {
    [k in StatusCode]?: z.ZodType<unknown, z.ZodTypeDef, unknown>;
  };
};
type APIConfig = Record<MethodAndAlias, APIEndpoint>;
type ParameterPath<T extends keyof ZodiosTypes, K, V, D> = V extends z.ZodType<unknown, z.ZodTypeDef, unknown>
  ? K extends string
    ? {
        type: T;
        name: K;
        schema: V;
        description?: D extends DescriptionObject
          ? D[ZodiosTypes[T]] extends Record<string, string>
            ? D[ZodiosTypes[T]][K]
            : never
          : never;
      }
    : never
  : never;
type APIPath<Config extends APIConfig, Name = keyof Config> = U.ListOf<
  Name extends MethodAndAlias
    ? Name extends `${infer Method} ${infer Alias}`
      ? Config[Name] extends APIEndpoint
        ? {
            alias: `${Lowercase<Method>}${Capitalize<Alias>}`;
            method: Lowercase<Method> extends _HTTPMethods ? Lowercase<Method> : 'get';
            path: Config[Name]['path'];
            response: Config[Name]['response'];
            description: Config[Name]['description'] extends DescriptionObject
              ? Config[Name]['description']['path']
              : never;
            responseDescription: Config[Name]['description'] extends DescriptionObject
              ? Config[Name]['description']['response']
              : never;
            parameters: [
              ...U.ListOf<
                | {
                    [K in keyof Config[Name]['queries']]: ParameterPath<
                      'Query',
                      K,
                      Config[Name]['queries'][K],
                      Config[Name]['description']
                    >;
                  }[keyof Config[Name]['queries']]
                | {
                    [K in keyof Config[Name]['headers']]: ParameterPath<
                      'Header',
                      K,
                      Config[Name]['headers'][K],
                      Config[Name]['description']
                    >;
                  }[keyof Config[Name]['headers']]
                | {
                    [K in keyof Config[Name]['params']]: ParameterPath<
                      'Path',
                      K,
                      Config[Name]['params'][K],
                      Config[Name]['description']
                    >;
                  }[keyof Config[Name]['params']]
                | ParameterPath<'Body', 'body', Config[Name]['body'], Config[Name]['description']>
              >
            ];
          }
        : never
      : never
    : never
>;

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const defineApi = <Config extends APIConfig>(config: Narrow<Config>) => {
  const endpoints = [];
  for (const [key, _value] of Object.entries(config)) {
    const value = _value as APIEndpoint;
    const [method, alias] = key.split(' ');
    if (method === undefined) {
      throw new Error('Missing method');
    }
    if (alias === undefined) {
      throw new Error('Missing alias');
    }
    type P = ReturnType<typeof makeParameters>[];
    const queries: P = [];
    const headers: P = [];
    const pathParams: P = [];
    const makeParams = (
      type: 'Query' | 'Header' | 'Path',
      container: P,
      obj: Record<string, z.ZodType<unknown, z.ZodTypeDef, unknown>>
    ) => {
      for (const [_key, _value] of Object.entries(obj)) {
        const description = value.description?.[zodiosTypes[type]]?.[_key] || '';
        container.push(
          makeParameters([
            {
              type: type,
              name: _key,
              schema: _value,
              description,
            },
          ])
        );
      }
    };
    if (value.queries !== undefined) {
      makeParams('Query', queries, value.queries);
    }
    if (value.headers !== undefined) {
      makeParams('Header', headers, value.headers);
    }
    if (value.params !== undefined) {
      makeParams('Path', pathParams, value.params);
    }
    const endpoint = {
      method: method.toLowerCase() as Lowercase<HTTPMethods>,
      path: value.path,
      response: value.response,
      alias: method.toLowerCase() + capitalize(alias),
      parameters: [...headers.flat(), ...queries.flat(), ...pathParams.flat()] as ZodiosEndpointParameters,
    } as ZodiosEndpointDefinition;
    const errors: {
      status: number;
      description: string;
      schema: z.ZodType<unknown, z.ZodTypeDef, unknown>;
    }[] = [];
    if (typeof value.errors === 'object' && Object.keys(value.errors).length > 0) {
      for (const [k, v] of Object.entries(value.errors)) {
        const description = value.description?.errors?.[k] ?? '';
        if (v) {
          errors.push({
            status: +k,
            description,
            schema: v,
          });
        }
      }
      endpoint.errors = makeErrors(errors);
    }
    if (value.description?.response) {
      endpoint.responseDescription = value.description?.response;
    }
    if (value.description?.path) {
      endpoint.description = value.description?.path;
    }
    if (value.body !== undefined && method !== 'GET') {
      const bodyParam = makeParameters([
        {
          type: 'Body',
          name: 'body',
          schema: value.body,
          ...(value.description?.body && {
            description: value.description?.body,
          }),
        },
      ]);
      endpoint?.parameters?.push(...bodyParam.flat());
    }
    endpoints.push(endpoint);
  }
  return endpoints as unknown as APIPath<Config>;
};
