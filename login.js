let AWS = require('aws-sdk');
let region = 'us-east-2'
AWS.config.update({region: 'us-east-2'});
let ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});



// ddb.putItem(params, function(err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data);
//   }
// });

exports.handler = async (event) => {

    // TODO implement
    const username = event.username;
    const password = event.password;
    if(!(username&&password)){
      throw new Error("username or password missing");
    }
        const params = {
  TableName: 'project-cse410',
  
KeyConditionExpression: "partitionKey = :pk and sortKey = :sk",
            ExpressionAttributeValues: {
               ':sk' : {S: password},
    ":pk":{S: username}
                
            }
};

  try{
    const data = await ddb.query(params).promise();
    if(data.Items.length <=0)throw new Error("INVALID DETAILS");
    const item = data.Items[0];
    return {
      image_name:item.image_name.S
    }
    
  }catch(err){
    throw err
  }
};
