import Loader from "@components/Loader";
import WrongChain from "@components/WrongChain";
import detectEthereumProvider from "@metamask/detect-provider";
import { loadContract } from "@utils/loadContract";
import { ethers } from "ethers";
import { createContext, useContext, useState, useEffect } from "react";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3Api, setWeb3Api] = useState({
    web3: null,
    provider: null,
    isLoading: true,
  });
  const [accountApi, setAccountApi] = useState({
    account: null,
    signer: null,
    isConnected: false,
  });
  const [chainApi, setChainApi] = useState({
    chainId: 1,
    isWrongChain: false,
    validChains: [4],
    isLoading: false,
  });
  const [contractApi, setContractApi] = useState({
    NFTContract: null,
    MarketplaceContract: null,
    isLoading: false,
  });

  const setMetamaskListeners = (provider) => {
    // realtime Metamask event listeners
    provider.on("accountsChanged", (accounts) => {
      setAccountApi({
        account: accounts[0],
        isConnected: true,
      });
      window.location.reload();
    });
    provider.on("chainChanged", (chainId) => {
      setChainApi((prevState) => ({
        ...prevState,
        chainId: parseInt(chainId),
      }));
      window.location.reload();
    });
  };

  /* 1. Check Web3 Available */
  const loadProvider = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      setMetamaskListeners(provider);
      const web3 = new ethers.providers.Web3Provider(provider);
      console.log("WEB3 INSTANCE FOUND.");

      setWeb3Api((prevState) => ({
        ...prevState,
        provider,
        web3,
      }));
    } else {
      setWeb3Api((api) => ({ ...api, isLoading: false }));
      console.log("INSTALL METAMASK");
    }
  };

  /* 2. Check for Valid ChainID & Connected Accounts */
  const loadChainAndAccounts = async () => {
    const { web3 } = web3Api;
    const { chainId } = await web3.getNetwork();
    const accounts = await web3.listAccounts();

    // Check if any account is currently connected.
    if (accounts.length > 0) {
      const signer = await web3.getSigner();
      const acc = await web3.getSigner().getAddress();
      console.log("ACCOUNT PRESENT.", acc);

      setAccountApi({
        account: acc,
        signer,
        isConnected: true,
      });
    } else {
      setAccountApi((prevState) => ({
        ...prevState,
        isConnected: false,
      }));
      console.log("No account connected. Connect to Metamask.");
    }

    // Check if the chainId is valid
    const { validChains } = chainApi;
    if (validChains.includes(parseInt(chainId))) {
      console.log("CORRECT CHAIN");
      setChainApi((prevState) => ({
        ...prevState,
        chainId: parseInt(chainId),
        isWrongChain: false,
      }));
    } else {
      console.log("WRONG CHAIN");
      setChainApi((prevState) => ({
        ...prevState,
        chainId: parseInt(chainId),
        isWrongChain: true,
      }));
    }

    setWeb3Api((prevState) => ({
      ...prevState,
      isLoading: false,
    }));
  };

  /* 3. Load Contracts */
  const loadContracts = async () => {
    setContractApi((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    const { chainId } = chainApi;
    const { web3 } = web3Api;

    let nft = await loadContract(chainId, "NFT", web3);
    let marketplace = await loadContract(chainId, "Marketplace", web3);

    console.log("CONTRACTS LOADED");

    setContractApi((prevState) => ({
      ...prevState,
      NFTContract: nft,
      MarketplaceContract: marketplace,
      isLoading: false,
    }));
  };

  /* USE EFFECTS. */
  useEffect(() => {
    loadProvider();
  }, []);

  useEffect(() => {
    web3Api.web3 && loadChainAndAccounts();
  }, [web3Api.web3]);

  useEffect(() => {
    chainApi.chainId != null &&
      !chainApi.isWrongChain &&
      web3Api.web3 &&
      loadContracts();
  }, [chainApi]);

  return (
    <Web3Context.Provider
      value={{ web3Api, accountApi, chainApi, contractApi }}>
      <>
        {web3Api.isLoading ? (
          <Loader />
        ) : web3Api.web3 ? (
          chainApi.isWrongChain ? (
            <WrongChain />
          ) : (
            <>{children} </>
          )
        ) : (
          <span>NO WEB3</span>
        )}
      </>
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  return useContext(Web3Context);
};
