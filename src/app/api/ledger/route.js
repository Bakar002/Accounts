import connectToDatabase from "@/lib/db";
import Ledger from "@/lib/models/Ledger";

export async function GET(request) {
    try {
        await connectToDatabase();

        const customerId = new URL(request.url).searchParams.get("customerId");

        if (!customerId) {
            return new Response(JSON.stringify({ error: "Customer ID is required" }), { status: 400 });
        }

        // Fetch ledger entries for the customer and populate bill details
        const ledgers = await Ledger.find({ customer: customerId })
            .populate("bill", "billNumber date grandTotal") // Populate specific fields from the Bill model
            .sort({ date: -1 }); // Sort by date in descending order

        return new Response(JSON.stringify({ ledgers }), { status: 200 });
    } catch (error) {
        console.error("Error fetching ledger entries:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
