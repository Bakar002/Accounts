import connectToDatabase from "@/lib/db";
import Bill from "@/lib/models/Bill";
import Customer from "@/lib/models/Customer";
import puppeteer from "puppeteer";

export async function POST(request) {
    try {
        await connectToDatabase();

        const { billId } = await request.json();

        // Fetch the bill with all related data
        const bill = await Bill.findById(billId)
            .populate("customer")
            .populate("tiles.tileId");

        if (!bill) {
            return new Response(JSON.stringify({ error: "Bill not found" }), { status: 404 });
        }

        // Generate dynamic HTML
        const billHTML = generateBillHTML(bill);

        // Generate PDF using Puppeteer
        const pdfBuffer = await generatePDF(billHTML);

        // Return the PDF as a response
        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=Bill_${bill.billNumber}.pdf`,
            },
        });
    } catch (error) {
        console.error("Error generating bill PDF:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

// Generate dynamic HTML for the bill
function generateBillHTML(bill) {
    const customer = bill.customer;
    const tiles = bill.tiles;

    const tilesRows = tiles
        .map(
            (tile) => `
            <tr>
                <td class="left">${tile.tileId.name}</td>
                <td class="right">${tile.quantityInMeters.toFixed(2)} Meter</td>
                <td class="right">${tile.quantityInBoxes}</td>
                <td class="right">${tile.quantityInPieces}</td>
                <td class="right">${tile.rate.toFixed(2)}</td>
                <td class="right">${tile.price.toFixed(2)}</td>
            </tr>
        `
        )
        .join("");

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bill Page</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">
            <style>
                /* Ensure sticky footer */
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #fff;
                    color: #000;
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }
                .bill-container {
                    flex: 1;
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 20px;
                    border: 1px solid #000;
                }
                .header-section {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                    position: relative;
                }
                .header-section h1 {
                    font-size: 24px;
                    margin: 0;
                    font-weight: bold;
                }
                .header-section .contact-info {
                    font-size: 14px;
                    margin-top: 10px;
                    line-height: 1.6;
                }
                .header-section .logo {
                    position: absolute;
                    top: 10px;
                    right: 20px;
                }
                .header-section .logo img {
                    width: 80px;
                }
                .details-section {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .details-column {
                    width: 48%;
                }
                .details-column div {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .details-column span {
                    font-size: 14px;
                    font-weight: bold;
                }
                .details-column .value {
                    font-weight: normal;
                    text-align: right;
                    margin-left: 10px;
                    width: 70%;
                    border-bottom: 1px solid #000;
                    padding-bottom: 5px;
                }
                .item-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                .item-table th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                    font-size: 14px;
                    text-align: center;
                    padding: 10px;
                    border: 1px solid #000;
                }
                .item-table td {
                    font-size: 14px;
                    padding: 8px 10px;
                    border: 1px solid #000;
                }
                .item-table td.left {
                    text-align: left;
                }
                .item-table td.right {
                    text-align: right;
                }
                .total-section {
                    margin-top: 20px;
                    font-size: 14px;
                    line-height: 1.6;
                }
                .total-section .row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .total-section .row span {
                    font-weight: bold;
                }
                .grand-total-row {
                    font-size: 16px;
                    font-weight: bold;
                    text-align: right;
                    margin-top: 20px;
                    border-top: 2px solid #000;
                    padding-top: 10px;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 12px;
                    line-height: 1.5;
                }
                .footer .urdu {
                    font-family: 'Noto Nastaliq Urdu', serif;
                    direction: rtl;
                }
            </style>
        </head>
        <body>
            <div class="bill-container">
                <div class="header-section">
                    <h1>SHERAZI Bills</h1>
                    <div class="contact-info">
                        Kashmir Road, Sialkot. Tel: +92-52-4272731-32, 052-6944824<br>
                        Fax: +92-52-4292931 | E-mail: miansons1@yahoo.com
                    </div>
                    <div class="logo">
                        <img src="https://i.imgur.com/8KNByL6.jpeg" alt="Company Logo">
                    </div>
                </div>
                <div class="details-section">
                    <div class="details-column">
                        <div><span>Name:</span><span class="value">${customer.name}</span></div>
                        <div><span>Address:</span><span class="value">${customer.address}</span></div>
                        <div><span>City:</span><span class="value">${customer.city || "-"}</span></div>
                        <div><span>Phone:</span><span class="value">${customer.phone}</span></div>
                    </div>
                    <div class="details-column">
                        <div><span>Bill No:</span><span class="value">${bill.billNumber}</span></div>
                        <div><span>Date:</span><span class="value">${new Date(bill.createdAt).toLocaleDateString()}</span></div>
                        <div><span>Salesman:</span><span class="value">${bill.salesmanName}</span></div>
                    </div>
                </div>
                <table class="item-table">
                    <thead>
                        <tr>
                            <th>ITEM DESCRIPTION</th>
                            <th>QUANTITY</th>
                            <th>BOXES</th>
                            <th>PCS</th>
                            <th>Rate</th>
                            <th>AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tilesRows}
                    </tbody>
                </table>
                <div class="total-section">
                    <div class="row"><span>P Amount:</span><span>Rs. ${bill.total.toFixed(2)}</span></div>
                    <div class="row"><span>Freight:</span><span>Rs. ${bill.freight.toFixed(2)}</span></div>
                    <div class="grand-total-row">Grand Total (Rs.): Rs. ${bill.grandTotal.toFixed(2)}</div>
                </div>
                <div class="footer">
                    <p>Deals: Raktiles, Spanish & China Tiles, Grohe Fitting, Imported & Local Sanitary Ware, Shower Cabins, Bath Tubs, Whirlpools, Hydro Massage Showers.</p>
                    <p>Address: SHERAZI TRADERS LAHORE</p>
                    <p class="urdu">شیرازی ٹریڈرز، لاہور۔ شکریہ</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Generate PDF using Puppeteer
async function generatePDF(html) {
    const browser = await puppeteer.launch({
        executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome' 
    }); 
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();
    return pdfBuffer;
}
