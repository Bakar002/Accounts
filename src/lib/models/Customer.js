import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
    balance: { type: Number, default: 0 }, // Running balance
});

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);
