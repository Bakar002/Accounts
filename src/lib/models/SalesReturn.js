import mongoose from "mongoose";

const salesReturnSchema = new mongoose.Schema({
    billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },
    items: [
        {
            tileId: { type: mongoose.Schema.Types.ObjectId, ref: "Tile", required: true },
            quantity: { type: Number, required: true },
            reason: { type: String, required: true },
        },
    ],
    totalRefund: { type: Number, required: true }, // Total refund amount
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SalesReturn || mongoose.model("SalesReturn", salesReturnSchema);
