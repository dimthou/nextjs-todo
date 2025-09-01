import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Todo } from '@lib/todoStore';

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [warning, setWarning] = useState<string>('');
  const [isSorting, setIsSorting] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [groupByCompleted, setGroupByCompleted] = useState(false);
  
  // Derived state for incomplete and completed todos
  const incompleteTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
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

  const handleCancelEdit = () => {
    setEditingId(null);
    setInputValue('');
    setFilterText('');
  };

  // Sort function that can be applied to any list
  const sortTodos = (todosToSort: Todo[]) => {
    if (!isSorting) return todosToSort;
    
    return [...todosToSort].sort((a, b) => {
      const comparison = a.text.toLowerCase().localeCompare(b.text.toLowerCase());
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Get the final list to display based on grouping and sorting preferences
  const getDisplayTodos = () => {
    if (groupByCompleted) {
      // When grouped, sort within each group if sorting is enabled
      const sortedIncomplete = sortTodos(incompleteTodos);
      const sortedComplete = sortTodos(completedTodos);
      return [...sortedIncomplete, ...sortedComplete];
    } else {
      // When not grouped, sort the entire list if sorting is enabled
      return sortTodos(todos);
    }
  };

  const handleSortName = () => {
    setIsSorting(current => {
      if (!current) {
        // If turning on sorting, start with ascending
        setSortDirection('asc');
        return true;
      } else {
        // If already sorting and same direction, turn off sorting
        if (sortDirection === 'desc') {
          return false;
        }
        // Otherwise toggle direction
        setSortDirection('desc');
        return true;
      }
    });
  };

  const handleGroupChange = () => {
    setGroupByCompleted(prev => !prev);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && editingId) {
      handleCancelEdit();
    }
  };

  // Get organized todos and then apply filtering
  const displayTodos = getDisplayTodos();
  const filteredTodos = displayTodos.filter(todo =>
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
          onKeyDown={handleInputKeyDown}
          placeholder={editingId ? "Edit todo..." : "Add new todo or filter..."}
          ref={inputRef}
        />
        <div style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isSorting}
              onChange={handleSortName}
            />
            Sort Name {!isSorting ? '' : sortDirection === 'asc' ? '(A to Z)' : '(Z to A)'}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={groupByCompleted}
              onChange={handleGroupChange}
            />
            Group Completed
          </label>
        </div>
      </form>
      {warning && (
        <div style={{ color: 'red' }}>{warning}</div>
      )}
      {editingId && (
        <div>
          Editing mode: Press Enter to save or ESC to cancel{' '}
          <button onClick={handleCancelEdit}>
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
