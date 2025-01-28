import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request) {
    await connectToDatabase();

    const { name, email, password, role } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return new Response("User already exists", { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to the database
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    return new Response(JSON.stringify({ message: "User registered successfully" }), { status: 201 });
}
