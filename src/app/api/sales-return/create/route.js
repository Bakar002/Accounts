import connectToDatabase from "@/lib/db";
import SalesReturn from "@/lib/models/SalesReturn";
import Bill from "@/lib/models/Bill";
import Tile from "@/lib/models/Tile";

export async function POST(request) {
    await connectToDatabase();

    const { billId, items } = await request.json();

    // Fetch the bill to validate the items
    const bill = await Bill.findById(billId).populate("tiles.tileId");
    if (!bill) {
        return new Response("Bill not found", { status: 404 });
    }

    let totalRefund = 0;

    for (const item of items) {
        const billItem = bill.tiles.find((t) => t.tileId._id.toString() === item.tileId);
        if (!billItem) {
            return new Response(`Item not found in the bill: ${item.tileId}`, { status: 404 });
        }

        if (item.quantity > billItem.quantity) {
            return new Response(
                `Return quantity for item ${billItem.tileId.name} exceeds purchased quantity`,
                { status: 400 }
            );
        }

        // Adjust inventory
        const tile = await Tile.findById(item.tileId);
        if (!tile) {
            return new Response(`Tile not found: ${item.tileId}`, { status: 404 });
        }
        tile.stock += item.quantity; // Add returned quantity back to stock
        await tile.save();

        // Calculate refund for this item
        totalRefund += item.quantity * billItem.price;
    }

    // Create a sales return entry
    const newReturn = new SalesReturn({
        billId,
        items,
        totalRefund,
    });

    await newReturn.save();

    return new Response(JSON.stringify({ message: "Sales return created successfully", return: newReturn }), {
        status: 201,
    });
}
