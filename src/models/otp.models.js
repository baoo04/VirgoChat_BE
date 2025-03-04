import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    otpType: {
      type: String,
      enum: ["signup", "reset-password"],
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      expires: 300,
    },
  }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
