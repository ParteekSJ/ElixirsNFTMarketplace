import TokenInput from "@components/TokenInput";
import { useWeb3 } from "@context/Web3Context";
import { PhotographIcon } from "@heroicons/react/solid";
import { useState, useRef, useEffect } from "react";
import { ClapSpinner, StageSpinner } from "react-spinners-kit";
import { create as IpfsHttpClient } from "ipfs-http-client";
import { ethers } from "ethers";
import BaseLayout from "@components/BaseLayout";
import Head from "next/head";
import { SET_SELECTED_HEADER_LINK } from "@features/navSlice";
import { useDispatch } from "react-redux";

export default function Create() {
  const client = IpfsHttpClient("http://ipfs.infura.io:5001/api/v0");

  /* FORM FIELDS & DATA */
  const [price, setPrice] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  /* FILE PICKER & FILE DATA */
  const filePickerRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  /* CONTRACTS RELATED DATA */
  const { contractApi, accountApi } = useWeb3();
  const { NFTContract, MarketplaceContract, isLoading } = contractApi;
  const { signer } = accountApi;
  const contractsLoaded =
    !isLoading && NFTContract != null && MarketplaceContract != null;

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const retrieveSelectedImage = (e) => {
    const reader = new FileReader();
    // If we've selected a file
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
      setImage(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      // URL of the image
      setSelectedFile(readerEvent.target.result);
    };
  };

  const uploadToIPFS = async (event) => {
    event.preventDefault();

    setLoading(true);
    if (typeof image !== undefined) {
      try {
        const result = await client.add(image);
        let ipfsImgRef = "https://ipfs.infura.io/ipfs/" + `${result.path}`;
        console.log("IMAGE ADDED TO IPFS");
        await createNFT(ipfsImgRef);
      } catch (e) {
        console.log("IPFS Image Upload Error", e);
        setLoading(false);
      }
    } else {
      console.log("NO FILE SELECTED");
      setLoading(false);
    }
  };

  const createNFT = async (ipfsImgRef) => {
    try {
      console.log("ipfsImageReference", ipfsImgRef);
      const result = await client.add(
        JSON.stringify({ name, description, image: ipfsImgRef })
      );
      mintThenList(result);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  };

  const mintThenList = async (result) => {
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`;
    // Creating the ERC721 token

    try {
      await (await NFTContract.connect(signer).mint(uri)).wait();
    } catch (e) {
      console.log(e);
      setLoading(false);
      return;
    }

    // Get tokenId of the new NFT
    const id = await NFTContract.tokenCount();
    // Authorize marketplace to manage (list, remove) our NFTs
    try {
      await (
        await NFTContract.connect(signer).setApprovalForAll(
          MarketplaceContract.address,
          true
        )
      ).wait();
    } catch (e) {
      console.log(e);
      setLoading(false);
      return;
    }

    // Add NFT to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    try {
      await (
        await MarketplaceContract.connect(signer).createItem(
          NFTContract.address,
          id,
          listingPrice
        )
      ).wait();
    } catch (e) {
      console.log(e);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  useEffect(() => {
    dispatch(SET_SELECTED_HEADER_LINK(1));
  }, []);

  return (
    <BaseLayout>
      <Head>
        <title>Create Elixir NFT</title>
      </Head>
      {contractsLoaded ? (
        <div className="relative w-full">
          <form className="flex flex-col">
            <div className="flex flex-col items-start mx-10 md:w-2/3">
              {/* NAME OF THE NFT TOKEN */}
              <label
                htmlFor="name"
                className="text-[#5c5e62] font-semibold text-[17px]">
                Name
              </label>
              <TokenInput
                value={name}
                id="name"
                setValue={setName}
                placeholder="Name of the NFT token"
              />
              {/* PRICE OF THE NFT TOKEN */}
              <label
                htmlFor="price"
                className="text-[#5c5e62] font-semibold text-[17px] ">
                Price
              </label>
              <TokenInput
                value={price}
                id="price"
                setValue={setPrice}
                placeholder="Enter price in ETH (1...50 ETH)"
              />
              {/* DESCRIPTION OF THE NFT TOKEN */}
              <label
                htmlFor="desc"
                className="text-[#5c5e62] font-semibold text-[17px] ">
                Description
              </label>
              <TokenInput
                value={description}
                id="desc"
                setValue={setDescription}
                placeholder="Enter the NFT's description"
              />
              {/* IMAGE OF THE NFT */}
              <label
                htmlFor="image"
                className="text-[#5c5e62] font-semibold text-[17px] ">
                Image
              </label>
              <div className="flex space-x-2 mt-1.5">
                <PhotographIcon
                  className={`h-7 ${
                    selectedFile ? `text-emerald-500` : `text-white/60`
                  } `}
                />
                <button
                  className="text-slate-200"
                  type="button"
                  onClick={() => filePickerRef.current.click()}>
                  {selectedFile ? "File chosen" : `Choose file`}
                </button>
              </div>

              <input
                type="file"
                className="hidden"
                ref={filePickerRef}
                onChange={retrieveSelectedImage}
              />

              {/* SUBMIT BUTTON */}
              <div className="mt-6">
                <button
                  type="submit"
                  onClick={(event) => {
                    uploadToIPFS(event);
                  }}
                  disabled={
                    selectedFile == null ||
                    !name.trim() ||
                    price < 0 ||
                    price > 50 ||
                    !description.trim() ||
                    loading ||
                    signer == null
                  }
                  className="inline-block py-2 text-xl text-white text-[16.5px] transition duration-150  bg-[#16151C] px-5 rounded-xl disabled:cursor-not-allowed  disabled:text-white/25">
                  {loading ? (
                    <div className="p-2">
                      <ClapSpinner size={16} />
                    </div>
                  ) : (
                    "Create & List NFT"
                  )}
                </button>
              </div>
            </div>

            {selectedFile && (
              <div className="flex w-full items-center justify-center mt-5">
                <img
                  className="h-48 w-48 lg:h-56 lg:w-56 md:absolute md:right-0 lg:right-12 md:top-6 rounded-lg"
                  src={selectedFile}
                  alt=""
                />
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="flex h-screen w-full items-center justify-center">
          <StageSpinner size={44} color="#00FF89" />
        </div>
      )}
    </BaseLayout>
  );
}
