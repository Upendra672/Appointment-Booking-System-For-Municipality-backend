const express = require("express");
const router = express.Router();
const Department = require("../models/departmentModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel")
const User = require("../models/userModel")
router.post(
  "/get-department-info-by-user-id",
  authMiddleware,
  async(req, res) => {
    try {
      const department = await Department.findOne({ userId: req.body.userId });
      res.status(200).send({
        success: true, 
        message: "Department info Fetched successfully",
        data: department,
      });
    } catch (error) {
      console.log(error)
      res.status(500).send({
        message: "Error getting department info",
        success: false,
        error,
      });
    }
  }
);

router.post(
  "/get-department-info-by-id",
  authMiddleware,
  async(req, res) => {
    try {
      const department = await Department.findOne({ _id: req.body.departmentId });
      res.status(200).send({
        success: true, 
        message: "Department info Fetched successfully",
        data: department,
      });
    } catch (error) {
      res.status(500).send({
        message: "Error getting department info",
        success: false,
        error,
      });
    }
  }
);

router.post("/update-department-profile", authMiddleware, async (req, res) => {
  try {
    const department = await Department.findOneAndUpdate(
      {
        userId: req.body.userId,
      },
      req.body
    );
    res.status(200).send({
      success: true,
      message: "Department profile updated successfully",
      data: department,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error getting department info",
      success: false,
      error,
    });
  }
});
router.get(
  "/get-appointments-by-department-id",
  authMiddleware,
  async (req, res) => {
    try {
      const department = await Department.findOne({userId:req.body.userId})
      const appointments = await Appointment.find({ departmentId:department._id});
      res.status(200).send({
        success: true,
        message: "Appointment fetched successfully",
        data: appointments,
      });
    } catch (error) {
      // console.log(error);
      res.status(500).send({
        success: false,
        message: "Error fetching Appointments",
        error,
      });
    }
  }
);
router.post(
  "/change-appointment-status",
  authMiddleware,
  async (req, res) => {
    try {
      const { appointmentId, status } = req.body;
      const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
        status,
      });
      const user = await User.findOne({ _id:appointment.userId });
      const unseenNotifications = user.unseenNotifications; 
      unseenNotifications.push({
        type: "appointment-status-has-been-changed",
        message: `Your Appointment status has been ${status}`,
        onClickPath: "/appointments",
      });
      //   await User.findByIdAndUpdate(user._id, {unseenNotifications})
      //   const departments = await Department.find({})
      // user.isDepartment = status === "approved" ? true : false;
      await user.save();
      res.status(200).send({ 
        message: "Department Status updated successfully",
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error changing appointment status",
        success: false,
        error,
      });
    }
  }
);

module.exports = router;
