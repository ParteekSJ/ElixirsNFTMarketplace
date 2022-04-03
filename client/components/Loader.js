import React from "react";
import { RotateSpinner } from "react-spinners-kit";

export default function Loader() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#26282F]">
      <RotateSpinner size={65} color="#00FF89" />
    </div>
  );
}
