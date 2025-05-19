'use client';

import { useState, useEffect } from 'react';
import { useTeams } from '@/hooks/use-teams';
import { Check, ChevronDown, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';

interface Team {
  id: string;
  name: string;
  description?: string;
}

interface TeamSelectorProps {
  currentTeamId?: string;
  onTeamChange: (teamId: string | null) => void;
  compact?: boolean;
}

export function TeamSelector({ currentTeamId, onTeamChange, compact = false }: TeamSelectorProps) {
  const { teams, isLoading, createTeam } = useTeams();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 현재 선택된 팀 찾기
  const currentTeam = currentTeamId 
    ? teams.find(team => team.id === currentTeamId)
    : null;

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    setIsCreating(true);
    
    try {
      const team = await createTeam({
        name: newTeamName,
        description: newTeamDescription || undefined,
      });
      
      if (team) {
        setNewTeamName('');
        setNewTeamDescription('');
        setDialogOpen(false);
        onTeamChange(team.id);
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center h-10 px-3 space-x-2 rounded-md bg-[#111111] border border-[#222222]">
        <Loading size="sm" />
        <span className="text-sm text-gray-400">팀 로딩 중...</span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex justify-between ${compact ? 'h-8 px-2 text-xs' : 'h-10 px-4'} bg-[#111111] hover:bg-[#222222] border-[#222222] text-gray-200`}
          >
            <div className="flex items-center">
              {currentTeam ? (
                <>
                  <Avatar className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} mr-2`}>
                    <AvatarFallback className="bg-yellow-600 text-black font-medium">
                      {currentTeam.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-32">{currentTeam.name}</span>
                </>
              ) : (
                <span className="text-gray-400">개인 할 일</span>
              )}
            </div>
            <ChevronDown className={`ml-2 ${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px] bg-black border-[#222222]">
          <DropdownMenuLabel className="text-gray-300">팀 선택</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-800" />

          <DropdownMenuItem
            className={`flex items-center ${!currentTeamId ? 'bg-[#112211]' : 'hover:bg-[#222222]'}`}
            onClick={() => {
              onTeamChange(null);
              setOpen(false);
            }}
          >
            <Users className="mr-2 h-4 w-4 text-gray-400" />
            <span>개인 할 일</span>
            {!currentTeamId && <Check className="ml-auto h-4 w-4 text-green-500" />}
          </DropdownMenuItem>

          {teams.length > 0 && <DropdownMenuSeparator className="bg-gray-800" />}

          {teams.map(team => (
            <DropdownMenuItem
              key={team.id}
              className={`flex items-center ${team.id === currentTeamId ? 'bg-[#112211]' : 'hover:bg-[#222222]'}`}
              onClick={() => {
                onTeamChange(team.id);
                setOpen(false);
              }}
            >
              <Avatar className="h-5 w-5 mr-2">
                <AvatarFallback className="bg-yellow-600 text-black text-xs font-medium">
                  {team.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm truncate max-w-36">{team.name}</span>
              {team.id === currentTeamId && <Check className="ml-auto h-4 w-4 text-green-500" />}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="bg-gray-800" />
          
          <DialogTrigger asChild onClick={() => setOpen(false)}>
            <DropdownMenuItem className="text-gray-300 hover:bg-[#222222] cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              <span>새 팀 만들기</span>
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-black border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>새 팀 만들기</DialogTitle>
            <DialogDescription className="text-gray-400">
              팀을 만들고 동료들을 초대하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="team-name" className="text-sm font-medium text-gray-300">
                팀 이름
              </label>
              <Input
                id="team-name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="예: 마케팅 팀"
                className="bg-[#111111] border-[#222222] text-gray-200 placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="team-description" className="text-sm font-medium text-gray-300">
                팀 설명 (선택사항)
              </label>
              <Input
                id="team-description"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                placeholder="예: 마케팅 관련 프로젝트를 위한 팀"
                className="bg-[#111111] border-[#222222] text-gray-200 placeholder:text-gray-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateTeam}
              disabled={!newTeamName.trim() || isCreating}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {isCreating ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </span>
              ) : (
                '팀 만들기'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
