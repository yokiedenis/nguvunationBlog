const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });
const bucketName = process.env.GCP_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

module.exports = {
  storage,
  bucket,
  bucketName
};
