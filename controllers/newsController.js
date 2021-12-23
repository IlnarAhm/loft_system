const formidable = require("formidable");
const tokens = require('../config/tokens');
const { uuid } = require('uuidv4');

const News = require('../database/models/newsModel');

module.exports.getAllNews = async function(req, res) {
    const news = await News.find({});

    res.json(news);
};

module.exports.addNews = async function(req, res) {
    const { title, text } = req.body;
    const refreshToken = req.headers['authorization'];
    const {firstName, _id, image, middleName, surName, username} = await tokens.getUserByToken(refreshToken);

    const newNews = await new News({
        created_at: new Date(),
        id: uuid(),
        title,
        text,
        user: {
            firstName,
            id: _id,
            image,
            middleName,
            surName,
            username
        }
    });

    await newNews.save();

    const news = await News.find({});

    res.json(news);
};

module.exports.updateNews = async function(req, res) {
    const {title, text} = req.body;

    await News.findOneAndUpdate({id: req.params.id}, { title, text });

    const news = await News.find({});

    res.json(news);
};

module.exports.deleteNews = async function(req, res) {
    await News.findOneAndDelete({ id: req.params.id });

    const news = await News.find({});

    res.json(news);
};