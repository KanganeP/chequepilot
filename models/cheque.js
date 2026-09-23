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
                allowNull: false,
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
            bank_address: DataTypes.TEXT,
            cheque_number: DataTypes.STRING,
            account_number: DataTypes.STRING,
            ifsc_code: DataTypes.STRING,
            micr_code: DataTypes.STRING,

            amount: DataTypes.DECIMAL(15, 2),

            amount_in_words: DataTypes.TEXT,

            cheque_date: DataTypes.DATE,
            clearance_date: DataTypes.DATE,

            remarks: DataTypes.TEXT,
            image_path: DataTypes.TEXT,
            ocr_raw_text: DataTypes.TEXT,

            overdue_days: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },

            is_ocr_verified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },

            created_at: DataTypes.DATE,
            created_by: DataTypes.UUID,

            cleared_at: DataTypes.DATE,
            cleared_by: DataTypes.UUID,

            bounced_at: DataTypes.DATE,
            bounced_by: DataTypes.UUID,

            bounced_reason: DataTypes.TEXT,

            updated_at: DataTypes.DATE,
            updated_by: DataTypes.UUID,
        },
        {
            tableName: "cheques",
            timestamps: false,
        }
    );
};