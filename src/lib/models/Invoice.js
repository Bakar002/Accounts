import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Paid", "Unpaid", "Partially Paid"], default: "Unpaid" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
