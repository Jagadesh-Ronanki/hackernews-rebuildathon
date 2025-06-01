'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Filter,
  SortAsc,
  LayoutGrid,
  Plus,
  X,
  Text,
  ListFilter,
  ArrowUpDown,
  ArrowDownUp,
  List,
  Grid3X3,
  AlignJustify
} from 'lucide-react'

type SortType = 'default' | 'points' | 'comments' | 'newest' | 'oldest';
type ViewMode = 'normal' | 'compact' | 'card';

interface StoryFiltersProps {
  onSortChange: (sort: SortType) => void;
  onDomainFilterChange: (domain: string) => void;
  onKeywordFilterChange: (keyword: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onFontSizeChange: (size: 'small' | 'normal' | 'large') => void;
  sortBy: SortType;
  domainFilter: string;
  keywordFilter: string;
  viewMode: ViewMode;
  fontSize: 'small' | 'normal' | 'large';
}

export function StoryFilters({
  onSortChange,
  onDomainFilterChange,
  onKeywordFilterChange,
  onViewModeChange,
  onFontSizeChange,
  sortBy = 'default',
  domainFilter = '',
  keywordFilter = '',
  viewMode = 'normal',
  fontSize = 'normal'
}: StoryFiltersProps) {
  const [savedDomains, setSavedDomains] = useState<string[]>([]);
  const [savedKeywords, setSavedKeywords] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    const savedDomains = localStorage.getItem('hn-saved-domains');
    if (savedDomains) {
      setSavedDomains(JSON.parse(savedDomains));
    }

    const savedKeywords = localStorage.getItem('hn-saved-keywords');
    if (savedKeywords) {
      setSavedKeywords(JSON.parse(savedKeywords));
    }
  }, []);

  const saveDomain = () => {
    if (!newDomain || savedDomains.includes(newDomain)) return;
    const updatedDomains = [...savedDomains, newDomain];
    setSavedDomains(updatedDomains);
    localStorage.setItem('hn-saved-domains', JSON.stringify(updatedDomains));
    setNewDomain('');
  }

  const saveKeyword = () => {
    if (!newKeyword || savedKeywords.includes(newKeyword)) return;
    const updatedKeywords = [...savedKeywords, newKeyword];
    setSavedKeywords(updatedKeywords);
    localStorage.setItem('hn-saved-keywords', JSON.stringify(updatedKeywords));
    setNewKeyword('');
  }

  const removeDomain = (domain: string) => {
    const updatedDomains = savedDomains.filter(d => d !== domain);
    setSavedDomains(updatedDomains);
    localStorage.setItem('hn-saved-domains', JSON.stringify(updatedDomains));
  }

  const removeKeyword = (keyword: string) => {
    const updatedKeywords = savedKeywords.filter(k => k !== keyword);
    setSavedKeywords(updatedKeywords);
    localStorage.setItem('hn-saved-keywords', JSON.stringify(updatedKeywords));
  }

  const handleSortChange = (value: SortType) => {
    onSortChange(value);
    localStorage.setItem('hn-sort-preference', value);
  }

  const handleViewModeChange = (value: ViewMode) => {
    onViewModeChange(value);
    localStorage.setItem('hn-view-mode', value);
  }

  const handleFontSizeChange = (value: 'small' | 'normal' | 'large') => {
    onFontSizeChange(value);
    localStorage.setItem('hn-font-size', value);
  }

  return (
    <TooltipProvider>
      {/* Desktop/top filter bar */}
      <div className="hidden sm:flex items-center justify-end gap-1 mb-3">
        {/* Sort Button */}
        <Popover>
          <Tooltip>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={`h-8 w-8 p-0 transition-all duration-200 ${
                  sortBy !== 'default' 
                    ? 'bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' 
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/10'
                }`}
              >
                {sortBy === 'default' && <ArrowUpDown className="w-4 h-4" />}
                {sortBy === 'points' && <SortAsc className="w-4 h-4" />}
                {sortBy === 'comments' && <ListFilter className="w-4 h-4" />}
                {sortBy === 'newest' && <ArrowDownUp className="w-4 h-4" />}
                {sortBy === 'oldest' && <ArrowUpDown className="w-4 h-4" />}
              </Button>
            </PopoverTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Sort: {sortBy === 'default' ? 'Default' : 
                sortBy === 'points' ? 'Most Points' :
                sortBy === 'comments' ? 'Most Comments' :
                sortBy === 'newest' ? 'Newest' : 'Oldest'}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-36 p-1" align="end">
            <div className="space-y-0.5">
              {[
                { value: 'default', label: 'Default', icon: ArrowUpDown },
                { value: 'points', label: 'Points', icon: SortAsc },
                { value: 'comments', label: 'Comments', icon: ListFilter },
                { value: 'newest', label: 'Newest', icon: ArrowDownUp },
                { value: 'oldest', label: 'Oldest', icon: ArrowUpDown }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  className={`w-full px-2 py-1.5 text-left rounded-md text-xs flex items-center gap-2 transition-colors ${
                    sortBy === value 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium' 
                      : 'hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                  onClick={() => handleSortChange(value as SortType)}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Filter Button */}
        {(domainFilter || keywordFilter) ? (
          // Show clear button when filters are active
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 transition-all duration-200 bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                onClick={() => {
                  onDomainFilterChange('');
                  onKeywordFilterChange('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Clear Filters</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          // Show filter popover when no filters are active
          <Popover>
            <Tooltip>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 transition-all duration-200 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/10"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Filter Stories</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64 p-2.5" align="end">
              <div className="space-y-3">
                {/* Domain Filter */}
                <div>
                  <Label htmlFor="domain-filter" className="text-xs font-medium">
                    Filter by Domain
                  </Label>
                  <div className="flex gap-1.5 mt-1">
                    <Input
                      id="domain-filter"
                      placeholder="e.g., github.com"
                      value={domainFilter}
                      onChange={(e) => onDomainFilterChange(e.target.value)}
                      className="h-7 text-xs"
                    />
                    <Button 
                      size="sm"
                      variant="outline"
                      className="px-1.5 h-7 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/10 dark:hover:text-orange-400 transition-colors"
                      onClick={() => onDomainFilterChange('')}
                      disabled={!domainFilter}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Keyword Filter */}
                <div>
                  <Label htmlFor="keyword-filter" className="text-xs font-medium">
                    Filter by Keyword
                  </Label>
                  <div className="flex gap-1.5 mt-1">
                    <Input
                      id="keyword-filter"
                      placeholder="e.g., javascript, react"
                      value={keywordFilter}
                      onChange={(e) => onKeywordFilterChange(e.target.value)}
                      className="h-7 text-xs"
                    />
                    <Button 
                      size="sm"
                      variant="outline"
                      className="px-1.5 h-7 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/10 dark:hover:text-orange-400 transition-colors"
                      onClick={() => onKeywordFilterChange('')}
                      disabled={!keywordFilter}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Saved Filters Toggle */}
                <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      Saved Filters
                      <Switch
                        checked={showSavedFilters}
                        onCheckedChange={setShowSavedFilters}
                        className="data-[state=checked]:bg-orange-500 dark:data-[state=checked]:bg-orange-600 scale-75"
                      />
                    </Label>
                  </div>

                  {showSavedFilters && (
                    <div className="mt-2 space-y-3">
                      {/* Saved Domains */}
                      <div>
                        <Label htmlFor="saved-domain" className="text-xs text-gray-500 dark:text-gray-400">
                          Save Domain Filter
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="saved-domain"
                            placeholder="Enter domain to save"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            className="h-7 text-xs"
                          />
                          <Button 
                            size="sm"
                            variant="outline"
                            className="px-1.5 h-7 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/10 dark:hover:text-orange-400 transition-colors"
                            onClick={saveDomain}
                            disabled={!newDomain}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {savedDomains.map((domain) => (
                            <Badge 
                              key={domain} 
                              variant="outline" 
                              className="flex items-center gap-1 text-xs cursor-pointer pl-2 pr-1 py-0.5 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                              onClick={() => onDomainFilterChange(domain)}
                            >
                              {domain}
                              <button 
                                className="opacity-70 hover:opacity-100" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeDomain(domain);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {savedDomains.length === 0 && (
                            <span className="text-xs text-gray-400 italic">No saved domains</span>
                          )}
                        </div>
                      </div>

                      {/* Saved Keywords */}
                      <div>
                        <Label htmlFor="saved-keyword" className="text-xs text-gray-500 dark:text-gray-400">
                          Save Keyword Filter
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="saved-keyword"
                            placeholder="Enter keyword to save"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            className="h-7 text-xs"
                          />
                          <Button 
                            size="sm"
                            variant="outline"
                            className="px-1.5 h-7 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/10 dark:hover:text-orange-400 transition-colors"
                            onClick={saveKeyword}
                            disabled={!newKeyword}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {savedKeywords.map((keyword) => (
                            <Badge 
                              key={keyword} 
                              variant="outline" 
                              className="flex items-center gap-1 text-xs cursor-pointer pl-2 pr-1 py-0.5 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                              onClick={() => onKeywordFilterChange(keyword)}
                            >
                              {keyword}
                              <button 
                                className="opacity-70 hover:opacity-100" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeKeyword(keyword);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {savedKeywords.length === 0 && (
                            <span className="text-xs text-gray-400 italic">No saved keywords</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Font Size Button */}
        <Popover>
          <Tooltip>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={`h-8 w-8 p-0 transition-all duration-200 ${
                  fontSize !== 'normal' 
                    ? 'bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' 
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/10'
                }`}
              >
                {fontSize === 'small' && <Text className="w-3 h-3" />}
                {fontSize === 'normal' && <Text className="w-4 h-4" />}
                {fontSize === 'large' && <Text className="w-5 h-5" />}
              </Button>
            </PopoverTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Font Size: {fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-32 p-1" align="end">
            <div className="space-y-0.5">
              {[
                { value: 'small', label: 'Small', size: 'w-3 h-3' },
                { value: 'normal', label: 'Normal', size: 'w-4 h-4' },
                { value: 'large', label: 'Large', size: 'w-5 h-5' }
              ].map(({ value, label, size }) => (
                <button
                  key={value}
                  className={`w-full px-2 py-1.5 text-left rounded-md text-xs flex items-center gap-2 transition-colors ${
                    fontSize === value 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium' 
                      : 'hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                  onClick={() => handleFontSizeChange(value as 'small' | 'normal' | 'large')}
                >
                  <Text className={size} /> {label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* View Mode Button */}
        <Popover>
          <Tooltip>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={`h-8 w-8 p-0 transition-all duration-200 ${
                  viewMode !== 'normal' 
                    ? 'bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' 
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/10'
                }`}
              >
                {viewMode === 'normal' && <AlignJustify className="w-4 h-4" />}
                {viewMode === 'compact' && <List className="w-4 h-4" />}
                {viewMode === 'card' && <Grid3X3 className="w-4 h-4" />}
              </Button>
            </PopoverTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">View Mode: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-32 p-1" align="end">
            <div className="space-y-0.5">
              {[
                { value: 'normal', label: 'Normal', icon: AlignJustify },
                { value: 'compact', label: 'Compact', icon: List },
                { value: 'card', label: 'Cards', icon: Grid3X3 }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  className={`w-full px-2 py-1.5 text-left rounded-md text-xs flex items-center gap-2 transition-colors ${
                    viewMode === value 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium' 
                      : 'hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                  onClick={() => handleViewModeChange(value as ViewMode)}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile/bottom filter bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex sm:hidden items-center justify-around bg-orange-50/95 dark:bg-orange-900/80 backdrop-blur-md border-t border-orange-200 dark:border-orange-800 py-1 px-2">
        {/* Sort Button */}
        <Popover>
          <Tooltip>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={`h-7 w-7 p-0 transition-all duration-200 ${
                  sortBy !== 'default' 
                    ? 'bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' 
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/10'
                }`}
              >
                {sortBy === 'default' && <ArrowUpDown className="w-3.5 h-3.5" />}
                {sortBy === 'points' && <SortAsc className="w-3.5 h-3.5" />}
                {sortBy === 'comments' && <ListFilter className="w-3.5 h-3.5" />}
                {sortBy === 'newest' && <ArrowDownUp className="w-3.5 h-3.5" />}
                {sortBy === 'oldest' && <ArrowUpDown className="w-3.5 h-3.5" />}
              </Button>
            </PopoverTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Sort: {sortBy === 'default' ? 'Default' : 
                sortBy === 'points' ? 'Most Points' :
                sortBy === 'comments' ? 'Most Comments' :
                sortBy === 'newest' ? 'Newest' : 'Oldest'}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-36 p-1" align="end">
            <div className="space-y-0.5">
              {[
                { value: 'default', label: 'Default', icon: ArrowUpDown },
                { value: 'points', label: 'Points', icon: SortAsc },
                { value: 'comments', label: 'Comments', icon: ListFilter },
                { value: 'newest', label: 'Newest', icon: ArrowDownUp },
                { value: 'oldest', label: 'Oldest', icon: ArrowUpDown }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  className={`w-full px-2 py-1.5 text-left rounded-md text-xs flex items-center gap-2 transition-colors ${
                    sortBy === value 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium' 
                      : 'hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                  onClick={() => handleSortChange(value as SortType)}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Filter Button */}
        {(domainFilter || keywordFilter) ? (
          // Show clear button when filters are active
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 p-0 transition-all duration-200 bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                onClick={() => {
                  onDomainFilterChange('');
                  onKeywordFilterChange('');
                }}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Clear Filters</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          // Show filter popover when no filters are active
          <Popover>
            <Tooltip>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 p-0 transition-all duration-200 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/10"
                >
                  <Filter className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Filter Stories</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64 p-2.5" align="end">
              <div className="space-y-3">
                {/* Domain Filter */}
                <div>
                  <Label htmlFor="domain-filter" className="text-xs font-medium">
                    Filter by Domain
                  </Label>
                  <div className="flex gap-1.5 mt-1">
                    <Input
                      id="domain-filter"
                      placeholder="e.g., github.com"
                      value={domainFilter}
                      onChange={(e) => onDomainFilterChange(e.target.value)}
                      className="h-7 text-xs"
                    />
                    <Button 
                      size="sm"
                      variant="outline"
                      className="px-1.5 h-7 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/10 dark:hover:text-orange-400 transition-colors"
                      onClick={() => onDomainFilterChange('')}
                      disabled={!domainFilter}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Keyword Filter */}
                <div>
                  <Label htmlFor="keyword-filter" className="text-xs font-medium">
                    Filter by Keyword
                  </Label>
                  <div className="flex gap-1.5 mt-1">
                    <Input
                      id="keyword-filter"
                      placeholder="e.g., javascript, react"
                      value={keywordFilter}
                      onChange={(e) => onKeywordFilterChange(e.target.value)}
                      className="h-7 text-xs"
                    />
                    <Button 
                      size="sm"
                      variant="outline"
                      className="px-1.5 h-7 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/10 dark:hover:text-orange-400 transition-colors"
                      onClick={() => onKeywordFilterChange('')}
                      disabled={!keywordFilter}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Saved Filters Toggle */}
                <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      Saved Filters
                      <Switch
                        checked={showSavedFilters}
                        onCheckedChange={setShowSavedFilters}
                        className="data-[state=checked]:bg-orange-500 dark:data-[state=checked]:bg-orange-600 scale-75"
                      />
                    </Label>
                  </div>

                  {showSavedFilters && (
                    <div className="mt-2 space-y-3">
                      {/* Saved Domains */}
                      <div>
                        <Label htmlFor="saved-domain" className="text-xs text-gray-500 dark:text-gray-400">
                          Save Domain Filter
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="saved-domain"
                            placeholder="Enter domain to save"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            className="h-7 text-xs"
                          />
                          <Button 
                            size="sm"
                            variant="outline"
                            className="px-1.5 h-7 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/10 dark:hover:text-orange-400 transition-colors"
                            onClick={saveDomain}
                            disabled={!newDomain}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {savedDomains.map((domain) => (
                            <Badge 
                              key={domain} 
                              variant="outline" 
                              className="flex items-center gap-1 text-xs cursor-pointer pl-2 pr-1 py-0.5 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                              onClick={() => onDomainFilterChange(domain)}
                            >
                              {domain}
                              <button 
                                className="opacity-70 hover:opacity-100" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeDomain(domain);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {savedDomains.length === 0 && (
                            <span className="text-xs text-gray-400 italic">No saved domains</span>
                          )}
                        </div>
                      </div>

                      {/* Saved Keywords */}
                      <div>
                        <Label htmlFor="saved-keyword" className="text-xs text-gray-500 dark:text-gray-400">
                          Save Keyword Filter
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="saved-keyword"
                            placeholder="Enter keyword to save"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            className="h-7 text-xs"
                          />
                          <Button 
                            size="sm"
                            variant="outline"
                            className="px-1.5 h-7 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/10 dark:hover:text-orange-400 transition-colors"
                            onClick={saveKeyword}
                            disabled={!newKeyword}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {savedKeywords.map((keyword) => (
                            <Badge 
                              key={keyword} 
                              variant="outline" 
                              className="flex items-center gap-1 text-xs cursor-pointer pl-2 pr-1 py-0.5 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                              onClick={() => onKeywordFilterChange(keyword)}
                            >
                              {keyword}
                              <button 
                                className="opacity-70 hover:opacity-100" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeKeyword(keyword);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {savedKeywords.length === 0 && (
                            <span className="text-xs text-gray-400 italic">No saved keywords</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Font Size Button */}
        <Popover>
          <Tooltip>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={`h-7 w-7 p-0 transition-all duration-200 ${
                  fontSize !== 'normal' 
                    ? 'bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' 
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/10'
                }`}
              >
                {fontSize === 'small' && <Text className="w-3 h-3" />}
                {fontSize === 'normal' && <Text className="w-3.5 h-3.5" />}
                {fontSize === 'large' && <Text className="w-4 h-4" />}
              </Button>
            </PopoverTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Font Size: {fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-32 p-1" align="end">
            <div className="space-y-0.5">
              {[
                { value: 'small', label: 'Small', size: 'w-3 h-3' },
                { value: 'normal', label: 'Normal', size: 'w-3.5 h-3.5' },
                { value: 'large', label: 'Large', size: 'w-4 h-4' }
              ].map(({ value, label, size }) => (
                <button
                  key={value}
                  className={`w-full px-2 py-1.5 text-left rounded-md text-xs flex items-center gap-2 transition-colors ${
                    fontSize === value 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium' 
                      : 'hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                  onClick={() => handleFontSizeChange(value as 'small' | 'normal' | 'large')}
                >
                  <Text className={size} /> {label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* View Mode Button */}
        <Popover>
          <Tooltip>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={`h-7 w-7 p-0 transition-all duration-200 ${
                  viewMode !== 'normal' 
                    ? 'bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' 
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/10'
                }`}
              >
                {viewMode === 'normal' && <AlignJustify className="w-3.5 h-3.5" />}
                {viewMode === 'compact' && <List className="w-3.5 h-3.5" />}
                {viewMode === 'card' && <Grid3X3 className="w-3.5 h-3.5" />}
              </Button>
            </PopoverTrigger>
            <TooltipContent side="top">
              <p className="text-xs">View Mode: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-32 p-1" align="end">
            <div className="space-y-0.5">
              {[
                { value: 'normal', label: 'Normal', icon: AlignJustify },
                { value: 'compact', label: 'Compact', icon: List },
                { value: 'card', label: 'Cards', icon: Grid3X3 }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  className={`w-full px-2 py-1.5 text-left rounded-md text-xs flex items-center gap-2 transition-colors ${
                    viewMode === value 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium' 
                      : 'hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                  onClick={() => handleViewModeChange(value as ViewMode)}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Display - Only show when filters are active */}
      {(domainFilter || keywordFilter) && (
        <div className="flex flex-wrap items-center gap-1 mt-2 text-xs">
          {domainFilter && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50"
            >
              {domainFilter}
              <button 
                onClick={() => onDomainFilterChange('')}
                className="hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {keywordFilter && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50"
            >
              {keywordFilter}
              <button 
                onClick={() => onKeywordFilterChange('')}
                className="hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          <button 
            className="text-xs text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors ml-1"
            onClick={() => {
              onDomainFilterChange('');
              onKeywordFilterChange('');
            }}
          >
            clear all
          </button>
        </div>
      )}
    </TooltipProvider>
  )
}
