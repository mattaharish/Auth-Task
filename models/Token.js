var mongoose = require('mongoose');

var tokenSchema = new mongoose.Schema({

    token: {
        type: String
    },
    active: {
        type: Boolean
    }

});

var User = module.exports = mongoose.model('Token', tokenSchema);