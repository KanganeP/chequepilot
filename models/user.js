module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },

            shop_id: DataTypes.UUID,

            role_id: DataTypes.INTEGER,

            full_name: DataTypes.STRING,

            email: {
                type: DataTypes.STRING,
                unique: true
            },

            mobile: DataTypes.STRING,

            password_hash: DataTypes.TEXT,

            profile_image: DataTypes.TEXT,

            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },

            last_login: DataTypes.DATE,

            created_at: DataTypes.DATE,

            created_by: DataTypes.UUID,

            updated_at: DataTypes.DATE,

            updated_by: DataTypes.UUID
        },
        {
            tableName: "users",
            timestamps: false
        }
    );
};