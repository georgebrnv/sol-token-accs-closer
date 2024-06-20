import { Connection, PublicKey } from "@solana/web3.js";
import express, { Request, Response } from 'express';
require('dotenv').config()
import path from 'path';
import bodyParser from 'body-parser';


const app = express();
const PORT = process.env.PORT || 3000;

// Setup conenction
// const connection = new solanaWeb3.Connection()

// Set the views directory
app.set('views', path.join(__dirname, '../src/views'));

// Setup body parser
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Set a default template engine
app.set('view engine', 'ejs'); 

app.get('/', (_req: Request, res: Response) => {
    res.render('index')
});

app.post('/', async (req: Request, res: Response) => {
    const { publicKey } = req.body;
    console.log(`WALLET - ${publicKey} - TOKEN ACCOUNTS:`);
    console.log('________________________________________________')

    const ownerPublicKey = new PublicKey(publicKey);

    let connection = new Connection('https://mainnet.helius-rpc.com/?api-key=fb217618-2a52-40c0-9621-38e657dbb505');

    let tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });
    
    tokenAccounts.value.forEach(acountInfo => {
        const tokenAmount = acountInfo.account.data.parsed.info.tokenAmount.amount;
        if ( tokenAmount === '0') {
            console.log('Account: ', acountInfo.pubkey.toBase58(), 'Balance: ', tokenAmount);
        }
    });

    res.json({ message: 'Wallet data received successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});