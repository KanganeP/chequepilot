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
        logging: false
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Cheque = require("./cheque")(sequelize, Sequelize.DataTypes);

db.ChequeType = require("./chequeType")(sequelize, Sequelize.DataTypes);

db.ChequeCategory = require("./chequeCategory")(sequelize, Sequelize.DataTypes);

db.ChequeStatus = require("./chequeStatus")(sequelize, Sequelize.DataTypes);


db.Cheque.belongsTo(db.ChequeType, {
    foreignKey: "cheque_type_id"
});

db.Cheque.belongsTo(db.ChequeCategory, {
    foreignKey: "cheque_category_id"
});

db.Cheque.belongsTo(db.ChequeStatus, {
    foreignKey: "cheque_status_id"
});
module.exports = db;