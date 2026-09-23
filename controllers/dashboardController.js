const { Op } = require("sequelize");

const {
    Cheque,
    ChequeType,
    ChequeStatus
} = require("../models");

exports.getDashboardSummary = async (req, res) => {
    try {
        const shopId = req.user.shopId;

        if (!shopId) {
            return res.status(400).json({
                success: false,
                message: "Shop ID not found in token"
            });
        }

        // =========================
        // Find Credit / Debit types
        // =========================

        const [creditType, debitType] = await Promise.all([
            ChequeType.findOne({
                where: {
                    type_name: {
                        [Op.iLike]: "credit"
                    },
                    is_active: true
                }
            }),

            ChequeType.findOne({
                where: {
                    type_name: {
                        [Op.iLike]: "debit"
                    },
                    is_active: true
                }
            })
        ]);

        // =========================
        // Find statuses
        // =========================

        const [clearedStatus, pendingStatus, bouncedStatus] =
            await Promise.all([
                ChequeStatus.findOne({
                    where: {
                        status_name: {
                            [Op.iLike]: "cleared"
                        },
                        is_active: true
                    }
                }),

                ChequeStatus.findOne({
                    where: {
                        status_name: {
                            [Op.iLike]: "pending"
                        },
                        is_active: true
                    }
                }),

                ChequeStatus.findOne({
                    where: {
                        status_name: {
                            [Op.iLike]: "bounced"
                        },
                        is_active: true
                    }
                })
            ]);

        // =========================
        // TOTAL CREDIT
        // ONLY CLEARED CREDIT CHEQUES
        // =========================

        const totalCredit =
            creditType && clearedStatus
                ? await Cheque.sum("amount", {
                    where: {
                        shop_id: shopId,
                        cheque_type_id: creditType.id,
                        cheque_status_id: clearedStatus.id
                    }
                })
                : 0;

        // =========================
        // TOTAL DEBIT
        // ONLY CLEARED DEBIT CHEQUES
        // =========================

        const totalDebit =
            debitType && clearedStatus
                ? await Cheque.sum("amount", {
                    where: {
                        shop_id: shopId,
                        cheque_type_id: debitType.id,
                        cheque_status_id: clearedStatus.id
                    }
                })
                : 0;

        // =========================
        // TODAY
        // =========================

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        // =========================
        // PENDING CHEQUES
        //
        // Pending status
        // AND cheque date is TODAY or FUTURE
        // =========================

        const pendingCheques = pendingStatus
            ? await Cheque.count({
                where: {
                    shop_id: shopId,
                    cheque_status_id: pendingStatus.id,
                    cheque_date: {
                        [Op.gte]: today
                    }
                }
            })
            : 0;

        // =========================
        // OVERDUE CHEQUES
        //
        // Pending status
        // AND cheque date is BEFORE TODAY
        // =========================

        const overdueCheques = pendingStatus
            ? await Cheque.count({
                where: {
                    shop_id: shopId,
                    cheque_status_id: pendingStatus.id,
                    cheque_date: {
                        [Op.lt]: today
                    }
                }
            })
            : 0;

        // =========================
        // BOUNCED CHEQUES
        //
        // Bounced status
        // =========================

        const bouncedCheques = bouncedStatus
            ? await Cheque.count({
                where: {
                    shop_id: shopId,
                    cheque_status_id: bouncedStatus.id
                }
            })
            : 0;

        // =========================
        // FINAL RESPONSE
        // =========================

        return res.json({
            success: true,

            totalCredit: Number(totalCredit || 0),
            totalDebit: Number(totalDebit || 0),

            pendingCheques,
            overdueCheques,
            bouncedCheques
        });

    } catch (err) {
        console.error("Dashboard summary error:", err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};