import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import SelectCharacter from './index.js';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants.js';
import LoadingIndicator from './Components/LoadingIndicator/index.js';
import Arena from './Components/Arena/index.js';
import myEpicGame from './utils/MyEpicGame.json';

const App = () => {

const [currentAccount, setCurrentAccount] = useState(null);
const [characterNFT, setCharacterNFT] = useState(null);
const [isLoading, setIsLoading] = useState(false);

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
    }
  } catch (error) {
    console.log(error);
  }

  setIsLoading(false);
};

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const checkNetwork = async () => {
    try { 
      if (window.ethereum.networkVersion !== '5') {
        alert("Please connect to Goerli!");
      }
    } catch(error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
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