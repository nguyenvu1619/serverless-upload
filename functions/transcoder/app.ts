import SNS from 'aws-sdk/clients/sns'
import ffmpeg from 'fluent-ffmpeg'
import DynamoDb from 'aws-sdk/clients/dynamodb'
import { v4 as uuid} from 'uuid'

const sns = new SNS()
ffmpeg.setFfmpegPath('/opt/ffmpeg')
ffmpeg.setFfprobePath('/opt/ffprobe')

const topicArn = process.env.SNS_TOPIC_ANALYSIS_ARN
const tableName = process.env.DYNAMODB_TableName
export const analystic = async (event) => {
    try{
    const url = "https://nguyenvu-upload-lambda-functions.s3-ap-southeast-1.amazonaws.com/theboy.mp4"
        const promise = new Promise(async resolve => {
            ffmpeg.ffprobe(url, async(err, metadata) =>{
                const jobLength = Math.ceil(metadata.format.duration/30)
                console.log(jobLength)
                const promisePushMessagePool = []
        const docClient = new DynamoDb.DocumentClient();
        const listJob = []
        const batchJobId = uuid()
        for (let i = 0; i< jobLength; i++){
            const start = i*30;
            const end = Math.min((i+1)*30, metadata.format.duration)
            const jobId = uuid()
            const data = {
                batchJobId,
                jobId,
                start,
                end,
                url
            }
            listJob.push(data)
            promisePushMessagePool.push(sns.publish({
                Message: JSON.stringify(data),
                TopicArn: topicArn
            }).promise())
        }
        const resultStoreDynamoDb = await docClient.put({
            TableName: "BatchJob",
            Item: {
                id: batchJobId,
                url,
                jobs: listJob.map(job => ({
                    id: job.jobId,
                    start: job.start,
                    end: job.end,
                    status: "converting"
                }))
            }
        }).promise()
        console.log("analystic -> resultStoreDynamoDb", resultStoreDynamoDb)
        const resultPromise = await Promise.all(listJob.map(async data => sns.publish({
            Message: JSON.stringify(data),
            TopicArn: topicArn
        }).promise()))
        console.log("analystic -> resultPromise", resultPromise)
        resolve(true)
    })
})
    await promise
    return {
        statusCode: 200,
    // Headers must be sent here as well as defined in the template.yaml.
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH'
    },
    body: JSON.stringify(true)
    }
} catch(e){
    console.log(e)
    console.log("asdasdas")
    return "2"
}
   
}

export const transcoder = async (event) => {
    var message = event.Records[0].Sns.Message;
    const data = JSON.parse(message)
    console.log(data)
    return {
        statusCode: 200,
    // Headers must be sent here as well as defined in the template.yaml.
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH'
    },
    body: JSON.stringify(data)
    }
}