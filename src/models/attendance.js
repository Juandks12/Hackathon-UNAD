import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },   // puede ser null si aún no salió
  tardanza: { type: Boolean, default: false },
  motivoCorreccion: { type: String }, // si el admin corrige
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);
