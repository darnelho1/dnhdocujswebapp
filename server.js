const express = require('express');
const app = express();
app.set('view engine', 'ejs');

var port = 5050;
app.get('/', function(req, res) {
  res.render('index')
})

app.listen(port, function(){
  console.log('App Listening on port: ' + port)
})

app.post('/', function(req, res){
  res.render('index');
  console.log("I've been clicked")
})
