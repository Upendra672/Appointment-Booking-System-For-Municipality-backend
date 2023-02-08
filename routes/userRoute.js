const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Department = require("../models/departmentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const moment = require("moment")
//this backend code is for registration
router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exist", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newuser = new User(req.body);
    await newuser.save();
    res
      .status(200)
      .send({ message: "User Created Scuccessfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500) 
      .send({ message: "Error creating user", success: false, error });
  }
});

//this backend code is for login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Password is incorrect", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: "Login successful", success: true, data: token });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error Logging in", success: false, error });
  }
});

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
});

router.post("/apply-department-account", authMiddleware, async (req, res) => {
  try {
    const newdepartment = new Department({ ...req.body, status: "pending" });
    await newdepartment.save();
    const adminUser = await User.findOne({ isAdmin: true });

    const unseenNotifications = adminUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-department-request",
      message: `${newdepartment.departmentName} has applied for the Department account`,
      data: {
        departmentId: newdepartment._id,
        name: newdepartment.departmentName,
      },
      onClickPath: "/admin/departmentlist",
    });
    await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
    res.status(200).send({
      success: true,
      message: "Department account applied successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error applying deaprtment account",
      success: false,
      error,
    });
  }
});

router.post(
  "/mark-all-notifications-as-seen",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      const unseenNotifications = user.unseenNotifications;
      const seenNotifications = user.seenNotifications;
      seenNotifications.push(...unseenNotifications);
      user.unseenNotifications = [];
      user.seenNotifications = seenNotifications;
      const updatedUser = await user.save();
      updatedUser.password = undefined;
      res.status(200).send({
        success: true,
        message: "All notifications marked as seen",
        data: updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error marikng seen notification",
        success: false,
        error,
      });
    }
  }
);

router.post("/delete-all-notifications", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "All notifications deleted",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error deleting notifications",
      success: false,
      error,
    });
  }
});

router.get(
  "/get-all-approved-departments",
  authMiddleware,
  async (req, res) => {
    try {
      const departments = await Department.find({ status: "approved" });
      res.status(200).send({
        success: true,
        message: "Department fetched successfully",
        data: departments,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error applying Department account",
        error,
      });
    }
  }
);

router.post("/book-appointment", authMiddleware, async (req, res) => {
  try {
    req.body.status = "pending";
    req.body.date = moment(req.body.date, 'DD:MM:YYYY').toISOString()
    req.body.time = moment(req.body.time, 'HH:mm').toISOString()
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    //pushing notification to department based on his userId
    const user = await User.findOne({ _id: req.body.departmentInfo.userId });
    user.unseenNotifications.push({
      type: "new-appointment-request",
      message: `A new appointment request  has been made by ${req.body.userIfo.name}`,
      onClickPath: "/department/appointments",
    });
    await user.save();
    res.status(200).send({
      message: "Appointment booked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking an appointment",
      success: false,
      error,
    });
  }
});


router.post("/check-booking-availability", authMiddleware, async (req, res) => {
  try {
    const date = moment(req.body.date,'DD:MM:YYYY').toISOString()
    const fromtime = moment(req.body.time,'HH:mm').subtract(1,'hours').toISOString()
    const totime = moment(req.body.time,'HH:mm').add(1,'hours').toISOString()
    const departmentId = req.body.departmentId;
    const appointments = await Appointments.find({
      departmentId,
      date,
      time: {$gte:fromtime, $lte:totime},
      // status: "approved"

    });
    if(appointments.length>0)
    {
      return res.status(200).send({
        message:"Appointments Not Available",
        success:false
      })
    }
else{
  return res.status(200).send({
    message:"Appointments Available",
    success: true
  })
}

    await user.save();
    res.status(200).send({
      message: "Appointment booked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking an appointment",
      success: false,
      error,
    });
  }
});
router.get(
  "/get-appointments-by-user-id",
  authMiddleware,
  async (req, res) => {
    try {
      const appointments = await Appointment.find({ userId: req.body.userId});
      res.status(200).send({
        success: true,
        message: "Appointment fetched successfully",
        data: appointments,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error fetching Appointments",
        error,
      });
    }
  }
);

module.exports = router;
