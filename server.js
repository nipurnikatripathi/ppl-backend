var express = require("express");
var path = require("path");
var app = express();
var mongoose = require("mongoose");
var multer = require("multer");
var bodyParser = require("body-parser");
const cors = require("cors");
app.use(express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.urlencoded({ extended: false }));
// collection name - signupppl for registered user collection
var signupppl = require("./userSchema");
// collection name - categorycollection for category collection
var categorySchema = require("./categorySchema");
// collection name - postcollection for post collection
var postSchema = require("./postSchema");

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
      res.send(data);
    } else if (err) {
      console.log("error at server side in addusername api");
    } else {
      console.log("username not found");
      res.send(false);
    }
  });
});

// get call for category
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
  });
});

// get call for username
app.get("/getUsername", (req, res) => {
  signupppl.find({}, function (err, data) {
    if (data) {
      console.log("userdata in get call@@@@", data);
      res.send(data);
    } else {
      console.log("error in getusername Api call");
    }
  });
});

// for storing image file in disk storage
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

// post call for upload post
app.post("/uploadPost", upload.single("selectedFile"), function (req, res) {
  if (req.file) {
    console.log("req.file.filename", req.file.filename);
    req.body.filename = req.file.filename;
    postSchema.create(req.body, function (result) {
      console.log("new data arrived", req.body);
      res.send({ msg: "post saveds on datatbase!" });
    });
  }
});

// post call for likes in upload post
app.post("/likes", (req, res) => {
  console.log("likes at server side -", req.body);
  // if postId and userEmail found in database
  postSchema.find(
    { $and: [{ _id: req.body.postId }, { likes: req.body.userEmail }] },
    function (error, data) {
      console.log("data outside find$$$$", data);
      // if data is found
      if (data.length >= 1) {
        console.log("data before pulling userEmail from array", data);
        // find the post by its postId and pull the userEmail from likes array
        postSchema.findByIdAndUpdate(
          req.body.postId,
          { $pull: { likes: req.body.userEmail } },
          { safe: true },
          function (err, model) {
            if (err) {
              console.log("err in find and update");
              // return res.send(err);
            } else {
              // console.log(
              //   "after pulling data from array in likes: ",
              //   res.json(model)
              // );
              return res.json(model);
            }
          }
        );
      }
      // if postId and userEmail not found in database
      else {
        // find the post by its postId and push the userEmail in likes array
        console.log("data before pushing userEmail in array", data);

        postSchema.findByIdAndUpdate(
          req.body.postId,
          { $push: { likes: req.body.userEmail } },
          { safe: true },
          function (err, model) {
            if (err) {
              console.log("err in find and update");
              // return res.send(err);
            } else {
              //console.log("after pushing data from array in likes: ",model);
              // console.log(
              //   "after pushing data from array in likes: ",
              //   res.json(model)
              // );
              return res.json(model);
            }
          }
        );
      }
    }
  );
});

//post call for comments in upload post
app.post("/comments", (req, res) => {
  console.log("comments at server side -", req.body);
  // find the post by its postId and update the comment array by pushing object having comment string and userEmail
  postSchema.findByIdAndUpdate(
    req.body.postId,
    { $push: { comments: req.body } },
    { safe: true },
    function (err, model) {
      if (err) {
        console.log("err in find and update");
        return res.send(err);
      } else {
        console.log("model in comments", model);
        //console.log(res.json(model));
        return res.json(model);
      }
    }
  );
});

// Post call for single post to fetch single data from database
app.post("/singlePost", (req, res) => {
  console.log("single post id in single post API @@@", req.body.singlepostId);
  postSchema
    .find(
      { _id: req.body.singlepostId }
      //   , function (err, data) {
      //   if (data.length) {
      //     console.log("data found single post!", data);
      //     // res.send(false);
      //   } else if (err) {
      //     console.log("error");
      //   } else {
      //     // signupppl.create(req.body, function (result) {
      //     console.log("data not found single post!");
      //     // res.send(true);
      //   }
      // }
    )
    .populate("category userid")
    .exec(function (err, data) {
      if (err) throw err;
      else {
        console.log("populate data in single post api", data);
        res.send(data);
      }
    });
});

// postSchema.find({ _id: req.body.singlepostId }),
//   function (err, data) {
//     console.log("data", data);
//     if (data) {
//       console.log("single post data in server side ", data);
//       //res.send(data);
//     } else {
//       console.log("err");
//       //   res.send(false);
//     }
//   };

// .populate("category userid")
// .exec(function (err, data) {
//   if (err) throw err;
//   else {
//     console.log("populate data in single post api", data);
//     res.send(data);
//   }
// });
// ).populate("category userid")
// .exec(function (err, data) {
//   if (err) throw err;
//   else {
//     console.log("populate data", data);
//     res.send(data);
//   }
//});

// get call for upload post
app.get("/getUploadPost", (req, res) => {
  postSchema
    .find({})
    .sort({ currentdate: -1 })
    .populate("category userid")
    .exec(function (err, data) {
      if (err) throw err;
      else {
        console.log("populate data in upload post api", data);
        res.send(data);
      }
    });
});

// server listening at 8081 port
var server = app.listen(8081, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log("server is running at http://%s:%s", host, port);
});
