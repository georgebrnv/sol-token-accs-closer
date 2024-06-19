// const solanaWeb3 = require("@solana/web3.js");
import express, { Request, Response } from 'express';
require('dotenv').config()
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup conenction
// const connection = new solanaWeb3.Connection()

// Set the views directory
app.set('views', path.join(__dirname, '../src/views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Set a default template engine
app.set('view engine', 'ejs'); 

app.get('/', (_req: Request, res: Response) => {
    res.render('index')
});

app.post

app.listen(PORT, () => {
    console.log("Server is running on http://localhost:$(PORT)");
});