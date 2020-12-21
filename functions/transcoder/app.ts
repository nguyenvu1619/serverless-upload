import SNS from 'aws-sdk/clients/sns'

const sns = new SNS({
})

export const analystic = async (event) => {
    console.log(process.env.SNS_TOPIC_ANALYSIS_ARN)
    const params = {
        Message: "FIRST_SNS",
        TopicArn: process.env.SNS_TOPIC_ANALYSIS_ARN
    }
    const publishText = await sns.publish(params).promise()
    return {
        statusCode: 200,
    // Headers must be sent here as well as defined in the template.yaml.
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH'
    },
    body: JSON.stringify(publishText)
    }
}

export const transcoder = async (event) => {
    var message = event.Records[0].Sns.Message;
    console.log('Message received from SNS:', message);
    return {
        statusCode: 200,
    // Headers must be sent here as well as defined in the template.yaml.
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH'
    },
    body: JSON.stringify(message)
    }
}