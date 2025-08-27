import type { NextApiRequest, NextApiResponse } from 'next';
import { getTodos, createTodo, Todo } from '@lib/todoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const todos = await getTodos();
      return res.status(200).json(todos);
    }
    case 'POST': {
      const todo: Todo = req.body;
      const success = await createTodo(todo);
      if (success) {
        return res.status(201).json(todo);
      }
      return res.status(500).json({ error: 'Failed to create todo' });
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
