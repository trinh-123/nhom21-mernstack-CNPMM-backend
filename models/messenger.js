var mongoose = require('mongoose');

var schema = new mongoose.Schema(
    { 
        id_user1: String,
        id_user2: String,
        content: [
            {
                id_user1: String,
                id_user2: String,
                id: String,
                message: String,
                name: String,
                category: String,
            }
        ]
    }
);

var Messenger = mongoose.model('Messenger', schema, 'messengers');

module.exports = Messenger;