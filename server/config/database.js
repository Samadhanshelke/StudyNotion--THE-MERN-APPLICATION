const mongoose = require("mongoose");
require("dotenv").config();
exports.connect = ()=>{
    mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(()=>{console.log("db connected successfully");})
    .catch((err)=>{
        console.log("db connection failed")
        console.log(err);
        process.exit(1);
    })
}