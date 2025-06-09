"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./models/db");
const constant_1 = require("./helper/constant");
const userauth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.cookies; // Extract token from cookies
        if (!token) {
            return res.status(401).json({ success: false, message: "Please login" });
        }
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, constant_1.secret);
        if (!decoded) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        // Fetch the user from DB
        const user = yield db_1.User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        // Attach user to request object
        req.user = user;
        console.log(req.user._id);
        next();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Authentication failed" });
    }
});
exports.default = userauth;
