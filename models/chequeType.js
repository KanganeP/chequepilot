module.exports = (sequelize, DataTypes) => {

    return sequelize.define(
        "ChequeType",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },

            type_name: DataTypes.STRING,

            description: DataTypes.TEXT,

            is_active: DataTypes.BOOLEAN,

            created_at: DataTypes.DATE
        },
        {
            tableName: "cheque_types",
            timestamps: false
        }
    );

};