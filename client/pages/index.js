import BaseLayout from "@components/BaseLayout";
import EmptyCollection from "@components/EmptyCollection";
import TokenDisplay from "@components/TokenDisplay";
import { useWeb3 } from "@context/Web3Context";
import { useEffect, useState, useMemo } from "react";
import { StageSpinner } from "react-spinners-kit";
import { useDispatch } from "react-redux";
import {
  SET_IS_PURCHASING,
  SET_PURCHASING_ITEM,
} from "@features/purchaseSlice";
import Head from "next/head";
import { SET_SELECTED_HEADER_LINK } from "@features/navSlice";

export default function Home() {
  const [marketItems, setMarketItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { contractApi, accountApi } = useWeb3();
  const { NFTContract, MarketplaceContract, isLoading } = contractApi;
  const fetchCondition =
    !isLoading && NFTContract != null && MarketplaceContract != null;

  const { signer } = accountApi;
  const [refetch, setRefetch] = useState(false);

  const dispatch = useDispatch();

  const loadMarketplaceItems = async () => {
    setLoading(true);
    let itemCount = await MarketplaceContract.itemCount();
    let converted_itemCount = parseInt(itemCount);
    let items = [];

    for (let i = 1; i <= converted_itemCount; i++) {
      const item = await MarketplaceContract.marketplaceItems(i);
      if (!item.sold) {
        // Get URI from smart contract
        const uri = await NFTContract.tokenURI(item.tokenId);
        // Use URI to fetch the NFT Metadata stored on IPFS
        const response = await fetch(uri);
        const metadata = await response.json();
        // Get the total price of the item (price + fee)
        const totalPrice = await MarketplaceContract.getTotalPrice(item.itemId);
        // Add item to `items` array
        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        });
      }
    }

    // All unsold items have been fetched
    setMarketItems(items);
    setLoading(false);
  };

  const purchaseMarketItem = async (item) => {
    dispatch(SET_IS_PURCHASING(true));
    try {
      await (
        await MarketplaceContract.connect(signer).purchaseItem(item.itemId, {
          value: item.totalPrice,
        })
      ).wait();
    } catch (e) {
      console.log("Purchasing Error", e);
      dispatch(SET_IS_PURCHASING(false));
      return;
    }

    dispatch(SET_IS_PURCHASING(false));
    setRefetch(!refetch);
  };

  useEffect(() => {
    dispatch(SET_SELECTED_HEADER_LINK(0));
    fetchCondition && loadMarketplaceItems();
  }, [contractApi, refetch]);

  return (
    <BaseLayout>
      <Head>
        <title>Elixir NFT Marketplace</title>
      </Head>
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <StageSpinner size={44} color="#00FF89" />
        </div>
      ) : (
        <div className="w-full h-full">
          {marketItems.length > 0 ? (
            <div className="grid place-items-center grid-cols-1 sm:place-items-start sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 space-x-5">
              {marketItems.map((item, idx) => {
                return (
                  <TokenDisplay
                    key={idx}
                    index={idx}
                    item={item}
                    buyNow={() => {
                      purchaseMarketItem(item);
                      dispatch(SET_PURCHASING_ITEM(idx));
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyCollection title="NO NFTS IN THE MARKETPLACE. START CREATING 👨‍💻" />
          )}
        </div>
      )}
    </BaseLayout>
  );
}
