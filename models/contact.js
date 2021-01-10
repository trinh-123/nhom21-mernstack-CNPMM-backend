const mongoose = require("mongoose");
const contactSchema = new mongoose.Schema({
    name: String,
    email:String,
    phone:Number,
    address:String,
    content:String,
    createdAt:Date,
});
const Contact = mongoose.model("Contact", contactSchema, "contacts");
module.exports = Contact;