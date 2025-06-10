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
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const db_1 = require("./models/db");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const constant_1 = require("./helper/constant");
const middleware_1 = __importDefault(require("./middleware"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
app.use((0, cookie_parser_1.default)());
const cors_1 = __importDefault(require("cors"));
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // frontend domain
    credentials: true
}));
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Define schema
        const schema = zod_1.z.object({
            username: zod_1.z.string().min(3).max(255),
            password: zod_1.z.string().min(3).max(255)
        });
        // Use safeParse to validate without throwing errors
        const result = schema.safeParse({ username, password });
        if (!result.success) {
            throw new Error(result.error.errors[0].message);
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Save the user to the database
        const user = new db_1.User({
            username,
            password: hashedPassword
        });
        yield user.save();
        res.json({ success: true, message: "Signup successful" });
    }
    catch (err) {
        // console.error(err);
        // @ts-ignore 
        res.status(500).json({
            // @ts-ignore 
            data: err.message
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log(req)
        const { username, password } = req.body;
        console.log(username, password);
        const user = yield db_1.User.findOne({
            username: username
        });
        if (!user) {
            throw new Error("user not found");
        }
        const checkpassword = yield bcrypt_1.default.compare(password, user.password);
        if (!checkpassword) {
            throw new Error("Invalid password");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, constant_1.secret, {
            expiresIn: "1d"
        });
        res.cookie("token", token);
        res.json({ success: true, message: "Signin successful", data: token });
    }
    catch (err) {
        // console.error(err);
        // @ts-ignore 
        res.status(500).json({
            // @ts-ignore 
            data: err.message
        });
    }
}));
// @ts-ignore 
app.get("/api/v1/view", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore 
        const user = req.user;
        // @ts-ignore 
        console.log(req.user._id);
        res.send(user);
    }
    catch (err) {
        let errorMessage = "Unknown error";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        res.status(401).send("Invalid field in content table: " + errorMessage);
    }
}));
// @ts-ignore 
app.post("/api/v1/content", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore 
        console.log(req.user._id);
        const { link, type, title } = req.body;
        const content = new db_1.Content({
            link,
            type,
            title,
            tags: [],
            // @ts-ignore 
            userId: req.user._id
        });
        yield content.save();
        res.json({ message: content });
    }
    catch (err) {
        let errorMessage = "Unknown error";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        res.status(401).send("Invalid field in content table: " + errorMessage);
    }
}));
// @ts-ignore 
app.get("/api/v1/content", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.user._id;
        const contents = yield db_1.Content.find({ userId }).populate("tags");
        res.json({ success: true, contents });
    }
    catch (err) {
        let errorMessage = "Unknown error";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        res.status(401).send("Error fetching content: " + errorMessage);
    }
}));
// @ts-ignore 
app.delete("/api/v1/content", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contentid } = req.body;
        const user = req.user;
        const findcontent = yield db_1.Content.findOneAndDelete({
            // @ts-ignore 
            userId: user._id,
            _id: contentid
        });
        res.send(findcontent);
    }
    catch (err) {
        let errorMessage = "Unknown error";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        res.status(401).send("Invalid field in content table: " + errorMessage);
    }
}));
// @ts-ignore 
app.post("/api/v1/brain/share", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = req.body.status;
        const user = req.user;
        // console.log(status)
        if (status == "True") {
            const existingLink = yield db_1.Linkk.findOne({
                // @ts-ignore 
                userId: user._id
            });
            if (existingLink) {
                res.json({
                    hash: existingLink.hash
                });
                // console.log("returnong")
                return;
            }
            const hash = (0, constant_1.genrate)(7);
            const result = yield db_1.Linkk.create({
                // @ts-ignore
                userId: user._id,
                // @ts-ignore
                hash: hash
            });
            // @ts-ignore 
            console.log(hash);
            // @ts-ignore
            res.send(result + " " + hash);
        }
        else {
            yield db_1.Linkk.deleteOne({
                // @ts-ignore
                userId: user._id
            });
            res.json({
                message: "Removed Link"
            });
        }
    }
    catch (err) {
        let errorMessage = "Unknown error";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        res.status(401).send("Invalid field in content table: " + errorMessage);
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hash = req.params.shareLink;
        const link = yield db_1.Linkk.findOne({
            hash: hash
        }).populate("userId", " username password").select("hash userId");
        if (!link) {
            res.status(411).json({
                message: "Sorry incorrect input"
            });
            return;
        }
        // @ts-ignore
        const content = yield db_1.Content.findOne({
            userId: link.userId._id
        });
        console.log(content);
        res.send(link + " " + content);
    }
    catch (err) {
        let errorMessage = "Unknown error";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        res.status(401).send("Invalid field in content table: " + errorMessage);
    }
}));
// @ts-ignore 
app.post('/api/v1/tags', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { title, contentId } = req.body; // Accept contentId from request
        // ✅ Create the new tag
        const tag = yield db_1.Tag.create({ title });
        // ✅ Push the tag into the Content document
        const updatedContent = yield db_1.Content.findOneAndUpdate(
        // @ts-ignore 
        { userId: user._id, _id: contentId }, // Find content by userId & contentId
        { $push: { tags: tag._id } }, // Push the new tag ID
        { new: true } // Return updated document
        ).populate("tags"); // Populate tags to show updated list
        if (!updatedContent) {
            return res.status(404).json({ message: "Content not found" });
        }
        res.json({
            success: true,
            message: "Tag added and content updated",
            updatedContent
        });
    }
    catch (err) {
        let errorMessage = "Unknown error";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        res.status(401).send("Invalid field in content table: " + errorMessage);
    }
}));
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
