'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, User2, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TeamMember, type TeamMemberType } from '@/components/TeamMember';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AssignMembersProps {
  todoId: string | number;
  todoText: string;
  teamMembers: TeamMemberType[];
  currentUserId: string;
  assignedMemberIds: string[];
  onAssign: (todoId: string | number, memberIds: string[]) => Promise<void>;
  trigger?: React.ReactNode;
}

export function AssignMembers({
  todoId,
  todoText,
  teamMembers,
  currentUserId,
  assignedMemberIds = [],
  onAssign,
  trigger,
}: AssignMembersProps) {
  const [open, setOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 다이얼로그가 열릴 때 현재 할당된 멤버 설정
  useEffect(() => {
    if (open) {
      setSelectedMemberIds(assignedMemberIds);
    }
  }, [open, assignedMemberIds]);

  // 멤버 선택 토글
  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  // 전체 선택/해제
  const toggleAll = () => {
    if (selectedMemberIds.length === teamMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(teamMembers.map((member) => member.id));
    }
  };

  // 자신만 선택
  const selectOnlyMe = () => {
    setSelectedMemberIds([currentUserId]);
  };

  // 할당 저장
  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onAssign(todoId, selectedMemberIds);
      setOpen(false);
    } catch (error) {
      console.error('Error assigning members:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent hover:bg-gray-800"
          >
            <Users className="h-4 w-4 mr-2" />
            담당자 지정
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">담당자 지정</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <div className="border-b border-gray-700 pb-2 mb-4">
            <h3 className="font-medium text-gray-300 text-sm mb-2 truncate">
              {todoText}
            </h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-transparent hover:bg-gray-800 border-gray-700"
                onClick={toggleAll}
              >
                {selectedMemberIds.length === teamMembers.length ? '전체 해제' : '전체 선택'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-transparent hover:bg-gray-800 border-gray-700"
                onClick={selectOnlyMe}
              >
                나만 선택
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {teamMembers.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <User2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">사용 가능한 팀원이 없습니다</p>
              </div>
            ) : (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center p-2 rounded-md cursor-pointer transition-colors",
                    selectedMemberIds.includes(member.id)
                      ? "bg-blue-900/30"
                      : "hover:bg-gray-800"
                  )}
                  onClick={() => toggleMember(member.id)}
                >
                  <div className="flex-shrink-0 mr-3">
                    <TeamMember member={member} />
                  </div>
                  <div className="flex-grow min-w-0 mr-2">
                    <div className="text-sm font-medium text-gray-200">
                      {member.name}
                      {member.id === currentUserId && (
                        <Badge className="ml-2 bg-blue-600 text-xs">
                          나
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <CheckCircle2
                      className={cn(
                        "h-5 w-5 transition-opacity",
                        selectedMemberIds.includes(member.id)
                          ? "text-blue-400 opacity-100"
                          : "text-gray-500 opacity-0"
                      )}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent hover:bg-gray-800 border-gray-700"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}