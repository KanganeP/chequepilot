const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");

const {
    processCheque,
    createCheque,
    getChequeTypes,
    getChequeCategories,
    getPendingChequesByType,
    getOverdueChequesByType,
    getClearedChequesByType,
    getBouncedChequesByType,
    clearCheque,
    bounceCheque
} = require("../controllers/chequeController");
const verifyToken = require("../middleware/verifyToken")

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
    auth,
    createCheque
);

// Pending Credit / Debit
router.get(
    "/pending/:type",
    verifyToken,
    getPendingChequesByType
);

router.get(
    "/overdue/:type",
    verifyToken,
    getOverdueChequesByType
);

// Cleared Credit / Debit
router.get(
    "/cleared/:type",
    verifyToken,
    getClearedChequesByType
);

router.get("/bounced/:type", verifyToken, getBouncedChequesByType);
router.patch("/:id/bounce", verifyToken, bounceCheque);

router.get("/types", getChequeTypes);

router.get("/categories", getChequeCategories);

// TEST
router.patch("/test", (req, res) => {
    console.log("🔥 CHEQUE PATCH TEST HIT");

    res.json({
        success: true,
        message: "Cheque PATCH route is working"
    });
});

// Clear cheque
router.patch(
    "/:id/clear",
    verifyToken,
    clearCheque
);

module.exports = router;