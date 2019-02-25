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
    , scopes = [apiClient.OAuth.Scope.EXTENDED];

const responseTypeCode = apiClient.OAuth.ResponseType.CODE; // Response type of code, to be used for the Auth code grant
const responseTypeToken = apiClient.OAuth.ResponseType.TOKEN; // Response type of token, to be used for implicit grant

let accountId // The DocuSign account that will be used
  , baseUri // the DocuSign platform base uri for the account.
  , eg // The example that's been requested
  ;


app.set('view engine', 'ejs');

//var port = 5050;
//const basePath = "https://demo.docusign.net/restapi"
var accessToken

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
  // IMPORTANT: after the login, DocuSign will send back a fresh
  // authorization code as a query param of the redirect URI.
  // You should set up a route that handles the redirect call to get
  // that code and pass it to token endpoint as shown in the next
  // lines:
  apiClient.generateAccessToken(clientID, clientSecret, req.query.code, function (err, oAuthToken) {
    //console.log(oAuthToken.accessToken);
    apiClient.getUserInfo(oAuthToken.accessToken, function (err, userInfo) {
      //console.log("UserInfo: " + userInfo);
      // parse first account's baseUrl
      // below code required for production, no effect in demo (same
      // domain)
      //apiClient.setBasePath(userInfo.accounts[0].baseUri + "/restapi");
      accessToken = oAuthToken.accessToken;
      //console.log(accessToken);
      res.render('index');
    });
  });
});

app.listen(port, function(){
  console.log('App Listening on port: ' + port)
})


app.post('/a', function listEnvelopesController(req, res){
  //console.log(accessToken)

    var envelopesApi = new docusign.EnvelopesApi();
    envelopesApi.listRecipients("3094776", "a8fc7de6-6c05-458e-bf79-803b2300d9aa", null, function (error, recips, response) {
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
