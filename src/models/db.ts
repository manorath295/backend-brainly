import mongoose from "mongoose";
const {Schema,model} = mongoose;


mongoose.connect('mongodb+srv://chughmanorath:HfiEXba0ytWA2S8F@cluster0.2pmsbm7.mongodb.net/brainly')
const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String,
        required:true
    }
})
const ContentSchema=new Schema({
    link:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true,
        enum:{
            values:['image', 'video', 'article', 'audio'],
            message:"Invalid type"
        }
    },
    title:{
        type:String,
        required:true
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }

})
const TagSchema=new Schema({
    title:{
        type:String,
        required:true,
        unique:true

    }
})
const LinkSchema=new Schema({
    hash:{
        type:String,
        required:true,
       
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
})
export  const Content=mongoose.model('Content',ContentSchema);
export  const User=mongoose.model('User',userSchema);
export  const Tag=mongoose.model('Tag',TagSchema);
export  const Linkk=mongoose.model('Link',LinkSchema);
