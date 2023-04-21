const deepai = require("deepai");

deepai.setApiKey(process.env.DEEPAI_API_KEY);

module.exports = deepai;
