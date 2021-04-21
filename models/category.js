const mongoose = require("mongoose");


const categorySchema= new mongoose.Schema({
    name: String,
    idParent: { type: mongoose.Schema.Types.ObjectId, ref: "parentCategory" },
});
const Category=mongoose.model("Category",categorySchema,"categories");
module.exports =Category;