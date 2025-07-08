"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { SearchIcon, X, Mic, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Search = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [searchType, setSearchType] = useState<"all" | "users" | "streams" | "topics">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmedValue = value.trim();
      if (!trimmedValue) return;

      const url = qs.stringifyUrl(
        {
          url: "/search",
          query: { 
            term: trimmedValue,
            type: searchType !== "all" ? searchType : undefined,
          },
        },
        { skipEmptyString: true },
      );

      router.push(url);
    },
    [router, value, searchType],
  );

  const onClear = useCallback(() => {
    setValue("");
    inputRef.current?.focus();
  }, []);

  const toggleVoiceSearch = useCallback(() => {
    setIsListening(!isListening);
    // Here you would implement actual voice search functionality
    if (!isListening) {
      // Start listening
      console.log("Starting voice search...");
    } else {
      // Stop listening
      console.log("Stopping voice search...");
    }
  }, [isListening]);

  // Handle Escape key to clear search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && value) {
        onClear();
      }
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [value, onClear]);

  return (
    <form
      onSubmit={onSubmit}
      className="relative flex items-center w-full max-w-lg lg:w-[500px] group"
      role="search"
      aria-label="Site Search"
    >
      <div className="relative flex-1">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search users, streams, topics..."
            className="pl-10 pr-20 rounded-r-none bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 group-hover:bg-background/70"
            aria-label="Search input"
          />
          
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
              aria-label="Search filter"
            >
              <Filter className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => setSearchType("all")}
              className={searchType === "all" ? "bg-muted/50" : ""}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              All
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSearchType("users")}
              className={searchType === "users" ? "bg-muted/50" : ""}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              Users
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSearchType("streams")}
              className={searchType === "streams" ? "bg-muted/50" : ""}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              Streams
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSearchType("topics")}
              className={searchType === "topics" ? "bg-muted/50" : ""}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              Topics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Voice Search Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleVoiceSearch}
        className="rounded-none border-l-0 h-9 px-2 hover:bg-muted/50 transition-colors"
        aria-label="Voice search"
      >
        <Mic className={`h-3 w-3 ${isListening ? "text-red-500 animate-pulse" : ""}`} />
      </Button>

      {/* Search Button */}
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="rounded-l-none border-l-0 h-9 px-3 hover:bg-primary hover:text-primary-foreground transition-colors"
        disabled={!value.trim()}
        aria-label="Submit search"
      >
        <SearchIcon className="h-3 w-3" />
      </Button>

      {/* Search Type Badge */}
      {searchType !== "all" && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5"
        >
          {searchType}
        </Badge>
      )}

      {/* Keyboard Shortcut Hint */}
      <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground opacity-0 group-focus-within:opacity-100 transition-opacity">
        Press Ctrl+K to search
      </div>
    </form>
  );
};
