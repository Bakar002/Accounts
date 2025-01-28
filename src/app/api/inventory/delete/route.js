import connectToDatabase from "@/lib/db";
import Tile from "@/lib/models/Tile";
import { authMiddleware } from "@/middleware/auth";
import jwt from "jsonwebtoken";

export async function DELETE(request) {
    await connectToDatabase();

    const token = request.headers.get("authorization")?.split(" ")[1];
    const { role } = jwt.verify(token, process.env.JWT_SECRET);

    if (role !== "Admin" && role !== "Manager") {
        return new Response("Forbidden", { status: 403 });
    }

    const { id } = await request.json();

    const deletedTile = await Tile.findByIdAndDelete(id);

    if (!deletedTile) {
        return new Response("Tile not found", { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Tile deleted successfully" }), { status: 200 });
}
