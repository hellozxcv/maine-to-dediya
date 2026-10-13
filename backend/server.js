const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");

const app=express();

app.use(cors());
app.use(express.json());

app.get('/',function (req,res){
    res.send("api is running");
});

async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI);
    console.log("mongo connected");
}
catch(error){
    console.log("mongodb connection failed");
    console.log(error.message);

}
}

connectDB();


app.use('/api/balances', require('./routes/balances'));
app.use('/api/settlements', require('./routes/settlements'));
app.use('/api/auth',require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/expenses', require('./routes/expenses'));

const auth=require('./middleware/auth');
app.get('/api/me',auth,function(req,res){
    res.json({message:"youare logged in",
        userId:req.userId
    })
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log('Server is running on port ' + PORT);
});
