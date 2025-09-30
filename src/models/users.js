import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["empleado", "admin"], default: "empleado" },
});

export default mongoose.model("User", userSchema);
