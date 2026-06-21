const chequeRoutes = require(
  "./routes/chequeRoutes"
);

app.use(
  "/api/cheque",
  chequeRoutes
);