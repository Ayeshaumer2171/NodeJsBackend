const express=require('express');
require('./db/config');
const cors=require('cors');
const User=require('./db/Users');
const Product=require('./db/Product');
const app=express();

const jwt=require('jsonwebtoken');
const jwtkey='e-comm';

app.use(express.json())
app.use(cors())

app.post('/register',async(req,res)=>{
const user=new User(req.body);
let result=await user.save();
result=result.toObject();
delete result.password;

//token jwt
jwt.sign({result},jwtkey,{expiresIn:"2h"},(error,token)=>{
  if(error){
    res.send({result:"seomething went wrong"});

  }
    res.send({result,auth:token});
})
// res.send(result);
})

app.post('/login',async(req,res)=>{

if(req.body.password && req.body.email){
  let user=await User.findOne(req.body).select('-password')

if(user){

//token jwt
jwt.sign({user},jwtkey,{expiresIn:"2h"},(error,token)=>{
  if(error){
    res.send({result:"seomething went wrong"});

  }
    res.send({user,auth:token});
})

    // res.send(user);
}else{
    res.send({result:"no user found"});
}
}
  
})

app.post('/add_product',async(req,res)=>{
  let product=new Product(req.body);
  let result=await product.save();
  res.send(result);
})


app.get('/products',async(req,res)=>{
let products=await Product.find();
if(products.length>0){
  res.send(products)
}else{
  res.send({result:"no products found"})
}

})


app.delete('/products/:id',async(req,res)=>{

const result=await Product.deleteOne({_id:req.params.id})
res.send(result);
})

//get single product
app.get('/products/:id',async(req,res)=>{
let result=await Product.findOne({_id:req.params.id});
if(result){
  res.send(result)
}else{
  res.send({result:"no record found"})
}

})


app.put('/products/:id',async(req,res)=>{
let result=await Product.updateOne(
  {_id:req.params.id},
  {$set:req.body}
)
res.send(result);
})


//search api
app.get('/search/:key',verifyToken,async(req,res)=>{
let result=await Product.find({
  "$or":[
    {name:{$regex:req.params.key}},
    {company:{$regex:req.params.key}},

  ]
})
res.send(result)
})


//token verification
function verifyToken(req,res,next){

  const token=req.headers['authorization'];
  if(token){
token=token.split('')[1];
jwt.verify(token,jwt);
  }else{

  }
console.warn("middle callef",token);
next();
}

app.listen(5000);