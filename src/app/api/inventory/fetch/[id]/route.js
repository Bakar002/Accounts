import connectToDatabase from "@/lib/db";
import Tile from "@/lib/models/Tile";
import { authMiddleware } from "@/middleware/auth";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
    await connectToDatabase();

    const { id } = params;

    try {
        const tile = await Tile.findById(id);

        if (!tile) {
            return new Response("Tile not found", { status: 404 });
        }

        return new Response(JSON.stringify({ tile }), { status: 200 });
    } catch (error) {
        console.error("Error fetching tile by ID:", error);
        return new Response("Error fetching tile", { status: 500 });
    }
}
