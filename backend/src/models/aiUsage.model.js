const mongoose = require('mongoose');
const schema = new mongoose.Schema({ userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, role:{type:String,required:true}, provider:{type:String,required:true}, model:{type:String,required:true}, promptTokens:{type:Number,min:0,default:0}, completionTokens:{type:Number,min:0,default:0}, durationMs:{type:Number,min:0,required:true}, success:{type:Boolean,required:true}, cost:{type:Number,min:0,default:null}, costCurrency:{type:String,default:null} },{timestamps:true});
schema.index({createdAt:-1,provider:1}); schema.index({userId:1,createdAt:-1});
const AiUsage=mongoose.model('AiUsage',schema); module.exports={AiUsage};
