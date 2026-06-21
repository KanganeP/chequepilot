const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const chequeRoutes = require("./routes/chequeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cheque", chequeRoutes);


app.get("/", (req, res) => {
  res.send("ChequeFlow API Running");
});

app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});