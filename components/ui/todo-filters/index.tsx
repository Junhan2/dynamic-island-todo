'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Filter, 
  SortAsc, 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle, 
  X, 
  User, 
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TodoFilters {
  status?: 'all' | 'active' | 'completed';
  assignee?: 'all' | 'me' | 'others';
  deadline?: 'all' | 'today' | 'upcoming' | 'overdue';
  sortBy?: 'deadline' | 'created' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}

interface TodoFiltersProps {
  filters: TodoFilters;
  onFilterChange: (filters: TodoFilters) => void;
  counts?: {
    all: number;
    active: number;
    completed: number;
    today: number;
    upcoming: number;
    overdue: number;
  };
}

export function TodoFilters({ filters, onFilterChange, counts = {
  all: 0,
  active: 0,
  completed: 0,
  today: 0,
  upcoming: 0,
  overdue: 0
}}: TodoFiltersProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'status' && value !== 'all') return true;
    if (key === 'assignee' && value !== 'all') return true;
    if (key === 'deadline' && value !== 'all') return true;
    return false;
  }).length;
  
  const handleStatusChange = (status: 'all' | 'active' | 'completed') => {
    onFilterChange({ ...filters, status });
  };
  
  const handleAssigneeChange = (assignee: 'all' | 'me' | 'others') => {
    onFilterChange({ ...filters, assignee });
  };
  
  const handleDeadlineChange = (deadline: 'all' | 'today' | 'upcoming' | 'overdue') => {
    onFilterChange({ ...filters, deadline });
  };
  
  const handleSortChange = (sortBy: 'deadline' | 'created' | 'alphabetical', sortOrder: 'asc' | 'desc') => {
    onFilterChange({ ...filters, sortBy, sortOrder });
    setSortOpen(false);
  };
  
  const resetFilters = () => {
    onFilterChange({
      status: 'all',
      assignee: 'all',
      deadline: 'all',
      sortBy: 'deadline',
      sortOrder: 'asc'
    });
  };
  
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Tabs 
        value={filters.status || 'all'} 
        onValueChange={(v) => handleStatusChange(v as any)}
        className="mr-auto"
      >
        <TabsList className="bg-[#111111] border border-[#222222]">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#222222]">
            전체
            {counts.all > 0 && <Badge className="ml-1 bg-gray-700">{counts.all}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-[#222222]">
            진행 중
            {counts.active > 0 && <Badge className="ml-1 bg-blue-700">{counts.active}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-[#222222]">
            완료됨
            {counts.completed > 0 && <Badge className="ml-1 bg-green-700">{counts.completed}</Badge>}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex gap-2">
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "bg-[#111111] hover:bg-[#222222] border-[#222222] text-gray-300",
                activeFiltersCount > 0 && "border-yellow-800 bg-yellow-950/30"
              )}
            >
              <Filter className="h-4 w-4 mr-1" />
              필터
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-yellow-600 text-black">{activeFiltersCount}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-black border-[#222222]" align="end">
            <div className="p-4 border-b border-[#222222]">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-200">할 일 필터</h3>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-7 px-2 text-xs text-gray-400 hover:text-gray-200"
                  >
                    <X className="h-3 w-3 mr-1" />
                    필터 초기화
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-4 border-b border-[#222222]">
              <h4 className="text-sm font-medium text-gray-300 mb-2">담당자</h4>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start pl-2 text-sm font-normal",
                    filters.assignee === 'all' ? "bg-[#222222]" : "bg-transparent"
                  )}
                  onClick={() => handleAssigneeChange('all')}
                >
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  모든 담당자
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start pl-2 text-sm font-normal",
                    filters.assignee === 'me' ? "bg-[#222222]" : "bg-transparent"
                  )}
                  onClick={() => handleAssigneeChange('me')}
                >
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  내게 할당된 항목
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start pl-2 text-sm font-normal",
                    filters.assignee === 'others' ? "bg-[#222222]" : "bg-transparent"
                  )}
                  onClick={() => handleAssigneeChange('others')}
                >
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  다른 사람에게 할당된 항목
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">마감일</h4>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start pl-2 text-sm font-normal",
                    filters.deadline === 'all' ? "bg-[#222222]" : "bg-transparent"
                  )}
                  onClick={() => handleDeadlineChange('all')}
                >
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  모든 날짜
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start pl-2 text-sm font-normal",
                    filters.deadline === 'today' ? "bg-[#222222]" : "bg-transparent"
                  )}
                  onClick={() => handleDeadlineChange('today')}
                >
                  <Clock className="h-4 w-4 mr-2 text-blue-400" />
                  오늘
                  {counts.today > 0 && (
                    <Badge className="ml-auto bg-blue-700">{counts.today}</Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start pl-2 text-sm font-normal",
                    filters.deadline === 'upcoming' ? "bg-[#222222]" : "bg-transparent"
                  )}
                  onClick={() => handleDeadlineChange('upcoming')}
                >
                  <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                  예정된 일정
                  {counts.upcoming > 0 && (
                    <Badge className="ml-auto bg-purple-700">{counts.upcoming}</Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start pl-2 text-sm font-normal",
                    filters.deadline === 'overdue' ? "bg-[#222222]" : "bg-transparent"
                  )}
                  onClick={() => handleDeadlineChange('overdue')}
                >
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  기한 지남
                  {counts.overdue > 0 && (
                    <Badge className="ml-auto bg-red-700">{counts.overdue}</Badge>
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <DropdownMenu open={sortOpen} onOpenChange={setSortOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-[#111111] hover:bg-[#222222] border-[#222222] text-gray-300"
            >
              <SortAsc className="h-4 w-4 mr-1" />
              정렬
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black border-[#222222]">
            <DropdownMenuLabel className="text-gray-300">정렬 기준</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem 
              className={cn("cursor-pointer", filters.sortBy === 'deadline' && "bg-[#222222]")}
              onClick={() => handleSortChange('deadline', 'asc')}
            >
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              마감일 (가까운 순)
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={cn("cursor-pointer", filters.sortBy === 'created' && filters.sortOrder === 'desc' && "bg-[#222222]")}
              onClick={() => handleSortChange('created', 'desc')}
            >
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              생성일 (최신순)
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={cn("cursor-pointer", filters.sortBy === 'alphabetical' && "bg-[#222222]")}
              onClick={() => handleSortChange('alphabetical', 'asc')}
            >
              <SortAsc className="h-4 w-4 mr-2 text-gray-400" />
              알파벳순 (A-Z)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
