import BaseLayout from "@components/BaseLayout";
import ListedTokenDisplay from "@components/ListedTokenDisplay";
import { useWeb3 } from "@context/Web3Context";
import { SET_SELECTED_HEADER_LINK } from "@features/navSlice";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { StageSpinner } from "react-spinners-kit";

export default function Purchases() {
  const dispatch = useDispatch();

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

  const [loading, setLoading] = useState(false);
  const [ownedItems, setOwnedItems] = useState([]);

  const loadOwnedItems = async () => {
    setLoading(true);
    // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
    const filter = MarketplaceContract.filters.MarketItemPurchased(
      null,
      null,
      null,
      null,
      account,
      null
    );
    const results = await MarketplaceContract.queryFilter(filter);

    //Fetch metadata of each nft and add that to listedItem object.
    const purchases = await Promise.all(
      results.map(async (i) => {
        // fetch arguments from each result
        i = i.args;
        // get uri url from nft contract
        const uri = await NFTContract.tokenURI(i.tokenId);
        // use uri to fetch the nft metadata stored on ipfs
        const response = await fetch(uri);
        const metadata = await response.json();
        // get total price of item (item price + fee)
        const totalPrice = await MarketplaceContract.getTotalPrice(i.itemId);
        // define listed item object
        let purchasedItem = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
        return purchasedItem;
      })
    );

    setOwnedItems(purchases);
    setLoading(false);
  };

  useEffect(() => {
    dispatch(SET_SELECTED_HEADER_LINK(2));
    dataLoaded && loadOwnedItems();
  }, [contractApi]);

  return (
    <BaseLayout>
      <Head>
        <title>My Purchases</title>
      </Head>
      <div className="h-full w-full px-2 py-3">
        {loading ? (
          <div className="flex h-screen w-full items-center justify-center">
            <StageSpinner size={44} color="#00FF89" />
          </div>
        ) : (
          <div className="w-full h-full">
            {/* OWNED ITEMS */}
            <h1 className="text-[32px] font-semibold text-center sm:text-left ml-5">
              OWNED ITEMS
            </h1>
            <div className="grid place-items-center grid-cols-1 sm:place-items-start sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 space-x-5">
              {ownedItems.length > 0 &&
                ownedItems.map((item, idx) => {
                  return <ListedTokenDisplay key={idx} item={item} owned />;
                })}
            </div>
            {ownedItems.length == 0 && (
              <div className="flex items-center justify-center mx-9 my-4 bg-black/20 py-5 px-3 rounded-lg">
                <div className="flex flex-col text-center md:flex-row space-x-2">
                  <span className="text-[26px]">NOTHING OWNED.</span>
                  <div className="flex">
                    <span className="text-[26px]">START SHOPPING 🛍️</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
