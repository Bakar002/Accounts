import connectToDatabase from "@/lib/db";
import Ledger from "@/lib/models/Ledger";
import Customer from "@/lib/models/Customer";

export async function GET(request) {
    try {
        await connectToDatabase();

        const customerName = new URL(request.url).searchParams.get("customerName");

        if (!customerName) {
            return new Response(JSON.stringify({ error: "Customer name is required" }), { status: 400 });
        }

        // Step 1: Fetch the customer by name
        const customer = await Customer.findOne({ name: customerName });
        if (!customer) {
            return new Response(JSON.stringify({ error: "Customer not found" }), { status: 404 });
        }

        // Step 2: Fetch ledger entries for the customer
        const ledgers = await Ledger.find({ customer: customer._id })
            .populate("bill", "billNumber date grandTotal") // Populate specific fields from the Bill model
            .sort({ date: -1 });

        // Step 3: Return the ledgers and customer balance
        return new Response(
            JSON.stringify({
                balance: customer.balance, // Include customer balance
                ledgers,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching ledgers:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
