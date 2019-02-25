const express = require('express');
const app = express();

var port = 5050;
app.get('/', function(req, res) {
  res.send('Hello World')
})

app.listen(port, function(){
  console.log('App Listening on port: ' + port)
})
