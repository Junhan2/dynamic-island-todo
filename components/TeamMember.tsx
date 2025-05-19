"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface TeamMemberType {
  id: string
  name: string
  avatar?: string
  online?: boolean
}

interface TeamMemberProps {
  member: TeamMemberType
  selected?: boolean
  onClick?: () => void
  size?: "sm" | "md"
}

export function TeamMember({ member, selected, onClick, size = "md" }: TeamMemberProps) {
  const sizeClass = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm"

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-transform",
        selected && "scale-110",
        onClick && "hover:scale-105",
      )}
      onClick={onClick}
    >
      <Avatar className={cn(sizeClass, selected && "ring-2 ring-yellow-500")}>
        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
        <AvatarFallback className="bg-gray-800 text-gray-200">
          {member.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {member.online && (
        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-black" />
      )}
    </div>
  )
}
