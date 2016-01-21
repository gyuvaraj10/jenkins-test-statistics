var express = require('express');
var gzippo = require('gzippo');
var app = express();

app.use(gzippo.staticGzip("" + __dirname + "/dist"));
app.listen(process.env.PORT || 9000);
