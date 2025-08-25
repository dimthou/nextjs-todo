import type { NextApiRequest, NextApiResponse } from 'next';
import { findTodo, updateTodo, deleteTodo } from './lib/todoStore';
import { Todo } from './lib/todoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
    body,
  } = req;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  switch (method) {
    case 'GET': {
      const todo = await findTodo(id);
      if (todo) {
        return res.status(200).json(todo);
      }
      return res.status(404).json({ error: 'Todo not found' });
    }
    case 'PUT': {
      const updated: Todo = body;
      const success = await updateTodo(id, updated);
      if (success) {
        return res.status(200).json(updated);
      }
      return res.status(404).json({ error: 'Todo not found' });
    }
    case 'DELETE': {
      const success = await deleteTodo(id);
      if (success) {
        return res.status(204).end();
      }
      return res.status(404).json({ error: 'Todo not found' });
    }
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
