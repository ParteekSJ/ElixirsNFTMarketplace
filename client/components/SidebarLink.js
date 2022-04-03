import React from "react";

export default function SidebarLink({ text, Icon, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`text-[#d9d9d9] flex items-center justify-center xl:justify-start text-xl space-x-3 hoverAnimation ${
        active && "font-semibold bg-emerald-500/40"
      }`}>
      <Icon className="h-7" />
      <span className="hidden xl:inline">{text}</span>
    </div>
  );
}
