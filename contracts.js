
// This function is called when the web page is loaded.
window.addEventListener('load', function() {
    console.log(typeof window.ethereum)
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        const contractAddress = "0x5FA0687047337FcdA0088182EC131a88DEC4fD50"; // Replace with your contract's address
        const contractABI = [
            {
                "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}],
                "name": "stake",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            
            {
                "inputs": [],
                "name": "unstake",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },

            {
                "inputs": [{"internalType": "address", "name": "", "type": "address"}],
                "name": "unclaimedDividends",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            

            {
                "inputs": [],
                "name": "withdrawDividends",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]; 
        
        document.getElementById('connectWalletButton').addEventListener('click', function() {
            if (window.ethereum) { // Check if MetaMask is installed
                window.ethereum.request({ method: 'eth_requestAccounts' }) // Prompt user to connect their wallet
                .then(function(accounts) {
                    // Connected successfully
                    const account = accounts[0]; // You now have the connected wallet address
                    const formattedAccount = account.substring(0, 4) + '...'; // Display first 4 characters of the wallet
                    console.log(`Connected to account: ${account}`);
                    // Update the button text to show the formatted account address
                    document.getElementById('connectWalletButton').innerText = `Wallet: ${formattedAccount}`;
                    // Optionally change the button style
                    document.getElementById('connectWalletButton').classList.add('wallet-connected');
        
                    // Fetch and display unclaimed dividends after wallet connection
                    contract.methods.unclaimedDividends(account).call()
                    .then(function(dividends) {
                        const dividendsInEther = web3.utils.fromWei(dividends, 'ether');
                        document.getElementById('accumulatedDividends').innerText = `Unclaimed Dividends: ${dividendsInEther} ETH`;
                    })
                    .catch(function(error) {
                        console.error("Failed to fetch unclaimed dividends:", error);
                    });
                })
                .catch(function(error) {
                    // Handle error. Likely the user rejected the connection request
                    console.error(`Connection failed: ${error.message}`);
                });
            } else {
                // MetaMask is not installed
                console.log('Please install MetaMask to use this feature!');
                // Prompt user to install MetaMask
                alert('Please install MetaMask to use this feature!');
            }
        });
        
        
        

        document.getElementById("buyPickleButton").addEventListener("click", async function() {
            const bnbAmount = document.getElementById("bnbAmount").value;
            const amountToSend = web3.utils.toWei(bnbAmount, 'ether'); // Convert BNB amount to Wei

            // Request account access if needed
            ethereum.request({
                method: 'eth_requestAccounts'
            }).then(function(accounts) {
                // Send transaction
                const transactionParameters = {
                    to: contractAddress, // Required except during contract publications.
                    from: accounts[0], // must match user's active address.
                    value: web3.utils.toHex(amountToSend), // Only required to send ether to the recipient from the initiating external account.
                };

                ethereum.request({
                        method: 'eth_sendTransaction',
                        params: [transactionParameters],
                    })
                    .then((txHash) => console.log('Transaction Hash:', txHash))
                    .catch((error) => console.error);
            });
        });
        // Adding Stake functionality
        document.getElementById("stakePickleButton").addEventListener("click", async function() {
            const pickleAmount = document.getElementById("stakeAmount").value;
            const amountToStake = web3.utils.toWei(stakeAmount, 'ether'); // Convert $PICKLE amount to Wei

            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];

                await contract.methods.stake(amountToStake).send({ from: account })
                    .on('transactionHash', function(hash){
                        console.log("Transaction hash:", hash);
                    })
                    .on('receipt', function(receipt){
                        console.log("Receipt:", receipt);
                        alert("Stake successful!");
                    })
                    .on('error', function(error, receipt) {
                        console.error("Staking failed:", error);
                        if(receipt) console.log("Receipt on Error:", receipt);
                    });
            } catch (error) {
                console.error("Staking failed:", error);
                alert("Staking failed. See console for details.");
            }
        });

        document.getElementById("unstakePickleButton").addEventListener("click", async function() {
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];

                await contract.methods.unstake().send({ from: account })
                    .on('transactionHash', function(hash){
                        console.log("Transaction hash:", hash);
                    })
                    .on('receipt', function(receipt){
                        console.log("Receipt:", receipt);
                        alert("Unstake successful!");
                    })
                    .on('error', function(error, receipt) {
                        console.error("Unstaking failed:", error);
                        if(receipt) console.log("Receipt on Error:", receipt);
                    });
            } catch (error) {
                console.error("Unstaking failed:", error);
                alert("Unstaking failed. See console for details.");
            }
        });

        document.getElementById("withdrawDividendsButton").addEventListener("click", async function() {
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
        
                await contract.methods.withdrawDividends().send({ from: account })
                    .on('transactionHash', function(hash){
                        console.log("Transaction hash:", hash);
                    })
                    .on('receipt', function(receipt){
                        console.log("Receipt:", receipt);
                        alert("Dividends withdrawn successfully!");
                    })
                    .on('error', function(error, receipt) {
                        console.error("Error withdrawing dividends:", error);
                        if(receipt) console.log("Receipt on Error:", receipt);
                    });
            } catch (error) {
                console.error("Error withdrawing dividends:", error);
                alert("Error withdrawing dividends. See console for details.");
            }
        });
        

    } else {
        alert('MetaMask is not installed. Please consider installing it: https://metamask.io/download.html');
    }
});
