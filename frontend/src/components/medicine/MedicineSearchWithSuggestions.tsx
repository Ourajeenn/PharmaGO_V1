import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Pill } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MedicineSearchProps {
  onSearch: (term: string) => void;
  onSelect?: (medicine: string) => void;
  className?: string;
  placeholder?: string;
}

const MedicineSearchWithSuggestions = ({ onSearch, onSelect, className, placeholder }: MedicineSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mock medicines database - in production, this would come from API
  const medicines = [
    "Doliprane 1000mg",
    "Doliprane 500mg",
    "Spasfon",
    "Amoxicilline 500mg",
    "Amoxicilline 1g",
    "Imodium",
    "Oscillococcinum",
    "Spray nasal",
    "Paracétamol",
    "Ibuprofène",
    "Aspirine",
    "Efferalgan",
    "Dafalgan",
    "Advil",
    "Smecta",
    "Gaviscon"
  ];

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 1) {
        const filtered = medicines.filter(med =>
          med.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (medicine: string) => {
    setSearchTerm(medicine);
    setShowSuggestions(false);
    onSearch(medicine);
    if (onSelect) {
      onSelect(medicine);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className || ''}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder || "Rechercher un médicament..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="pl-10"
        />
      </div>

      {showSuggestions && (
        <Card className="absolute z-50 w-full mt-2 p-2 shadow-lg">
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors flex items-center gap-2"
              >
                <Pill className="h-4 w-4 text-primary" />
                <span className="text-sm">{suggestion}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MedicineSearchWithSuggestions;
