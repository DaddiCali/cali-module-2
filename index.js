import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  // State variables to manage various aspects of the app
  const [ethereumWallet, setEthereumWallet] = useState(undefined);
  const [currentAccount, setCurrentAccount] = useState(undefined);
  const [atmContract, setAtmContract] = useState(undefined);
  const [accountBalance, setAccountBalance] = useState(0);
  const [receiverAddress, setReceiverAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showChoices, setShowChoices] = useState(false);

  // Address and ABI of the ATM contract
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  // Function to detect and connect to MetaMask wallet
  const detectMetaMaskWallet = async () => {
    if (window.ethereum) {
      setEthereumWallet(new ethers.providers.Web3Provider(window.ethereum));
    }
  };

  // Function to handle current account information
  const handleAccountInformation = async () => {
    if (ethereumWallet) {
      const accounts = await ethereumWallet.listAccounts();
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      } else {
        alert("No MetaMask account found.");
      }
    }
  };

  // Function to connect MetaMask wallet
  const connectMetaMask = async () => {
    if (!ethereumWallet) {
      alert("Please install and connect MetaMask to proceed.");
      return;
    }

    await ethereumWallet.send("eth_requestAccounts", []);
    handleAccountInformation();
    initializeATMContract();
  };

  // Function to initialize ATM contract
  const initializeATMContract = () => {
    if (ethereumWallet) {
      const signer = ethereumWallet.getSigner();
      const atmInstance = new ethers.Contract(contractAddress, atmABI, signer);
      setAtmContract(atmInstance);
    }
  };

  // Function to deposit diamonds into the ATM
  const depositDiamonds = async () => {
    if (atmContract && transferAmount) {
      const amountInWei = ethers.utils.parseEther(transferAmount);
      await atmContract.deposit(amountInWei);
      setNotificationMessage(`Successfully bought ${transferAmount} diamonds.`);
      setAccountBalance(accountBalance + parseFloat(transferAmount));
    }
  };
  
  // Function to withdraw diamonds from the ATM
  const withdrawDiamonds = async () => {
    if (atmContract && transferAmount) {
      if (transferAmount.toLowerCase() === "reset") {
        const currentBalance = await atmContract.getBalance();
        const amountInWei = ethers.utils.parseEther(ethers.utils.formatEther(currentBalance));
        await atmContract.withdraw(amountInWei);
        setAccountBalance(0);
        setNotificationMessage("Account balance reset to 0.");
      } else {
        const amountInWei = ethers.utils.parseEther(transferAmount);
        await atmContract.withdraw(amountInWei);
        setNotificationMessage(`Successfully sold ${transferAmount} diamonds.`);
        setAccountBalance(accountBalance - parseFloat(transferAmount));
      }
    }
  };
  
  // Function to transfer diamonds to another address
  const transferDiamonds = async () => {
    if (ethereumWallet && receiverAddress && transferAmount) {
      const signer = ethereumWallet.getSigner();
      const amountInWei = ethers.utils.parseEther(transferAmount);
      const transaction = await signer.sendTransaction({
        to: receiverAddress,
        value: amountInWei,
      });
      await transaction.wait();
      setNotificationMessage(`Successfully transferred ${transferAmount} diamonds.`);
      updateAccountBalance();
    }
  };

  // Function to sell all diamonds in the account
const sellAllBalance = async () => {
    if (atmContract) {
      try {
        const currentBalance = await atmContract.getBalance();
        if (currentBalance.gt(0)) {
          await atmContract.withdraw(currentBalance);
          setAccountBalance(0);
          setNotificationMessage("Sold all diamonds in the account.");
        } else {
          setNotificationMessage("No diamonds to sell.");
        }
      } catch (error) {
        console.error("Error selling diamonds:", error);
        setNotificationMessage("Failed to sell diamonds. Please try again later.");
      }
    }
  };
  
  

  // Function to update the account balance
  const updateAccountBalance = async () => {
    if (atmContract) {
      const depositedBalance = await atmContract.getBalance();
      setAccountBalance(ethers.utils.formatEther(depositedBalance));
    }
  };

  // Hook to run when the component mounts
  useEffect(() => {
    detectMetaMaskWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>Cali Buy and Sell</h1></header>
      <div className="center">
        <div className="input-group">
          <input
            type="text"
            placeholder="Receiver Address"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount in diamonds"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <div className="choices-dropdown">
            <button onClick={() => setShowChoices(!showChoices)}>Choices</button>
            {showChoices && (
              <div className="choices-menu">
                <button onClick={transferDiamonds}>Transfer Diamonds</button>
                <button onClick={depositDiamonds}>Buy</button>
                <button onClick={withdrawDiamonds}>Sell</button>
                <button onClick={sellAllBalance}>Sell All</button>
              </div>
            )}
          </div>
        </div>
        {currentAccount ? (
          <div>
            <p>Your MetaMask Account: {currentAccount}</p>
            <p>Your Total Deposited Balance: {accountBalance} diamonds</p>
            {notificationMessage && <p>{notificationMessage}</p>}
          </div>
        ) : (
          <button onClick={connectMetaMask}>Connect with MetaMask</button>
        )}
      </div>
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #f0f0f0;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        header {
          background-color: #333;
          color: #fff;
          padding: 10px;
          width: 100%;
          text-align: center;
          margin-bottom: 20px;
        }
        .center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        }
        .input-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          width: 100%;
        }
        input {
          padding: 10px;
          width:
 calc(50% - 10px);
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .choices-dropdown {
          position: relative;
        }
        .choices-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 5px;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 1;
        }
        .choices-menu button {
          display: block;
          width: 100%;
          padding: 10px;
          text-align: left;
          border: none;
          background-color: transparent;
          cursor: pointer;
        }
        .choices-menu button:hover {
          background-color: #f0f0f0;
        }
      `}</style>
    </main>
  );
}

