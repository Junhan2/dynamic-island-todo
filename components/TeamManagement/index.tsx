'use client';

import { useState } from 'react';
import { Plus, Check, X, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTeams } from '@/hooks/use-teams';
import { TeamMember } from '@/components/TeamMember';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Team {
  id: string;
  name: string;
  description?: string;
  members?: Array<{
    id: string;
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
    };
    role: string;
  }>;
  _count?: {
    todos: number;
  };
}

interface TeamManagementProps {
  onSelectTeam?: (teamId: string) => void;
  currentUserId: string;
}

export function TeamManagement({ onSelectTeam, currentUserId }: TeamManagementProps) {
  const { teams, isLoading, createTeam, inviteUser } = useTeams();
  
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTeamId, setInviteTeamId] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    setIsCreatingTeam(true);
    
    try {
      const team = await createTeam({
        name: newTeamName,
        description: newTeamDescription || undefined,
      });
      
      if (team) {
        setNewTeamName('');
        setNewTeamDescription('');
        if (onSelectTeam) {
          onSelectTeam(team.id);
        }
      }
    } finally {
      setIsCreatingTeam(false);
    }
  };
  
  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !inviteTeamId) return;
    
    setIsInviting(true);
    
    try {
      await inviteUser(inviteTeamId, inviteEmail);
      setInviteEmail('');
      setInviteTeamId(null);
    } finally {
      setIsInviting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">내 팀</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#111111] hover:bg-[#222222] text-gray-400 hover:text-gray-200 border border-[#222222]">
              <Plus size={14} className="mr-1" /> 새 팀 만들기
            </Button>
          </DialogTrigger>
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
                disabled={!newTeamName.trim() || isCreatingTeam}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {isCreatingTeam ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⟳</span> 생성 중...
                  </span>
                ) : (
                  '팀 만들기'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="py-4 text-center text-gray-400">
          <span className="animate-spin inline-block mr-2">⟳</span> 팀 정보 로딩 중...
        </div>
      ) : teams.length === 0 ? (
        <div className="py-8 text-center bg-[#111111] rounded-lg border border-[#222222]">
          <Users size={48} className="mx-auto text-gray-600 mb-2" />
          <p className="text-gray-400">아직 소속된 팀이 없습니다.</p>
          <p className="text-sm text-gray-500 mt-1">새 팀을 만들거나 초대를 기다려주세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="p-4 bg-[#111111] rounded-lg border border-[#222222] hover:border-[#333333] transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-200">{team.name}</h3>
                  {team.description && (
                    <p className="text-sm text-gray-400 mt-1">{team.description}</p>
                  )}
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-gray-200 hover:bg-[#222222]"
                      onClick={() => setInviteTeamId(team.id)}
                    >
                      <User size={14} className="mr-1" /> 초대
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="bg-black border-l border-gray-800 text-white">
                    <SheetHeader>
                      <SheetTitle>팀원 초대</SheetTitle>
                      <SheetDescription className="text-gray-400">
                        이메일 주소를 입력하여 팀원을 초대하세요.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="invite-email" className="text-sm font-medium text-gray-300">
                          이메일 주소
                        </label>
                        <div className="flex gap-2">
                          <Input
                            id="invite-email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="example@gmail.com"
                            className="bg-[#111111] border-[#222222] text-gray-200 placeholder:text-gray-500"
                          />
                          <Button
                            onClick={handleInviteUser}
                            disabled={!inviteEmail.trim() || isInviting}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black"
                          >
                            {isInviting ? (
                              <span className="animate-spin">⟳</span>
                            ) : (
                              <Plus size={16} />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">팀원 ({team.members?.length || 0})</h4>
                        <div className="space-y-2">
                          {team.members?.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded border border-[#1a1a1a]"
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex-shrink-0">
                                  {member.user.image ? (
                                    <img
                                      src={member.user.image}
                                      alt={member.user.name || 'User'}
                                      className="w-8 h-8 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                                      {(member.user.name || 'U').charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-sm text-gray-200">
                                    {member.user.name || member.user.email?.split('@')[0]}
                                    {member.user.id === currentUserId && ' (You)'}
                                  </div>
                                  <div className="text-xs text-gray-400">{member.role}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center text-sm text-gray-400">
                  <Users size={14} className="mr-1" />
                  {team.members?.length || 0} 명
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onSelectTeam?.(team.id)}
                  className="text-xs bg-[#222222] hover:bg-[#333333] text-gray-300"
                >
                  할 일 관리
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
