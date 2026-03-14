import "../config/env.js"
import userModel from "../models/UserModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import nodemailer from "nodemailer"

console.log("EMAIL_USER:", process.env.EMAIL_USER)
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "loaded" : "MISSING")

const otpStore = {}  // {email: {otp, expiresAt, userData}}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,           // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

transporter.verify((error, success) => {
    if (error) {
        console.log("Email transporter error:", error.message)
    } else {
        console.log("Email transporter ready")
    }
})

const generateOTP = () => {
    return Math.floor(10000 + Math.random() * 90000).toString()
}

const sendOTPEmail = async (toEmail, name, otp) => {  // sends OTP to given email address
    const mailOptions = {
        from: `"IIEST Shibpur OCR Portal" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your OTP for IIEST Shibpur OCR Portal Registration",
        html: `
            <div style="font-family: 'Trebuchet MS', sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #0277bd, #0288d1); padding: 28px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 22px;">IIEST Shibpur</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">Email Verification</p>
                </div>
                <div style="padding: 32px;">
                    <h2 style="color: #1a1a1a; margin: 0 0 12px;">Hi ${name}</h2>
                    <p style="color: #555; font-size: 15px; line-height: 1.6;">
                        Use the OTP below to verify your email and complete your registration.
                        This OTP is valid for <strong>10 minutes</strong>.
                    </p>
                    <div style="background: #e1f5fe; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                        <p style="margin: 0 0 8px; color: #0277bd; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase;">Your OTP</p>
                        <div style="font-size: 42px; font-weight: 800; color: #0277bd; letter-spacing: 0.3em;">${otp}</div>
                    </div>
                    <p style="color: #999; font-size: 13px;">
                        If you did not request this, please ignore this email.
                        Do not share this OTP with anyone.
                    </p>
                </div>
                <div style="background: #f5f5f5; padding: 16px; text-align: center;">
                    <p style="margin: 0; color: #aaa; font-size: 12px;">© 2025 IIEST Shibpur · OCR Portal</p>
                </div>
            </div>
        `
    }
    await transporter.sendMail(mailOptions)
}

const sendWelcomeEmail = async (toEmail, name) => {  // sends message to given email address after registration
    const mailOptions = {
        from: `"IIEST Shibpur OCR Portal" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Welcome to IIEST Shibpur OCR Portal!",
        html: `
            <div style="font-family: 'Trebuchet MS', sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #2e7d32, #43a047); padding: 28px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 22px;">IIEST Shibpur</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">Student Registration Portal (OCR)</p>
                </div>
                <div style="padding: 32px;">
                    <h2 style="color: #1a1a1a; margin: 0 0 12px;">Welcome, ${name}!</h2>
                    <p style="color: #555; font-size: 15px; line-height: 1.6;">
                        Your account has been successfully verified and created on the IIEST Shibpur OCR Portal.
                    </p>
                    <div style="background: #e8f5e9; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="margin: 0; color: #2e7d32; font-size: 14px;">
                            ~ Email verified successfully<br/>
                            ~ Account created successfully<br/>
                            ~ You can now log in
                        </p>
                    </div>
                </div>
                <div style="background: #f5f5f5; padding: 16px; text-align: center;">
                    <p style="margin: 0; color: #aaa; font-size: 12px;">© 2025 IIEST Shibpur · OCR Portal</p>
                </div>
            </div>
        `
    }
    await transporter.sendMail(mailOptions)
}

const sendLoginAlertEmail = async (toEmail, name) => {  // sends message to given email address after login
    const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    const mailOptions = {
        from: `"IIEST Shibpur OCR Portal" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "New Login Detected - IIEST Shibpur OCR Portal",
        html: `
            <div style="font-family: 'Trebuchet MS', sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #0277bd, #0288d1); padding: 28px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 22px;">Login Alert</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">IIEST Shibpur OCR Portal</p>
                </div>
                <div style="padding: 32px;">
                    <p style="color: #555; font-size: 15px; line-height: 1.6;">
                        Hi <strong>${name}</strong>, a new login was detected on your account.
                    </p>
                    <div style="background: #e1f5fe; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="margin: 0; color: #0277bd; font-size: 14px;">Time: ${time} (IST)</p>
                    </div>
                    <p style="color: #999; font-size: 13px;">
                        If this wasn't you, please change your password immediately.
                    </p>
                </div>
                <div style="background: #f5f5f5; padding: 16px; text-align: center;">
                    <p style="margin: 0; color: #aaa; font-size: 12px;">© 2025 IIEST Shibpur · OCR Portal</p>
                </div>
            </div>
        `
    }
    await transporter.sendMail(mailOptions)
}

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" })
}

const registerUser = async (req, res) => {
    const { name, rollno, password, email } = req.body
    try {
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
            expiresAt: Date.now() + 10 * 60 * 1000,  // OTP expires in 10 mins
            userData: { name, rollno, email, password: hashedPassword }
        }

        await sendOTPEmail(email, name, otp)
        res.json({ success: true, message: "OTP sent to your email. Please verify to complete registration." })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error sending OTP. Please try again." })
    }
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

        sendWelcomeEmail(email, name).catch(err => console.log("Welcome email failed:", err.message))

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
        await sendOTPEmail(email, record.userData.name, otp)
        res.json({ success: true, message: "New OTP sent to your email." })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error resending OTP." })
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
        sendLoginAlertEmail(emailExists.email, emailExists.name).catch(err =>
            console.log("Login alert email failed:", err.message)
        )
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
