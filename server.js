var express = require("express");
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
var mongoose = require("mongoose");
var ppldb = require("./userSchema");

const cors = require("cors");
app.use(cors({ origin: true }));

app.use(bodyParser.json());
mongoose.connect("mongodb://localhost:27017/ppldb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// post call for signup
app.post("/register", (req, res) => {
  ppldb.find({ email: req.body.email }, function (err, data) {
    if (data.length) {
      console.log("user exists");
      res.send(false);
    } else {
      ppldb.create(req.body, function (result) {
        console.log("new data arrived", req.body);
        res.send(true);
      });
    }
  });
});

// post call for login

app.post("/login", function (req, res) {
  console.log(req.body);
  ppldb.find(
    { $and: [{ email: req.body.email }, { password: req.body.password }] },
    (error, data) => {
      if (data.length > 0) {
        res.send(true);
        console.log("you are successfully logged in!");
      } else {
        res.send(false);
        console.log("invalid user");
      }
    }
  );
});

var server = app.listen(8081, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log("server is running at http://%s:%s", host, port);
});
