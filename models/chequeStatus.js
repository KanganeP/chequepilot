module.exports = (sequelize, DataTypes) => {

    return sequelize.define(
        "ChequeStatus",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },

            status_name: DataTypes.STRING,

            description: DataTypes.TEXT,

            display_order: DataTypes.INTEGER,

            is_active: DataTypes.BOOLEAN,

            created_at: DataTypes.DATE
        },
        {
            tableName: "cheque_statuses",
            timestamps: false
        }
    );

};