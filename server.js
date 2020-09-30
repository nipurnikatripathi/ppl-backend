var express = require("express");
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
// console.log(__dirname, path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.urlencoded({ extended: false }));
var mongoose = require("mongoose");
// collection name - signupppl for registered user collection
var signupppl = require("./userSchema");
// collection name - categorySchema for category collection
var categorySchema = require("./categorySchema");

var postSchema = require("./postSchema");

const cors = require("cors");
app.use(cors());
app.use(cors({ origin: true }));

app.use(bodyParser.json());
mongoose.connect("mongodb://localhost:27017/ppldb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// post call for registeration at /register API
app.post("/register", (req, res) => {
  signupppl.find({ email: req.body.email }, function (err, data) {
    if (data.length) {
      console.log("user exists");
      res.send(false);
    } else {
      signupppl.create(req.body, function (result) {
        console.log("new data arrived", req.body);
        res.send(true);
      });
    }
  });
});

// post call for login at /login API

app.post("/login", function (req, res) {
  console.log(req.body);
  signupppl.findOne({ $and: [{ email: req.body.email }] }, (error, data) => {
    if (data) {
      if (data.password === req.body.password) {
        res.send({ msg: "login successfully" });

        console.log("you are successfully logged in!");
      } else {
        res.send({ msg: "invalid password" });
      }
    } else {
      res.send({ msg: "invalid email" });
      console.log("invalid email");
    }
  });
});

//post call for category add category at /addCategory API
app.post("/addCategory", (req, res) => {
  console.log("category before condition", req.body);

  categorySchema.find({ categoryName: req.body.category }, (error, data) => {
    console.log("category after condition", data);
    if (data.length) {
      console.log("category alredy exists !", data);
      res.send(false);
    } else if (error) {
      console.log("error in adding");
    } else {
      categorySchema.create({ categoryName: req.body.category }, function (
        result
      ) {
        console.log("new category arrived", req.body);
        res.send(req.body);
      });
    }
  });
});

//post call for username add category at /addusername API
app.post("/addusername", (req, res) => {
  console.log("username at server side inside addusername api", req.body);

  signupppl.find({ email: req.body.userEmail }, function (err, data) {
    if (data.length) {
      console.log("username found", data);
      // console.log("username: ",data);
      res.send(data);
    } else if (err) {
      console.log("error at server side in addusername api");
    } else {
      console.log("username not found");
      res.send(false);
    }
  });
  // res.send(true)
});
// categorySchema.find({ categoryName: req.body.category },( error, data ) => {
//   console.log("category after condition", data);
//   if (data.length) {
//     console.log("category alredy exists !", data);
//     res.send(false);
//   }
//   else if (error) {
//     console.log("error in adding")
//   }
//   else {
//     categorySchema.create({ categoryName: req.body.category }, function (result ) {
//       console.log("new category arrived", req.body);
//       res.send(req.body);
//     });
//   }
// });

//get call for category
app.get("/getusername", (req, res) => {
  console.log("get call");

  signupppl.find({}, function (err, data) {
    console.log("username after condition", data);
    res.send(data);
  });
});

app.get("/getCategory", (req, res) => {
  console.log("get call");

  categorySchema.find({}, function (err, data) {
    console.log("category after condition", data);
    res.send(data);
  });
});

// delete category
app.delete("/deleteCategory", (req, res) => {
  console.log("category received in delete api :", req.body);

  console.log("category id :", req.body._id);

  categorySchema.deleteOne({ _id: req.body._id }, (error, data) => {
    console.log("data :", data);
    if (data) {
      console.log("data in server side in delete api:", data);
      res.send(true);
    } else {
      res.send(false);
    }
    //   }
    // } else {
    //   res.send({ msg: "invalid email" });
    //   console.log("invalid email");
    // }
  });
});

// get call for username

app.get("/getUsername", (req, res) => {
  signupppl.find({}, function (err, data) {
    if (data) {
      console.log("userdata in get call", data);
      res.send(true);
    } else {
      console.log("error in getusername Api call");
    }
  });

  // signupppl.find({} , function (err, data) {
  //   console.log("username:",data);
  //   res.send(data);
  //   }
  // )
});

// app.post("/addCategory", (req, res) => {
//   categorySchema.find({$and: [{name: req.body.categorySchema}], function (err, data) {
//     if (data.length) {
//       console.log("category already exists", data);
//       res.send("category already exists");
//     } else if {
//       categorySchema.create(req.body, function (result) {
//         console.log("new data arrived", req.body);
//         res.send(true);
//       })
//     }

//   }}
// )}
// )

var multer = require("multer");
// var upload = multer({dest:'uploadImages/'});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// app.use('/static', express.static(path.join(__dirname, 'public')))
var upload = multer({ storage: storage });
app.post("/uploadPost", upload.single("selectedFile"), function (req, res) {
  if (req.file) {
    console.log("req.file.filename", req.file.filename);
    req.body.filename = req.file.filename;
    // console.log("request:", req);
    postSchema.create(req.body, function (result) {
      console.log("new data arrived", req.body);
      res.send({ msg: "post saveds on datatbase!" });
    });
  }
});

// app.get("/getUploadPost", (req, res) => {
//   postSchema
//     .find({}, function (err, data) {
//       console.log("category after condition", data);
//       res.send(data);
//     })
//     .sort({ currentdate: -1 });
// });
app.get("/getUploadPost", (req, res) => {
  postSchema
    .find({})
    .sort({ currentdate: -1 })
    .populate('category userid')
    .exec(function (err, data) {
      if (err) throw err;
      else {
        console.log("populate data", data);
        res.send(data);
      }
    });
});

var server = app.listen(8081, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log("server is running at http://%s:%s", host, port);
});
