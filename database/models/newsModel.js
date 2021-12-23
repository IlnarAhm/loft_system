const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsSchema = new Schema({
    created_at: Date,
    id: String,
    text: String,
    title: String,
    user: Object
});

const News = mongoose.model("News", newsSchema);

module.exports = News;