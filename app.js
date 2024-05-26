import express from 'express';
import products from './routes/Product.js';
import errorMiddleware from './middlewares/error.js';
import auth from './routes/auth.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import order from './routes/order.js'
import payment from './routes/payment.js'
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path:path.join(__dirname,"config/config.env")});


const app = express();


app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname,'uploads') ) )
app.use('/api/v1',products);
app.use('/api/v1',auth);
app.use('/api/v1',order);
app.use('/api/v1',payment);

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) =>{
        res.sendFile(path.resolve(__dirname, '../client/build/index.html'))
    })
}

app.use(errorMiddleware)

export default app;