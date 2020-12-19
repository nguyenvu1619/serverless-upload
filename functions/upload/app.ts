import S3 from 'aws-sdk/clients/s3'
import fs from 'fs'
const s3 = new S3()
const bucketName = "nguyenvu-upload-lambda-functions"

const key = "first_upload"

const fileName = "@root/theboy.mp4"
export const handler = async (event) => {
  console.log(__dirname)
  const readStream = fs.createReadStream("../../functions/upload/theboy.mp4")
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: readStream
  }
  const options = { partSize: 5 * 1024 * 1024, queueSize: 10 };  
    const result = await s3.upload(params, options).promise()
    console.log(result)
    return {
        statusCode: 200,
    // Headers must be sent here as well as defined in the template.yaml.
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH'
    },
    body: "asdasd"
    }
}