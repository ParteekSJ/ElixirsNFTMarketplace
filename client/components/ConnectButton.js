import React, { useContext } from "react";

export default function ConnectButton() {
  return (
    <button
      onClick={async () => {
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });
      }}
      className="inline-flex items-center justify-center w-full px-6 py-3 mb-2 text-lg text-white bg-emerald-500 rounded-md hover:bg-emerald-400 sm:w-auto sm:mb-0">
      Connect Wallet
    </button>
  );
}
