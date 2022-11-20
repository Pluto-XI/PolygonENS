import React, { useEffect, useState } from "react";
import "./styles/App.css";
import './assets/clouds.jpg';
import { ethers } from "ethers";
import DomainsAbi from './utils/Domains.json';

// Constants;
const CONTRACT_ADDRESS = '0xBB149a288CFa18ecb04920A1b42844955232ab04';
const tld = '.cloud';
const zeroAddress = '0x0000000000000000000000000000000000000000';

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

  const registerDomain = async () => {
    //Don't run if the domain is empty
    if (!domain) { return };

    //Alert the user if the domain is too short
    if (domain.length < 3) {
      alert("Domain must be at least 3 characters long");
      return;
    }

    //Calculate price based on length of domain
    //3 chars = .4 matic, 4 chars = .2 matic, 5+ chars = .01 matic
    const price = domain.length === 3 ? '0.4' : domain.length === 4 ? '0.2' : '0.01';
    console.log("Registering domain", domain, "with price", price);

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, DomainsAbi.abi, signer);

        console.log("Pop wallet and pay gas...");
        let txn = await contract.register(domain, {value: ethers.utils.parseEther(price)});
        //Wait for txn to be mined
        const receipt = await txn.wait();

        if (receipt.status === 1) {
          console.log("Domain registered! https://mumbai.polygonscan.com/tx/" + txn.hash);
          txn = await contract.setRecord(domain, record);
          await txn.wait();

          console.log("Record set! https://mumbai.polygonscan.com/tx/" + txn.hash);
          setRecord('');
          setDomain('');

        } else {
          alert("Transaction failed! Please try again");
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const setDomainRecord = async () => {
    //Don't run if the domain is empty
    if (!domain) { return };

    //Alert the user if the domain is too short
    if (domain.length < 3) {
      alert("Domain must be at least 3 characters long");
      return;
    }

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, DomainsAbi.abi, signer);

        let txn = await contract.getAddress(domain);
        if (txn !== zeroAddress) {
          try {
            txn = await contract.setRecord(domain, record);
            await txn.wait();
            console.log("Record set! https://mumbai.polygonscan.com/tx/" + txn.hash);
            setRecord('');
            setDomain('');
          } catch (error) {
            console.log(error);
          }
        } else {
          alert("Not a registered domain.");
        }
      }
    } catch (error) {
      console.log(error);
    }
  }



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
        <input
            type="text"
            value={record}
            placeholder="Set record to your URI"
            onChange={e => setRecord(e.target.value)}
            />
            </div>
          <div className="button-container">
            <div>
            <button className="cta-button mint-button" disabled={null} onClick={registerDomain}>
              Register CNS Name
            </button>
            <button className="cta-button mint-button" disabled={null} onClick={setDomainRecord}>
              Set CNS Record
            </button>
            </div>
            <button className="cta-button mint-button" disabled={null} onClick={setDomainRecord}>
              View CNS Record
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

      <footer className="footer-container">
        <p className="footer-text">This is project was created to learn how DNS systems are created and put in place on the Ethereum blockchain. This solution was deployed using a React front-end and the contract itself is deployed on Mumbai. If you are interested in seeing the code and how this was made, please take a look at my Github <a target="_blank" href="https://github.com/Pluto-XI/PolygonENS" rel="noreferrer">here</a></p>
        <p className="footer-text">If you're in need of some eth, use the <a target="_blank" href="https://mumbaifaucet.com/" rel="noreferrer">Mumbai faucet</a></p>
      </footer>
      </div>
    </div>
  );
};

export default App;
