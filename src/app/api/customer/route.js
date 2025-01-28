import connectToDatabase from "@/lib/db";
import Customer from "@/lib/models/Customer";

export async function GET(request) {
    try {
        await connectToDatabase();

        const customers = await Customer.find().sort({ name: 1 }); // Sort by name alphabetically
        return new Response(JSON.stringify(customers), { status: 200 });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
