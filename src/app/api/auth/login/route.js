import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request) {
    await connectToDatabase();

    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return new Response(
        JSON.stringify({
            token,
            user: { name: user.name, email: user.email, role: user.role },
        }),
        { status: 200 }
    );
}
