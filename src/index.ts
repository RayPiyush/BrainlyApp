import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {userModel} from "./db";
import {JWT_PASSWORD} from "./config";
const app=express();
import { Request, Response } from "express";
import { userMiddleware } from "./middleware";
//const JWT_PASSWORD = process.env.JWT_PASSWORD;


app.post("/api/v1/signup",async (req:Request,res:Response):Promise<any>=>{
    try{
        const {email,password}=req.body;

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

app.post("/api/v1/content",userMiddleware,(req:Request,res:Response)=>{
    try{
        
    }
    catch(error){
        console.log(error);
    }
})

app.get("/api/v1/content",(req,res)=>{

})

app.delete("/api/v1/content",(req,res)=>{

})

app.post("/api/v1/brain/share",(req,res)=>{

})

app.get("/api/v1/brain/:shareLink",(req,res)=>{

})
app.listen(3000);