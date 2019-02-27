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
app.use(express.static(path.join(__dirname, "/public")));


var oAuthAccessToken
var envelopeId

apiClient.setBasePath(basePath);

app.get('/', function (req, res) {
    const authUri = apiClient.getAuthorizationUri(clientID, scopes, redirectUri, responseTypeCode);
     //Open DocuSign OAuth login in a browser, res being your node.js response object.
    res.redirect(authUri);
});
app.get('/e5', function (req, res) {

  apiClient.generateAccessToken(clientID, clientSecret, req.query.code, function (err, oAuthToken) {
    oAuthAccessToken = oAuthToken.accessToken;
    apiClient.addDefaultHeader('Authorization', 'Bearer ' + oAuthToken.accessToken);
    res.render('index')
  });
});

app.listen(port, function(){
  console.log('App Listening on port: ' + port)
})


app.get('/a', function listRecipientsController(req, res){
    docusign.Configuration.default.setDefaultApiClient(apiClient);
    var envelopesApi = new docusign.EnvelopesApi();
    envelopesApi.listRecipients('8006154', envelopeId , null, function (error, recips, response) {
      if (error) {
        //console.log(JSON.stringify(apiClient.defaultHeaders));
        return;
      }
      if (recips) {
        console.log('Recipients: ' + JSON.stringify(recips));
        res.send(recips);
      }
      return recips;
    });
  })



app.get('/b',function getUserInfoController(req,res){
  console.log(oAuthAccessToken);
  apiClient.getUserInfo(oAuthAccessToken, function(err, userInfo){
    res.send(userInfo)
  })

})

app.get('/c', function listenvelopesDocumentsController(req,res){
  docusign.Configuration.default.setDefaultApiClient(apiClient);
  var envelopesApi = new docusign.EnvelopesApi();
  // call the listDocuments() API
  envelopesApi.listDocuments(accountId, envelopeId, null, function (error, docs, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }
    if (docs) {
      res.send(docs)
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

app.post('/e', function embeddedSigningController(req, res){
docusign.Configuration.default.setDefaultApiClient(apiClient);
//Read the file you wish to send from the local machine.
fileStream = process.argv[2];
pdfBytes = fs.readFileSync(path.resolve(__dirname, 'test.pdf'));
pdfBase64 = pdfBytes.toString('base64');


let envDef = new docusign.EnvelopeDefinition();

//Set the Email Subject line and email message
envDef.emailSubject = 'Please sign this document sent from Node SDK';
envDef.emailBlurb = 'Please sign this document sent from the DocuSign Node.JS SDK.'

//Read the file from the document and convert it to a Base64String
let doc = new docusign.Document();
doc.documentBase64 = pdfBase64;
doc.fileExtension = 'pdf';
doc.name = 'Node Doc Send Sample';
doc.documentId = '1';

//Push the doc to the documents array.
let docs = [];
docs.push(doc);
envDef.documents = docs;

//Create the signer with the previously provided name / email address
let signer = new docusign.Signer();
signer.name = 'Darnell Holder';
signer.email = 'holderdarnell2@gmail.com';
signer.routingOrder = '1';
signer.recipientId = '1';
signer.clientUserId = '123'; //ClientUserId specifies that a recipient is captive. It ties to a generic DocuSign account and cannot be referenced without generating a recipient token.

//Create a tabs object and a signHere tab to be placed on the envelope
let tabs = new docusign.Tabs();

let signHere = new docusign.SignHere();
signHere.documentId = '1';
signHere.pageNumber = '1';
signHere.recipientId = '1';
signHere.tabLabel = 'SignHereTab';
signHere.xPosition = '50';
signHere.yPosition = '50';

//Create the array for SignHere tabs, then add it to the general tab array
signHereTabArray = [];
signHereTabArray.push(signHere);

tabs.signHereTabs = signHereTabArray;

//Then set the recipient, named signer, tabs to the previously created tab array
signer.tabs = tabs;

//Add the signer to the signers array
let signers = [];
signers.push(signer);

//Envelope status for drafts is created, set to sent if wanting to send the envelope right away
envDef.status = 'sent';

//Create the general recipients object, then set the signers to the signer array just created
let recipients = new docusign.Recipients();
recipients.signers = signers;

//Then add the recipients object to the enevelope definitions
envDef.recipients = recipients;

// *** End envelope creation ***


//Send the envelope
let envelopesApi = new docusign.EnvelopesApi();
envelopesApi.createEnvelope(accountId, { 'envelopeDefinition': envDef }, function (err, envelopeSummary, response) {

  if (err) {
    return res.send('Error while creating a DocuSign envelope:' + err);
  }
  //Set envelopeId the envelopeId that was just created
  envelopeId = envelopeSummary.envelopeId;
  console.log(envelopeId);


  let recipientViewRequest = new docusign.RecipientViewRequest();
  recipientViewRequest.authenticationMethod = 'email';
  recipientViewRequest.clientUserId = '123';
  recipientViewRequest.recipientId = '1';
  recipientViewRequest.returnUrl = 'http://localhost:5050/';
  recipientViewRequest.userName = 'Darnell Holder';
  recipientViewRequest.email = 'holderdarnell2@gmail.com';

  //Create the variable used to handle the response
  recipientViewResults = docusign.ViewLinkRequest();

  //Make the request for a recipient view
  envelopesApi.createRecipientView(accountId, envelopeId, { recipientViewRequest: recipientViewRequest }, function (err, recipientViewResults, response) {

    if (err) {
      return res.send('Error while creating a DocuSign recipient view:' + err);
    }

    //Set the signingUrl variable to the link returned from the CreateRecipientView request
    let signingUrl = recipientViewResults.url;

    //Then redirect to the signing URL
    res.redirect(signingUrl);
  });

});

})
