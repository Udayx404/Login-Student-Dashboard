import "../config/env.js"
import userModel from "../models/userModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"

const otpStore = {}  // { email: { otp, expiresAt, userData } }

const validateRollNo = (rollno) => {
    const pattern = /^20\d{2}CSB\d{3}$/
    return pattern.test(rollno)
}

const generateOTP = () => {
    return Math.floor(10000 + Math.random() * 90000).toString()
}

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body
    try {
        const record = otpStore[email]

        if (!record) {
            return res.json({ success: false, message: "No OTP found. Please register again." })
        }
        if (Date.now() > record.expiresAt) {
            delete otpStore[email]
            return res.json({ success: false, message: "OTP has expired. Please register again." })
        }
        if (record.otp !== otp.trim()) {
            return res.json({ success: false, message: "Incorrect OTP. Please try again." })
        }

        const { name, rollno, password: hashedPassword } = record.userData
        const newUser = new userModel({ name, email, password: hashedPassword, rollno })
        const user = await newUser.save()
        delete otpStore[email]

        const token = createToken(user._id)
        res.json({ success: true, token, message: "Email verified! Account created successfully." })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error verifying OTP." })
    }
}

const resendOTP = async (req, res) => {
    const { email } = req.body
    try {
        const record = otpStore[email]
        if (!record) {
            return res.json({ success: false, message: "Session expired. Please register again." })
        }
        const otp = generateOTP()
        otpStore[email] = { ...record, otp, expiresAt: Date.now() + 10 * 60 * 1000 }
        res.json({ success: true, otp: otp, message: "New OTP generated" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error regenerating OTP." })
    }
}

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" })
}

const registerUser = async (req, res) => {
    const { name, rollno, password, email } = req.body
    try {
        if (!validateRollNo(rollno)) {
            return res.json({ success: false, message: "Invalid roll number format! Use: 20XXCSBXXX" })
        }
        const emailExists = await userModel.findOne({ email })
        if (emailExists) {
            return res.json({ success: false, message: "User already exists! Please login." })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email format!" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters!" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const otp = generateOTP()
        otpStore[email] = {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000,
            userData: { name, rollno, email, password: hashedPassword }
        }

        res.json({ success: true, otp: otp, message: "OTP generated. Please verify to complete registration." })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error generating OTP. Please try again." })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        const emailExists = await userModel.findOne({ email })
        if (!emailExists) {
            return res.json({ success: false, message: "User doesn't exist! Please register." })
        }
        const isMatch = await bcrypt.compare(password, emailExists.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password!" })
        }
        const token = createToken(emailExists._id)
        res.json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error logging in." })
    }
}

const getUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.json({ success: false, message: "No token provided" })
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await userModel.findById(decoded.id).select("-password")
        if (!user) return res.json({ success: false, message: "User not found" })
        res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Invalid or expired token" })
    }
}

export { loginUser, registerUser, verifyOTP, resendOTP, getUser }