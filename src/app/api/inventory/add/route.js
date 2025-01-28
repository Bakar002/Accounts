import connectToDatabase from "@/lib/db";
import Tile from "@/lib/models/Tile";
import { authMiddleware } from "@/middleware/auth";
import jwt from "jsonwebtoken";

export async function POST(request) {
    await connectToDatabase();

    const token = request.headers.get("authorization")?.split(" ")[1];
    const { role } = jwt.verify(token, process.env.JWT_SECRET);

    if (role !== "Admin" && role !== "Manager") {
        return new Response("Forbidden", { status: 403 });
    }

    const { name, size, boxes, tilesPerBox, packagingPerBox } = await request.json();

    // Create a new tile
    const newTile = new Tile({ name, size, boxes, tilesPerBox, packagingPerBox });

    await newTile.save();

    return new Response(JSON.stringify({ message: "Tile added successfully", tile: newTile }), { status: 201 });
}
