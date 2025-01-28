import { PDFDocument, rgb } from "pdf-lib";
import connectToDatabase from "@/lib/db";
import Invoice from "@/lib/models/Invoice";

export async function POST(request) {
    await connectToDatabase();
    const { invoiceId } = await request.json();

    // Fetch the invoice and associated bill, with tiles populated
    const invoice = await Invoice.findById(invoiceId).populate({
        path: "billId",
        populate: {
            path: "tiles.tileId", // Populate the tileId within the tiles array
        },
    });

    if (!invoice) {
        return new Response("Invoice not found", { status: 404 });
    }

    const bill = invoice.billId;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    // Add company logo
    const logoImagePath = "http://localhost:3000/images/logo.jpeg"; // Replace with actual path
    try {
        const logoImageBytes = await fetch(logoImagePath).then((res) => res.arrayBuffer());
        const logoImage = await pdfDoc.embedPng(logoImageBytes);
        page.drawImage(logoImage, {
            x: 50,
            y: height - 100,
            width: 100,
            height: 50,
        });
    } catch (error) {
        console.error("Failed to load logo image:", error);
    }

    // Add company details
    page.drawText("Sherazi Traders Lahore", { x: 200, y: height - 50, size: 16 });
    page.drawText("Kashmir Road, Sialkot", { x: 200, y: height - 70, size: 10 });
    page.drawText("Tel: +92-52-4272731-32", { x: 200, y: height - 90, size: 10 });

    // Add invoice details
    page.drawText(`Invoice Number: ${invoice.invoiceNumber}`, { x: 50, y: height - 130, size: 12 });
    page.drawText(`Bill Number: ${bill._id}`, { x: 50, y: height - 150, size: 12 });
    page.drawText(`Customer Name: ${bill.customerName}`, { x: 50, y: height - 170, size: 12 });
    page.drawText(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { x: 50, y: height - 190, size: 12 });

    // Add table headers
    page.drawText("ITEM DESCRIPTION", { x: 50, y: height - 230, size: 10 });
    page.drawText("SIZE", { x: 150, y: height - 230, size: 10 });
    page.drawText("QUANTITY", { x: 250, y: height - 230, size: 10 });
    page.drawText("PRICE", { x: 350, y: height - 230, size: 10 });
    page.drawText("TOTAL", { x: 450, y: height - 230, size: 10 });

    // Add table rows
    let y = height - 250;
    bill.tiles.forEach((item) => {
        const tile = item.tileId || {};
        const tileName = tile.name || "N/A";
        const tileSize = tile.size || "N/A";
        const quantity = item.quantity || 0;
        const price = item.price ? item.price.toFixed(2) : "0.00";
        const total = item.total ? item.total.toFixed(2) : "0.00";

        page.drawText(tileName, { x: 50, y, size: 10 });
        page.drawText(tileSize, { x: 150, y, size: 10 });
        page.drawText(quantity.toString(), { x: 250, y, size: 10 });
        page.drawText(price, { x: 350, y, size: 10 });
        page.drawText(total, { x: 450, y, size: 10 });

        y -= 20;
    });

    // Add totals
    page.drawText(`Grand Total: ${bill.grandTotal.toFixed(2)}`, { x: 50, y: y - 40, size: 12 });

    // Add notes
    page.drawText("Notes:", { x: 50, y: y - 80, size: 12 });
    page.drawText("Thank you for your business!", { x: 50, y: y - 100, size: 10 });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Return the PDF as a response
    return new Response(pdfBytes, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`,
        },
    });
}
