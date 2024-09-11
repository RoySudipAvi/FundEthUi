import React, { useState } from "react";
import { ethers, parseEther, parseUnits } from "ethers";
import { contractAddress, contractABI } from "../ContractConfig"

const WalletConnector: React.FC = () => {
    const [isPopUpOpen, setIsPopUpOpen] = useState<boolean>(false)
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [walletAddress, setWalletAddres] = useState<string | null>(null)
    const [contract, setContract] = useState<ethers.Contract | null>(null)
    const [fundAmount, setFundAmount] = useState<string>("")
    const [totalAmount, setTotalAmount] = useState<string | null>(null)
    const [isOwner, setIsOwner] = useState<boolean>(false)
    const [totalFundedByThis, setTotalFundedByThis] = useState<string | null>(null)
    const connectMetaMask = async () => {
        if (window.ethereum) {
            if (window.ethereum.isMetaMask)
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    console.log("Connected to MetaMask", provider);
                    setWalletAddres(accounts[0])
                    setIsConnected(true);  // Set connected status to true
                    setIsPopUpOpen(false);

                    const signer = await provider.getSigner();
                    const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
                    setContract(contractInstance);

                    const owner = await contractInstance.getOwner()
                    if (accounts[0].toLowerCase() === owner.toLowerCase()) {
                        setIsOwner(true)
                    }

                } catch (error) {
                    console.error(error)
                }
        }
        else {
            alert("Metamask is not installed")
        }
    }

    const connectRabby = async () => {
        alert("Support for rabby wallet will be provided soon")
    }

    const FundMe = async () => {
        if (contract && fundAmount) {
            try {
                const tx = await contract.fund({ value: parseEther(fundAmount) })
                const receipt = await tx.wait();
                console.log(receipt)
            } catch (error) {
                console.error(error)
            }
        }
        else {
            alert("Please enter a valid value or ensure contract is connected.")
        }
    }

    const getTotalAmount = async () => {
        if (contract) {
            try {
                const total = await contract.checkBalance()
                const totalbalance = ethers.formatEther(total)
                setTotalAmount(totalbalance)
            } catch (error) {
                console.error(error)
            }
        }
    }

    const withdraw = async () => {
        if (contract && isOwner) {
            const tx = await contract.withdraw()
            const receipt = await tx.wait()
            console.log(receipt)
        }
        else {
            alert("Either you are not the owner or you have not connected with the contract")
        }
    }

    const getTotalFundedByThis = async () => {
        if (contract) {
            try {
                const tx = await contract.checkAmountFundedByAddress(walletAddress)
                setTotalFundedByThis(ethers.formatEther(tx))
            }
            catch (error) {
                console.error(error)
            }
        }
        else {
            alert("connect to the contract")
        }
    }


    return (
        <div>
            {isConnected ? (
                <>
                    <h3>Welcome, {walletAddress}</h3>
                    <div className="input-container">
                        <input
                            className="input-box"
                            type="text"
                            placeholder="0.1 Ether"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)} // Handle input change
                        />
                        <button className="fund-button" onClick={FundMe}>Fund Me</button>
                    </div>
                    <button className="get-total-button" onClick={getTotalAmount}>Check Total Amount</button>
                    {totalAmount && <p>Total Amount: {totalAmount} Ether</p>}
                    <button className="get-total-button" onClick={getTotalFundedByThis}>Amount Funded By Me</button>
                    {totalFundedByThis && <p>Amount: {totalFundedByThis} Ether</p>}
                    {isOwner && <button className="withdraw-button" onClick={withdraw}>Withdraw Fund</button>}
                </>

            ) : (
                <button className="connect-button" onClick={() => setIsPopUpOpen(true)}>Connect Wallet</button>
            )
            }
            {
                isPopUpOpen && (
                    <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "white", padding: "20px", border: "1px solid black", zIndex: 1000 }}>
                        <h2>Select Wallet</h2>
                        <button className="wallet-button" onClick={connectMetaMask}>Connect MetaMask</button>
                        <button className="wallet-button" onClick={connectRabby}>Connect Rabby Wallet</button>
                        <button className="close-popup" onClick={() => setIsPopUpOpen(false)}>Close</button>
                    </div>
                )
            }

            {
                isPopUpOpen && (
                    <div onClick={() => setIsPopUpOpen(false)} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 999 }}></div>
                )
            }

        </div>
    )
}

export default WalletConnector