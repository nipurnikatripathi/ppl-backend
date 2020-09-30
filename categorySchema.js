
// categorySchema - for submitCategoryButton
// values of newCategory object in submitButtonCategory component is save in the same order as present in categorySchema
var mongoose = require("mongoose");
var categorySchema = mongoose.Schema(
  {
    categoryName: { type: String },
    
  },
  { versionKey: false }
);
module.exports = mongoose.model("categoryCollection", categorySchema);
// collection name in backend : "categoryCollection"
