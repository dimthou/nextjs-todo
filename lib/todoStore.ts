import { supabase } from '@lib/supabaseClient';

export interface Todo {
  id?: string;
  text: string;
  completed: boolean;
  created_at?: string;
}

export const getTodos = async (): Promise<Todo[]> => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching todos:', error);
    return [];
  }

  return data || [];
};

export const createTodo = async (todo: Todo): Promise<boolean> => {
  const { error } = await supabase
    .from('todos')
    .insert([
      {
        text: todo.text,
        completed: todo.completed
      }
    ]);

  if (error) {
    console.error('Error creating todo:', error);
    return false;
  }

  return true;
};

export const updateTodo = async (id: string, updatedTodo: Todo): Promise<boolean> => {
  const { error } = await supabase
    .from('todos')
    .update({
      text: updatedTodo.text,
      completed: updatedTodo.completed
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating todo:', error);
    return false;
  }

  return true;
};

export const deleteTodo = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting todo:', error);
    return false;
  }

  return true;
};

export const findTodo = async (id: string): Promise<Todo | undefined> => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error finding todo:', error);
    return undefined;
  }

  return data;
};
