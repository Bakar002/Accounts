import connectToDatabase from "@/lib/db";
import Bill from "@/lib/models/Bill";

export async function GET() {
    try {
        await connectToDatabase();
        const bills = await Bill.find().populate("customer").populate("tiles.tileId");
        return new Response(JSON.stringify({ bills }), { status: 200 });
    } catch (error) {
        console.error("Error fetching bills:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch bills" }), { status: 500 });
    }
}
