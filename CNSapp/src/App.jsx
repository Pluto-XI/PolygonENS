import React, { useEffect, useState } from "react";
import "./styles/App.css";
import "./assets/clouds.jpg";
import { ethers } from "ethers";
import DomainsAbi from "./utils/Domains.json";
import polygonLogo from "./assets/polygonlogo.png";
import ethLogo from "./assets/ethlogo.png";
import { networks } from "./utils/networks";
import { MoonLoader } from "react-spinners";

// Constants;
const CONTRACT_ADDRESS = "0xBB149a288CFa18ecb04920A1b42844955232ab04";
const tld = ".cloud";
// const zeroAddress = "0x0000000000000000000000000000000000000000";

const App = () => {
  //State variable for user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");
  const [domain, setDomain] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState("");
  const [network, setNetwork] = useState("");
  const [registry, setRegistry] = useState([]);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      //Request access to account
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

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
    const accounts = await ethereum.request({ method: "eth_accounts" });

    //Users can have mutlipled, let's grab the first one if it's there.
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }

    //Check user's network chain ID
    const chainId = await ethereum.request({ method: "eth_chainId" });
    setNetwork(networks[chainId]);

    ethereum.on("chainChanged", handleChainChanged);

    function handleChainChanged(_chainId) {
      window.location.reload();
    }
  };

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        //Try to switch to the mumbai testnet
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13881" }],
        });
      } catch (error) {
        //Errors code 4902 means the chain hasn't been added to metamask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainName: "Polygon Mumbai Testnet",
                  rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
                  nativeCurrency: {
                    name: "Mumbai Matic",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
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
      //If no ethereum on window, metamask isn't installed.
      alert(
        "MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html"
      );
    }
  };

  const registerDomain = async () => {
    //Don't run if the domain is empty
    if (!domain) {
      return;
    }

    //Alert the user if the domain is too short
    if (domain.length < 3) {
      alert("Domain must be at least 3 characters long");
      return;
    }

    //Calculate price based on length of domain
    //3 chars = .4 matic, 4 chars = .2 matic, 5+ chars = .01 matic
    const price =
      domain.length === 3 ? "0.4" : domain.length === 4 ? "0.2" : "0.01";
    console.log("Registering domain", domain, "with price", price);

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          DomainsAbi.abi,
          signer
        );

        console.log("Pop wallet and pay gas...");
        let txn = await contract.register(domain, {
          value: ethers.utils.parseEther(price),
        });

        setLoading(true);

        //Wait for txn to be mined
        const receipt = await txn.wait();

        if (receipt.status === 1) {
          console.log(
            "Domain registered! https://mumbai.polygonscan.com/tx/" + txn.hash
          );
          txn = await contract.setRecord(domain, record);
          await txn.wait();

          setLoading(false);

          console.log(
            "Record set! https://mumbai.polygonscan.com/tx/" + txn.hash
          );

          setTimeout(() => {
            getRegistry();
          }, 2000);

          setRecord("");
          setDomain("");
        } else {
          alert("Transaction failed! Please try again");
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateDomain = async () => {
    if (!record || !domain) {
      return;
    }
    setLoading(true);
    console.log("Updating domain", domain, "with record", record);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          DomainsAbi.abi,
          signer
        );

        //Set loading animation
        setLoading(true);

        let tx = await contract.setRecord(domain, record);
        await tx.wait();
        console.log("Record set https://mumbai.polygonscan.com/tx/" + tx.hash);

        setLoading(false);

        setTimeout(() => {
          getRegistry();
        }, 2000);
        setRecord("");
        setDomain("");
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const getRegistry = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, DomainsAbi.abi, signer);

        //Get all domains from the contract
        const names = await contract.getAllNames();

        //For each name, get the record and address
        const registryRecords = await Promise.all(names.map(async (name) => {
          const registryRecord = await contract.records(name);
          const owner = await contract.domains(name);
          return {
            id: names.indexOf(name),
            name: name,
            record: registryRecord,
            owner: owner,
          };
        }));

        console.log("Registry fetched ", registryRecords);
        setRegistry(registryRecords);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (network === 'Polygon Mumbai Testnet') {
      getRegistry();
    }
  }, [currentAccount, network]);




  //Render Methods
  //Create a function to render if wallet is not connect yet.
  const renderNotConnectedContainer = () => {
    return (
      <div className="connect-wallet-container">
        <img
          className="cloud-image"
          src={require("./assets/clouds.jpg")}
          alt="Clouds"
        />
        <button
          onClick={connectWallet}
          className="cta-button connect-wallet-button"
        >
          Connect Wallet
        </button>
      </div>
    );
  };

  const renderInputForm = () =>{
    if (network !== 'Polygon Mumbai Testnet') {
      return (
        <div className="connect-wallet-container">
          <p>Please connect to Polygon Mumbai Testnet</p>
          <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
        </div>
      );
    }

    return (
      <div className="form-container">
        <div className="first-row">
          <input
            type="text"
            value={domain}
            placeholder='Domain'
            onChange={e => setDomain(e.target.value)}
          />
          <p className='tld'> {tld} </p>
        </div>

        <input
          type="text"
          value={record}
          placeholder='Enter your URI'
          onChange={e => setRecord(e.target.value)}
        />

        {loading ? <MoonLoader color="#36d7b7" speedMultiplier={0.3} /> : null}

          {/* If the editing variable is true, return the "Set record" and "Cancel" button */}
          {editing ? (
            <div className="button-container">
              {/* This will call the updateDomain function we just made */}
              <button className='cta-button mint-button' disabled={loading} onClick={updateDomain}>
                Set record
              </button>  
              {/* This will let us get out of editing mode by setting editing to false */}
              <button className='cta-button mint-button' onClick={() => {setEditing(false)}}>
                Cancel
              </button>  
            </div>
          ) : (
            // If editing is not true, the mint button will be returned instead
            <div className="register-set-container">
              <button className='cta-button mint-button' disabled={loading} onClick={registerDomain}>
                Register CNS Name
              </button>
              <button onClick={setEditing} className="register-prompt-button">Set CNS Record?</button>
            </div>
          )}
      </div>
    );
  }

  const renderRegistry = () => {
    if (currentAccount && registry.length > 0) {
      return (
        <div className="mint-container">
          <p className="subtitle"> Recently registered domains!</p>
          <div className="mint-list">
            { registry.map((registry, index) => {
              return (
                <div className="mint-item" key={index}>
                  <div className='mint-row'>
                    <a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${registry.id}`} target="_blank" rel="noopener noreferrer">
                      <p className="underlined">{' '}{registry.name}{tld}{' '}</p>
                    </a>
                    {/* If mint.owner is currentAccount, add an "edit" button*/}
                    { registry.owner.toLowerCase() === currentAccount.toLowerCase() ?
                      <button className="edit-button" onClick={() => editRecord(registry.name)}>
                        <img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
                      </button>
                      :
                      null
                    }
                  </div>
            <p> {registry.record} </p>
          </div>)
          })}
        </div>
      </div>);
    }
  };

  const editRecord = (name) => {
    console.log("Editing record for", name);
    setEditing(true);
    setDomain(name);
  }

  const renderOpenSeaModal = () => {
    return (
      <div className="modal">
        <div className="modal-card">
          <h1>Your CNS name has been registered</h1>
          <p>View your transaction on OpenSea here</p>
          
        </div>
      </div>
    )
  };

  //This runs our function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      {renderOpenSeaModal()}
      <div className="container">
        <div className="header-container">
          <header>
            <div className="left">
              <p className="title">☁️ Cloud Name Service</p>
              <p className="subtitle">Your celestial API on the blockchain.</p>
            </div>
            {/* Display a logo and wallet connect status*/}
            <div className="right">
              <img
                alt="Network logo"
                className="logo"
                src={network.includes("Polygon") ? polygonLogo : ethLogo}
              />
              {currentAccount ? (
                <p>
                  {" "}
                  Wallet: {currentAccount.slice(0, 6)}...
                  {currentAccount.slice(-4)}{" "}
                </p>
              ) : (
                <p> Not connected </p>
              )}
            </div>
          </header>
        </div>

        {!currentAccount && renderNotConnectedContainer()}
        {currentAccount && renderInputForm()}
        {registry && renderRegistry()}

        <footer className="footer-container">
          <p className="footer-text">
            This is project was created to learn how DNS systems are created and
            put in place on the Ethereum blockchain. This solution was deployed
            using a React front-end and the contract itself is deployed on
            Mumbai. If you are interested in seeing the code and how this was
            made, please take a look at my Github{" "}
            <a
              target="_blank"
              href="https://github.com/Pluto-XI/PolygonENS"
              rel="noreferrer"
            >
              here
            </a>
          </p>
          <hr />
          <p className="footer-text">
            If you're in need of some eth, use the{" "}
            <a
              target="_blank"
              href="https://mumbaifaucet.com/"
              rel="noreferrer"
            >
              Mumbai faucet
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
