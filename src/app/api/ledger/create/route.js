import Ledger from "@/lib/models/Ledger";
import Customer from "@/lib/models/Customer";
import connectToDatabase from "@/lib/db";

export async function POST(request) {
    try {
        await connectToDatabase();

        const { customerId, transactionType, amount, description } = await request.json();

        // Validate request data
        if (!customerId || !transactionType || !amount) {
            return new Response(JSON.stringify({ error: "Required fields missing" }), { status: 400 });
        }

        // Find the customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return new Response(JSON.stringify({ error: "Customer not found" }), { status: 404 });
        }

        // Update customer balance based on transaction type
        if (transactionType === "Credit") {
            customer.balance += amount; // Increase balance for credits
        } else if (transactionType === "Debit") {
            customer.balance -= amount; // Decrease balance for debits
        } else {
            return new Response(JSON.stringify({ error: "Invalid transaction type" }), { status: 400 });
        }
        await customer.save();

        // Create a ledger entry
        const ledgerEntry = new Ledger({
            customer: customerId,
            transactionType,
            amount,
            description: description || "Manual transaction",
        });
        await ledgerEntry.save();

        return new Response(JSON.stringify({ message: "Ledger entry added successfully", ledger: ledgerEntry }), {
            status: 201,
        });
    } catch (error) {
        console.error("Error creating ledger entry:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
