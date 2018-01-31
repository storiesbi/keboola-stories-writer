'use strict';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { isEmpty } from 'lodash';
import { PREFIX_DATE_POSITION } from '../constants';
// Function uploadFiles reads input files selected in KBC GUI and prepare an array of promises.
// The array of promises will be returned and processed afterwards.
export function uploadFiles(
  AWS,
  SOURCE_DIR,
  { inputFiles, bucketName, remotePath, compressOutput, fileNameExtension }
) {
  let promises = [];
  inputFiles.forEach(file => {
    promises.push(
      (({ destination }) => {
        return new Promise((resolve, reject) => {
          const fileName = getFileName(destination, fileNameExtension);
          const key = compressOutput ? `${fileName}.gz` : fileName;
          const s3 = new AWS.S3();
          let body = compressOutput ?
            fs.createReadStream(`${SOURCE_DIR}/${destination}`).pipe(zlib.createGzip()) :
            fs.createReadStream(`${SOURCE_DIR}/${destination}`);
          s3.upload({ Bucket: bucketName, Key: path.join(remotePath, key), Body: body })
            .send((error, data) => error ?
              reject(error) : resolve(`Successfully uploaded data to ${bucketName}`));
        });
      })(file)
    );
  });
  return promises;
}

// A simple function that prepare the correct filename.
function getFileName(destination, fileNameExtension) {
  // If no prefix or suffix request, we can just return the filename.
  if (isEmpty(fileNameExtension)) {
    return destination;
  } else {
    const { extensionType, extensionValue } = fileNameExtension;
    return extensionType === PREFIX_DATE_POSITION ? `${extensionValue}.${destination}` : `${destination}.${extensionValue}`;
  }
}
