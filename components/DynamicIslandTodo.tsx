"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Plus, X, Check, RotateCcw, Users, Share2, LogOut, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TeamMember, type TeamMemberType } from "@/components/TeamMember"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signOut } from "next-auth/react"
import type { Todo, UserWithId } from "@/types"
import { useTodos } from "@/hooks/use-todos"
import { useTeams } from "@/hooks/use-teams"

// Mock team members data for temporary use
// 이후 실제 API와 연동 시 대체될 예정
const generateTeamMembers = (currentUser: UserWithId): TeamMemberType[] => [
  { 
    id: currentUser.id, 
    name: currentUser.name || "You", 
    avatar: currentUser.image || "/placeholder.svg?height=32&width=32", 
    online: true 
  },
  { id: "user2", name: "Alex Kim", avatar: "/placeholder.svg?height=32&width=32", online: true },
  { id: "user3", name: "Taylor Wong", avatar: "/placeholder.svg?height=32&width=32", online: false },
  { id: "user4", name: "Jordan Lee", avatar: "/placeholder.svg?height=32&width=32", online: true },
]

interface DynamicIslandTodoProps {
  currentUser: UserWithId
}

export default function DynamicIslandTodo({ currentUser }: DynamicIslandTodoProps) {
  const snappyTransition = {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 1,
  }
  
  // API 사용을 위한 훅 호출
  const { 
    todos: apiTodos, 
    isLoading: isLoadingTodos, 
    createTodo, 
    updateTodo, 
    deleteTodo, 
    assignTodo 
  } = useTodos();
  
  const { 
    teams, 
    isLoading: isLoadingTeams 
  } = useTeams();
  
  // 팀원 목록 생성
  const [teamMembers, setTeamMembers] = useState<TeamMemberType[]>([]);
  
  useEffect(() => {
    // 기본적으로 현재 사용자를 추가
    const defaultMembers: TeamMemberType[] = [
      { 
        id: currentUser.id, 
        name: currentUser.name || "You", 
        avatar: currentUser.image || "/placeholder.svg?height=32&width=32", 
        online: true 
      }
    ];
    
    // 팀이 로드되면 팀 멤버 추가
    if (teams.length > 0 && !isLoadingTeams) {
      const activeTeam = teams[0]; // 현재는 첫 번째 팀으로 가정
      
      if (activeTeam.members) {
        const teamMembersList = activeTeam.members
          .filter(member => member.user.id !== currentUser.id) // 현재 사용자 제외
          .map(member => ({
            id: member.user.id,
            name: member.user.name || member.user.email?.split('@')[0] || "User",
            avatar: member.user.image || "/placeholder.svg?height=32&width=32",
            online: true // 실제로는 온라인 상태를 가져와야 함
          }));
        
        setTeamMembers([...defaultMembers, ...teamMembersList]);
      }
    } else {
      setTeamMembers(defaultMembers);
    }
  }, [currentUser, teams, isLoadingTeams]);
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isAssigning, setIsAssigning] = useState(false)
  const [assigningTodoId, setAssigningTodoId] = useState<number | string | null>(null)
  const [todoDeadline, setTodoDeadline] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)
  
  // API에서 가져온 할 일 목록 동기화
  useEffect(() => {
    if (!isLoadingTodos) {
      setTodos(apiTodos);
    }
  }, [apiTodos, isLoadingTodos]);

  const addTodo = async () => {
    if (newTodo.trim() !== "") {
      const todoData = {
        text: newTodo,
        assignedTo: selectedMembers.length > 0 ? [...selectedMembers] : [currentUser.id],
        deadline: todoDeadline || undefined
      };
      
      const createdTodo = await createTodo(todoData);
      
      if (createdTodo) {
        setNewTodo("");
        setSelectedMembers([]);
        setTodoDeadline("");
      }
    }
  }

  const toggleTodo = async (id: string | number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id.toString(), { completed: !todo.completed });
    }
  }

  const removeTodo = async (id: string | number) => {
    await deleteTodo(id.toString());
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  const toggleMemberSelection = (memberId: string) => {
    if (isAssigning && assigningTodoId !== null) {
      // 기존 할 일에 멤버 할당
      const todo = todos.find((t) => t.id === assigningTodoId);
      
      if (todo) {
        const currentAssignees = todo.assignedTo || [];
        const newAssignees = currentAssignees.includes(memberId)
          ? currentAssignees.filter(id => id !== memberId)
          : [...currentAssignees, memberId];
        
        assignTodo(assigningTodoId.toString(), newAssignees);
      }
    } else {
      // 새 할 일 생성 시 멤버 선택
      setSelectedMembers(prev =>
        prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
      );
    }
  }

  const startAssigning = (todoId: number | string) => {
    setIsAssigning(true);
    setAssigningTodoId(todoId);
  }

  const stopAssigning = () => {
    setIsAssigning(false);
    setAssigningTodoId(null);
  }

  const filteredTodos = todos.filter((todo) => {
    if (selectedTab === "all") return true
    if (selectedTab === "mine") return todo.assignedTo?.includes(currentUser.id)
    if (selectedTab === "shared") return todo.assignedTo?.some((id) => id !== currentUser.id)
    return true
  })

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // 먼저 완료 상태로 정렬
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // 그 다음 마감일로 정렬 (마감일이 가까운 순)
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    
    // 마감일이 있는 할 일을 먼저 표시
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    
    // 마지막으로 생성일 기준 최신순
    return 0;
  })

  const completedTodos = todos.filter((todo) => todo.completed).length
  const remainingTodos = todos.length - completedTodos
  const sharedTodos = todos.filter((todo) => todo.assignedTo?.some((id) => id !== currentUser.id)).length

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && !(event.target as Element).closest(".dynamic-island-todo")) {
        setIsExpanded(false)
        stopAssigning()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  return (
    <motion.div
      className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 dynamic-island-todo"
      initial={false}
      animate={{
        width: isExpanded ? "var(--di-expanded-width)" : "var(--di-collapsed-width)",
        height: isExpanded ? "auto" : "var(--di-collapsed-height)",
        borderRadius: isExpanded ? "var(--di-expanded-radius)" : "var(--di-border-radius)",
      }}
      transition={{
        ...snappyTransition,
        borderRadius: { duration: 0.08 },
      }}
    >
      <motion.div
        className="bg-black text-white h-full cursor-pointer overflow-hidden rounded-[inherit] border border-gray-800"
        onClick={() => !isExpanded && setIsExpanded(true)}
        layout
        transition={snappyTransition}
      >
        {!isExpanded && (
          <motion.div className="p-2 flex items-center justify-between h-full" layout>
            <span className="font-semibold">Team Todo List</span>
            <div className="flex items-center space-x-2 h-full">
              {sharedTodos > 0 && (
                <span className="bg-blue-500 text-black rounded-full w-6 h-6 min-w-[24px] flex items-center justify-center text-xs font-medium">
                  <Users size={12} />
                </span>
              )}
              {remainingTodos > 0 && (
                <span className="bg-yellow-500 text-black rounded-full w-6 h-6 min-w-[24px] flex items-center justify-center text-xs font-medium">
                  {remainingTodos}
                </span>
              )}
              {completedTodos > 0 && (
                <span className="bg-gray-500 text-white rounded-full w-6 h-6 min-w-[24px] flex items-center justify-center text-xs font-medium">
                  {completedTodos}
                </span>
              )}
            </div>
          </motion.div>
        )}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                ...snappyTransition,
                opacity: { duration: 0.1 },
              }}
              className="p-4 pb-2"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Team Todo List</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-gray-400 hover:text-gray-200 hover:bg-[#222222]"
                    aria-label="Sign out"
                  >
                    <LogOut size={14} className="mr-1" />
                    <span className="text-xs">Sign out</span>
                  </Button>
                  <div className="flex -space-x-2">
                    {teamMembers.map((member) => (
                      <TooltipProvider key={member.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <TeamMember member={member} size="sm" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">{member.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="mb-4">
                <TabsList className="bg-[#111111] border border-[#222222]">
                  <TabsTrigger value="all" className="data-[state=active]:bg-[#222222]">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="mine" className="data-[state=active]:bg-[#222222]">
                    Mine
                  </TabsTrigger>
                  <TabsTrigger value="shared" className="data-[state=active]:bg-[#222222]">
                    Shared
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {isAssigning ? (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-300">Assign to team members:</h3>
                    <Button
                      onClick={stopAssigning}
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-gray-400 hover:text-gray-200 hover:bg-[#222222]"
                    >
                      Done
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 bg-[#111111] p-2 rounded-lg border border-[#222222]">
                    {teamMembers.map((member) => {
                      const todo = todos.find((t) => t.id === assigningTodoId)
                      const isSelected = todo?.assignedTo?.includes(member.id)

                      return (
                        <TeamMember
                          key={member.id}
                          member={member}
                          selected={isSelected}
                          onClick={() => toggleMemberSelection(member.id)}
                        />
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex mb-4 items-center">
                  <div className="flex-grow relative mr-2">
                    <Input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a new todo"
                      className="w-full bg-[#111111] border-[#222222] text-gray-200 placeholder:text-gray-500 focus:border-[#333333] focus:outline-none focus:ring-0 focus:ring-offset-0 h-10 pl-10 transition-colors duration-200 rounded-lg"
                      ref={inputRef}
                      aria-label="New todo input"
                    />
                    <Pencil className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => dateInputRef.current?.showPicker()}
                          className="bg-[#111111] hover:bg-[#222222] text-gray-400 hover:text-gray-200 transition-colors h-10 px-3 border border-[#222222] rounded-lg mr-1"
                          type="button"
                        >
                          <Calendar size={16} />
                          <input
                            type="date"
                            value={todoDeadline}
                            onChange={(e) => setTodoDeadline(e.target.value)}
                            className="sr-only"
                            ref={dateInputRef}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Set deadline</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    onClick={addTodo}
                    className="bg-[#111111] hover:bg-[#222222] text-gray-400 hover:text-gray-200 transition-colors h-10 px-3 border border-[#222222] rounded-lg"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              )}

              {!isAssigning && selectedMembers.length > 0 && (
                <div className="mb-4 bg-[#111111] p-2 rounded-lg border border-[#222222]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Assign to:</span>
                    <Button
                      onClick={() => setSelectedMembers([])}
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-gray-400 hover:text-gray-200 hover:bg-[#222222]"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers
                      .filter((m) => selectedMembers.includes(m.id))
                      .map((member) => (
                        <TeamMember
                          key={member.id}
                          member={member}
                          selected={true}
                          onClick={() => toggleMemberSelection(member.id)}
                          size="sm"
                        />
                      ))}
                  </div>
                </div>
              )}

              {!isAssigning && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {teamMembers.map((member) => (
                    <TeamMember
                      key={member.id}
                      member={member}
                      selected={selectedMembers.includes(member.id)}
                      onClick={() => toggleMemberSelection(member.id)}
                      size="sm"
                    />
                  ))}
                </div>
              )}

              <motion.ul className="space-y-2 max-h-60 overflow-y-auto" role="list" aria-label="Todo list" layout>
                <AnimatePresence initial={false}>
                  {sortedTodos.map((todo) => (
                    <motion.li
                      key={todo.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={snappyTransition}
                      className="flex items-center justify-between"
                      role="listitem"
                      layout
                    >
                      <div className="flex items-center flex-grow mr-2">
                        <span
                          className={`flex-grow text-sm ${
                            todo.completed ? "text-gray-500 line-through decoration-gray-500" : "text-yellow-500"
                          }`}
                          onClick={() => toggleTodo(todo.id)}
                        >
                          {todo.text}
                          {todo.deadline && (
                            <span className="text-xs ml-2 text-gray-400">
                              Due: {new Date(todo.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </span>
                        {todo.assignedTo && todo.assignedTo.length > 0 && (
                          <div className="flex -space-x-1 ml-2">
                            {todo.assignedTo.map((memberId) => {
                              const member = teamMembers.find((m) => m.id === memberId)
                              if (!member) return null
                              return (
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
                              )
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center bg-[#111111] rounded-md border border-[#222222]">
                        <Button
                          onClick={() => startAssigning(todo.id)}
                          size="sm"
                          variant="ghost"
                          className="h-10 px-3 text-gray-400 hover:text-gray-200 hover:bg-[#222222] rounded-none"
                          aria-label={`Share "${todo.text}" with team members`}
                        >
                          <Share2 size={14} />
                        </Button>
                        <Separator orientation="vertical" className="h-5 bg-[#222222]" />
                        <Button
                          onClick={() => toggleTodo(todo.id)}
                          size="sm"
                          variant="ghost"
                          className="h-10 px-3 text-gray-400 hover:text-gray-200 hover:bg-[#222222] rounded-none"
                          aria-label={`${todo.completed ? "Revert" : "Complete"} "${todo.text}"`}
                        >
                          {todo.completed ? <RotateCcw size={14} /> : <Check size={14} />}
                        </Button>
                        <Separator orientation="vertical" className="h-5 bg-[#222222]" />
                        <Button
                          onClick={() => removeTodo(todo.id)}
                          size="sm"
                          variant="ghost"
                          className="h-10 px-3 text-gray-400 hover:text-gray-200 hover:bg-[#222222] rounded-none"
                          aria-label={`Remove "${todo.text}" from the list`}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
