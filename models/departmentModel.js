const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    departmentName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    specilization: {
      type: String,
      required: true,
    },
    minFee: {
      type: Number,
      required: true,
    },
    timings: {
      type: Array,
      required: true,
    },
    status: {
      type: String,
      default: "pending"
    },
    // slots:{
    //   type: Number,
    //   required: true,  
    // }
  },
  {
    timestamps: true,
  }
);
const departmentModel = mongoose.model("departments", departmentSchema);
module.exports = departmentModel;
