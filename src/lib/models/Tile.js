import mongoose from "mongoose";

const tileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    size: { type: String, required: true },
    stock: { type: Number, default: 0 }, // This will be calculated
    boxes: { type: Number, required: true }, // Number of boxes
    tilesPerBox: { type: Number, required: true }, // Tiles per box
    packagingPerBox: { type: Number, required: true }, // Packaging per box
    createdAt: { type: Date, default: Date.now },
});

// Calculate stock as the product of boxes, tilesPerBox, and packagingPerBox
tileSchema.pre("save", function (next) {
    this.stock = this.boxes * this.tilesPerBox;
    next();
});

export default mongoose.models.Tile || mongoose.model("Tile", tileSchema);
