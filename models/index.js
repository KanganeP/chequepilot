require("dotenv").config();

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false,
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// =========================
// Cheque Models
// =========================

db.Cheque = require("./cheque")(
    sequelize,
    Sequelize.DataTypes
);

db.ChequeType = require("./chequeType")(
    sequelize,
    Sequelize.DataTypes
);

db.ChequeCategory = require("./chequeCategory")(
    sequelize,
    Sequelize.DataTypes
);

db.ChequeStatus = require("./chequeStatus")(
    sequelize,
    Sequelize.DataTypes
);

// =========================
// User Models
// =========================

db.User = require("./user")(
    sequelize,
    Sequelize.DataTypes
);

db.UserRole = require("./userRole")(
    sequelize,
    Sequelize.DataTypes
);

// =========================
// Cheque Associations
// =========================

db.Cheque.belongsTo(db.ChequeType, {
    foreignKey: "cheque_type_id",
    as: "type",
});

db.ChequeType.hasMany(db.Cheque, {
    foreignKey: "cheque_type_id",
    as: "cheques",
});

db.Cheque.belongsTo(db.ChequeCategory, {
    foreignKey: "cheque_category_id",
    as: "category",
});

db.ChequeCategory.hasMany(db.Cheque, {
    foreignKey: "cheque_category_id",
    as: "cheques",
});

db.Cheque.belongsTo(db.ChequeStatus, {
    foreignKey: "cheque_status_id",
    as: "status",
});

db.ChequeStatus.hasMany(db.Cheque, {
    foreignKey: "cheque_status_id",
    as: "cheques",
});

// =========================
// Cheque User Associations
// =========================

db.Cheque.belongsTo(db.User, {
    foreignKey: "created_by",
    as: "createdBy",
});

db.Cheque.belongsTo(db.User, {
    foreignKey: "updated_by",
    as: "updatedBy",
});

db.User.hasMany(db.Cheque, {
    foreignKey: "created_by",
    as: "createdCheques",
});

db.User.hasMany(db.Cheque, {
    foreignKey: "updated_by",
    as: "updatedCheques",
});

// =========================
// User Role Associations
// =========================

db.User.belongsTo(db.UserRole, {
    foreignKey: "role_id",
});

db.UserRole.hasMany(db.User, {
    foreignKey: "role_id",
});

// =========================

module.exports = db;