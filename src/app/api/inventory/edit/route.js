import connectToDatabase from "@/lib/db";
import Tile from "@/lib/models/Tile";
import { authMiddleware } from "@/middleware/auth";
import jwt from "jsonwebtoken";

export async function PUT(request) {
    await connectToDatabase();

    const token = request.headers.get("authorization")?.split(" ")[1];
    const { role } = jwt.verify(token, process.env.JWT_SECRET);

    if (role !== "Admin" && role !== "Manager") {
        return new Response("Forbidden", { status: 403 });
    }

    const { id, name, size, boxes, tilesPerBox, packagingPerBox } = await request.json();

    // Find the tile by ID and update it
    const updatedTile = await Tile.findByIdAndUpdate(
        id,
        { name, size, boxes, tilesPerBox, packagingPerBox },
        { new: true }
    );

    if (!updatedTile) {
        return new Response("Tile not found", { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Tile updated successfully", tile: updatedTile }), { status: 200 });
}
