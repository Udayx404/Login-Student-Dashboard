import express from 'express'
import {loginUser, registerUser, getUser} from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.post("/login", loginUser)
userRouter.post("/register", registerUser)
userRouter.get("/me", getUser)

export default userRouter