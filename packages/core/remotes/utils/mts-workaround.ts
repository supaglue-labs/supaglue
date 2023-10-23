// @ts-expect-error The current file is a CommonJS module whose imports will produce 'require' calls; however, the referenced file is an ECMAScript module and cannot be imported with 'require'. Consider writing a dynamic 'import("./client.mjs")' call instead.
import { api as defineApi } from 'zodios-api-shorthand';

export { defineApi };
