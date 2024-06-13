import mongoose from "mongoose";

const medicalSchema = new mongoose.Schema({}, { timestamps: true });

export const MedicalRecord = mongoose.model("MedicalRecord", medicalSchema);
