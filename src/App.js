import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from 'ethers';
import contractABI from './utils/contractABI.json';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = '.che';
const CONTRACT_ADDRESS = "0x93cA1E6471dF0A2028C1aa255DaB2EFa3f7451B5";

const App = () => {
	const [currentAccount, setCurrentAccount] = useState(null);
	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;
		if (!ethereum) {
			console.log("Make sure you have MetaMask!");
		} else {
			console.log("We have the ethereum object", ethereum);
		}

		// check if the user is authorized to access accounts
		const accounts = await ethereum.request({ method: 'eth_accounts' });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account", account);
			setCurrentAccount(account);
		} else {
			console.log("Make sure you are logged in to MetaMask!");
		}
	}

	const connectToWallet = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
				console.log("Make sure you have MetaMask!");
				return;
			}
			// request access to account, this will launch the wallet
			const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

			// got access to an account
			const account = accounts[0];
			setCurrentAccount(account);
			console.log("Connected", account);
		} catch (error) {
			console.log(error);
		}
	}

	const mintDomain = async () => {
		// dont run if the domain is empty
		if (!domain) { return; }
		// Alert the user if the domain is too short
		if (domain.length < 3) {
			alert("Domain name must be at least 3 characters long");
			return;
		}

		// Calculate price based on length of domain (change this to match your contract)	
		// 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
		const price = domain.length === 3 ? '0.5' : (domain.length === 4 ? '0.3' : '0.1')
		console.log("Minting domain", domain, "with price", price);

		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
				console.log("Wallet will pop now to pay the gas fees");

				// call the register function on the contract
				let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) });
				let receipt = await tx.wait(); // wait for the transaction to be mined

				if (receipt.status === 1) {
					console.log("Domain minted! https://mumbai.polygonscan.com/domain/tx/" + tx.hash);

					// update the record on the domain name
					tx = await contract.setRecord(domain, record);
					receipt = await tx.wait(); // wait for the transaction to be mined
					console.log("Record set! https://mumbai.polygonscan.com/domain/tx/" + tx.hash);

					setRecord('');
					setDomain('');

				} else {
					console.log("Transaction failed! Please try again");
				}
			}

		} catch (error) {
			console.log(error);
		}
	}

	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<img src="https://media.giphy.com/media/JmJeX2oPybgd7P1Usq/giphy.gif" alt="M gif" />
			<button className="cta-button connect-wallet-button" onClick={connectToWallet}>
				Connect Wallet
			</button>
		</div>
	)

	const renderInputForm = () => {
		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder='domain'
						onChange={e => setDomain(e.target.value)}
					/>
					<p className='tld'> {tld} </p>
				</div>

				<input
					type="text"
					value={record}
					placeholder='whats ur power'
					onChange={e => setRecord(e.target.value)}
				/>

				<div className="button-container">
					<button className='cta-button mint-button' disabled={null} onClick={mintDomain}>
						Mint
					</button>
					{/* <button className='cta-button mint-button' disabled={null} onClick={null}>
						Set data
					</button> */}
				</div>

			</div>
		);
	}

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);


	return (
		<div className="App">
			<div className="container">

				<div className="header-container">
					<header>
						<div className="left">
							<p className="title">🐱‍👤 M_M Name Service</p>
							<p className="subtitle">Your friendly name service on the blockchain!</p>
						</div>
					</header>
				</div>
				{!currentAccount && renderNotConnectedContainer()}
				{currentAccount && renderInputForm()}
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
