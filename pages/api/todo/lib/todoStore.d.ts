export interface Todo {
  id: string;
  todo: string;
  isCompleted: boolean;
  createdAt: string;
}

export declare const getTodos: () => Promise<Todo[]>;
export declare const createTodo: (todo: Todo) => Promise<boolean>;
export declare const updateTodo: (id: string, updatedTodo: Todo) => Promise<boolean>;
export declare const deleteTodo: (id: string) => Promise<boolean>;
export declare const findTodo: (id: string) => Promise<Todo | undefined>;
