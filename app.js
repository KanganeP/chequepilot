const express = require("express");
const cors = require("cors")
const db = require("./models");;

const authRoutes = require("./routes/authRoutes");
const chequeRoutes = require("./routes/chequeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cheque", chequeRoutes);

const PORT = process.env.PORT || 3001;

db.sequelize.authenticate()
.then(() => {
    console.log("✅ PostgreSQL Connected");
})
.catch(err => {
    console.log("❌ Database Error");
    console.log(err);
});

app.get("/", (req, res) => {
  res.send("ChequeFlow API Running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});