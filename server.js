const express = require('express')
    , passport = require('passport')
    , session = require('express-session')
    , docusign = require('docusign-esign')
    , moment = require('moment')
    , fs = require('fs-extra')
    , path = require('path')
    , promisfy = require('util')
    , url = require('url');

const app = express()
    , host = 'localhost'
    , port = 5050
    , hostUrl = 'http://'+ host + ':' + port
    , accountId = '78070ae1-ee88-4731-894e-6a3b550cdd27'
    , clientID = 'c500d8c2-7aa8-447b-af61-167c999f04aa'
    , clientSecret = '15f36335-3ba4-453d-83cb-0e0a8dffe874'
    , signerEmail = 'holderdarnell2@gmail.com'
    , signerName = 'Darnell Holder'
    , templateId = '{TEMPLATE_ID}'
    , baseUriSuffix = '/restapi'
    , testDocumentPath = '../demo_documents/test.pdf'
    , test2DocumentPath = '../demo_documents/battle_plan.docx'
    , redirectUri ="http://localhost:5050/e5"
    , basePath = 'https://demo.docusign.net/restapi'
    , apiClient = new docusign.ApiClient()
    , scopes = [apiClient.OAuth.Scope.SIGNATURE]
    , responseTypeCode = apiClient.OAuth.ResponseType.CODE // Response type of code, to be used for the Auth code grant
    , responseTypeToken = apiClient.OAuth.ResponseType.TOKEN; // Response type of token, to be used for implicit grant
    ;

let eg;

var oAuthAccessToken
var encodedString

app.set('view engine', 'ejs');




//app.get('/', function(req, res) {
//  res.render('index')
//})
apiClient.setBasePath(basePath);

app.get('/', function (req, res) {
    const authUri = apiClient.getAuthorizationUri(clientID, scopes, redirectUri, responseTypeCode);//get DocuSign OAuth authorization url
     //Open DocuSign OAuth login in a browser, res being your node.js response object.
    res.redirect(authUri);
});
app.get('/e5', function (req, res) {

  apiClient.generateAccessToken(clientID, clientSecret, req.query.code, function (err, oAuthToken) {
    //console.log(oAuthToken.accessToken);
    apiClient.getUserInfo(oAuthToken.accessToken, function (err, userInfo) {
      oAuthAccessToken = oAuthToken.accessToken;
      console.log("the oAuthToken is :" + JSON.stringify(oAuthToken));
      //console.log(oAuthAccessToken);
      //apiClient.setBasePath(basePath);
      // var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/++[++^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
      //
      // // Define the string
      // var string = clientID + ':' + clientSecret;
      //
      // // Encode the String
      // encodedString = Base64.encode(string);
      //console.log(encodedString);
      apiClient.addDefaultHeader('Authorization', 'Bearer ' + oAuthToken.accessToken);
      apiClient.setBasePath(userInfo.accounts[0].baseUri + '/restapi')
      //console.log(userInfo.accounts[0].baserUri)
      //console.log(userInfo.accounts[0].accountId);
      console.log("the deafult header is: " + JSON.stringify( apiClient.defaultHeaders));
      //console.log(apiclient.basePath);
      res.render('index')
      //createEnvelope(userInfo.accounts[0].accountId, oAuthToken.accessToken);
    });
  });
});

app.listen(port, function(){
  console.log('App Listening on port: ' + port)
})


app.post('/a', function listEnvelopesController(req, res){
  console.log(oAuthAccessToken)
  //apiClient.setBasePath(basePath);
    // apiClient.addDefaultHeader('Authorization ' + 'Bearer ', 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQkAAAABAAUABwAASfo5ipvWSAgAAIkdSM2b1kgCAJ8giZesq0hAr93A-qwGx1gVAAEAAAAYAAEAAAAFAAAADQAkAAAAZjBmMjdmMGUtODU3ZC00YTcxLWE0ZGEtMzJjZWNhZTNhOTc4MAAAUbpMfZvWSDcAYEcIb3TtBU6HTBBHVB7pfg.mr1LXIQKuj79-eY7MwRBdBKd6oiehj3ZaObXtqlZbMree5pDUJLDPZoyFxPIHAXUoxfMCp6IbtEmphzKquMAGHC4vYDNl0E_QlQOpfKD-GF5fQcMNNTj1m4-0r6PwNpI2zfkPpQ6-5n3jumY7M4Y7mMA2G5H7lo-DiyqJXMG8sXTlHU_Ckd9AUOkEZJJ9NKrOj8ibkIW2b2qGDRI2h2Z5f7ZtKuefAYhSofq0ipECY8kq_yt-jIIhTvlj0qexwbZj_66TKJ0biqZWQtA7v9AT4Lk1k9EHMQFbut3Q8X3SrMkvzXe_8lR_ITzwXK3lU4nC0jIjywzJBuKADA4vcbcUA');
    var envelopesApi = new docusign.EnvelopesApi();
    envelopesApi.listRecipients(accountId, "6a2d9802-8976-4840-b434-62c6b5ae194d", null, function (error, recips, response) {
      if (error) {
        console.log('Error: ' + error);
        return;
      }
      if (recips) {
        console.log('Recipients: ' + JSON.stringify(recips));
        res.send(recips);
      }
      return recips;
    });
    console.log("I've been clicked")
  })

//  apiClient.setBasePath(basePath);
//  apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);



app.post('/b',function getUrl(req,res){
  var curerntUrl = req.protocol + '://' + req.originalURl;
  parsedurl = url.parse(curerntUrl, true)
  //console.log(parsedurl.host);
  //console.log(parsedurl.pathname);
  //console.console.log(parsedurl.search);
  res.render('index')
})

function createEnvelope(accountId) {
    var envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = 'Please sign this document';
    envDef.templateId = 'a8fc7de6-6c05-458e-bf79-803b2300d9aa';
    //bc284b7a-da00-4da8-ae79-1afa58631033
    //{TEMPLATE_ID}
    // create a template role with a valid templateId and roleName and assign signer info
    var tRole = new docusign.TemplateRole();
    tRole.roleName = 'item 1';
    tRole.name = 'Darnell Holder';
    tRole.email = 'darnelho1@gmail.com';

    // set the clientUserId on the recipient to mark them as embedded (ie we will generate their signing link)
    tRole.clientUserId = '1001';

    // create a list of template roles and add our newly created role
    var templateRolesList = [];
    templateRolesList.push(tRole);

    // assign template role(s) to the envelope
    envDef.templateRoles = templateRolesList;

    // send the envelope by setting |status| to 'sent'. To save as a draft set to 'created'
    envDef.status = 'sent';

    // use the |accountId| we retrieved through the Login API to create the Envelope
    //var accountId = accountId;

    // instantiate a new EnvelopesApi object
    var envelopesApi = new docusign.EnvelopesApi();

    // call the createEnvelope() API
    envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, function (err, envelopeSummary, response) {
      if (err) {
        console.log(err);
      }
      console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
    });
}
