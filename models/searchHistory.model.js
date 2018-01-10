const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SearchHistroy = new Schema({
    searchstr: {type: String, required: true, minlength: 1},
    searchRes: {type: [String], required: true},
    searched_at: { type: Date , default: Date.now }
});

module.exports = mongoose.model('SearchHistory', SearchHistroy);