const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Department = require("../models/departmentModel");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/get-all-departments", authMiddleware, async (req, res) => {
  try {
    const departments = await Department.find({});
    res.status(200).send({
      message: "Department fetched successfully",
      success: true,
      data: departments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error applying Department account",
      success: false,
      error,
    });
  }
});

router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({isAdmin:false});
    res.status(200).send({
      message: "User fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error applying Department account",
      success: false,
      error,
    });
  }
});

router.post(
  "/change-department-account-status",
  authMiddleware,
  async (req, res) => {
    try {
      const { departmentId, status } = req.body;
      const department = await Department.findByIdAndUpdate(departmentId, {
        status,
      });
      const user = await User.findOne({ _id: department.userId });
      const unseenNotifications = user.unseenNotifications;
      unseenNotifications.push({
        type: "new-department-request-changed",
        message: `Your department account status has been ${status}`,
        onClickPath: "/notifications",
      });
      //   await User.findByIdAndUpdate(user._id, {unseenNotifications})
      //   const departments = await Department.find({})
      user.isDepartment = status === "approved" ? true : false;
      await user.save();
      res.status(200).send({
        message: "Department Status updated successfully",
        success: true,
        data: department,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error applying Department account",
        success: false,
        error,
      });
    }
  }
);


module.exports = router;
