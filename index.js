import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import callerRoutes from "./routes/caller.js";

const app = express();
dotenv.config();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is Twilio Webhook of Spam-Jam.");
});

app.use("/caller", callerRoutes);

const PORT = process.env.PORT || 5555;

app.listen(PORT, () => {
  console.log(`Now listening on port ${PORT}.`);
});
