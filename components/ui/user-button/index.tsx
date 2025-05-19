'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import type { UserWithId } from '@/types';

interface UserButtonProps {
  user: UserWithId;
}

export function UserButton({ user }: UserButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: '/auth/signin' });
    setIsLoggingOut(false);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.image || ''}
              alt={user.name || 'User'}
            />
            <AvatarFallback className="bg-yellow-600 text-black font-medium">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black border-gray-800" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-gray-100">{user.name}</p>
            <p className="text-xs leading-none text-gray-400">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem
          className="cursor-pointer text-gray-300 focus:bg-gray-800 focus:text-gray-100"
          onClick={() => {}}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>프로필</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-gray-300 focus:bg-gray-800 focus:text-gray-100"
          onClick={() => {}}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>설정</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem
          className="cursor-pointer text-red-400 focus:bg-red-900 focus:text-red-200"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? '로그아웃 중...' : '로그아웃'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
