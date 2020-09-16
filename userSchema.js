var mongoose = require("mongoose");
var userSchema = mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
    email: { type: String },
    firstName: { type: String },
    lastName: { type: String },
  },
  { versionKey: false }
);
module.exports = mongoose.model("signupppl", userSchema);
