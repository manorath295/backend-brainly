import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "./models/db";
import { secret } from "./helper/constant";

// Define a type for the JWT payload
interface JwtPayload {
  id: string;
}

// Extend Express Request to include 'user'
declare module "express-serve-static-core" {
  interface Request {
    user?: InstanceType<typeof User>;
  }
}

const userauth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.cookies; // Extract token from cookies

    if (!token) {
      return res.status(401).json({ success: false, message: "Please login" });
    }

    // Verify the token
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Fetch the user from DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Attach user to request object
    req.user = user;
    console.log(req.user._id)
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};


export default userauth;
