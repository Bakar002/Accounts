// src/app/api/billing/return/route.js
import connectToDatabase from "@/lib/db";
import SalesReturn from "@/lib/models/SalesReturn";
import Bill from "@/lib/models/Bill";
import Tile from "@/lib/models/Tile";
import Customer from "@/lib/models/Customer";
import Ledger from "@/lib/models/Ledger";
import mongoose from "mongoose";

export async function POST(request) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await connectToDatabase();

        const { billId, returnedTiles, totalQuantity, grandTotal } = await request.json();

        // Fetch the original bill
        const bill = await Bill.findById(billId).session(session);
        if (!bill) {
            throw new Error("Bill not found");
        }

        // Step 1: Update Tile Stock using findOneAndUpdate
        for (const item of returnedTiles) {
            const updateResult = await Tile.findOneAndUpdate(
                { _id: item.tileId }, // Filter by tile ID
                { $inc: { stock: item.quantityInPieces } }, // Increment stock by returned pieces
                { session, new: true } // Use session and return the updated document
            );

            if (!updateResult) {
                throw new Error(`Tile with ID ${item.tileId} not found or stock update failed`);
            }
        }

        // Step 2: Create Sales Return Record
        const salesReturn = new SalesReturn({
            bill: billId,
            customer: bill.customer,
            returnedTiles,
            totalQuantity,
            grandTotal,
        });
        await salesReturn.save({ session });

        // Step 3: Update Customer Balance (if payment was Credit) using findOneAndUpdate
        if (bill.paymentType === "Credit") {
            const updateCustomer = await Customer.findOneAndUpdate(
                { _id: bill.customer }, // Filter by customer ID
                { $inc: { balance: -grandTotal } }, // Decrement balance by grandTotal
                { session, new: true } // Use session and return the updated document
            );

            if (!updateCustomer) {
                throw new Error("Customer not found or balance update failed");
            }

            // Create a ledger entry for the return
            const ledgerEntry = new Ledger({
                customer: bill.customer,
                bill: billId,
                transactionType: "Return",
                amount: grandTotal,
                description: "Sales Return",
            });
            await ledgerEntry.save({ session });
        }

        await session.commitTransaction();
        return new Response(
            JSON.stringify({ message: "Sales return processed successfully", salesReturn }),
            { status: 201 }
        );
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Error processing sales return:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    } finally {
        session.endSession();
    }
}