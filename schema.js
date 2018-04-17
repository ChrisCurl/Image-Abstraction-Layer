var mongoose = require('mongoose');
var schema = mongoose.Schema;

const querySchema = new schema({
    query: String,
    time: Date
});

const queryModel = mongoose.model('queryObj', querySchema);

module.exports = queryModel;