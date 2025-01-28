import connectToDatabase from "@/lib/db";
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

        const {
            customer,
            salesmanName,
            paymentType,
            tiles,
            discount,
            tax,
            freight,
            totalQuantity,
            grandTotal,
            billNumber,
        } = await request.json();

        // Step 1: Validate or Create Customer
        let existingCustomer = await Customer.findOne({ name: customer.name, phone: customer.phone }).session(session);

        if (!existingCustomer) {
            existingCustomer = new Customer({
                name: customer.name,
                address: customer.address,
                phone: customer.phone,
                balance: 0, // Initialize balance for a new customer
            });
            await existingCustomer.save({ session });
        }

        // Step 2: Update Tile Stock
        for (const item of tiles) {
            const requiredPieces = item.quantityInPieces;

            // Ensure enough stock exists
            const updateResult = await Tile.findOneAndUpdate(
                { _id: item.tileId, stock: { $gte: requiredPieces } }, // Stock must be >= requiredPieces
                { $inc: { stock: -requiredPieces } }, // Decrement the stock
                { session, new: true }
            );

            if (!updateResult) {
                throw new Error(
                    `Not enough stock for tile with ID: ${item.tileId}. Requested: ${requiredPieces} pieces.`
                );
            }
        }

        // Step 3: Create the Bill
        const newBill = new Bill({
            customer: existingCustomer._id,
            salesmanName,
            paymentType,
            tiles,
            discount,
            tax,
            freight,
            total: grandTotal,
            grandTotal,
            billNumber,
        });
        await newBill.save({ session });

        // Step 4: Handle Ledger Entry for Credit Payments
        if (paymentType === "Credit") {
            // Create a new ledger entry
            const ledgerEntry = new Ledger({
                customer: existingCustomer._id,
                bill: newBill._id,
                transactionType: "Credit",
                amount: grandTotal,
                description: "Credit Sale",
            });
            await ledgerEntry.save({ session });

            // Update customer's balance
            existingCustomer.balance += grandTotal;
            await existingCustomer.save({ session });
        }

        await session.commitTransaction();
        return new Response(
            JSON.stringify({ message: "Bill created successfully", bill: newBill }),
            { status: 201 }
        );
    } catch (error) {
        if (session.inTransaction()) {
            // Abort transaction only if it hasn't been committed
            await session.abortTransaction();
        }
        console.error("Error creating bill:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    } finally {
        session.endSession();
    }
}
