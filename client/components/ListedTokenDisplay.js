import { ethers } from "ethers";
import React from "react";

export default function ListedTokenDisplay({ item, sold, owned }) {
  return (
    <div className="w-[250px] h-auto rounded-[11px] cursor-pointer mx-5 my-4 bg-[#2B2E43] p-4">
      <div className="flex flex-col text-white">
        <img className="rounded-lg" src={item.image} alt="" />
        <div className="flex justify-between items-center my-3">
          <div className="flex flex-col">
            <span className="font-semibold text-[17.5px]">{item.name}</span>
            <span className="font-thin text-[15px]">{item.desc}</span>
          </div>
        </div>
        {!sold ? (
          <div
            className={`${
              owned && "hidden"
            } flex bg-emerald-500 hover:bg-emerald-700 py-2 rounded-xl my-3 transition-all ease-in-out duration-150 cursor-default items-center`}>
            <span className="mx-auto">
              Listed for {ethers.utils.formatEther(item.totalPrice.toString())}{" "}
              ETH
            </span>
          </div>
        ) : (
          <div
            className={` ${
              owned && "hidden"
            } flex bg-red-500 hover:bg-red-600  py-2 rounded-xl my-3 transition-all ease-in-out duration-150 cursor-default items-center`}>
            <span className="mx-auto">
              Sold for {ethers.utils.formatEther(item.price.toString())} ETH
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
