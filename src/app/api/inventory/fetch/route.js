import connectToDatabase from "@/lib/db";
import Tile from "@/lib/models/Tile";

export async function GET() {
    await connectToDatabase();

    const tiles = await Tile.find();
    return new Response(JSON.stringify({ tiles }), { status: 200 });
}
