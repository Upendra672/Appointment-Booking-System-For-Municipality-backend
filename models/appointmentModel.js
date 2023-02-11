const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  departmentId: {
    type: String,
    required: true,
  },
  departmentInfo: {
    type: Object,
    required: true,
  },
  userInfo: {
    type: Object,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String, 
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "approved",
  },
  // slots:{
  //   type: Number,
  //   required: true,  
  // }
},{
    timestamps:true,
});

const appointmentModel = mongoose.model("appointments",appointmentSchema);
module.exports = appointmentModel;   