import connectToDatabase from "@/lib/db";
import Bill from "@/lib/models/Bill";
import Customer from "@/lib/models/Customer";
import Tile from "@/lib/models/Tile";
import axios from "axios";

const os = require('os');

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
        const pdfBuffer = await generatePDFWithPDFShift(billHTML);

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
            const base64Image = "data:image/jpeg;base64,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O6cOLXxzmrZ5KrFl0Dldzo+jhczq7ZwItugcJ0O2VOe10SqRbK2a4AAAAAAJudMuZSwAAAAAANzTsRh3g4fY4/XOJ369YTE5/YMPL69fLPUrXUS41CyejJXbTXDby9bQOT0dHeK6DPY65Yyq97g94wesOudHSsGI8ZMWscvs7OY4vc4PSNbZ9ahp9HnbpxO3xbMaXIs9eNIAAAAAAE3OmXMpYAAAAAAEwM2PyPXvEJy4c5gy7GIxedzEecITlwjNj8jO95DUnGDOMOXCGTGPfh6PTJ4GIM0Yh78wM2KB69YwyYxlxAAAAAAABNzplzKWAAAAAAAAAB68jr83oc838ez5McZ8Zr58GQ0POQdHT3vZxZgdnTjbNPNl5J1Iy+Dxg1uoYOhoZjWyZOUdSMvgx6XnqmvobukAAAAAAAAAATc6ZcylgAAAAAAAAAA3NbwN7FrDoxzxtbHNHvzA6Uc4Z8AdGOeNjZ5w6OLTE7mkNnZ5o2s/OHRxaYdri7xpQAAAAAAAAAAE3OmXMpYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJudMuZSwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATc6ZcylgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAm50y5lLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABNzplzKbASCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeriH/9oADAMBAAIAAwAAACH3333333333333333333333333333333333332733333333333333333333333333333333333337333333333333333333333333333333333333373333333333333333333vX33333333333333337333333333333333333G1X333333333333333373333333333333333mh3tX33333333333333337333333333333333gEgAZX3333333333333333733333333333332n10vLFf333333333333333373333333333332sWc1Y6lX3333333333333333733333333333+D+4v/3ZFXzDT7/X333333333373333333333/QBrBP2CWJh/MBg973333333333733333333331Vo0wRN6P9kcfVr//AN999999999+99999999999Xx81999999999jtV9999999999+99999999998LDCV999999999dOf9999999999+99999999999XvIogzJ99oc839999999999999+999999999995zX/Eae99u/GX9999999999999+99999999999lCT2+zc999Y/X9999999999999+99999999999s+BFn4j99tKOX9999999999999+99999999999fO+MqMo99uALX9999999999999+999999999999999wif995s1X9999999999999+999999999954d0wP7S99NL2X9999999999999+9999999999/XmO7lGB99+oOX9999999999999+99999999999HwAcm4X999ei99999999999999+9999999999tt/s9N+P99ke999999999999999+99999991999999999x9959991999999999999+99999992yaeuy6ui6GtKqSO2CW2Gme9999999+9999999q+SW6ammeiq9q+e2aSGS22m9999999+9999999ttNp4Bttc8Z5N9d/wDDXbfbXffffffffvfffffffffaQFllsOrTtrrGl/v3PffffffffffvffffffffffZdTeTTdXfebdXUe/fffffffffffvfffffffffffffffffffffffffffffffffffffvfffffffffffffffffffffffffffffffffffffvfffffffffffffffffffffffffffffffffffffvPffffffffffffffffffffffffffffffffffffng/ffffffffffffffffffffffffffffffffffXv/9oADAMBAAIAAwAAABAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK0IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8IAAAAAAAAAAAAAAAAIIEAAAAAAAAAAAAAAAAD8IAAAAAAAAAAAAAAAIIk0MAAAAAAAAAAAAAAAD8IAAAAAAAAAAAAAIIR4KQMIAAAAAAAAAAAAAAD8IAAAAAAAAAAAAAIVyvS2IAAAAAAAAAAAAAAAD8IAAAAAAAAAAAIJewiiK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G1YMgTTmwPYjkp8xyiQjw1W5Mzi3brDn6sQ3iCpoyZiU3iL/AAiK0YEEvXye8Q8WYiBpqAnaK1hqg1iIN05QOMABxR6cukWVbTCBV4e/DdF7zcNOIFnuf5ptvnFGA336Ndai1VTl0rOAlXJQCc4pay3gG/tDIpc+LpnCeIsYnmmFif0IFvqgLSFX7wbaqClCKexcRAaNJzgWALVqICxA2HkQ6qT0oc6qYEKozIC9JSiKTlBpRuOT+riRRr/iJGHH8kxo4qy+xN80zedIFV88mDGU3YbyqGwHC4HA1MC8/wAyI4SB5NzFHcAyRq3tMdwxDhhm8N0XvNw04as4UVaur43hzirgHmNQHTYVatMajw9gIonpBQwBDD1E599e/JWaCtCowx3q1tSmPQX6DWVWi0CQlGyDBKMxEpg9zNmuLMbCNTDyU5QaR5kvJCCk9bJY/kwo0u2ACHyF0Y8DWKjj9LifxQxyAGcZCoDVSss7gqihuHkymrcdqF19opuYIsoHL0lfHSpZ52kB4xMcaDEhaxo4/S4Je5cGKg5x9owGsN36+BY0NltAYe8TG1K/Phui95uGnD9tJXxYypj95y+D28eXjznecvg9vAql4HOYuSxVnPh+i95uGn0X0XvNw0+i+i95uGn0X0XvNw0+i+i95uGn0X0XvNw0+i+i95uGn0X0XvNw0+i+g95uGk8xjrM8xnnMpqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKaspqymrKasrq/eCx3/ALTDvMJ//9k="; // Complete base64 string here

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
            <title>Inovice Page</title>
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
                    <h1>SHERAZI Inovices</h1>
                    <div class="contact-info">
                        Kashmir Road, Sialkot. Tel: +92-52-4272731-32, 052-6944824<br>
                        Fax: +92-52-4292931 | E-mail: miansons1@yahoo.com
                    </div>
                    <div class="logo">
                    <img src="${base64Image}" alt="Company Logo">
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
                        <div><span>Inovice No:</span><span class="value">${bill.billNumber}</span></div>
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

async function generatePDFWithPDFShift(html) {
    const response = await axios.post(
        "https://api.pdfshift.io/v3/convert/pdf",
        {
            source: html,
            format: "A4", // Ensure the format is A4
            margin: "20px", // Optional: Add margins
            landscape: false, // Set to true if you want landscape orientation
            css: `
                @page {
                    size: A4; // Ensure the page size is A4
                    margin: 20px; // Optional: Add margins
                }
            `,
        },

        {
            auth: {
                username: "api",
                password: "sk_d6e01d4393f77f3f41bc8fbd0249950bacb4f4fc", // Replace with your PDFShift API key
            },
            responseType: "arraybuffer", // To receive the PDF as a buffer
        }
    );

    return response.data;
}