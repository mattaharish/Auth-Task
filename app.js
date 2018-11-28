const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/config.js');

mongoose.Promise = global.Promise;

mongoose.connect(config.db);

const db = mongoose.connection;

db.on('connected', function () {
  console.log("Conneted to db..");
});

const app = express();

app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));

app.use('/', require('./controllers/index.js'));

app.set('port', (process.env.PORT || 3000));

app.get('*', function (req, res, next) {
  req.status = 404;
  next("Page Not Found!!");
});

app.use(function (err, req, res, next) {
  res.send(err);
});

app.listen(app.get('port'), function () {
  console.log('Server started on port ' + app.get('port'));
});