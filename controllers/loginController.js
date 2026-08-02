const jwt = require("jsonwebtoken");

const token = jwt.sign(
    {
        userId: user.id,
        shopId: user.shop_id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_EXPIRE
    }
);

res.json({
    success: true,
    token,
    user
});