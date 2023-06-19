const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Runtime array to store products
let products = [];

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// GET all products
app.get("/products", (req, res) => {
  res.json(products);
});

// GET a specific product by ID
app.get("/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

// POST a new product
app.post("/products", (req, res) => {
  const newProduct = req.body;
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT (update) a product by ID
app.put("/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  const updatedProduct = req.body;

  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  products[productIndex] = updatedProduct;

  res.json(updatedProduct);
});

// DELETE a product by ID
app.delete("/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];

  res.json(deletedProduct);
});

// Payment
app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
