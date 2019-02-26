const express = require('express'),
      passport = require('passport')
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
    , clientID = '47f1113d-6380-4886-b0a6-cba02f960879'
    , clientSecret = 'e3122117-0328-4c3d-8381-b7e35d8404b9'
    , signerEmail = 'darnelho1@gmail.com'
    , signerName = 'Darnell Holder'
    , templateId = '{TEMPLATE_ID}'
    , baseUriSuffix = '/restapi'
    , testDocumentPath = '../demo_documents/test.pdf'
    , test2DocumentPath = '../demo_documents/battle_plan.docx'
    , redirectUri ="http://localhost:5050/e5"
    , basePath = 'https://demo.docusign.net/restapi'
    , apiClient = new docusign.ApiClient()
    , scopes = [apiClient.OAuth.Scope.SIGNATURE];

const responseTypeCode = apiClient.OAuth.ResponseType.CODE; // Response type of code, to be used for the Auth code grant
const responseTypeToken = apiClient.OAuth.ResponseType.TOKEN; // Response type of token, to be used for implicit grant

let accountId // The DocuSign account that will be used
  , baseUri // the DocuSign platform base uri for the account.
  , eg // The example that's been requested
  ;


app.set('view engine', 'ejs');


//var port = 5050;
//const basePath = "https://demo.docusign.net/restapi"
var oAuthAccessToken
var encodedString

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
    oAuthAccessToken = oAuthToken.accessToken;
    apiClient.addDefaultHeader('Authorization', 'Bearer ' + oAuthToken.accessToken);
    //apiClient.setBasePath(userInfo.accounts[0].baseUri + '/restapi')
    //console.log(userInfo.accounts[0].baserUri)
    //console.log(userInfo.accounts[0].accountId)
    res.render('index')
  });
});

app.listen(port, function(){
  console.log('App Listening on port: ' + port)
})


app.post('/a', function listRecipientsController(req, res){
    docusign.Configuration.default.setDefaultApiClient(apiClient);
    var envelopesApi = new docusign.EnvelopesApi();
    envelopesApi.listRecipients('8006154', "6a2d9802-8976-4840-b434-62c6b5ae194d", null, function (error, recips, response) {
      if (error) {
        //console.log('Error: ' + error);
        //console.log(JSON.stringify(apiClient.defaultHeaders));
        //console.log(apiClient.baseUri);
        //console.log(response);
        return;
      }
      if (recips) {
        console.log('Recipients: ' + JSON.stringify(recips));
        res.send(recips);
      }
      return recips;
    });
    //console.log("I've been clicked")
  })



app.post('/b',function getUserInfoController(req,res){
  console.log(oAuthAccessToken);
  apiClient.getUserInfo(oAuthAccessToken, function(err, userInfo){
    res.send(userInfo)
  })

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
