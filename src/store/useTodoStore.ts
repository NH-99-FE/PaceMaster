import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
}

interface TodoActions {
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  clearCompleted: () => void;
}

type TodoStore = TodoState & { actions: TodoActions };

const useTodoStore = create<TodoStore>()(
  persist(
    immer(set => ({
      todos: [],
      actions: {
        addTodo: (text: string) =>
          set(state => {
            state.todos.push({
              id: crypto.randomUUID(),
              text,
              completed: false,
            });
          }),
        toggleTodo: (id: string) =>
          set(state => {
            const todo = state.todos.find((todo: Todo) => todo.id === id);
            if (todo) todo.completed = !todo.completed;
          }),
        removeTodo: (id: string) =>
          set(state => {
            state.todos = state.todos.filter((todo: Todo) => todo.id !== id);
          }),
        clearCompleted: () =>
          set(state => {
            state.todos = state.todos.filter((todo: Todo) => !todo.completed);
          }),
      },
    })),
    {
      name: 'todos-storage',
      partialize: state => ({ todos: state.todos }),
    }
  )
);

export const useTodos = () => useTodoStore(s => s.todos);
export const useTodoActions = () => useTodoStore(s => s.actions);
export const useIncompleteCount = () =>
  useTodoStore(s => s.todos.reduce((acc, t) => acc + (t.completed ? 0 : 1), 0));
