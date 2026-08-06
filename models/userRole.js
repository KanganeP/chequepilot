module.exports = (sequelize, DataTypes) => {

    return sequelize.define(
        "UserRole",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },

            role_name: DataTypes.STRING,

            description: DataTypes.TEXT,

            is_active: DataTypes.BOOLEAN
        },
        {
            tableName: "users_role",
            timestamps: false
        }
    );

};