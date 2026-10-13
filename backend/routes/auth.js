const jwt=require("jsonwebtoken");
const express=require("express");
const bcrypt=require("bcryptjs");
const User=require('../models/user');

const router=express.Router();

//signup api
router.post('/signup',async function (req,res){
    try{
        const name=req.body.name;
        const email=req.body.email;
        const password=req.body.password;

        if (!name || !email|| !password){
            return res.status(400).json({
                message:"All fields are compulssory"
            })
        }
        const existinguser = await User.findOne({email:email.toLowerCase()});
        if(existinguser){
            return res.status(400).json({message:"email already registered"});
        }

        const hashedPassword=await bcrypt.hash(password,10);
        const user=await User.create({
            name:name,
            email:email,
            password:hashedPassword,
        });
       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

res.status(201).json({
  token: token,
  user: { id: user._id, name: user.name, email: user.email },
});
    }catch{
        res.status(500).json({ message: error.message });

    }

});

//login api

router.post('/login',async function(req,res){
    try{
        const email=req.body.email;
        const password=req.body.password;

        if(!email || !password){
            return res.status(400).json({message:"email and password are required"});
        }

        const user=await User.findOne({email:email.toLowerCase()});
        if(!user){
            return res.status(400).json({message:"Inavlid email or password"});
        }

        const ismatch=await bcrypt.compare(password,user.password);
        if(!ismatch){
            return res.status(400).json({message:'Invalid email or password'});
        }

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7D'});
        res.json({
        token: token,
        user: { id: user._id, name: user.name, email: user.email },
    });
    }
catch(error){
    res.status(500).json({ message: error.message });
}
});

module.exports=router;

