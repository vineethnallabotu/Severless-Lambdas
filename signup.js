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
    const image_name = event.image_name
    if(!(username&&password)){
      throw new Error("username or password missing");
    }
     if(!(image_name)){
      throw new Error("image_name missing");
    }
    
    if(password.length <4){
      throw new Error("THE PASSWORD SHOULD BE ATLEAST 4 CHARACTERS");
    }
    if(!(/(([0-9]+[a-zA-Z]+)|[a-zA-Z]+[0-9]+)/).test(password))
      throw new Error("THE PASSWORD IS MISSING A LETTER/NUMBER")
    
        const params = {
  TableName: 'project-cse410',
  Item: {
    "partitionKey":{S: username},
    "sortKey": {S: password},
    "image_name": {S: image_name},
    "typeKey":{S:'user'}
  },
  ConditionExpression: 'attribute_not_exists(sortKey)'
};

  try{
    const data = await ddb.putItem(params).promise();
  }catch(err){
    if(err.code == 'ConditionalCheckFailedException')
    throw new Error('username already exists')
    throw err
  }
    
    return "success";
};
