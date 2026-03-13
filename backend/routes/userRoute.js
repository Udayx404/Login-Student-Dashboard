import express from 'express'
import {loginUser, registerUser, getUser, verifyOTP, resendOTP} from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.post("/login", loginUser)
userRouter.post("/register", registerUser)
userRouter.post("/verify-otp", verifyOTP)
userRouter.post("/resend-otp", resendOTP)
userRouter.get("/me", getUser)

export default userRouter