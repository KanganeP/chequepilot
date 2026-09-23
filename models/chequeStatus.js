module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "ChequeStatus",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            status_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            tableName: "cheque_statuses",
            timestamps: false,
        }
    );
};