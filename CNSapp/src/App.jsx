import React, { useEffect, useState } from "react";
import "./styles/App.css";
import './assets/clouds.jpg';
import { ethers } from "ethers";

// Constants;
const CONTRACT_ADDRESS = '0x7fb383937344c03cb1cf456795446c786209ebc5';
const tld = '.cloud';

const App = () => {
  //State variable for user's public wallet
  const [currentAccount, setCurrentAccount] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState('');

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      //Request access to account
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      //Print public address once we auth metamask
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log("Unable to connect wallet:", error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    //Check if authorized to access user wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    //Users can have mutlipled, let's grab the first one if it's there.
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };



  //Render Methods
  //Create a function to render if wallet is not connect yet.
  const renderNotConnectedContainer = () => {
    return (
      <div className="connect-wallet-container">
        <img className="cloud-image" src={require('./assets/clouds.jpg')} alt="Clouds"/>
        <button onClick={connectWallet} className="cta-button connect-wallet-button">
          Connect Wallet
        </button>
      </div>
    )
  };

  const renderInputForm = () => {
    return (
      <div className="form-container">
        <div className="first-row">
          <input
            type="text"
            value={domain}
            placeholder="Domain"
            onChange={e => setDomain(e.target.value)}
          />
          <p className="tld"> {tld} </p>
        </div>
        <input
            type="text"
            value={record}
            placeholder="Set record to your URI"
            onChange={e => setRecord(e.target.value)}
          />
          <div className="button-container">
            <button className="cta-button mint-button" disabled={null} onClick={null}>
              Register CNS Name
            </button>
            <button className="cta-button mint-button" disabled={null} onClick={null}>
              Set CNS Record
            </button>
          </div>
      </div>
    );
  };

  //This runs our function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <header>
            <div className="left">
              <p className="title">☁️ Cloud Name Service</p>
              <p className="subtitle">Your celestial API on the blockchain.</p>
            </div>
          </header>
        </div>

        {!currentAccount && renderNotConnectedContainer()}
        {currentAccount && renderInputForm()}

      <footer>
        <p>This is project was created to learn how DNS systems are created and put in place on the Ethereum blockchain. This solution was deployed using a React front-end and the contract itself is deployed on Mumbai. If you are interested in seeing the code and how this was made, please take a look at my Github <a target="_blank" href="https://github.com/Pluto-XI/PolygonENS" rel="noreferrer">here</a></p>
        <p>If you're in need of some eth, use the <a target="_blank" href="https://mumbaifaucet.com/" rel="noreferrer">Mumbai faucet</a></p>
      </footer>
      </div>
    </div>
  );
};

export default App;
