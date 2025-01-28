import connectToDatabase from "@/lib/db";
import Customer from "@/lib/models/Customer";

export async function GET(request, context) {
    try {
        await connectToDatabase();

        // Await the params to ensure they are resolved
        const { params } = context;
        const { customerId } = await params;

        // Find the customer by ID
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return new Response(JSON.stringify({ error: "Customer not found" }), { status: 404 });
        }

        return new Response(JSON.stringify(customer), { status: 200 });
    } catch (error) {
        console.error("Error fetching customer:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
