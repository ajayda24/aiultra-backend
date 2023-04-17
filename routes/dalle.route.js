const express = require("express");
const openai = require("../utils/openai.js");

const router = express.Router();

router.route("/").get(async (req, res, next) => {
  let images;
  try {
    images = await cloudinary.api.resources({
      prefix: "aiultra/",
      type: "upload",
    });
    console.log(images);
  } catch (error) {
    console.log(error);
  }
  res.send("Hello from DALL-E");
});

router.route("/").post(async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const aiResponse = await openai.createImage({
      prompt,
      n: 1,
      size: "512x512",
      response_format: "b64_json",
    });
    const image = aiResponse.data.data[0].b64_json;

    res.status(200).json({ photo: image });
  } catch (error) {
    console.log(error.response.data.error);
    res.status(500).send(error.response.data.error);
  }
});

module.exports = router;
