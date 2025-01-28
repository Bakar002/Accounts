import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(req) {
    await connectToDatabase();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is an admin
        if (decoded.role !== "Admin") {
            return new Response("Forbidden", { status: 403 });
        }

        // Fetch all users
        const users = await User.find({}, "name email role");
        return new Response(JSON.stringify(users), { status: 200 });
    } catch (error) {
        return new Response("Unauthorized", { status: 401 });
    }
}
