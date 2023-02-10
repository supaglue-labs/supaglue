import { ConsumerEvent } from '@supaglue/grpc/pubsub_api_pb';
import * as avro from 'avsc';
import { getSchema } from './client';

export async function parseEvent(event: ConsumerEvent, customerId: string) {
  const schemaId = event.getEvent()?.getSchemaId();
  if (!schemaId) {
    throw new Error('Schema ID is required');
  }
  const { type } = await getSchema({ schemaId, customerId });
  const allFields = type.fields;
  const replayId = decodeReplayId(Buffer.from(event.getReplayId()));
  const payload = event.getEvent()?.getPayload();
  if (!payload) {
    throw new Error('Payload is required');
  }
  const parsedPayload = type.fromBuffer(Buffer.from(payload));

  try {
    parsedPayload.ChangeEventHeader.nulledFields = parseFieldBitmaps(
      allFields,
      parsedPayload.ChangeEventHeader.nulledFields
    );
  } catch (error) {
    throw new Error('Failed to parse nulledFields', { cause: error });
  }
  try {
    parsedPayload.ChangeEventHeader.diffFields = parseFieldBitmaps(
      allFields,
      parsedPayload.ChangeEventHeader.diffFields
    );
  } catch (error) {
    throw new Error('Failed to parse diffFields', { cause: error });
  }
  try {
    parsedPayload.ChangeEventHeader.changedFields = parseFieldBitmaps(
      allFields,
      parsedPayload.ChangeEventHeader.changedFields
    );
  } catch (error) {
    throw new Error('Failed to parse changedFields', { cause: error });
  }

  return {
    replayId,
    payload: parsedPayload,
  };
}

function parseFieldBitmaps(allFields: avro.types.Field[], fieldBitmapsAsHex: string[]) {
  if (fieldBitmapsAsHex.length === 0) {
    return [];
  }
  let fieldNames: string[] = [];
  // Replace top field level bitmap with list of fields
  if (fieldBitmapsAsHex[0].startsWith('0x')) {
    fieldNames = fieldNames.concat(getFieldNamesFromBitmap(allFields, fieldBitmapsAsHex[0]));
  }
  // Process compound fields
  if (fieldBitmapsAsHex[fieldBitmapsAsHex.length - 1].indexOf('-') !== -1) {
    fieldBitmapsAsHex.forEach((fieldBitmapAsHex: string) => {
      const bitmapMapStrings = fieldBitmapAsHex.split('-');
      // Ignore top level field bitmap
      if (bitmapMapStrings.length >= 2) {
        const parentField = allFields[parseInt(bitmapMapStrings[0])];
        const childFields = getChildFields(parentField.type as avro.types.UnwrappedUnionType);
        const childFieldNames = getFieldNamesFromBitmap(childFields, bitmapMapStrings[1]);
        fieldNames = fieldNames.concat(childFieldNames.map((fieldName) => `${parentField.name}.${fieldName}`));
      }
    });
  }
  return fieldNames;
}

function getChildFields(parentField: avro.types.UnwrappedUnionType) {
  const { types } = parentField;
  let fields: avro.types.Field[] = [];
  types.forEach((type) => {
    if (type instanceof avro.types.RecordType) {
      fields = fields.concat(type.fields);
    } else if (type instanceof avro.types.NullType) {
      return;
      // TODO: We need to fix this for nested objects like Name.[...].FirstName
      // If we push null, we get off by one error
      // fields.push(null);
    }
  });
  return fields;
}

/**
 * Loads field names from a bitmap
 */
function getFieldNamesFromBitmap(fields: avro.types.Field[], fieldBitmapAsHex: string) {
  let binValue = hexToBin(fieldBitmapAsHex);
  binValue = reverseBytes(binValue); // Reverse byte order to match expected format
  // Use bitmap to figure out field names based on index
  const fieldNames = [];
  for (let i = 0; i < binValue.length && i < fields.length; i++) {
    if (binValue[i] === '1') {
      fieldNames.push(fields[i].name);
    }
  }
  return fieldNames;
}

function reverseBytes(input: string) {
  return input.split('').reverse().join('');

  // This following code was a bug from pub-sub-api-node-client
  // let output = '';
  // for (let i = input.length / 8 - 1; i >= 0; i--) {
  //   output += input.substring(i * 8, (i + 1) * 8);
  // }
  // return output;
}

/**
 * Decodes the value of a replay ID from a buffer
 */
export function decodeReplayId(encodedReplayId: Buffer) {
  return Number(encodedReplayId.readBigUInt64BE());
}

/**
 * Encodes the value of a replay ID
 */
export function encodeReplayId(replayId: number) {
  const buf = Buffer.allocUnsafe(8);
  buf.writeBigUInt64BE(BigInt(replayId), 0);
  return buf;
}

/**
 * Converts a hexadecimal string into a string binary representation
 */
function hexToBin(hex: string) {
  let bin = hex.substring(2); // Remove 0x prefix
  bin = bin.replaceAll('0', '0000');
  bin = bin.replaceAll('1', '0001');
  bin = bin.replaceAll('2', '0010');
  bin = bin.replaceAll('3', '0011');
  bin = bin.replaceAll('4', '0100');
  bin = bin.replaceAll('5', '0101');
  bin = bin.replaceAll('6', '0110');
  bin = bin.replaceAll('7', '0111');
  bin = bin.replaceAll('8', '1000');
  bin = bin.replaceAll('9', '1001');
  bin = bin.replaceAll('A', '1010');
  bin = bin.replaceAll('B', '1011');
  bin = bin.replaceAll('C', '1100');
  bin = bin.replaceAll('D', '1101');
  bin = bin.replaceAll('E', '1110');
  bin = bin.replaceAll('F', '1111');
  return bin;
}
