import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Todo, TodoFilter, TodoSort } from '../types/todo';
import { AddTodo } from './AddTodo';
import { TodoList } from './TodoList';
import { AppHeader } from './AppHeader';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const TodoApp: React.FC = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [sort, setSort] = useState<TodoSort>('created');
  const [searchQuery, setSearchQuery] = useState('');
  const isInitialLoad = useRef(true);
  const hasLoadedTodos = useRef(false);

  // Load todos from Supabase on mount
  useEffect(() => {
    if (!user) {
      setTodos([]);
      hasLoadedTodos.current = true;
      isInitialLoad.current = false;
      return;
    }
    
    loadTodos();
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading todos:', error);
        setTodos([]);
        hasLoadedTodos.current = true;
        isInitialLoad.current = false;
        return;
      }

      // Convert Supabase data to our Todo format
      const formattedTodos: Todo[] = (data || []).map((todo: any) => ({
        id: todo.id,
        text: todo.text,
        description: todo.description,
        completed: todo.completed,
        createdAt: new Date(todo.created_at),
        updatedAt: new Date(todo.updated_at),
        priority: todo.priority,
        categories: todo.categories,
      }));

      setTodos(formattedTodos);
      hasLoadedTodos.current = true;
      isInitialLoad.current = false;
    } catch (error) {
      console.error('Error loading todos:', error);
      setTodos([]);
      hasLoadedTodos.current = true;
      isInitialLoad.current = false;
    }
  };


  const addTodo = async (text: string, priority: 'low' | 'medium' | 'high', categories?: { name: string; color: string }[], description?: string) => {
    if (!user) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority,
      categories,
    };

    try {
      const { error } = await supabase
        .from('todos')
        .insert([{
          id: newTodo.id,
          user_id: user.id,
          text: newTodo.text,
          description: newTodo.description,
          completed: newTodo.completed,
          priority: newTodo.priority,
          categories: newTodo.categories,
          created_at: newTodo.createdAt.toISOString(),
          updated_at: newTodo.updatedAt.toISOString(),
        }]);

      if (error) {
        console.error('Error adding todo:', error);
        return;
      }

      setTodos(prev => [newTodo, ...prev]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    if (!user) return;
    
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    const newCompleted = !todo.completed;
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({ 
          completed: newCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error toggling todo:', error);
        return;
      }

      setTodos(prev => prev.map(t => 
        t.id === id 
          ? { ...t, completed: newCompleted, updatedAt: new Date() }
          : t
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting todo:', error);
        return;
      }

      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const updatePriority = async (id: string, priority: 'low' | 'medium' | 'high') => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({ 
          priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating priority:', error);
        return;
      }

      setTodos(prev => prev.map(todo => 
        todo.id === id 
          ? { ...todo, priority, updatedAt: new Date() }
          : todo
      ));
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const updateCategoryColor = async (categoryName: string, newColor: string) => {
    if (!user) return;
    
    try {
      // Get all todos that have this category
      const todosWithCategory = todos.filter(todo => 
        todo.categories?.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())
      );

      // Update each todo in Supabase
      for (const todo of todosWithCategory) {
        const updatedCategories = todo.categories?.map(category => 
          category.name.toLowerCase() === categoryName.toLowerCase()
            ? { ...category, color: newColor }
            : category
        );

        const { error } = await supabase
          .from('todos')
          .update({ 
            categories: updatedCategories,
            updated_at: new Date().toISOString()
          })
          .eq('id', todo.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating category color:', error);
          return;
        }
      }

      // Update local state
      setTodos(prev => prev.map(todo => ({
        ...todo,
        categories: todo.categories?.map(category => 
          category.name.toLowerCase() === categoryName.toLowerCase()
            ? { ...category, color: newColor }
            : category
        ),
        updatedAt: new Date()
      })));
    } catch (error) {
      console.error('Error updating category color:', error);
    }
  };

  const editTodo = async (id: string, text: string, description?: string, priority?: 'low' | 'medium' | 'high', categories?: { name: string; color: string }[]) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({ 
          text,
          description,
          priority: priority || 'medium',
          categories,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error editing todo:', error);
        return;
      }

      setTodos(prev => prev.map(todo => 
        todo.id === id 
          ? { 
              ...todo, 
              text, 
              description, 
              priority: priority || todo.priority,
              categories,
              updatedAt: new Date() 
            }
          : todo
      ));
    } catch (error) {
      console.error('Error editing todo:', error);
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  // Extract existing categories with their colors
  const existingCategories = React.useMemo(() => {
    const categoryMap = new Map<string, string>();
    todos.forEach(todo => {
      if (todo.categories) {
        todo.categories.forEach(category => {
          categoryMap.set(category.name, category.color);
        });
      }
    });
    return Array.from(categoryMap.entries()).map(([name, color]) => ({ name, color }));
  }, [todos]);

  return (
    <div className="min-h-screen bg-notion-gray-50 dark:bg-notion-gray-900">
      {/* Header */}
      <AppHeader completedCount={completedCount} totalCount={totalCount} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Add Todo Section */}
          <AddTodo onAdd={addTodo} existingCategories={existingCategories} onUpdateCategoryColor={updateCategoryColor} />

          {/* Todo List Section */}
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
            onUpdatePriority={updatePriority}
            onUpdateCategoryColor={updateCategoryColor}
            filter={filter}
            onFilterChange={setFilter}
            sort={sort}
            onSortChange={setSort}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            existingCategories={existingCategories}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-notion-gray-200 dark:border-notion-gray-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-notion-gray-500 dark:text-notion-gray-400">
            Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};
