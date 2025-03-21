const mongoose = require("mongoose");
require("dotenv").config();
exports.connect = ()=>{
    mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(()=>{
        console.log('db connected')
    })
    .catch((err)=>{
        console.log('db failed')
        process.exit(1);
    })
}