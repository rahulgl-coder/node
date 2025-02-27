const express=require("express")
const app=express()
const port=5000
const path = require("path");
const db= require("./dBconnection/connect")
const userRoute=require("./routes/user")
const adminRoute=require("./routes/admin")
const cookieParser=require("cookie-parser")




app.use(express.static("public"))
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view")); 


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser())

app.use(userRoute)
app.use(adminRoute)



db()

app.listen(port,()=>{console.log("connected");
})


