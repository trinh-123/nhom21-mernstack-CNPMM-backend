var Category = require("../models/category");
var ParentCategory = require("../models/parentCategory");

module.exports.getCategoriesByParentId = async (req, res) => {
    const parentId=req.params.id_parent;
    const categories = await Category.find({idParent:parentId});
    return res.json({categories});
};

module.exports.getCategories = async (req, res) => {
    const categories = await Category.find({});
    return res.json({categories});
};
module.exports.getParentCategories = async (req,res) =>{
    const parentcategories = await ParentCategory.find({});
    return res.json({parentcategories});
}
