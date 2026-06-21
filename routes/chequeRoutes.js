const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const {
  processChequeOCR,
} = require("../services/ocrService");

router.post(
  "/ocr",
  upload.single("chequeImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload image",
        });
      }

      const ocrResult =
        await processChequeOCR(
          req.file.path
        );

      res.json({
        success: true,
        ocrResult,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "OCR Failed",
      });
    }
  }
);

module.exports = router;