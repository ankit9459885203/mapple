// note:- notifications are user-specific (1 user → many notifications)

const { Notification, User } = require("../models");

/**
 * CREATE NOTIFICATION (ADMIN ) ______________________________________________________________________________________________________
 */
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;

    // validation
    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, title and message are required",
      });
    }

    // check user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

/**
 * GET MY NOTIFICATIONS (USER)_________________________________________________________________________________________________________________
 */
exports.getMyNotificationsById = async (req, res) => {
  try {
    const userId = req.user.id; // from verifyToken

    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/**
 * DELETE NOTIFICATION (USER – OWN ONLY)_____________________________________________________________________________________________________
 * Soft delete
 */
exports.softDelete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification id",
      });
    }

    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // authorization
    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own notification",
      });
    }

    await notification.destroy(); // soft delete

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

/**
 * ADMIN – DELETE ANY NOTIFICATION (HARD DELETE)_______________________________________________________________________________________________________
 */
exports.permanentDeleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id, {
      paranoid: false,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await notification.destroy({ force: true });

    return res.status(200).json({
      success: true,
      message: "Notification permanently deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to permanently delete notification",
      error: error.message,
    });
  }
};
