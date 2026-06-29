const Notification = require("../models/Notification");

// @desc    Get user notifications (direct and global)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { recipient: null }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json({ success: true, message: "Notification marked as read", data: notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { 
        $or: [
          { recipient: req.user._id },
          { recipient: null }
        ],
        read: false 
      },
      { read: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a system notification
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res, next) => {
  const { recipient, title, message, type } = req.body;
  try {
    const notification = await Notification.create({
      recipient: recipient || null,
      title,
      message,
      type: type || "info"
    });
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};
