const express = require("express");
const app = express();

const path = require("path");
const url = require("url");

const port = 8080;

app.engine('pug', require('pug').__express)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "static")));

app.listen(port, function() {
    console.log("Listening to " + port);
});

app.get(/\D+/, function(req, res) {
    let purl = url.parse(req.url, true);
    let pa = path.join(req.url, "index");
    pa = pa.substring(1, pa.length);
    res.render(pa, purl.query);
});