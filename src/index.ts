import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createCloseAccountInstruction, } from '@solana/spl-token';
import express, { Request, Response } from 'express';
require('dotenv').config()
import path from 'path';
import bodyParser from 'body-parser';


const app = express();
const PORT = process.env.PORT || 3000;
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

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

app.post('/create-transactions', async (req: Request, res: Response) => {
    const { publicKey } = req.body;
    console.log(`WALLET - ${publicKey} - TOKEN ACCOUNTS:`);
    console.log('________________________________________________')

    const ownerPublicKey = new PublicKey(publicKey);

    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`);

    // Get all token accounts from a wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });

    const serializedTransactions: string[] = [];

    // Create a new array of zeroed token accounts
    const filteredAccounts = tokenAccounts.value.filter(account => account.account.data.parsed.info.tokenAmount.amount === '0');
    // Get recent block hash for transactions with confirmed commitment
    const { blockhash } = await connection.getLatestBlockhash('confirmed');

    console.log(`Zeroed token accounts amount: ${filteredAccounts.length}`);

    // Parse accounts in batches of 5
    while (filteredAccounts.length > 0) {
        const batch = filteredAccounts.splice(0, 5);
        const txn = new Transaction();

        for (const account of batch) {
            const tokenPubkey = new PublicKey(account.pubkey)
            const closeInstruction = createCloseAccountInstruction(
                tokenPubkey,
                ownerPublicKey,
                ownerPublicKey,
            );

            txn.add(closeInstruction);
        };

        txn.feePayer = ownerPublicKey;
        txn.recentBlockhash = blockhash;
        const serializedTxn = txn.serialize({ requireAllSignatures: false }).toString('base64');
        
        serializedTransactions.push(serializedTxn);
    };
    console.log('All serialized transactions are ready to be signed.');

    res.json({ transactions: serializedTransactions });
});

app.post('/send-transactions', async (req: Request, res: Response) => {
    const { signedTransactions } = req.body;

    try {
        const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`);
        const buffer = Buffer.from(signedTransactions, 'base64');
        const signature = await connection.sendRawTransaction(buffer);

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        const confirmationStrategy = { signature, blockhash, lastValidBlockHeight };
        await connection.confirmTransaction(confirmationStrategy);

        res.json({ success: true, signature: signature})
    } catch (error) {
        console.error('Transaction error: ', error)
        res.status(500).json({ success: false, error: error })
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
