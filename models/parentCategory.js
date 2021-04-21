const mongoose = require("mongoose");
const parentCategorySchema= new mongoose.Schema({
    name: String,
});
const parentCategory=mongoose.model("parentCategory",parentCategorySchema,"parentcategories");
module.exports =parentCategory;