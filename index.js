const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dyiry.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// console.log(uri);

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  // console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    console.log("database connected");
    const servicesCollection = client
      .db("creative_agency")
      .collection("services");
    const bookingCollection = client
      .db("creative_agency")
      .collection("bookings");
    const reviewCollection = client.db("creative_agency").collection("reviews");
    const userCollection = client.db("creative_agency").collection("users");
    //  get orders on home page
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    // booking order by id
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;

      console.log(id);
      if (id) {
        const query = { _id: ObjectId(id) };
        const service = await servicesCollection.findOne(query);
        return res.send(service);
      } else {
        return res.send({ message: "Product not found" });
      }
    });

    // get order by email

    app.get("/bookingService", verifyToken, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      // console.log(email);
      if (email === decodedEmail) {
        const query = { email: email };
        const bookings = await bookingCollection.find(query).toArray();
        return res.send(bookings);
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    });

    // post booking data
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const result = bookingCollection.insertOne(booking);
      res.send(result);
    });

    // post review data

    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = reviewCollection.insertOne(review);
      res.send(result);
    });

    // get review on home page
    app.get("/reviewGet", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // addnew product

    app.post("/addItem", async (req, res) => {
      const newItem = req.body;
      const result = await servicesCollection.insertOne(newItem);
      res.send(result);
    });

    // create user for admin role i need email
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      res.send({ result, token });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to our menufracturer company!");
});

app.listen(port, () => {
  console.log(`Welcome to our refrigerator parts menufracturer. ${port}`);
});
