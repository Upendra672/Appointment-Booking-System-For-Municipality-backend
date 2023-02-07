const express = require("express");
const router = express.Router();
const Department = require("../models/departmentModel");
const authMiddleware = require("../middlewares/authMiddleware");

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

module.exports = router;
