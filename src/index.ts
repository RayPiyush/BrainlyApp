import express, { NextFunction } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {contentModel, userModel,linkModel} from "./db";
import {JWT_PASSWORD} from "./config";

import { Request, Response } from "express";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
//const JWT_PASSWORD = process.env.JWT_PASSWORD;
const app=express();
app.use(express.json());
dotenv.config();

const PORT=process.env.PORT || 7000;
const MONGOURL=process.env.MONGO_URL;

app.post("/api/v1/signup",async (req:Request,res:Response):Promise<any>=>{
    try{

        const email=req.body.email;
        const password=req.body.password;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        //hashed the password
        const hashedPassword=await bcrypt.hash(password,10);

        await userModel.create({
            email:email,
            password:hashedPassword

        });
        res.json({
            message:"Signup Succeded"
        });

    }
    catch(error:any){
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(409).json({ message: "Email already in use in db" });
          }

        console.error("Signup error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
})

app.post("/api/v1/signin",async (req:Request,res:Response):Promise<any>=>{
    try{
        const {email,password}=req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user=await userModel.findOne({
            email
        })

        if(!user){
            return res.status(403).json({
                message:"User Not Found"
            })
        }

        const passwordMatch=await bcrypt.compare(password,user.password);

        if(!passwordMatch){
            return res.status(403).json({
                message:"Incorrect Credentials"
            })
        }

        if (!JWT_PASSWORD) {
            throw new Error("JWT_PASSWORD is not defined in the .env file");
        }
        
        const token=jwt.sign({
            id:user._id
        },JWT_PASSWORD,{expiresIn: '2 days', 
     });

        res.json({
            token:token
        })


    }
    catch(error){
        console.error("Signin error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post("/api/v1/content",userMiddleware,async (req:Request,res:Response)=>{
    try{
        const {link,type}=req.body();
        await contentModel.create({
            link,
            type,
            title:req.body.title,
            userId:req.userId,
            tags:[]
        })

        res.json({
            message:"Content created successfully"
        })

    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error in content creation"
        })
    }
})

app.get("/api/v1/content",userMiddleware,async (req:Request,res:Response,next:NextFunction)=>{
    const user=req.userId;
    const content=await contentModel.find({
        userId:user
    }).populate("userId","email")
    res.json({
        content
    })
})

app.delete("/api/v1/content",userMiddleware, async (req:Request,res:Response,next:NextFunction)=>{
    const content=req.body.contentId;
    await contentModel.deleteMany({
        content,
        userId:req.userId
    })

    res.json({
        message:"Deleted successfully"
    })


})

app.post("/api/v1/brain/share",userMiddleware,async (req:Request,res:Response,next:NextFunction)=>{
        const share = req.body.share;
        if (share) {
                const existingLink = await linkModel.findOne({
                    userId: req.userId
                });

                if (existingLink) {
                    res.json({
                        hash: existingLink.hash
                    })
                    return;
                }
                const hash =random(10);
                await linkModel.create({
                    userId: req.userId,
                    hash: hash
                })

                res.json({
                    hash
                })
        } else {
            await linkModel.deleteOne({
                userId: req.userId
            });

            res.json({
                message: "Removed link"
            })
        }
})


app.get("/api/v1/brain/:shareLink",async (req:Request,res:Response,next:NextFunction)=>{
    const hash=req.params.shareLink;

    const link=await linkModel.findOne({
        hash:hash
    })
    if(!link){
        res.json({
            message:"Wrong url, please check url"
        })
        return;
    }

    const content=await contentModel.find({
        userId:link.userId
    })

    const user=await userModel.findOne({
        _id:link.userId
    })

    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }

    res.json({
        username:user.email,
        content:content

    })
})
app.listen(3000);