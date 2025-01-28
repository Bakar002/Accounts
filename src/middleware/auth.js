import jwt from "jsonwebtoken";

export function authMiddleware(requiredRole) {
    return async (req, res, next) => {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return new Response("Unauthorized", { status: 401 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (requiredRole && decoded.role !== requiredRole) {
                return new Response("Forbidden", { status: 403 });
            }
            req.user = decoded;
            next();
        } catch (error) {
            return new Response("Unauthorized", { status: 401 });
        }
    };
}
