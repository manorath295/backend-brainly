"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Linkk = exports.Tag = exports.User = exports.Content = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
mongoose_1.default.connect('mongodb+srv://chughmanorath:HfiEXba0ytWA2S8F@cluster0.2pmsbm7.mongodb.net/brainly');
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});
const ContentSchema = new Schema({
    link: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: {
            values: ['image', 'video', 'article', 'audio'],
            message: "Invalid type"
        }
    },
    title: {
        type: String,
        required: true
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});
const TagSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    }
});
const LinkSchema = new Schema({
    hash: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});
exports.Content = mongoose_1.default.model('Content', ContentSchema);
exports.User = mongoose_1.default.model('User', userSchema);
exports.Tag = mongoose_1.default.model('Tag', TagSchema);
exports.Linkk = mongoose_1.default.model('Link', LinkSchema);
