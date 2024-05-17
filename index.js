const mongoose = require("mongoose");
const express = require("express");
const app = express();
const UsersRoutes = require("./user.js");
const LocationRoutes = require("./locn.js");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/users", UsersRoutes);
app.use("/location", LocationRoutes);

// Connecting with MongoDB
mongoose
  .connect(
    "mongodb+srv://admin:nodeAPI1@password.ybcklkj.mongodb.net/Weather?retryWrites=true&w=majority&appName=Backend"
  )
  .then(() => {
    console.log("Connected to DB");
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`Running on port ${port}...`));
  })
  .catch((error) => {
    console.error("Connection Failed", error);
  });
