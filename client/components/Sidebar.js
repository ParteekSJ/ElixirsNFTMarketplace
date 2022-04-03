import React from "react";
import SidebarLink from "./SidebarLink";
import { useSelector } from "react-redux";
import {
  HomeIcon,
  CloudUploadIcon,
  CreditCardIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/outline";
import { useDispatch } from "react-redux";
import { SET_SELECTED_HEADER_LINK } from "@features/navSlice";
import { useRouter } from "next/router";

export default function Sidebar() {
  const { selectedNavItem } = useSelector((state) => ({ ...state.nav }));
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <div className="hidden sm:flex flex-col items-center xl:items-start xl:w-[340px] p-2 fixed h-full">
      {/* SIDEBAR LINKS */}
      <div className="space-y-2.5 mt-4 mb-2.5 xl:ml-24">
        <SidebarLink
          text="Home"
          Icon={HomeIcon}
          active={selectedNavItem == 0}
          onClick={() => {
            dispatch(SET_SELECTED_HEADER_LINK(0));
            router.push("/");
          }}
        />
        <SidebarLink
          text="Create"
          Icon={CloudUploadIcon}
          active={selectedNavItem == 1}
          onClick={() => {
            dispatch(SET_SELECTED_HEADER_LINK(1));
            router.push("/create");
          }}
        />
        <SidebarLink
          text="Purchases"
          Icon={CreditCardIcon}
          active={selectedNavItem == 2}
          onClick={() => {
            dispatch(SET_SELECTED_HEADER_LINK(2));
            router.push("/purchases");
          }}
        />
        <SidebarLink
          text="Listings"
          Icon={PresentationChartLineIcon}
          active={selectedNavItem == 3}
          onClick={() => {
            dispatch(SET_SELECTED_HEADER_LINK(3));
            router.push("/listings");
          }}
        />
      </div>
    </div>
  );
}
