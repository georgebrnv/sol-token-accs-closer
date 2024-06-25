document.addEventListener('DOMContentLoaded', async function() {
    const connectButton = document.getElementById('connectWalletButton');
    const disconnectButton = document.getElementById('disconnectWalletButton');
    const createTransactionButton = document.getElementById('createTransactionButton');

    let walletPublicKey = null;

    connectButton.addEventListener('click', async () => {
        if (window.solana && window.solana.isPhantom) { 
            try {
                // Connect to Phantom wallet
                const wallet = await window.solana.connect();
                walletPublicKey = wallet.publicKey.toString();
                console.log('Phantom wallet has been connected:', wallet.publicKey.toString());

                // Store wallet connection information in local storage
                localStorage.setItem('walletConnected', 'true');

                // Update UI
                connectButton.style.display = 'none';
                disconnectButton.style.display = 'inline-block';
                createTransactionButton.style.display = 'inline-block';

            } catch (error) {
                console.error('An error occurred while connecting your wallet:', error);
            }
        } else {
            alert('Phantom Wallet not found. Please install it from https://phantom.app');
        }
    });

    disconnectButton.addEventListener('click', async () => {
        try {
            // Disconnect Phantom wallet
            await window.solana.disconnect();
            console.log('Wallet has been disconnected.');

            // Remove wallet connection information from local storage
            localStorage.removeItem('walletConnected');

            // Update UI
            disconnectButton.style.display = 'none';
            createTransactionButton.style.display = 'none';
            connectButton.style.display = 'inline-block';

        } catch (error) {
            console.error('An error occurred while disconnecting your wallet:', error);
        }
    });

    // Check if wallet is connected on page load
    const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
    if (isWalletConnected) {
        try {
            const wallet = await window.solana.connect();
            walletPublicKey = wallet.publicKey.toString();
            console.log('Connected to Phantom wallet:', wallet.publicKey.toString());
        } catch (error) {
            console.error('An error occurred while connecting your wallet:', error);
        }
    };

    // Check if wallet is connected on page load
    if (window.solana.isConnected) {
        disconnectButton.style.display = 'inline-block';
        createTransactionButton.style.display = 'inline-block';
    } else {
        connectButton.style.display = 'inline-block';
    };

    createTransactionButton.addEventListener('click', async () => {
        if (!window.solana.publicKey) {
            alert('Please connect your wallet first.');
            return;
        }

        try {
            const response = await fetch('/create-transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ publicKey: walletPublicKey })
            });
            const { transactions } = await response.json();

            for (const serializedTransaction of transactions) {
                const transaction = solanaWeb3.Transaction.from(Buffer.from(serializedTransaction, 'base64'));
                const signedTransaction = await window.solana.signTransaction(serializedTransaction);
                const serializedSignedTransaction = signedTransaction.serialize().toString('base64');

                const sendResponse = await fetch('/send-transaction', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ signedTransaction: serializedSignedTransaction })
                });

                const sendResult = await sendResponse.json();
                if (sendResult.success) {
                    console.log(`Transaction sent: ${sendResult.signature}`);
                } else {
                    console.error('Failed to send transaction', sendResult.error);
                };
            };

        } catch (error) {
            console.error('An error occurred while creating transactions: ', error);
        };
    });

});