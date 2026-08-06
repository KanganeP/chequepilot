const bcrypt = require("bcrypt");
const { User, UserRole } = require("../models");

exports.createUser = async (req, res) => {
    try {
        const passwordHash = await bcrypt.hash(
            req.body.password,
            10
        );
        const user = await User.create({
            shop_id: req.user.shopId,
            role_id: req.body.roleId,
            full_name: req.body.fullName,
            email: req.body.email,
            mobile: req.body.mobile,
            password_hash: passwordHash,
            profile_image: req.file
                ? req.file.filename
                : null,
            is_active: req.body.isActive,
            created_at: new Date(),
            created_by: req.user.userId
        });
        res.json({
            success: true,
            message: "User Created Successfully",
            data: user
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getRoles = async (req, res) => {
    try {
        const roles = await UserRole.findAll({
            attributes: [
                "id",
                "role_name"
            ],
            where: {
                is_active: true
            },
            order: [
                ["id", "ASC"]
            ]
        });
        res.json({
            success: true,
            data: roles
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: {
                shop_id: req.user.shopId
            },
            include: [
                {
                    model: UserRole,
                    attributes: ["id", "role_name"]
                }
            ],
            order: [["created_at", "DESC"]]
        });
        const data = users.map(user => ({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            mobile: user.mobile,
            profile_image: user.profile_image,
            is_active: user.is_active,
            last_login: user.last_login,
            created_at: user.created_at,
            role_name: user.UserRole?.role_name || ""
        }));
        res.json({
            success: true,
            data
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};