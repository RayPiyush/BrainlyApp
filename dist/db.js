"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkModel = exports.tagModel = exports.contentModel = exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
//const ObjectId=mongoose.Types.ObjectId;
const Types = mongoose_1.default.Types;
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const contentTypes = ['image', 'video', 'article', 'audio'];
const contentSchema = new Schema({
    link: { type: String, required: true },
    type: { type: String, enum: contentTypes, required: true },
    title: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    tags: [{ type: Types.ObjectId, ref: 'Tag' }],
    userId: { type: Types.ObjectId, ref: 'User', required: true }
});
const tagSchema = new Schema({
    title: { type: String, required: true, unique: true }
});
const linkSchema = new Schema({
    hash: { type: String, required: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true }
});
exports.userModel = mongoose_1.default.model("user", userSchema);
exports.contentModel = mongoose_1.default.model("content", contentSchema);
exports.tagModel = mongoose_1.default.model("tag", tagSchema);
exports.linkModel = mongoose_1.default.model("link", linkSchema);
