"use client";

import { Toggle } from "../sidebar/toggle";
import { Actions } from "./actions";
import { Logo } from "./logo";
import { Search } from "./search";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full h-16 z-[49] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Toggle />
          <div className="hidden md:block">
            <Logo />
          </div>
        </div>

        {/* Center Section */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <Search />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Actions />
        </div>
      </div>
    </nav>
  );
};
