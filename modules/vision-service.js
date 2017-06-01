"use strict";
const jwt   = require('jsonwebtoken');
let request = require('request-promise');

process.on('unhandledRejection', r => console.log(r));

exports.classify = imageURL => new Promise(async(resolve, reject) => {

  const pvsUrl = process.env.EINSTEIN_VISION_URL;
  const accountId  = process.env.EINSTEIN_VISION_ACCOUNT_ID;
  const privateKey = process.env.EINSTEIN_VISION_PRIVATE_KEY.replace(/\\n/g, '\n');
  const model= process.env.EINSTEIN_VISION_MODEL;

  var token = getToken();
  if(token===null){
    token = await updateToken(pvsUrl,accountId,privateKey);
  }
  let visionresult = await doClassify(pvsUrl,imageURL,model,accountId,privateKey,token);
  resolve(visionresult.probabilities[0].label);
});



var doClassify = async(pvsUrl,resizedImgUrl,modelId='GeneralImageClassifier',accountId,privateKey,jwtToken) => {
  var token = jwtToken || getToken();
  var formData = {
    modelId: modelId,
    sampleLocation : resizedImgUrl
  }
  var options = {
      simple:false,
      resolveWithFullResponse : true,
      url: `${pvsUrl}v1/vision/predict`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      },
      formData:formData
  }

    var result= await request(options);
    if(result.statusCode=='401'){
      console.log('unauthorized');
      token = await updateToken(pvsUrl,accountId,privateKey);
      options.headers.Authorization=`Bearer ${token}`;
      result= await request(options);
    }
  return JSON.parse(result.body);
};


var updateToken = async(pvsUrl,accountId,privateKey) =>  {
    let argumentError;
    if (pvsUrl == null) {
      argumentError = new Error('updateToken requires EINSTEIN_VISION_URL, the base API URL (first arg)');
      return Promise.reject(argumentError);
    }
    if (accountId == null) {
      argumentError = new Error('updateToken requires EINSTEIN_VISION_ACCOUNT_ID, the account ID (second arg)');
      return Promise.reject(argumentError);
    }
    if (privateKey == null) {
      argumentError = new Error('updateToken requires EINSTEIN_VISION_PRIVATE_KEY, the private key (third arg)');
      return Promise.reject(argumentError);
    }

    var reqUrl = `${pvsUrl}v1/oauth2/token`;

    var rsa_payload = {
      "sub":accountId,
      "aud":reqUrl
    }

    var rsa_options = {
      header:{
        "alg":"RS256",
        "typ":"JWT"
       },
       expiresIn: '25h'
    }

    var token = jwt.sign(
      rsa_payload,
      privateKey,
      rsa_options
    );
    var options = {
      url: reqUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
      },
      body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(token)}`
    }
    let result = await request(options);
      const granted = JSON.parse(result);
      const accessToken = granted.access_token;
      setToken(accessToken);
      return accessToken;
  };

  var oauthToken = null;

  function setToken(token) {
    oauthToken=token;
  }

  function getToken() {
    return oauthToken;
  }
