import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Todo } from '@lib/todoStore';

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [warning, setWarning] = useState<string>('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todo');
      const data: Todo[] = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const createTodo = async (todoData: Todo) => {
    try {
      await fetch('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });
      await fetchTodos();
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const updateTodo = async (id: string, todoData: Todo) => {
    try {
      await fetch(`/api/todo/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });
      await fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`/api/todo/${id}`, {
        method: 'DELETE',
      });
      await fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      setWarning('Todo cannot be empty!');
      setTimeout(() => setWarning(''), 3000);
      return;
    }
    if (editingId) {
      const existingTodo = todos.find(t => t.id === editingId);
      const isDuplicate = todos.some(t => t.id !== editingId && t.text.toLowerCase() === trimmedValue.toLowerCase());
      if (isDuplicate) {
        setWarning('This todo already exists!');
        setTimeout(() => setWarning(''), 3000);
        return;
      }
      if (existingTodo) {
        updateTodo(editingId, { ...existingTodo, text: trimmedValue });
      }
      setEditingId(null);
    } else {
      const isDuplicate = todos.some(t => t.text.toLowerCase() === trimmedValue.toLowerCase());
      if (isDuplicate) {
        setWarning('This todo already exists!');
        setTimeout(() => setWarning(''), 3000);
        return;
      }
      const newTodo: Todo = {
        id: uuidv4(),
        text: trimmedValue,
        completed: false,
        created_at: new Date().toISOString(),
      };
      createTodo(newTodo);
    }
    setInputValue('');
    setFilterText('');
    setWarning('');
  };

  const handleEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setInputValue(todo.text);
    setFilterText('');
  };

  const handleRemove = (id: string) => {
    deleteTodo(id);
  };

  const toggleComplete = (todo: Todo) => {
    updateTodo(todo.id, { ...todo, completed: !todo.completed });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (!editingId) {
      setFilterText(value);
    }
  };

  const filteredTodos = todos.filter(todo =>
    todo.text.toLowerCase().includes(filterText.toLowerCase())
  );

  const showNoResults = filterText && filteredTodos.length === 0;

  return (
    <div>
      <h1>Todo List</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={editingId ? "Edit todo..." : "Add new todo or filter..."}
        />
      </form>
      {warning && (
        <div style={{ color: 'red' }}>{warning}</div>
      )}
      {editingId && (
        <div>
          Editing mode: Press Enter to save or{' '}
          <button onClick={() => { setEditingId(null); setInputValue(''); }}>
            Cancel
          </button>
        </div>
      )}
      <ul>
        {showNoResults ? (
          <li>No result. Create a new one instead!</li>
        ) : (
          filteredTodos.map(todo => (
            <li
              key={todo.id}
              onMouseEnter={() => setHoveredId(todo.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                {todo.text}
              </span>
              {hoveredId === todo.id && (
                <>
                  {' '}
                  <button onClick={() => toggleComplete(todo)}>
                    {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                  {' '}
                  <button onClick={() => handleEdit(todo)}>
                    Edit
                  </button>
                  {' '}
                  <button onClick={() => handleRemove(todo.id)}>
                    Remove
                  </button>
                </>
              )}
            </li>
          ))
        )}
      </ul>
      <p>
        Total todos: {todos.length} | Completed: {todos.filter(t => t.completed).length} | Active: {todos.filter(t => !t.completed).length}
      </p>
    </div>
  );
}
