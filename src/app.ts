import "dotenv/config"
import express from "express";
import cors from "cors"
import { router } from "./routes";

const PORT = process.env.PORT_EXPRESS || 3500

const app = express()
app.set('server.timeout', 600000);
app.use(cors())
app.use(express.json())

app.use('/api', router)
 
async function main(){
    app.listen(PORT,() => {
        console.log(`Backend Portal Running in ${PORT}`)
    })
}

main()

