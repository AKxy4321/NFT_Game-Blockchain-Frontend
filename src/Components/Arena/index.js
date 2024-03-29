import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants.js';
import myEpicGame from '../../utils/MyEpicGame.json';
import LoadingIndicator from '../LoadingIndicator/index.js';
import './Arena.css';

const Arena = ({ characterNFT, setCharacterNFT, currentAccount }) => {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [isRevived, setIsRevived] = useState(false);

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log('Attacking boss...');
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log('attackTxn:', attackTxn);
        setAttackState('hit');
        setIsRevived(false);
      }
    } catch (error) {
      if (error.message.includes("transaction failed")) {
        alert('Transaction failed. Please try again.');
        setAttackState('');
      } else {
        console.error('Error during attack:', error);
      }
    }
  };

    const onAttackComplete = (from, currBossHp, currPlayerHp) => {
      const bossHp = currBossHp.toNumber();
      const playerHp = currPlayerHp.toNumber();
      const sender = from.toString();

      alert(`Attack Complete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

      if (currentAccount === sender.toLowerCase()) {

        setBoss((prevState) => {
            return { ...prevState, hp: bossHp };
        });
        setCharacterNFT((prevState) => {
            return { ...prevState, hp: playerHp };
        });
      }
      else {
        setBoss((prevState) => {
            return { ...prevState, hp: bossHp };
        });
      }

      window.location.reload();
  }

  const reviveCharacter = async () => {
    try {
      if (gameContract) {
        setAttackState('reviving');
        console.log('Reviving character...');
        const reviveTxn = await gameContract.reviveCharacter();
        await reviveTxn.wait();
        console.log('reviveTxn:', reviveTxn);
        setAttackState('');
        setIsRevived(true);
        alert("Revive Completed!");
      }
    } catch (error) {
      alert('Error, Could not revive character: ', error);
      setAttackState('');
    }
  };

  useEffect(() => {
    const fetchBoss = async () => {
        const bossTxn = await gameContract.getBigBoss();
        console.log('Boss:', bossTxn);
        setBoss(transformCharacterData(bossTxn));
    };

    if (gameContract) {
      fetchBoss();
      gameContract.on('AttackComplete', onAttackComplete);
    }

  return () => {
      if (gameContract) {
          gameContract.off('AttackComplete', onAttackComplete);
      }
  }
  }, [gameContract]);

  useEffect(() => {
    if (isRevived) {
      window.location.reload();
    }
  }, [isRevived]);

  return (
    <div className="arena-container"> 
      {/* Boss */}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content  ${attackState}`}>
            <h2>{boss.name}</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`💥 Attack ${boss.name}`}
            </button><br></br><br></br>
              {characterNFT && characterNFT.hp === 0 && (
                <div className="revive-container">
                  <button className="cta-button" onClick={reviveCharacter}>
                    Revive
                  </button>
                </div>
              )}
          </div>
          {attackState === 'attacking' && (
            <div className="loading-indicator">
              <LoadingIndicator />
              <p>Attacking ⚔️</p>
            </div>
          )}
        </div>
      )}
  
      {/* Character NFT */}
      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <img
                  src={characterNFT.imageURI}
                  alt={`Character ${characterNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
          {/* <div className="active-players">
            <h2>Active Players</h2>
            <div className="players-list">{renderActivePlayersList()}</div>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default Arena;