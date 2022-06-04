const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");


const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



app.get("/", (req, res) => {
  res.send("Welcome to our menufracturer company!");
});

app.listen(port, () => {
  console.log(`Welcome to our refrigerator parts menufracturer. ${port}`);
});
