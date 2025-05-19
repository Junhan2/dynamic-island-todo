'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarIcon, Loader2, Plus, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TeamMember, type TeamMemberType } from '@/components/TeamMember';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TodoFormProps {
  onAddTodo: (data: { 
    text: string; 
    assignedTo?: string[]; 
    deadline?: string | null;
  }) => Promise<boolean>;
  teamMembers: TeamMemberType[];
  currentUserId: string;
}

export function TodoForm({ onAddTodo, teamMembers, currentUserId }: TodoFormProps) {
  const [text, setText] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignees, setShowAssignees] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 컴포넌트가 마운트되면 입력란에 포커스
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };
  
  const clearSelection = () => {
    setSelectedMembers([]);
    setDeadline(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    try {
      const success = await onAddTodo({
        text: text.trim(),
        assignedTo: selectedMembers.length > 0 ? selectedMembers : [currentUserId],
        deadline: deadline ? deadline.toISOString() : null,
      });
      
      if (success) {
        setText('');
        setSelectedMembers([]);
        setDeadline(null);
        setShowAssignees(false);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedMembersList = teamMembers.filter(member => 
    selectedMembers.includes(member.id)
  );
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex space-x-2">
        <div className="flex-grow relative">
          <Input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="새 할 일 추가..."
            className="w-full bg-[#111111] border-[#222222] text-gray-200 placeholder:text-gray-500 h-10 transition-colors duration-200 rounded-lg"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex gap-1">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className={cn(
                  "h-10 w-10 bg-[#111111] hover:bg-[#222222] border-[#222222]",
                  deadline && "border-yellow-800 bg-yellow-950/30"
                )}
                disabled={isLoading}
                aria-label="마감일 설정"
              >
                <CalendarIcon className={cn(
                  "h-4 w-4", 
                  deadline ? "text-yellow-500" : "text-gray-400"
                )} />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              align="end" 
              className="w-auto p-0 bg-black border-[#222222]"
            >
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={(date) => {
                  setDeadline(date);
                  setDatePickerOpen(false);
                }}
                locale={ko}
                className="bg-black text-white"
              />
              {deadline && (
                <div className="flex justify-between items-center p-2 border-t border-[#222222]">
                  <span className="text-sm text-gray-300">
                    {format(deadline, 'PPP', { locale: ko })}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeadline(null)}
                    className="h-7 text-xs text-gray-400 hover:text-gray-200"
                  >
                    <X className="h-3 w-3 mr-1" />
                    지우기
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          <Button
            type="button"
            size="icon"
            variant="outline"
            className={cn(
              "h-10 w-10 bg-[#111111] hover:bg-[#222222] border-[#222222]",
              selectedMembers.length > 0 && "border-yellow-800 bg-yellow-950/30"
            )}
            onClick={() => setShowAssignees(!showAssignees)}
            disabled={isLoading}
            aria-label="담당자 할당"
          >
            <User className={cn(
              "h-4 w-4", 
              selectedMembers.length > 0 ? "text-yellow-500" : "text-gray-400"
            )} />
          </Button>
          
          <Button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="h-10 px-4 bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                추가
              </>
            )}
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {(selectedMembers.length > 0 || deadline || showAssignees) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-[#111111] rounded-lg border border-[#222222]">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-2">
                  {selectedMembers.length > 0 && (
                    <Badge className="bg-yellow-600 text-black">
                      담당자 {selectedMembers.length}명
                    </Badge>
                  )}
                  {deadline && (
                    <Badge className="bg-blue-600 text-white">
                      {format(deadline, 'M월 d일 (E)', { locale: ko })}
                    </Badge>
                  )}
                </div>
                
                {(selectedMembers.length > 0 || deadline) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="h-7 px-2 text-xs text-gray-400 hover:text-gray-200"
                  >
                    <X className="h-3 w-3 mr-1" />
                    초기화
                  </Button>
                )}
              </div>
              
              {showAssignees && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {teamMembers.map((member) => (
                    <TeamMember
                      key={member.id}
                      member={member}
                      selected={selectedMembers.includes(member.id)}
                      onClick={() => toggleMemberSelection(member.id)}
                    />
                  ))}
                </div>
              )}
              
              {selectedMembers.length > 0 && !showAssignees && (
                <div className="flex flex-wrap gap-2">
                  {selectedMembersList.map((member) => (
                    <TeamMember
                      key={member.id}
                      member={member}
                      selected={true}
                      onClick={() => toggleMemberSelection(member.id)}
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
