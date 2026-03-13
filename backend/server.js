import express from "express"
import cors from "cors"
import userRouter from "./routes/userRoute.js"
import { connectDB } from "./config/db.js"

const app = express()
const port = 4000

app.use(express.json())
app.use(cors())

connectDB()

app.use("/api/user", userRouter)

app.get("/", (req, res) => {
    res.send("API working")
})

app.listen(port, ()=>{
    console.log(`Server started at http://localhost:${port}`)
})