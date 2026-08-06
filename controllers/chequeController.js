const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const {
    Cheque,
    ChequeType,
    ChequeCategory,
    ChequeStatus
} = require("../models");

exports.processCheque = async (req, res) => {
    try {
        const form = new FormData();
        form.append(
            "file",
            fs.createReadStream(req.file.path),
            req.file.originalname
        );
        const response = await axios.post(
            "http://localhost:8000/process/",
            form,
            {
                headers: form.getHeaders()
            }
        );
        fs.unlinkSync(req.file.path);
        res.json(response.data);
    }catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

function formatDate(value) {
    if (!value) return null;

    // Already yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    // dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split("/");
        return `${year}-${month}-${day}`;
    }

    // OCR format ddmmyy
    if (/^\d{6}$/.test(value)) {
        const day = value.substring(0, 2);
        const month = value.substring(2, 4);
        const year = "20" + value.substring(4, 6);
        return `${year}-${month}-${day}`;
    }
    return null;
}

exports.createCheque = async (req, res) => {
    try {
        const cheque = await Cheque.create({
            shop_id: req.user.shopId,
            cheque_type_id: req.body.chequeTypeId,
            cheque_category_id: req.body.chequeCategoryId,
            cheque_status_id: 1, // Pending
            party_name: req.body.partyName,
            payee_name: req.body.payeeName,
            bank_name: req.body.bankName,
            bank_address: req.body.bankAddress,
            cheque_number: req.body.chequeNumber,
            account_number: req.body.accountNumber,
            ifsc_code: req.body.ifscCode,
            micr_code: req.body.micrCode,
            amount: req.body.amount,
            amount_in_words: req.body.amountInWords,
            cheque_date: formatDate(req.body.chequeDate),
            clearance_date: null,
            remarks: req.body.remarks,
            image_path: req.body.imagePath,
            ocr_raw_text: JSON.stringify(req.body),
            overdue_days: 0,
            is_ocr_verified: true,
            created_at: new Date(),
            created_by: req.user.userId,
            cleared_at: null,
            cleared_by: null,
            bounced_at: null,
            bounced_by: null,
            bounced_reason: null,
            updated_at: null,
            updated_by: null
        });
        res.json({
            success: true,
            message: "Cheque saved successfully",
            cheque
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

exports.getChequeTypes = async (req, res) => {
    try {
        const rows = await ChequeType.findAll({
            attributes: ["id", "type_name"],
            where: {
                is_active: true
            },
            order: [["id", "ASC"]]
        });
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

exports.getChequeCategories = async (req, res) => {
    try {
        const rows = await ChequeCategory.findAll({
            attributes: ["id", "category_name"],
            where: {
                is_active: true
            },
            order: [["id", "ASC"]]
        });
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};