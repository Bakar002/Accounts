import connectToDatabase from "@/lib/db";
import Invoice from "@/lib/models/Invoice";
import Bill from "@/lib/models/Bill";

export async function POST(request) {
    await connectToDatabase();

    const { billId } = await request.json();

    // Check if the bill exists
    const bill = await Bill.findById(billId);
    if (!bill) {
        return new Response("Bill not found", { status: 404 });
    }

    // Generate a unique invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    // Create a new invoice
    const newInvoice = new Invoice({
        billId,
        invoiceNumber,
        status: "Unpaid",
    });

    await newInvoice.save();

    return new Response(
        JSON.stringify({ message: "Invoice generated successfully", invoice: newInvoice }),
        { status: 201 }
    );
}
