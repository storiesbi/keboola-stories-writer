'use strict';
import moment from 'moment';
import { isEmpty, isUndefined } from 'lodash';
import { DEFAULT_DATE_FORMAT, POSTFIX_DATE_POSITION, DEFAULT_OUTPUT_DIR,
         S3_BUCKET_NAME, S3_REGION_NAME } from '../constants';
// This function check the input configuration specified in KBC.
// Check whether the required fields are provided.
// Prepare simple output that is going to be used in later phases.
export async function parseConfiguration(configObject) {
  return new Promise((resolve, reject) => {
    const inputFiles = configObject.get('storage:input:tables');
    const accessKeyId = configObject.get('image_parameters:#access_key_id');
    const secretAccessKey = configObject.get('image_parameters:#secret_access_key');
    // If no file is specified, we can stop the processing.
    if (isUndefined(inputFiles) || isEmpty(inputFiles)) {
      reject('No KBC Bucket/Table selected!');
    }
    const bucketName = S3_BUCKET_NAME;
    if (isUndefined(accessKeyId) || isUndefined(secretAccessKey) || isUndefined(bucketName)) {
      reject('Missing S3 credentials! Neither accessKeyId, secretAccessKey, nor bucketName specified!');
    }
    // Other params
    const region = S3_REGION_NAME;
    const project_id = process.env.KBC_PROJECTID
    const stack_id = process.env.KBC_STACKID
    const remotePath = DEFAULT_OUTPUT_DIR + stack_id + '/' + project_id + '/' + process.env.KBC_CONFIGID;
    const compressOutput = true;
    const appendDatetime = false;
    const datetimePosition = POSTFIX_DATE_POSITION;
    const datetimeFormat = DEFAULT_DATE_FORMAT;
    // We need to check whether the date based on the input params is a valid date.
    // If not, we can still return a default option.
    const inputDate = moment().format(datetimeFormat);
    // We need to make sure either prefix or suffix is specified for parameters:datetime_position.
    const datePositionCheckExpression = /prefix|postfix/;
    if (!datePositionCheckExpression.test(datetimePosition)) {
      reject(`Invalid value in datetime_position parameter! Only value 'prefix' or 'postfix' allowed! `);
    }
    // If we don't want to append any date pre/post filename, we can return an empty object.
    const fileNameExtension = appendDatetime ? { extensionType: datetimePosition, extensionValue: inputDate } : {};

    resolve({ region,
      bucketName,
      remotePath,
      inputFiles,
      accessKeyId,
      fileNameExtension,
      compressOutput,
      secretAccessKey
    });
  })
}
