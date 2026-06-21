const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const processChequeOCR = async (
  imagePath
) => {
  try {
    const formData = new FormData();

    formData.append(
      "file",
      fs.createReadStream(imagePath)
    );

    const response = await axios.post(
      "http://localhost:8000/process/",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "OCR Error:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  processChequeOCR,
};