const express = require("express");
const multer = require("multer");

const verifyToken = require("../middleware/verifyToken");
const { createUser, getRoles, getUsers } = require("../controllers/userController");

const router = express.Router();

const upload = multer({
    dest: "uploads/profiles"
});

router.get(
    "/roles",
    verifyToken,
    getRoles
);

router.post(
    "/",
    verifyToken,
    upload.single("profileImage"),
    createUser
);

router.get(
    "/",
    verifyToken,
    getUsers
);

module.exports = router;