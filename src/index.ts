import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {z} from "zod";
import { Content, Linkk, Tag, User } from "./models/db"
const app = express();
app.use(express.json());
import {genrate, secret} from "./helper/constant";
import userauth from "./middleware";
import cookieParser from "cookie-parser";
app.use(cookieParser()); 
import cors from 'cors';
app.use(cors({
  origin: "http://localhost:5173", // frontend domain
  credentials: true
}));


app.post("/api/v1/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Define schema
        const schema = z.object({
            username: z.string().min(3).max(255),
            password: z.string().min(3).max(255)
        });

        // Use safeParse to validate without throwing errors
        const result = schema.safeParse({ username, password });

        if (!result.success) {
           throw new Error(result.error.errors[0].message);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Save the user to the database
        const user = new User({
            username,
            password: hashedPassword
        });
        await user.save();

         res.json({ success: true, message: "Signup successful" });
    } catch (err) {
        // console.error(err);
        // @ts-ignore 
         res.status(500).json({
            // @ts-ignore 
            data:err.message
         });
    }
});

app.post("/api/v1/signin", async  (req, res) => {
try{
    // console.log(req)
    const { username, password } = req.body;
    console.log(username,password)
    const user=await User.findOne({
        username:username
    });
    if(!user){
       throw new Error("user not found");
    }
    const checkpassword=await bcrypt.compare(password, user.password);
    if(!checkpassword){
        throw new Error("Invalid password");
    }
    const token=jwt.sign({id:user._id},secret,{
        expiresIn:"1d"
    })
    res.cookie("token",token);
    res.json({success:true,message:"Signin successful",data:token});
}
catch (err) {
    // console.error(err);
    // @ts-ignore 
    res.status(500).json({
        // @ts-ignore 
        data:err.message
     });
}
});
// @ts-ignore 
app.get("/api/v1/view",userauth,async (req, res) => {
    try{

    // @ts-ignore 
    const user=req.user
    // @ts-ignore 
        console.log(req.user._id)

res.send(user)
    }
    catch (err) {
        let errorMessage = "Unknown error";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        res.status(401).send("Invalid field in content table: " + errorMessage);
      }

});

// @ts-ignore 
app.post("/api/v1/content",userauth,async (req, res) => {
    try{

    // @ts-ignore 
        console.log(req.user._id)
const {link,type,title}=req.body;
const content=new Content({
    link,
    type,
    title,
    tags:[],
    // @ts-ignore 
    userId:req.user._id

})
await content.save();
res.json({message:content})
    }
    catch (err) {
        let errorMessage = "Unknown error";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        res.status(401).send("Invalid field in content table: " + errorMessage);
      }

});
// @ts-ignore 
app.get("/api/v1/content", userauth, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.user._id;

    const contents = await Content.find({ userId }).populate("tags");

    res.json({ success: true, contents });
  } catch (err) {
    let errorMessage = "Unknown error";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    res.status(401).send("Error fetching content: " + errorMessage);
  }
});

// @ts-ignore 
app.delete("/api/v1/content",userauth,async  (req, res) => {
    try{
    const {contentid}=req.body
    const user=req.user;
    const findcontent = await Content.findOneAndDelete({
        // @ts-ignore 
        userId: user._id,
        _id: contentid
    });
   
    res.send(findcontent)
}
catch (err) {
    let errorMessage = "Unknown error";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    res.status(401).send("Invalid field in content table: " + errorMessage);
  }
});
// @ts-ignore 
app.post("/api/v1/brain/share", userauth ,async (req, res) => {
try{
    const status=req.body.status;
    const user=req.user;
    // console.log(status)
    if(status=="True"){
        
        const existingLink = await Linkk.findOne({
            // @ts-ignore 
            userId: user._id
        });

        if (existingLink) {
            res.json({
                hash: existingLink.hash
            })
            // console.log("returnong")
            return;
        }
     const    hash=genrate(7)
        const result =await Linkk.create({
            // @ts-ignore
            userId: user._id,
            // @ts-ignore
            hash: hash
        })
        // @ts-ignore 
        console.log(hash)
        // @ts-ignore
        res.send(result+ " "+hash)
    }
    else{
        await Linkk.deleteOne({
            // @ts-ignore
            userId:user._id
        })
        res.json({
            message:"Removed Link"
        })
    }
}
catch (err) {
    let errorMessage = "Unknown error";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    res.status(401).send("Invalid field in content table: " + errorMessage);
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    try{
        const hash=req.params.shareLink;
        const link=await Linkk.findOne({
            hash:hash
        }).populate("userId"," username password").select("hash userId")
        if (!link) {
            res.status(411).json({
                message: "Sorry incorrect input"
            })
            return;
        }
        // @ts-ignore
        const content= await Content.findOne({
            userId:link.userId._id
        })
        console.log(content)
        res.send(link +" "+content)

    }
    catch (err) {
        let errorMessage = "Unknown error";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        res.status(401).send("Invalid field in content table: " + errorMessage);
      }
});
// @ts-ignore 
app.post('/api/v1/tags', userauth, async (req, res) => {
    try {
        const user = req.user;
        const { title, contentId } = req.body; // Accept contentId from request

        // ✅ Create the new tag
        const tag = await Tag.create({ title });

        // ✅ Push the tag into the Content document
        const updatedContent = await Content.findOneAndUpdate(
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
    } catch (err) {
        let errorMessage = "Unknown error";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        res.status(401).send("Invalid field in content table: " + errorMessage);
      }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});