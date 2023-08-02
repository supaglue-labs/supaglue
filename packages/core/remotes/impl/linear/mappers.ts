import type {
  CommentConnection,
  IssueConnection,
  ProjectConnection,
  TeamConnection,
  UserConnection,
} from '@linear/sdk';
import { LINEAR_STANDARD_OBJECTS } from '@supaglue/utils';
import { BadRequestError } from '../../../errors';

export type LinearStandardObject = (typeof LINEAR_STANDARD_OBJECTS)[number];

export type LinearStandardObjectConnection =
  | IssueConnection
  | CommentConnection
  | TeamConnection
  | UserConnection
  | ProjectConnection;

export const toLinearStandardObject = (object: string): LinearStandardObject => {
  if (!LINEAR_STANDARD_OBJECTS.includes(object as LinearStandardObject)) {
    throw new BadRequestError(`Unsupported object ${object}`);
  }
  return object as LinearStandardObject;
};
