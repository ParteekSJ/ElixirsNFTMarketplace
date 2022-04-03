import React from "react";

export default function AccountAddress({ address }) {
  let firstFour = address.substring(0, 5);
  let lastFour = address.substring(address.length - 5);

  return (
    <div className="text-[18px] bg-neutral-800 p-3 rounded-lg">
      <span>{firstFour}</span>
      <span>....</span>
      <span>{lastFour}</span>
    </div>
  );
}
