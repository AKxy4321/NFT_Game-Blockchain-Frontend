import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants.js';
import LoadingIndicator from '../LoadingIndicator/index.js';
import myEpicGame from '../../utils/MyEpicGame.json';
import './SelectCharacter.css';

const SelectCharacter = ({ setCharacterNFT }) => {
	const [gameContract, setGameContract] = useState(null);
	const [characters, setCharacters] = useState([]);
	const [mintingCharacter, setMintingCharacter] = useState(false);

	const mintCharacterNFTAction = async (characterId) => {
		try {
			if (gameContract) {
				setMintingCharacter(true);
				console.log('Minting character in progress...');
				const mintTxn = await gameContract.mintCharacterNFT(characterId);
				await mintTxn.wait();
				console.log('mintTxn:', mintTxn);
				alert(`Your NFT is minted!`);
			}
		} catch (error) {
			console.warn('MintCharacterAction Error:', error);
			setMintingCharacter(false);
		}
	};

	const renderCharacters = () =>
		characters.map((character, index) => (
			<div className="character-item" key={character.name}>
				<div className="name-container">
					<p>{character.name}</p>
				</div>
				<img src={character.imageURI} alt={character.name} />
				<button
					type="button"
					className="character-mint-button"
					onClick={() => mintCharacterNFTAction(index)}
				>{`Mint ${character.name}`}</button>
			</div>
		));

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

	useEffect(() => {
		const getCharacters = async () => {
			try {
				console.log('Getting contract characters to mint');

				const charactersTxn = await gameContract.getAllDefaultCharacters();
				console.log('charactersTxn:', charactersTxn);

				const characters = charactersTxn.map((characterData) =>
					transformCharacterData(characterData)
				);

				setCharacters(characters);
			} catch (error) {
				console.error('Something went wrong fetching characters:', error);
			}
		};

		const onCharacterMint = async (sender, tokenId, characterIndex) => {
			console.log(
				`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
			);

			if (gameContract) {
				const characterNFT = await gameContract.checkIfUserHasNFT();
				console.log('CharacterNFT: ', characterNFT);
				setCharacterNFT(transformCharacterData(characterNFT));
			}
		};

		if (gameContract) {
			getCharacters();
			gameContract.on('CharacterNFTMinted', onCharacterMint);
		}

		return () => {
			if (gameContract) {
				gameContract.off('CharacterNFTMinted', onCharacterMint);
			}
		};
	}, [gameContract]);

	return (
		<div className="select-character-container">
			<h2>Mint Your Hero. Choose wisely.</h2>
			{characters.length > 0 && (
				<div className="character-grid">{renderCharacters()}</div>
			)}
			{/* Only show our loading state if mintingCharacter is true */}
			{mintingCharacter && (
				<div className="loading">
					<div className="indicator">
						<LoadingIndicator />
						<p>Minting In Progress...</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default SelectCharacter;
