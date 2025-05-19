'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Check, Calendar, Share2, CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamMember, type TeamMemberType } from '@/components/TeamMember';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TodoItemProps {
  id: string | number;
  text: string;
  completed: boolean;
  createdAt?: string;
  deadline?: string | Date | null;
  assignedTo?: string[];
  teamMembers?: TeamMemberType[];
  onToggle: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  onAssign: (id: string | number) => void;
  currentUserId: string;
}

export function TodoItem({
  id,
  text,
  completed,
  createdAt,
  deadline,
  assignedTo = [],
  teamMembers = [],
  onToggle,
  onDelete,
  onAssign,
  currentUserId
}: TodoItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // 마감일 처리
  const deadlineDate = deadline ? new Date(deadline) : null;
  const isOverdue = deadlineDate && deadlineDate < new Date() && !completed;
  const isToday = deadlineDate ? 
    new Date().toDateString() === deadlineDate.toDateString() 
    : false;
  
  // 담당자 처리
  const assignees = teamMembers.filter(member => 
    assignedTo.includes(member.id)
  );
  
  const isAssignedToMe = assignedTo.includes(currentUserId);
  const isShared = assignedTo.some(id => id !== currentUserId);
  
  // 마감일 표시 포맷팅
  const formatDeadline = () => {
    if (!deadlineDate) return null;
    
    if (isToday) {
      return '오늘';
    }
    
    return format(deadlineDate, 'M월 d일 (E)', { locale: ko });
  };
  
  // 마감일 상태에 따른 아이콘 및 색상
  const getDeadlineIndicator = () => {
    if (!deadlineDate) return null;
    
    if (isOverdue) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (isToday) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    
    return <Calendar className="h-4 w-4 text-gray-400" />;
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative rounded-lg border p-3 transition-all",
        completed 
          ? "border-[#222222] bg-[#0a0a0a]" 
          : isOverdue 
            ? "border-red-900/50 bg-red-950/10"
            : "border-[#222222] bg-[#111111] hover:border-[#333333]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={() => onToggle(id)}
          className="flex-shrink-0 pt-0.5"
          aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {completed ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-gray-500 group-hover:text-gray-400" />
          )}
        </button>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "text-sm font-medium break-words line-clamp-2",
                completed ? "text-gray-500 line-through" : "text-gray-200"
              )}
              onClick={() => onToggle(id)}
            >
              {text}
            </div>
            
            <div className="flex-shrink-0 flex ml-2 mt-0.5">
              {assignees.length > 0 && (
                <div className="flex -space-x-1 mr-2">
                  {assignees.slice(0, 3).map((member) => (
                    <TooltipProvider key={member.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <TeamMember member={member} size="sm" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">{member.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {assignees.length > 3 && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-gray-300 text-xs">
                      +{assignees.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 메타데이터 (담당자, 마감일) */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            {isAssignedToMe && (
              <Badge className="bg-[#222222] text-gray-300 hover:bg-[#333333]">
                내 할 일
              </Badge>
            )}
            
            {isShared && (
              <Badge className="bg-blue-950 text-blue-300 hover:bg-blue-900">
                <Share2 className="h-3 w-3 mr-1" />
                공유됨
              </Badge>
            )}
            
            {deadlineDate && (
              <Badge 
                className={cn(
                  "flex items-center gap-1",
                  isOverdue 
                    ? "bg-red-950 text-red-300 hover:bg-red-900" 
                    : isToday 
                      ? "bg-blue-950 text-blue-300 hover:bg-blue-900"
                      : "bg-[#222222] text-gray-300 hover:bg-[#333333]"
                )}
              >
                {getDeadlineIndicator()}
                <span>{formatDeadline()}</span>
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* 액션 버튼 (호버 시 표시) */}
      <div 
        className={cn(
          "absolute top-2 right-2 flex items-center space-x-1 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-gray-500 hover:text-yellow-500 hover:bg-[#222222]"
          onClick={() => onAssign(id)}
          aria-label="Assign to team members"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-gray-500 hover:text-red-500 hover:bg-[#222222]"
          onClick={() => onDelete(id)}
          aria-label="Delete todo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
