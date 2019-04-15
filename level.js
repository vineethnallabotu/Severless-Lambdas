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
    if(path.length !== 3) {
       return errorHandler("username or level_id  or block_id missing ")
    }
    
    const username = path[0];
    const level_id = path[1];
    const block_id = path[2];
    
    if(event.httpMethod === 'GET'){
        const params = {
  TableName: 'project-cse410',
  
KeyConditionExpression: "partitionKey = :pk and sortKey = :sk",
            ExpressionAttributeValues: {
               ':sk' : {S: `level_${level_id}#block_${block_id}#`},
    ":pk":{S: username}
                
            }
};

  try{
    const data = await ddb.query(params).promise();
    if(data.Items.length <= 0)return errorHandler("user hasnt reached this level yet")
    const item = data.Items[0];
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            solution:item.solution.S
        }),
    };
    
  }catch(err){
        return errorHandler(err.errorMessage)

  }
    }
    
    if(event.httpMethod === 'POST'){
        const solution = JSON.parse(event.body).solution;
         if(!(solution)){
         return errorHandler("solution missing")
    }
        const params = {
  TableName: 'project-cse410',
  Item: {
    "partitionKey":{S: username},
    "sortKey": {S: `level_${level_id}#block_${block_id}#`},
    "typeKey":{S:'level'},
    "solution" : {S:solution}
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
