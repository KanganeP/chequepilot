const pool = require("../db/db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const signup = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      shopName,
      ownerName,
      email,
      mobile,
      gstNumber,
      address,
      city,
      state,
      country,
      pincode,
      subscriptionPlan,
      password,
      logoUrl,
    } = req.body;

    // Check Existing Email

    const existingShop = await client.query(
      `SELECT id FROM shops WHERE email=$1`,
      [email]
    );

    if (existingShop.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const shopId = uuidv4();
    const userId = uuidv4();
    const settingId = uuidv4();
    const auditId = uuidv4();

    // Save Shop

    await client.query(
      `
      INSERT INTO shops (
        id,
        shop_name,
        owner_name,
        email,
        mobile,
        gst_number,
        address,
        city,
        state,
        country,
        pincode,
        logo_url,
        subscription_plan,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
        TRUE,NOW(),NOW()
      )
      `,
      [
        shopId,
        shopName,
        ownerName,
        email,
        mobile,
        gstNumber,
        address,
        city,
        state,
        country,
        pincode,
        logoUrl,
        subscriptionPlan,
      ]
    );

    // Encrypt Password

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    // Create Owner User

    await client.query(
      `
      INSERT INTO users (
        id,
        shop_id,
        full_name,
        email,
        mobile,
        password_hash,
        role,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,
        'OWNER',
        TRUE,
        NOW(),
        NOW()
      )
      `,
      [
        userId,
        shopId,
        ownerName,
        email,
        mobile,
        passwordHash,
      ]
    );

    // Default Settings

    await client.query(
      `
      INSERT INTO settings (
        id,
        shop_id,
        reminder_days_before,
        email_notification,
        whatsapp_notification,
        push_notification,
        timezone,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        3,
        TRUE,
        FALSE,
        TRUE,
        'Asia/Kolkata',
        NOW(),
        NOW()
      )
      `,
      [settingId, shopId]
    );

    // Audit Log

    await client.query(
      `
      INSERT INTO audit_logs (
        id,
        shop_id,
        user_id,
        action_type,
        module_name,
        action_details,
        created_at
      )
      VALUES (
        $1,
        $2,
        $3,
        'CREATE',
        'SIGNUP',
        'New Shop Registered',
        NOW()
      )
      `,
      [auditId, shopId, userId]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Account Created Successfully",
      shopId,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  signup,
};