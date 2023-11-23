import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import SelectCharacter from './Components/SelectCharacter/index.js';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants.js';
import LoadingIndicator from './Components/LoadingIndicator/index.js';
import Arena from './Components/Arena/index.js';
import myEpicGame from './utils/MyEpicGame.json';
import networks from './utils/networks.js';

const App = () => {

const [currentAccount, setCurrentAccount] = useState(null);
const [characterNFT, setCharacterNFT] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [network, setNetwork] = useState('');

const checkIfWalletIsConnected = async () => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have MetaMask!');

      setIsLoading(false);
      return;
    } else {
      console.log('We have the ethereum object', ethereum);

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }

      // Get chainId
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      setNetwork(networks[chainId]);
    
      ethereum.on('chainChanged', handleChainChanged);
    
      function handleChainChanged(_chainId) {
      // Reload the page or update the necessary state when the chain changes
      window.location.reload();
      }
    }
  } catch (error) {
    console.log(error);
  }

  setIsLoading(false);
};

const connectWallet = async () => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Get MetaMask -> https://metamask.io/");
      return;
    }
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    
  const account = accounts[0];
    console.log("Connected", account);
    setCurrentAccount(account);
  } catch (error) {
    console.log(error)
  }
}

const switchNetwork = async () => {
  if (window.ethereum) {
    try {
    // Try to switch to the Mumbai testnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
    });
    } catch (error) {
    // This error code means that the chain we want has not been added to MetaMask
    // In this case we ask the user to add it to their MetaMask
    if (error.code === 4902) {
      try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
        {	
          chainId: '0x13881',
          chainName: 'Polygon Mumbai Testnet',
          rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
          nativeCurrency: {
            name: "Mumbai Matic",
            symbol: "MATIC",
            decimals: 18
          },
          blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
        },
        ],
      });
      } catch (error) {
      console.log(error);
      }
    }
    console.log(error);
    }
  } else {
    // If window.ethereum is not found then MetaMask is not installed
    alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
  } 
  }

  // Render Methods
  const renderContent = () => {
    if (network !== 'Polygon Mumbai Testnet') {
      return (
      <div className="connect-wallet-container">
        <p style={{ color: 'white', textAlign: 'center'}}>Please connect to Polygon Mumbai Testnet</p>
        <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
      </div>
      );
    }
    
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWallet}
          >
            Connect Wallet 
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;	
    } else if (currentAccount && characterNFT) {
      return  <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
    }
  }; 

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
  
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }

      setIsLoading(false);
    };

    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [network]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ MetaSlayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          {/* This is where our button and image code used to be!
           *	Remember we moved it into the render method.
           */}
          {renderContent()}
        </div>
        <div className="footer-container">
          <a
            className="footer-text"
            href={''}
            target="_blank"
            rel="noreferrer"
          >{}</a>
        </div>
      </div>
    </div>
  );
}

export default App;