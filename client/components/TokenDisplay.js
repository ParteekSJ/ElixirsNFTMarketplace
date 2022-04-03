import { useWeb3 } from "@context/Web3Context";
import { ethers } from "ethers";
import React from "react";
import { useSelector } from "react-redux";
import { ClapSpinner } from "react-spinners-kit";

export default function TokenDisplay({ item, buyNow, index }) {
  const { isPurchasing, idx } = useSelector((state) => ({ ...state.purchase }));
  const { accountApi } = useWeb3();
  const { signer } = accountApi;

  return (
    <div className="w-[250px] h-auto rounded-[11px] cursor-pointer mx-5 my-4 bg-[#2B2E43] p-4">
      <div className="flex flex-col text-white">
        <img className="rounded-lg" src={item.image} alt="" />
        <div className="flex justify-between items-center space-x-4  my-0.5">
          <div className="flex flex-col">
            <span className="font-semibold text-[17.5px]">{item.name}</span>
            <span className="font-thin text-[15px]">{item.description}</span>
          </div>
          <div>
            <span className="font-semibold">
              {ethers.utils.formatEther(item.totalPrice.toString())}
              {` `} ETH
            </span>
          </div>
        </div>
        {signer && (
          <button
            onClick={buyNow}
            className="bg-emerald-500 cursor-pointer hover:bg-emerald-700 px-1 py-2 rounded-xl my-3 transition-all ease-in-out duration-150">
            {isPurchasing && idx == index ? (
              <div className="flex items-center justify-center">
                <ClapSpinner size={16} frontColor="#fff" />
              </div>
            ) : (
              "Buy Now"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
