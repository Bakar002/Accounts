import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", default: null },
    transactionType: { type: String, enum: ["Credit", "Debit"], required: true },
    amount: { type: Number, required: true },
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
});

export default mongoose.models.Ledger || mongoose.model("Ledger", ledgerSchema);
