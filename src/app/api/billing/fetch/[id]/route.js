import connectToDatabase from "@/lib/db";
import Bill from "@/lib/models/Bill";

export async function GET(request, { params }) {
    try {
        await connectToDatabase();

        // Wait for params to be available
        const { id } = await params;  // Add await here

        const bill = await Bill.findById(id)
            .populate("customer")
            .populate("tiles.tileId");

        if (!bill) {
            return new Response(JSON.stringify({ error: "Bill not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ bill }), { status: 200 });
    } catch (error) {
        console.error("Error fetching bill:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch bill" }), { status: 500 });
    }
}
