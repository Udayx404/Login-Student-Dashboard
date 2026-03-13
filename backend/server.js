import "./config/env.js"
import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import userRouter from "./routes/userRoute.js"
import { connectDB } from "./config/db.js"


const app = express()
const port = 4000

app.use(helmet())

app.use(cors({
    origin: [
        "http://localhost:5173",
    ],
    credentials: true,
}))

app.use(express.json())


const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 mins
    max: 100,                   // max 100 requests per IP per 15 mins
    message: { success: false, message: "Too many requests, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 mins
    max: 10,                    // max 10 attempts per IP per 15 min
    message: { success: false, message: "Too many attempts, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
})

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,   // 5 mins
    max: 5,                     // max 5 OTP attempts per IP per 5 min
    message: { success: false, message: "Too many OTP attempts, please try again after 5 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
})

app.use(generalLimiter)
app.use("/api/user/login", authLimiter)
app.use("/api/user/register", authLimiter)
app.use("/api/user/verify-otp", otpLimiter)
app.use("/api/user/resend-otp", otpLimiter)

connectDB()

app.use("/api/user", userRouter)

app.get("/", (req, res) => {
    res.send("API working")
})

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
})
