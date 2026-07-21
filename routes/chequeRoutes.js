const express = require("express");
const multer = require("multer");

const {
    processCheque, 
    createCheque, 
    getChequeTypes,
    getChequeCategories
} = require("../controllers/chequeController");

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});

router.post(
    "/process-cheque",
    upload.single("file"),
    processCheque
);

router.post(
    "/",
    createCheque
);

router.get("/types", getChequeTypes);

router.get("/categories", getChequeCategories);

module.exports = router;