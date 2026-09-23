const { Op } = require("sequelize");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const {
    Cheque,
    ChequeType,
    ChequeCategory,
    ChequeStatus,
    User
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
    } catch (err) {
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

        // Find Pending status
        const pendingStatus = await ChequeStatus.findOne({
            where: {
                status_name: "Pending",
                is_active: true
            }
        });

        if (!pendingStatus) {
            return res.status(400).json({
                success: false,
                message: "Pending cheque status not found"
            });
        }

        const cheque = await Cheque.create({
            shop_id: req.user.shopId,
            cheque_type_id: req.body.chequeTypeId,
            cheque_category_id: req.body.chequeCategoryId,
            cheque_status_id: pendingStatus.id,
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

exports.getPendingChequesByType = async (req, res) => {
    try {
        const { type } = req.params;

        if (!["credit", "debit"].includes(type.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "Invalid cheque type. Use credit or debit."
            });
        }

        const chequeType = await ChequeType.findOne({
            where: {
                type_name: {
                    [Op.iLike]: type
                }
            }
        });

        if (!chequeType) {
            return res.status(404).json({
                success: false,
                message: `${type} cheque type not found`
            });
        }

        const pendingStatus = await ChequeStatus.findOne({
            where: {
                status_name: {
                    [Op.iLike]: "pending"
                }
            }
        });

        if (!pendingStatus) {
            return res.status(404).json({
                success: false,
                message: "Pending cheque status not found"
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cheques = await Cheque.findAll({
            where: {
                shop_id: req.user.shopId,
                cheque_status_id: pendingStatus.id,
                cheque_type_id: chequeType.id,
                cheque_date: {
                    [Op.gte]: today
                }
            },

            include: [
                {
                    model: ChequeType,
                    as: "type",
                    attributes: ["id", "type_name"]
                },
                {
                    model: ChequeStatus,
                    as: "status",
                    attributes: ["id", "status_name"]
                },
                {
                    model: User,
                    as: "createdBy",
                    attributes: ["id", "full_name"]
                },
                {
                    model: User,
                    as: "updatedBy",
                    attributes: ["id", "full_name"]
                }
            ],

            order: [["created_at", "DESC"]]
        });

        const data = cheques.map((cheque) => {
            const item = cheque.toJSON();

            return {
                ...item,
                type_name: item.type?.type_name || null,
                status_name: item.status?.status_name || null,
                created_by_name: item.createdBy?.full_name || null,
                updated_by_name: item.updatedBy?.full_name || null,
            };
        });

        return res.json({
            success: true,
            count: data.length,
            data
        });

    } catch (err) {
        console.error("Get pending cheques error:", err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getClearedChequesByType = async (req, res) => {
    try {
        const { type } = req.params;

        const normalizedType = type.toLowerCase();

        if (!["credit", "debit"].includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid cheque type. Use credit or debit.",
            });
        }

        // =========================
        // Find cheque type
        // =========================

        const chequeType = await ChequeType.findOne({
            where: {
                type_name: {
                    [Op.iLike]: normalizedType,
                },
                is_active: true,
            },
        });

        if (!chequeType) {
            return res.status(404).json({
                success: false,
                message: `${type} cheque type not found`,
            });
        }

        // =========================
        // Find Cleared status
        // =========================

        const clearedStatus = await ChequeStatus.findOne({
            where: {
                status_name: {
                    [Op.iLike]: "cleared",
                },
                is_active: true,
            },
        });

        if (!clearedStatus) {
            return res.status(404).json({
                success: false,
                message: "Cleared cheque status not found",
            });
        }

        // =========================
        // Get cleared cheques
        // =========================

        const cheques = await Cheque.findAll({
            where: {
                shop_id: req.user.shopId,

                // Cleared only
                cheque_status_id: clearedStatus.id,

                // Credit / Debit
                cheque_type_id: chequeType.id,
            },

            include: [
                {
                    model: ChequeType,
                    as: "type",
                    attributes: ["id", "type_name"],
                },

                {
                    model: ChequeStatus,
                    as: "status",
                    attributes: ["id", "status_name"],
                },

                {
                    model: User,
                    as: "createdBy",
                    attributes: ["id", "full_name"],
                },

                {
                    model: User,
                    as: "updatedBy",
                    attributes: ["id", "full_name"],
                },
            ],

            order: [["cleared_at", "DESC"]],
        });

        // =========================
        // Format response
        // =========================

        const data = cheques.map((cheque) => {
            const item = cheque.toJSON();

            return {
                ...item,

                type_name: item.type?.type_name || null,

                status_name: item.status?.status_name || null,

                created_by_name:
                    item.createdBy?.full_name || null,

                updated_by_name:
                    item.updatedBy?.full_name || null,
            };
        });

        return res.json({
            success: true,
            count: data.length,
            data,
        });

    } catch (err) {
        console.error("Get cleared cheques error:", err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.getOverdueChequesByType = async (req, res) => {
    try {
        const { type } = req.params;

        const normalizedType = type.toLowerCase();

        if (!["credit", "debit"].includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid cheque type. Use credit or debit."
            });
        }

        const chequeType = await ChequeType.findOne({
            where: {
                type_name: {
                    [Op.iLike]: normalizedType
                },
                is_active: true
            }
        });

        if (!chequeType) {
            return res.status(404).json({
                success: false,
                message: `${type} cheque type not found`
            });
        }

        const pendingStatus = await ChequeStatus.findOne({
            where: {
                status_name: {
                    [Op.iLike]: "pending"
                },
                is_active: true
            }
        });

        if (!pendingStatus) {
            return res.status(404).json({
                success: false,
                message: "Pending cheque status not found"
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cheques = await Cheque.findAll({
            where: {
                shop_id: req.user.shopId,
                cheque_status_id: pendingStatus.id,
                cheque_type_id: chequeType.id,
                cheque_date: {
                    [Op.lt]: today
                }
            },

            include: [
                {
                    model: ChequeType,
                    as: "type",
                    attributes: ["id", "type_name"]
                },
                {
                    model: ChequeStatus,
                    as: "status",
                    attributes: ["id", "status_name"]
                },
                {
                    model: User,
                    as: "createdBy",
                    attributes: ["id", "full_name"]
                },
                {
                    model: User,
                    as: "updatedBy",
                    attributes: ["id", "full_name"]
                }
            ],

            order: [["cheque_date", "ASC"]]
        });

        const data = cheques.map((cheque) => {
            const item = cheque.toJSON();

            return {
                ...item,

                type_name: item.type?.type_name || null,
                status_name: item.status?.status_name || null,

                created_by_name:
                    item.createdBy?.full_name || null,

                updated_by_name:
                    item.updatedBy?.full_name || null
            };
        });

        return res.json({
            success: true,
            count: data.length,
            data
        });

    } catch (err) {
        console.error("Get overdue cheques error:", err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.clearCheque = async (req, res) => {
    try {
        const { id } = req.params;

        // Find cheque belonging to logged-in shop
        const cheque = await Cheque.findOne({
            where: {
                id,
                shop_id: req.user.shopId
            }
        });

        if (!cheque) {
            return res.status(404).json({
                success: false,
                message: "Cheque not found"
            });
        }

        // Find Cleared status dynamically
        const clearedStatus = await ChequeStatus.findOne({
            where: {
                status_name: {
                    [Op.iLike]: "Cleared"
                },
                is_active: true
            }
        });

        if (!clearedStatus) {
            return res.status(404).json({
                success: false,
                message: "Cleared cheque status not found"
            });
        }

        const now = new Date();

        // Update cheque status
        await cheque.update({
            cheque_status_id: clearedStatus.id,
            cleared_at: now,
            cleared_by: req.user.userId,
            updated_at: now,
            updated_by: req.user.userId
        });

        return res.json({
            success: true,
            message: "Cheque marked as cleared successfully",
            data: cheque
        });

    } catch (err) {
        console.error("Clear cheque error:", err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.bounceCheque = async (req, res) => {
    try {
        const { id } = req.params;
        const { bouncedReason } = req.body;

        const cheque = await Cheque.findOne({
            where: {
                id,
                shop_id: req.user.shopId,
            },
        });

        if (!cheque) {
            return res.status(404).json({
                success: false,
                message: "Cheque not found.",
            });
        }

        const bouncedStatus = await ChequeStatus.findOne({
            where: {
                status_name: {
                    [Op.iLike]: "bounced",
                },
                is_active: true,
            },
        });

        if (!bouncedStatus) {
            return res.status(404).json({
                success: false,
                message: "Bounced status not found.",
            });
        }

        const now = new Date();

        await cheque.update({
            cheque_status_id: bouncedStatus.id,
            bounced_at: now,
            bounced_by: req.user.userId,
            bounced_reason: bouncedReason || null,
            updated_at: now,
            updated_by: req.user.userId,
        });

        return res.json({
            success: true,
            message: "Cheque marked as bounced successfully.",
            data: cheque,
        });

    } catch (error) {
        console.error("Bounce cheque error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to mark cheque as bounced.",
        });
    }
};

exports.getBouncedChequesByType = async (req, res) => {
    try {
        const { type } = req.params;

        const chequeType = await ChequeType.findOne({
            where: {
                type_name: {
                    [Op.iLike]: type,
                },
                is_active: true,
            },
        });

        if (!chequeType) {
            return res.status(404).json({
                success: false,
                message: `Cheque type '${type}' not found.`,
            });
        }

        const bouncedStatus = await ChequeStatus.findOne({
            where: {
                status_name: {
                    [Op.iLike]: "bounced",
                },
                is_active: true,
            },
        });

        if (!bouncedStatus) {
            return res.status(404).json({
                success: false,
                message: "Bounced status not found.",
            });
        }

        const cheques = await Cheque.findAll({
            where: {
                shop_id: req.user.shopId,
                cheque_status_id: bouncedStatus.id,
                cheque_type_id: chequeType.id,
            },

            include: [
                {
                    model: ChequeType,
                    as: "type",
                    attributes: ["id", "type_name"],
                },
                {
                    model: ChequeStatus,
                    as: "status",
                    attributes: ["id", "status_name"],
                },
                {
                    model: User,
                    as: "createdBy",
                    attributes: ["id", "full_name"],
                },
                {
                    model: User,
                    as: "updatedBy",
                    attributes: ["id", "full_name"],
                },
            ],

            order: [["bounced_at", "DESC"]],
        });

        const data = cheques.map((c) => {
            const item = c.toJSON();

            return {
                ...item,
                type_name: c.type?.type_name || null,
                status_name: "Bounced",
                created_by_name: c.createdBy?.full_name || null,
                updated_by_name: c.updatedBy?.full_name || null,
            };
        });

        return res.json({
            success: true,
            data,
        });

    } catch (error) {
        console.error("Get bounced cheques error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch bounced cheques.",
        });
    }
};