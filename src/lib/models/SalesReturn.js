import mongoose from "mongoose";

const salesReturnSchema = new mongoose.Schema({
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    returnedTiles: [
        {
            tileId: { type: mongoose.Schema.Types.ObjectId, ref: "Tile", required: true },
            quantityInPieces: { type: Number, required: true },
            quantityInBoxes: { type: Number, required: true },
            quantityInMeters: { type: Number, required: true },
            rate: { type: Number, required: true },
            price: { type: Number, required: true },
        },
    ],
    totalQuantity: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SalesReturn || mongoose.model("SalesReturn", salesReturnSchema);