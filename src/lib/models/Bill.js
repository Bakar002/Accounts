import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    salesmanName: { type: String, required: true },
    paymentType: { type: String, enum: ['Cash', 'Credit'], required: true },
    billNumber: { type: String, required: false, unique: true },
    date: { type: Date, default: Date.now },
    tiles: [
        {
            tileId: { type: mongoose.Schema.Types.ObjectId, ref: "Tile", required: true },
            quantityInBoxes: { type: Number, required: true },
            quantityInPieces: { type: Number, required: true },
            packagingPerBox: { type: Number, required: false },
            remainingPieces: { type: Number, required: false },
            rate: { type: Number, required: true },
            price: { type: Number, required: true },
            quantityInMeters: { type: Number, required: true },

        },
    ],
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    freight: { type: Number, default: 0 },
    total: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Bill || mongoose.model("Bill", billSchema);
