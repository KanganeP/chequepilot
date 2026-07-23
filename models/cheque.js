module.exports = (sequelize, DataTypes) => {

    return sequelize.define(
        "Cheque",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },

            shop_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },

            created_by: {
                type: DataTypes.UUID,
                allowNull: true,
            },

            cheque_type_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            cheque_category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            cheque_status_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            party_name: DataTypes.STRING,

            payee_name: DataTypes.STRING,

            bank_name: DataTypes.STRING,

            bank_address: DataTypes.STRING,

            cheque_number: DataTypes.STRING,

            account_number: DataTypes.STRING,

            ifsc_code: DataTypes.STRING,

            micr_code: DataTypes.STRING,

            amount: DataTypes.DECIMAL(15, 2),

            amount_in_words: DataTypes.TEXT,

            cheque_date: DataTypes.DATEONLY,

            clearance_date: DataTypes.DATEONLY,

            remarks: DataTypes.TEXT,

            image_path: DataTypes.TEXT,

            ocr_raw_text: DataTypes.TEXT,

            overdue_days: DataTypes.INTEGER,

            activated_at: DataTypes.DATE,

            activated_by: DataTypes.UUID,

            cleared_by: DataTypes.UUID,

            cleared_at: DataTypes.DATE,

            bounced_reason: DataTypes.TEXT,

            is_ocr_verified: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },

            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },

            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "cheques",
            timestamps: false,
        }
    );
};