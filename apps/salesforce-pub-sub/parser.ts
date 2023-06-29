// adapted from https://github.com/pozil/pub-sub-api-node-client/blob/main/src/eventParser.js
// under the Creative Commons Zero v1.0 Universal license

import * as avro from 'avsc';

export function parseEvent(schema: string, eventPayload: Buffer) {
  const eventType = avro.parse(schema) as avro.types.RecordType;

  const payload = eventType.fromBuffer(eventPayload);
  const allFields = eventType.fields;

  try {
    payload.ChangeEventHeader.nulledFields = parseFieldBitmaps(allFields, payload.ChangeEventHeader.nulledFields);
  } catch (error: any) {
    throw new Error(`Failed to parse nulledFields: ${error.message}`);
  }
  try {
    payload.ChangeEventHeader.diffFields = parseFieldBitmaps(allFields, payload.ChangeEventHeader.diffFields);
  } catch (error: any) {
    throw new Error(`Failed to parse diffFields: ${error.message}`);
  }
  try {
    payload.ChangeEventHeader.changedFields = parseFieldBitmaps(allFields, payload.ChangeEventHeader.changedFields);
  } catch (error: any) {
    throw new Error(`Failed to parse changedFields: ${error.message}`);
  }

  return payload;
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
    fieldBitmapsAsHex.forEach((fieldBitmapAsHex) => {
      const bitmapMapStrings = fieldBitmapAsHex.split('-');
      // Ignore top level field bitmap
      if (bitmapMapStrings.length >= 2) {
        const parentField = allFields[parseInt(bitmapMapStrings[0])];
        const childFields = getChildFields(parentField);
        if (!childFields) {
          return;
        }
        const childFieldNames = getFieldNamesFromBitmap(childFields, bitmapMapStrings[1]);
        fieldNames = fieldNames.concat(childFieldNames.map((fieldName) => `${parentField.name}.${fieldName}`));
      }
    });
  }
  return fieldNames;
}

function getChildFields(parentField: avro.types.Field) {
  const { type } = parentField;
  if (type instanceof avro.types.RecordType) {
    return type.fields;
  }
}

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
}

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
