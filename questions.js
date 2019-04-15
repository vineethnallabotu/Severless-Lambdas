let AWS = require('aws-sdk');
let region = 'us-east-2'
AWS.config.update({region: 'us-east-2'});
let ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const errorHandler = (msg) =>{
    const response = {
        statusCode: 500,
        body: JSON.stringify({
            errorType:"Error",
            errorMessage:msg
        }),
    };
    return response
}

exports.handler = async (event,ctx,callback) => {
    const path = event.pathParameters.proxy.split('/');
    console.log(path.length)
    if(path.length !== 2) {
       return errorHandler("level_id  or block_id missing ")
    }
    
    const level_id = path[0];
    const block_id = path[1];
    
    if(event.httpMethod === 'GET'){
        const params = {
  TableName: 'project-cse410',
  
KeyConditionExpression: "partitionKey = :pk and sortKey = :sk",
            ExpressionAttributeValues: {
               ':sk' : {S: `level_${level_id}#block_${block_id}#`},
    ":pk":{S: 'question'}
                
            }
};

  try{
    const data = await ddb.query(params).promise();
    if(data.Items.length <= 0)return errorHandler("question does not exist")
    const item = data.Items[0];
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            question:item.question.S
        }),
    };
    
  }catch(err){
        return errorHandler(err.errorMessage)

  }
    }
    
    if(event.httpMethod === 'POST'){
        const question = JSON.parse(event.body).question;
         if(!(question)){
         return errorHandler("question missing")
    }
        const params = {
  TableName: 'project-cse410',
  Item: {
    "partitionKey":{S: 'question'},
    "sortKey": {S: `level_${level_id}#block_${block_id}#`},
    "typeKey":{S:'question'},
    "question" : {S:question}
  }
};

  try{
    const data = await ddb.putItem(params).promise();
    return {
        statusCode: 200,
        body: JSON.stringify("success"),
    };
  }catch(err){
    return errorHandler(err.errorMessage)
  }
    }
    
    
};
