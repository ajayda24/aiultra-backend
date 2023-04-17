const express = require("express");
require("dotenv").config();
const cors = require("cors");

const connectDB = require("./utils/connect.js");
const userRoutes = require("./routes/user.routes.js");
const dalleRoutes = require("./routes/dalle.route.js");

const cloudinary = require("./utils/cloudinary.js");

const app = express();

app.use(cors());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/api/user", userRoutes);
app.use("/api/dalle", dalleRoutes);

app.get("/", async (req, res, next) => {
  res.status(200).json({
    status: true,
    message: "Server running",
    data: null,
  });
});

app.get("*", (req, res) => {
  res
    .status(403)
    .json({ status: false, messgae: "API doesn't exist.", data: null });
});

process.on("unhandledRejection", (error) => {
  console.error("Uncaught Error", error);
});

app.use(function (err, req, res, next) {
  console.log(err);
  res.status(err.code || 500).json({
    status: false,
    message: err.message || "An unknown error occured!",
    data: null,
  });
});

process.on("uncaughtException", function (err) {
  console.log(err);
  process.exit(); // exit the process to avoid unknown state
});

const PORT = process.env.PORT || 3001;

try {
  connectDB(process.env.MONGODB_URL)
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}.`);
      });
    })
    .catch((err) => console.log(err));
} catch (error) {
  console.log(error);
}
