import userModel from "../models/UserModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"

const loginUser = async (req,res) => {
    const {rollno, email, password} = req.body
    try {
    const emailExists = await userModel.findOne({email})  //checking if email already exists in database
    const rollExists = await userModel.findOne({rollno})  //checking if roll already exists in database
    if(!emailExists){
        return res.json({success: false, message: "User email doesn't exist! Please register"})
    }
    if(!rollExists){
        return res.json({success: false, message: "User roll doesn't exist! Please register"})
    }

    const isMatch = await bcrypt.compare(password, emailExists.password)  //comparing user's password in the database and the provided password
    if(!isMatch){
        return res.json({success: false, message: "Invalid password!"})
    }

    const token = createToken(emailExists._id)
    res.json({success: true, token})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: "Error"})   
    }
}

const createToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET_KEY)
}

const registerUser = async (req,res) => {
    const {name, rollno, password, email} = req.body
    try {
        const emailExists = await userModel.findOne({email})  //checking if email already exists in database
        const rollExists = await userModel.findOne({rollno})  //checking if email already exists in database
        if(emailExists){
            return res.json({success: false, message: "Email already exists! Please login"})
        }
        if(rollExists){
            return res.json({success: false, message: "Roll already exists! Please login"})
        }

        if(!validator.isEmail(email)){  //validating email format
            return res.json({success: false, message: "Please enter valid email format!"})
        }

        if(password.length<8){  //checking for strong password
            return res.json({success: false, message: "Please enter a strong password!"})
        }

        //hashing the password
        const salt = await bcrypt.genSalt(10)  
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({  //create new user
            name: name,
            email: email,
            password: hashedPassword,
            rollno: rollno,
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success: true, token})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: "Error"})
    }
}

const getUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const user = await userModel.findById(decoded.id).select("-password")
    res.json({success: true, user })
  } catch (error) {
    res.json({success: false, message: "Invalid token" })
  }
}

export { loginUser, registerUser, getUser }