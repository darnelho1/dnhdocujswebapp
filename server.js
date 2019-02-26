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
    , accountId='8006154'
    , hostUrl = 'http://'+ host + ':' + port
    , clientID = '47f1113d-6380-4886-b0a6-cba02f960879'
    , clientSecret = 'e3122117-0328-4c3d-8381-b7e35d8404b9'
    , signerEmail = 'darnelho1@gmail.com'
    , signerName = 'Darnell Holder'
    , envelopeId = '6a2d9802-8976-4840-b434-62c6b5ae194d'
    , baseUriSuffix = '/restapi'
    , testDocumentPath = '../demo_documents/test.pdf'
    , test2DocumentPath = '../demo_documents/battle_plan.docx'
    , redirectUri ="http://localhost:5050/e5"
    , basePath = 'https://demo.docusign.net/restapi'
    , apiClient = new docusign.ApiClient()
    , scopes = [apiClient.OAuth.Scope.SIGNATURE];

const responseTypeCode = apiClient.OAuth.ResponseType.CODE; // Response type of code, to be used for the Auth code grant
const responseTypeToken = apiClient.OAuth.ResponseType.TOKEN; // Response type of token, to be used for implicit grant

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
    envelopesApi.listRecipients('8006154', envelopeId , null, function (error, recips, response) {
      if (error) {
        //console.log('Error: ' + error);
        //console.log(JSON.stringify(apiClient.defaultHeaders));
        //console.log(apiClient.baseUri);
        //console.log(response);
        return;
      }
      if (recips) {
        console.log('Recipients: ' + JSON.stringify(recips));
        res.send("<pre>" + JSON.stringify(recips)+ "</pre>" + "<li>Hello WOrld</li>");
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

app.post('/c', function listenvelopesDocumentsController(req,res){
  docusign.Configuration.default.setDefaultApiClient(apiClient);
  var envelopesApi = new docusign.EnvelopesApi();
  // call the listDocuments() API
  envelopesApi.listDocuments(accountId, envelopeId, null, function (error, docsList, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }
    if (docsList) {
      console.log('Envelope Documents: ' + JSON.stringify(docsList))
    }
});

})

app.get('/d',function downloadEnvelopeDocumentsController(req,res){
  docusign.Configuration.default.setDefaultApiClient(apiClient);
  var envelopesApi = new docusign.EnvelopesApi();
  envelopesApi.getDocument(accountId, envelopeId, '1', null, function (error, document, response) {
    if (error) {
      res.send('Error: ' + error);
      return;
    }
    if (document) {
      try {
        var fs = require('fs');
        var path = require('path');
        // download the document pdf
        var filename = envelopeId + '_' + '1' + '.pdf';
        var tempFile = path.resolve(__dirname, filename);
        fs.writeFile(tempFile, new Buffer(document, 'binary'), function (err) {
          if (err) console.log('Error: ' + err);
        });
        res.send('Document ' + '1' + ' from envelope ' + envelopeId + ' has been downloaded to:\n' + tempFile);
      } catch (ex) {
        res.send('Exception: ' + ex);
      }
    }
  });
})
