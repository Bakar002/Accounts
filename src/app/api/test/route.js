import connectToDatabase from '@/lib/db';

export async function GET(request) {
    await connectToDatabase();
    return new Response("Database connected successfully!", { status: 200 });
}
