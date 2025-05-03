
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface UserSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  placeholderText?: string;
}

export function UserSearchBar({ 
  searchTerm, 
  setSearchTerm, 
  handleSearch,
  placeholderText = "Buscar por email, nome do plano ou ID..."
}: UserSearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={placeholderText}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <Button onClick={handleSearch}>Buscar</Button>
      {searchTerm && (
        <Button 
          variant="outline"
          onClick={() => {
            setSearchTerm('');
            handleSearch();
          }}
        >
          Limpar
        </Button>
      )}
    </div>
  );
}
