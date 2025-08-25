import fs from 'fs/promises';
import path from 'path';

export interface Todo {
  id: string;
  todo: string;
  isCompleted: boolean;
  createdAt: string;
}

const TODO_FILE = path.join(process.cwd(), 'data', 'todos.json');

const ensureDataDir = async (): Promise<void> => {
  const dataDir = path.dirname(TODO_FILE);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') throw error;
  }
};

const initializeTodos = async (): Promise<void> => {
  const defaultTodos: Todo[] = [
    {
      id: '1',
      todo: 'Learn Next.js',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      todo: 'Build a todo app',
      isCompleted: true,
      createdAt: new Date().toISOString(),
    },
  ];
  await ensureDataDir();
  try {
    await fs.access(TODO_FILE);
  } catch {
    await fs.writeFile(TODO_FILE, JSON.stringify(defaultTodos, null, 2));
  }
};

const readTodos = async (): Promise<Todo[]> => {
  try {
    await initializeTodos();
    const data = await fs.readFile(TODO_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading todos:', error);
    return [];
  }
};

const writeTodos = async (todos: Todo[]): Promise<boolean> => {
  try {
    await ensureDataDir();
    await fs.writeFile(TODO_FILE, JSON.stringify(todos, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing todos:', error);
    return false;
  }
};

export const getTodos = async (): Promise<Todo[]> => {
  return await readTodos();
};

export const createTodo = async (todo: Todo): Promise<boolean> => {
  const todos = await readTodos();
  todos.push(todo);
  return await writeTodos(todos);
};

export const updateTodo = async (id: string, updatedTodo: Todo): Promise<boolean> => {
  const todos = await readTodos();
  const index = todos.findIndex(t => t.id === id);
  if (index !== -1) {
    todos[index] = updatedTodo;
    return await writeTodos(todos);
  }
  return false;
};

export const deleteTodo = async (id: string): Promise<boolean> => {
  const todos = await readTodos();
  const index = todos.findIndex(t => t.id === id);
  if (index !== -1) {
    todos.splice(index, 1);
    return await writeTodos(todos);
  }
  return false;
};

export const findTodo = async (id: string): Promise<Todo | undefined> => {
  const todos = await readTodos();
  return todos.find(t => t.id === id);
};
