import React, { useEffect, useState } from 'react';
import './Components/SelectCharacter/SelectCharacter.css';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

const SelectCharacter = ({ setCharacterNFT }) => {
  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>
    </div>
  );
};

export default SelectCharacter;
