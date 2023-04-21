const express = require("express");
const uuid = require("uuid").v4;

const openai = require("../utils/openai.js");
const { PostModel } = require("../model/user.model.js");
const HttpError = require("../utils/HttpError.js");

const router = express.Router();

router.route("/").get(async (req, res, next) => {
  // let images;
  // try {
  //   images = await cloudinary.api.resources({
  //     prefix: "aiultra/",
  //     type: "upload",
  //   });
  //   console.log(images);
  // } catch (error) {
  //   console.log(error);
  // }
  res.json({ msg: "Hello from DALL-E" });
});

// router.route("/").post(async (req, res, next) => {
//   try {
//     const { prompt } = req.body;
//     const aiResponse = await openai.createImage({
//       prompt,
//       n: 1,
//       size: "512x512",
//       response_format: "b64_json",
//     });
//     const image = aiResponse.data.data[0].b64_json;

//     res.status(200).json({ photo: image });
//   } catch (error) {
//     console.log(error.response.data.error);
//     res.status(500).send(error.response.data.error);
//   }
// });

router.post("/postNewImage", async (req, res, next) => {
  const { name = "hello welcome to earth", userImage, email, tags } = req.body;
  const aiResponse = await openai.createImage({
    prompt: name,
    n: 1,
    size: "512x512",
    response_format: "",
  });

  const imageUrl = aiResponse.data.data[0].url;
  try {
    const post = new PostModel({
      postId: uuid(),
      name,
      imageUrl,
      userImage,
      email,
      tags,
    });
    await post.save();
  } catch (error) {
    console.log(error.response.data.error);
    return next(new HttpError(error, 500));
  }
});

router.post("postReactImage", async (req, res, next) => {
  const { postId, email, like } = req.body;
  try {
    const post = await PostModel.findOne({ postId: postId });
    if (like) {
      post.likes = post.likes + 1;
      post.likedUsers.push(email);
    } else {
      post.likes = post.likes - 1;
      const likedUsers = post.likedUsers.filter((p) => p != email);
      post.likedUsers = likedUsers;
    }
    await post.save();
  } catch (error) {
    return next(new HttpError(error, 500));
  }
});

module.exports = router;
