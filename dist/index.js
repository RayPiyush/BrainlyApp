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
const db_1 = require("./db");
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
//const JWT_PASSWORD = process.env.JWT_PASSWORD;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const password = req.body.password;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        //hashed the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield db_1.userModel.create({
            email: email,
            password: hashedPassword
        });
        res.json({
            message: "Signup Succeded"
        });
    }
    catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(409).json({ message: "Email already in use in db" });
        }
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        const user = yield db_1.userModel.findOne({
            email
        });
        if (!user) {
            return res.status(403).json({
                message: "User Not Found"
            });
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(403).json({
                message: "Incorrect Credentials"
            });
        }
        if (!config_1.JWT_PASSWORD) {
            throw new Error("JWT_PASSWORD is not defined in the .env file");
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id
        }, config_1.JWT_PASSWORD, { expiresIn: '2 days',
        });
        res.json({
            token: token
        });
    }
    catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { link, type } = req.body();
        yield db_1.contentModel.create({
            link,
            type,
            title: req.body.title,
            userId: req.userId,
            tags: []
        });
        res.json({
            message: "Content created successfully"
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            message: "Error in content creation"
        });
    }
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.userId;
    const content = yield db_1.contentModel.find({
        userId: user
    }).populate("userId", "email");
    res.json({
        content
    });
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const content = req.body.contentId;
    yield db_1.contentModel.deleteMany({
        content,
        userId: req.userId
    });
    res.json({
        message: "Deleted successfully"
    });
}));
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const existingLink = yield db_1.linkModel.findOne({
            userId: req.userId
        });
        if (existingLink) {
            res.json({
                hash: existingLink.hash
            });
            return;
        }
        const hash = (0, utils_1.random)(10);
        yield db_1.linkModel.create({
            userId: req.userId,
            hash: hash
        });
        res.json({
            hash
        });
    }
    else {
        yield db_1.linkModel.deleteOne({
            userId: req.userId
        });
        res.json({
            message: "Removed link"
        });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.linkModel.findOne({
        hash: hash
    });
    if (!link) {
        res.json({
            message: "Wrong url, please check url"
        });
        return;
    }
    const content = yield db_1.contentModel.find({
        userId: link.userId
    });
    const user = yield db_1.userModel.findOne({
        _id: link.userId
    });
    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        });
        return;
    }
    res.json({
        username: user.email,
        content: content
    });
}));
app.listen(3000);
