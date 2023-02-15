require("dotenv").config();
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// uploads a file to s3
function uploadFile(file, type) {
  console.log("type", type);
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: `${type}/${file.filename}`,
    ACL: "public-read",
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadFile = uploadFile;

// downloads a file from s3
function getFileStream(fileKey) {
  fileKey = "photo/16764432489911676289659946main board.jpg";
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
}
exports.getFileStream = getFileStream;

// delete a file from s3
function deleteFile(fileKey) {
  const deleteParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
  return s3.deleteObject(deleteParams).promise();
}
exports.deleteFile = deleteFile;

// file public base url for s3
const filePublicUrl =
  "https://internal-sys-storage.s3.ap-south-1.amazonaws.com/";
exports.filePublicUrl = filePublicUrl;
