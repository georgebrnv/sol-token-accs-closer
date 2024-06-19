document.addEventListener('DOMContentLoaded', async function() {
    const connectButton = document.getElementById('connectWalletButton');
    const disconnectButton = document.getElementById('disconnectWalletButton');

    connectButton.addEventListener('click', async () => {
        if (window.solana && window.solana.isPhantom) { 
            try {
                // Connect to Phantom wallet
                const wallet = await window.solana.connect();
                console.log('Phantom wallet has been connected:', wallet.publicKey.toString());

                // Store wallet connection information in local storage
                localStorage.setItem('walletConnected', 'true');

                // Update UI
                connectButton.style.display = 'none';
                disconnectButton.style.display = 'inline-block';

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
            console.log('Connected to Phantom wallet:', wallet.publicKey.toString());
        } catch (error) {
            console.error('An error occurred while connecting your wallet:', error);
        }
    }

    // Check if wallet is connected on page load
    if (window.solana.isConnected) {
        connectButton.style.display = 'none';
    } else {
        disconnectButton.style.display = 'none';
    }

    

});