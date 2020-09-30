var mongoose = require("mongoose");
var postSchema = mongoose.Schema(
  {
    category:  {type: mongoose.Schema.Types.ObjectId, ref: 'categoryCollection'},
    userid:   {type: mongoose.Schema.Types.ObjectId, ref: 'signupppl'},
    description: { type: String },
    filename: { type: String },
    currentdate: {type: Date, default: Date.now},
  },
  { versionKey: false }
);
module.exports = mongoose.model("postCollections", postSchema);

