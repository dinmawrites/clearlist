import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SortAsc } from 'lucide-react';
import { Todo, TodoFilter, TodoSort } from '../types/todo';
import { TodoItem } from './TodoItem';
import { cn } from '../utils/cn';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string, description?: string, priority?: 'low' | 'medium' | 'high', categories?: { name: string; color: string }[]) => void;
  onUpdatePriority: (id: string, priority: 'low' | 'medium' | 'high') => void;
  onUpdateCategoryColor: (categoryName: string, newColor: string) => void;
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  sort: TodoSort;
  onSortChange: (sort: TodoSort) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  existingCategories: { name: string; color: string }[];
}

const filterOptions: { value: TodoFilter; label: string; count?: number }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const sortOptions: { value: TodoSort; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'priority', label: 'Priority' },
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'category', label: 'Category' },
];

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggle,
  onDelete,
  onEdit,
  onUpdatePriority,
  onUpdateCategoryColor,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  searchQuery,
  onSearchChange,
  existingCategories,
}) => {
  const filteredTodos = todos.filter((todo) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      todo.text.toLowerCase().includes(searchLower) ||
      (todo.description && todo.description.toLowerCase().includes(searchLower));
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed);
    
    return matchesSearch && matchesFilter;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    switch (sort) {
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'alphabetical':
        return a.text.localeCompare(b.text);
      case 'category':
        // Handle todos with no categories (put them at the end)
        if (!a.categories || a.categories.length === 0) {
          if (!b.categories || b.categories.length === 0) return 0;
          return 1; // a has no categories, b does, so a comes after b
        }
        if (!b.categories || b.categories.length === 0) {
          return -1; // b has no categories, a does, so a comes before b
        }
        
        // Sort by first category alphabetically
        const aFirstCategory = a.categories[0].name.toLowerCase();
        const bFirstCategory = b.categories[0].name.toLowerCase();
        const categoryComparison = aFirstCategory.localeCompare(bFirstCategory);
        
        // If categories are the same, sort by priority as secondary sort
        if (categoryComparison === 0) {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        
        return categoryComparison;
      default:
        return 0;
    }
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
          <p className="text-sm text-notion-gray-500 dark:text-notion-gray-400 mt-1">
            {activeCount} active, {completedCount} completed
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="notion-input pl-10"
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex items-center gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-notion-gray-100 rounded-lg p-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange(option.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                  filter === option.value
                    ? "bg-white text-notion-gray-900 shadow-sm"
                    : "text-notion-gray-600 hover:text-notion-gray-900"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SortAsc size={14} className="text-notion-gray-500" />
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as TodoSort)}
              className="notion-input text-sm py-1.5"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-notion-gray-400 mb-2">
                <Search size={48} className="mx-auto" />
              </div>
              <p className="text-notion-gray-500">
                {searchQuery ? 'No tasks match your search.' : 'No tasks yet. Add one above!'}
              </p>
            </motion.div>
          ) : (
            sortedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onUpdatePriority={onUpdatePriority}
                onUpdateCategoryColor={onUpdateCategoryColor}
                existingCategories={existingCategories}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
