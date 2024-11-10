// src/App.jsx
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

const CONTRACT_ADDRESS = '0xFfb58B0EB3FAC405a3371b953185885640EDb1B9';
const ABI = [
  {
    "inputs": [],
    "name": "digForTreasure",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "generateTreasure",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [treasureStatus, setTreasureStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [chance, setChance] = useState(0); // เพิ่ม state สำหรับโอกาส

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('MetaMask not detected!');
        return;
      }
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log('No account found!');
      }
    };
    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert('MetaMask is not installed');
      return;
    }
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    setCurrentAccount(accounts[0]);
  };

  const handleCellClick = (id) => {
    setSelectedCell(id);
    calculateChance(); // คำนวณโอกาสเมื่อเลือกช่อง
  };

  const calculateChance = () => {
    const probability = Math.floor(Math.random() * 100) + 1; // สุ่มโอกาสเป็น 1-100%
    setChance(probability);
  };

  const digForTreasure = async () => {
    if (!selectedCell) {
      alert('Please select a cell to dig');
      return;
    }

    setLoading(true);
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert('Please connect your wallet');
      return;
    }

    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    try {
      const tx = await contract.methods.digForTreasure(selectedCell).send({
        from: accounts[0],
        value: web3.utils.toWei('0.0001', 'ether'), // จ่าย 0.0001 ETH เพื่อขุด
        gas: 300000,  // เพิ่ม gas limit
      });
      setTreasureStatus('Treasure found!');
      alert('Treasure dug up!');
    } catch (err) {
      console.error('Error digging treasure:', err);
      if (err.code === 4001) { 
        setTreasureStatus('Transaction was cancelled by user.');
      } else if (err.message.includes('reverted')) {
        setTreasureStatus('Transaction was reverted. Check smart contract or gas limits.');
      } else {
        setTreasureStatus('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Treasure Hunt 3x3 Grid</h1>
        {currentAccount ? (
          <div>
            <p>Connected Account: {currentAccount}</p>
            <div className="grid">
              {[...Array(9)].map((_, index) => (
                <div
                  key={index}
                  className={`cell ${selectedCell === index + 1 ? 'selected' : ''}`}
                  onClick={() => handleCellClick(index + 1)}
                >
                  {selectedCell === index + 1 ? 'Selected' : 'Select'}
                </div>
              ))}
            </div>
            <p>โอกาสได้สมบัติ: {chance}%</p>
            <button onClick={digForTreasure} disabled={loading}>
              {loading ? 'Digging...' : 'Dig for Treasure'}
            </button>
            <p>{treasureStatus}</p>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>
    </div>
  );
}

export default App;
