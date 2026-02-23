import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["shopkeeper", "customer"],
      required: [true, "Role is required"],
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isDelete: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
)

const User = mongoose.model("User", userSchema);

export default User;