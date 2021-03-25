const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var infoSchema = new Schema({
    title:{type:String},
    pageid:{type:String},
    revid:{type:String},
    text:{type:String},
},{
    collection: "infos"
})

module.exports = mongoose.model('info', infoSchema);