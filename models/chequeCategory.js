module.exports = (sequelize, DataTypes) => {

    return sequelize.define(
        "ChequeCategory",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },

            category_name: DataTypes.STRING,

            description: DataTypes.TEXT,

            is_active: DataTypes.BOOLEAN,

            created_at: DataTypes.DATE
        },
        {
            tableName: "cheque_categories",
            timestamps: false
        }
    );

};