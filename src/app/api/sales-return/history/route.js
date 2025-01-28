import connectToDatabase from "@/lib/db";
import SalesReturn from "@/lib/models/SalesReturn";

export async function GET() {
    await connectToDatabase();

    const returns = await SalesReturn.find().populate("billId items.tileId");
    return new Response(JSON.stringify({ returns }), { status: 200 });
}
