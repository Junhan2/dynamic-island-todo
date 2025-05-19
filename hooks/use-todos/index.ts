'use client';

import { useState, useEffect, useCallback } from 'react';
import { todoApi } from '@/lib/api';
import type { Todo } from '@/types';

interface UseTodosOptions {
  teamId?: string;
  completed?: boolean;
  deadline?: string;
}

interface UseTodosResult {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTodo: (data: {
    text: string;
    teamId?: string;
    assignedTo?: string[];
    deadline?: string;
  }) => Promise<Todo | null>;
  updateTodo: (
    todoId: string,
    data: { text?: string; completed?: boolean; deadline?: string | null }
  ) => Promise<Todo | null>;
  deleteTodo: (todoId: string) => Promise<boolean>;
  assignTodo: (todoId: string, userIds: string[]) => Promise<Todo | null>;
}

export function useTodos(options: UseTodosOptions = {}): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await todoApi.getTodos(options);

      if (error) {
        setError(error);
      } else {
        setTodos(data || []);
      }
    } catch (err) {
      setError('할 일 목록을 불러오는 중 오류가 발생했습니다');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = async (data: {
    text: string;
    teamId?: string;
    assignedTo?: string[];
    deadline?: string;
  }): Promise<Todo | null> => {
    try {
      const { data: createdTodo, error } = await todoApi.createTodo(data);

      if (error) {
        setError(error);
        return null;
      }

      // 할 일 목록 업데이트
      setTodos((prev) => [createdTodo, ...prev]);
      return createdTodo;
    } catch (err) {
      setError('할 일을 생성하는 중 오류가 발생했습니다');
      console.error(err);
      return null;
    }
  };

  const updateTodo = async (
    todoId: string,
    data: { text?: string; completed?: boolean; deadline?: string | null }
  ): Promise<Todo | null> => {
    try {
      const { data: updatedTodo, error } = await todoApi.updateTodo(todoId, data);

      if (error) {
        setError(error);
        return null;
      }

      // 할 일 목록 업데이트
      setTodos((prev) =>
        prev.map((todo) => (todo.id === todoId ? updatedTodo : todo))
      );
      return updatedTodo;
    } catch (err) {
      setError('할 일을 업데이트하는 중 오류가 발생했습니다');
      console.error(err);
      return null;
    }
  };

  const deleteTodo = async (todoId: string): Promise<boolean> => {
    try {
      const { error } = await todoApi.deleteTodo(todoId);

      if (error) {
        setError(error);
        return false;
      }

      // 할 일 목록에서 제거
      setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
      return true;
    } catch (err) {
      setError('할 일을 삭제하는 중 오류가 발생했습니다');
      console.error(err);
      return false;
    }
  };

  const assignTodo = async (
    todoId: string,
    userIds: string[]
  ): Promise<Todo | null> => {
    try {
      const { data: updatedTodo, error } = await todoApi.assignTodo(todoId, userIds);

      if (error) {
        setError(error);
        return null;
      }

      // 할 일 목록 업데이트
      setTodos((prev) =>
        prev.map((todo) => (todo.id === todoId ? updatedTodo : todo))
      );
      return updatedTodo;
    } catch (err) {
      setError('할 일을 할당하는 중 오류가 발생했습니다');
      console.error(err);
      return null;
    }
  };

  return {
    todos,
    isLoading,
    error,
    refetch: fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    assignTodo,
  };
}
