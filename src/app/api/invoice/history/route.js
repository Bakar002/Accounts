import connectToDatabase from "@/lib/db";
import Invoice from "@/lib/models/Invoice";

export async function GET() {
    await connectToDatabase();

    const invoices = await Invoice.find().populate("billId", "customerName grandTotal createdAt");
    return new Response(JSON.stringify({ invoices }), { status: 200 });
}
