import BaseLayout from "@components/BaseLayout";
import EmptyCollection from "@components/EmptyCollection";
import ListedTokenDisplay from "@components/ListedTokenDisplay";
import { useWeb3 } from "@context/Web3Context";
import { SET_SELECTED_HEADER_LINK } from "@features/navSlice";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { StageSpinner } from "react-spinners-kit";

export default function Listings() {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);

  /* CONTRACTS RELATED DATA */
  const { contractApi, accountApi } = useWeb3();
  const { NFTContract, MarketplaceContract, isLoading } = contractApi;
  const { account, signer } = accountApi;
  const dataLoaded =
    !isLoading &&
    NFTContract != null &&
    MarketplaceContract != null &&
    signer != null &&
    account != null;

  const loadListedItems = async () => {
    setLoading(true);
    const itemCount = parseInt(await MarketplaceContract.itemCount());
    let listedItems = [];
    let soldItems = [];

    for (let i = 1; i <= itemCount; i++) {
      const item = await MarketplaceContract.marketplaceItems(i);
      // Get listed items
      if (item.seller === account) {
        const uri = await NFTContract.tokenURI(item.tokenId);
        // Use URI to fetch the NFT metadata stored on IPFS
        const response = await fetch(uri);
        const metadata = await response.json();
        // Get total price of the item (item price + listing fee)
        const totalPrice = await MarketplaceContract.getTotalPrice(item.itemId);
        let fetchedItem = {
          totalPrice,
          price: item.price,
          itemId: item.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };

        item.sold ? soldItems.push(fetchedItem) : listedItems.push(fetchedItem);
      }
    }
    setListedItems(listedItems);
    setSoldItems(soldItems);
  };

  useEffect(() => {
    dispatch(SET_SELECTED_HEADER_LINK(3));
    dataLoaded &&
      loadListedItems().then(() => {
        setLoading(false);
      });
  }, [contractApi]);

  return (
    <BaseLayout>
      <Head>
        <title>My Listed NFTs</title>
      </Head>
      <div className="h-full w-full px-2 py-3">
        {loading ? (
          <div className="flex h-screen w-full items-center justify-center">
            <StageSpinner size={44} color="#00FF89" />
          </div>
        ) : (
          <div className="w-full h-full">
            {/* LISTED ITEMS */}
            <h1 className="text-[32px] font-semibold text-center sm:text-left ml-5">
              LISTED ITEMS
            </h1>
            <div className="grid place-items-center grid-cols-1 sm:place-items-start sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 space-x-5">
              {listedItems.length > 0 &&
                listedItems.map((item, idx) => {
                  return <ListedTokenDisplay key={idx} item={item} />;
                })}
            </div>
            {listedItems.length == 0 && (
              <EmptyCollection title="NO ITEMS LISTED ON THE MARKETPLACE 📝" />
            )}
            {/* SOLD ITEMS */}
            <h1 className="text-[32px] font-semibold text-center sm:text-left ml-5">
              SOLD ITEMS
            </h1>
            <div className="grid place-items-center grid-cols-1 sm:place-items-start sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 space-x-5">
              {soldItems.length > 0 &&
                soldItems.map((item, idx) => {
                  return <ListedTokenDisplay key={idx} item={item} sold />;
                })}
            </div>
            {soldItems.length == 0 && (
              <EmptyCollection title="NO ITEMS SOLD 📉" />
            )}
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
