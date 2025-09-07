import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Edit3, Flag, Palette } from 'lucide-react';
import { Todo, CATEGORY_COLORS } from '../types/todo';
import { cn } from '../utils/cn';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string, description?: string, priority?: 'low' | 'medium' | 'high', categories?: { name: string; color: string }[]) => void;
  onUpdatePriority: (id: string, priority: 'low' | 'medium' | 'high') => void;
  onUpdateCategoryColor: (categoryName: string, newColor: string) => void;
  existingCategories: { name: string; color: string }[];
}

const priorityColors = {
  low: 'text-notion-gray-400 dark:text-notion-gray-500',
  medium: 'text-yellow-500 dark:text-yellow-400',
  high: 'text-red-500 dark:text-red-400',
};

const priorityOptions = [
  { value: 'low' as const, label: 'Low', color: 'text-notion-gray-400' },
  { value: 'medium' as const, label: 'Medium', color: 'text-yellow-500' },
  { value: 'high' as const, label: 'High', color: 'text-red-500' },
];

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onUpdatePriority,
  onUpdateCategoryColor,
  existingCategories,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editCategories, setEditCategories] = useState<{ name: string; color: string }[]>(todo.categories || []);
  const [currentEditCategory, setCurrentEditCategory] = useState('');
  const [currentEditCategoryColor, setCurrentEditCategoryColor] = useState<string>(CATEGORY_COLORS[0].value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [priorityJustChanged, setPriorityJustChanged] = useState(false);

  // Filter existing categories based on input
  const filteredSuggestions = React.useMemo(() => {
    if (!currentEditCategory.trim() || currentEditCategory.trim().length < 1) return [];
    return existingCategories.filter(cat => 
      cat.name.toLowerCase().includes(currentEditCategory.toLowerCase())
    );
  }, [currentEditCategory, existingCategories]);

  const handleSuggestionSelect = (suggestion: { name: string; color: string }) => {
    setCurrentEditCategory(suggestion.name);
    setCurrentEditCategoryColor(suggestion.color);
    setShowSuggestions(false);
  };

  const handleCategoryChange = (value: string) => {
    setCurrentEditCategory(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const addEditCategory = () => {
    if (currentEditCategory.trim() && editCategories.length < 3) {
      const categoryName = currentEditCategory.trim();
      const existingCategoryIndex = editCategories.findIndex(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
      const globalCategoryExists = existingCategories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
      
      if (existingCategoryIndex !== -1) {
        // Update existing category color locally and globally
        setEditCategories(prev => prev.map((cat, index) => 
          index === existingCategoryIndex 
            ? { ...cat, color: currentEditCategoryColor }
            : cat
        ));
        // Update globally across all todos
        onUpdateCategoryColor(categoryName, currentEditCategoryColor);
      } else if (globalCategoryExists) {
        // Category exists globally but not locally - add it with the new color, then update globally
        const newCategory = { name: categoryName, color: currentEditCategoryColor };
        setEditCategories(prev => [...prev, newCategory]);
        // Update globally across all todos
        onUpdateCategoryColor(categoryName, currentEditCategoryColor);
      } else {
        // Add new category
        const newCategory = { name: categoryName, color: currentEditCategoryColor };
        setEditCategories(prev => [...prev, newCategory]);
      }
      
      setCurrentEditCategory('');
      setCurrentEditCategoryColor(CATEGORY_COLORS[0].value);
      setShowSuggestions(false);
    }
  };

  const removeEditCategory = (index: number) => {
    setEditCategories(prev => prev.filter((_, i) => i !== index));
  };

  const handlePriorityChange = (newPriority: 'low' | 'medium' | 'high') => {
    onUpdatePriority(todo.id, newPriority);
    setShowPriorityMenu(false);
    
    // Add visual feedback
    setPriorityJustChanged(true);
    setTimeout(() => setPriorityJustChanged(false), 1000);
  };

  // Update local state when todo prop changes
  React.useEffect(() => {
    setEditPriority(todo.priority);
  }, [todo.priority]);


  // Close priority menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPriorityMenu) {
        const target = event.target as Element;
        // Check if click is outside the priority menu container
        if (!target.closest('.priority-menu-container')) {
          setShowPriorityMenu(false);
        }
      }
    };

    if (showPriorityMenu) {
      // Add a small delay to prevent immediate closure from the button click
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPriorityMenu]);

  const handleEdit = () => {
    if (editText.trim() && (
      editText !== todo.text || 
      editDescription !== (todo.description || '') ||
      editPriority !== todo.priority ||
      JSON.stringify(editCategories) !== JSON.stringify(todo.categories || [])
    )) {
      onEdit(todo.id, editText.trim(), editDescription.trim() || undefined, editPriority, editCategories.length > 0 ? editCategories : undefined);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setEditDescription(todo.description || '');
      setEditPriority(todo.priority);
      setEditCategories(todo.categories || []);
      setCurrentEditCategory('');
      setCurrentEditCategoryColor(CATEGORY_COLORS[0].value);
      setShowSuggestions(false);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <div className="notion-card p-4 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(todo.id)}
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200",
              todo.completed
                ? "bg-notion-blue-600 border-notion-blue-600 text-white"
                : "border-notion-gray-300 hover:border-notion-blue-500"
            )}
          >
            {todo.completed && <Check size={12} />}
          </button>

          {/* Todo Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="notion-input text-sm"
                  placeholder="Task title"
                  autoFocus
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="notion-input text-sm resize-none"
                  placeholder="Add a description (optional)"
                  rows={2}
                />
                

                {/* Categories Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-notion-gray-600">Categories ({editCategories.length}/3):</span>
                  </div>
                  
                  {/* Selected Categories */}
                  {editCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editCategories.map((category, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: category.color,
                            color: CATEGORY_COLORS.find(c => c.value === category.color)?.textColor || '#000000'
                          }}
                        >
                          <span>{category.name}</span>
                          <button
                            type="button"
                            onClick={() => removeEditCategory(index)}
                            className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Category Input */}
                  {editCategories.length < 3 && (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={currentEditCategory}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addEditCategory();
                            } else {
                              handleKeyPress(e);
                            }
                          }}
                          onFocus={() => setShowSuggestions(currentEditCategory.trim().length > 0)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          className="notion-input text-sm w-full"
                          placeholder="Add category..."
                        />
                        
                        {/* Category Suggestions */}
                        {showSuggestions && filteredSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-notion-gray-800 border border-notion-gray-200 dark:border-notion-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                            {filteredSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleSuggestionSelect(suggestion)}
                                className="w-full px-3 py-2 text-left hover:bg-notion-gray-50 dark:hover:bg-notion-gray-700 flex items-center gap-2 text-sm"
                              >
                                <div 
                                  className="w-4 h-4 rounded-full border border-notion-gray-200"
                                  style={{ backgroundColor: suggestion.color }}
                                />
                                <span className="text-notion-gray-900 dark:text-white">{suggestion.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Category Color Selection */}
                      {currentEditCategory.trim() && (
                        <div className="flex items-center gap-2">
                          <Palette size={14} className="text-notion-gray-500" />
                          <span className="text-sm text-notion-gray-600">Color:</span>
                          <div className="flex gap-2 flex-wrap">
                            {CATEGORY_COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => setCurrentEditCategoryColor(color.value)}
                                className={cn(
                                  "w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110",
                                  currentEditCategoryColor === color.value
                                    ? "border-notion-gray-400 ring-2 ring-notion-blue-500 ring-offset-1"
                                    : "border-notion-gray-200 hover:border-notion-gray-300"
                                )}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={addEditCategory}
                            className="notion-button-primary text-xs px-3 py-1"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
              </div>
            ) : (
              <div className="space-y-1">
                <p
                  className={cn(
                    "text-sm font-medium transition-all duration-200",
                    todo.completed
                      ? "line-through text-notion-gray-500 dark:text-notion-gray-400"
                      : "text-notion-gray-900 dark:text-white"
                  )}
                >
                  {todo.text}
                </p>
                {todo.description && (
                  <p
                    className={cn(
                      "text-xs transition-all duration-200",
                      todo.completed
                        ? "line-through text-notion-gray-400 dark:text-notion-gray-500"
                        : "text-notion-gray-600 dark:text-notion-gray-300"
                    )}
                  >
                    {todo.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Priority Indicator */}
          <div className="flex items-center gap-2">
            <div className="relative priority-menu-container">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPriorityMenu(!showPriorityMenu);
                }}
                className={cn(
                  "p-1 rounded hover:bg-notion-gray-100 dark:hover:bg-notion-gray-700 transition-all duration-200",
                  showPriorityMenu && "bg-notion-gray-100 dark:bg-notion-gray-700",
                  priorityJustChanged && "bg-green-100 dark:bg-green-900/20"
                )}
                title="Change priority"
              >
                <Flag
                  size={14}
                  className={cn(
                    "transition-all duration-300",
                    priorityColors[todo.priority],
                    priorityJustChanged && "scale-110"
                  )}
                />
              </button>
              
              {/* Priority Dropdown Menu */}
              {showPriorityMenu && (
                <div 
                  className="absolute top-full left-0 mt-1 bg-white dark:bg-notion-gray-800 border border-notion-gray-200 dark:border-notion-gray-700 rounded-lg shadow-lg z-50 min-w-[120px]"
                  style={{ 
                    zIndex: 9999,
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    marginTop: '4px'
                  }}
                >
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePriorityChange(option.value);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left hover:bg-notion-gray-50 dark:hover:bg-notion-gray-700 flex items-center gap-2 text-sm transition-colors duration-200",
                        todo.priority === option.value && "bg-notion-blue-50 dark:bg-notion-blue-900/20"
                      )}
                    >
                      <Flag
                        size={12}
                        className={cn(
                          "transition-colors duration-200",
                          priorityColors[option.value]
                        )}
                      />
                      <span className={cn(
                        "transition-colors duration-200",
                        todo.priority === option.value 
                          ? "text-notion-blue-700 dark:text-notion-blue-300 font-medium"
                          : "text-notion-gray-900 dark:text-white"
                      )}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-notion-gray-100 dark:hover:bg-notion-gray-700 transition-colors duration-200"
                title="Edit"
              >
                <Edit3 size={14} className="text-notion-gray-500" />
              </button>
              
              <button
                onClick={() => onDelete(todo.id)}
                className="p-1 rounded hover:bg-red-50 transition-colors duration-200"
                title="Delete"
              >
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-2 flex items-center justify-between text-xs text-notion-gray-500 dark:text-notion-gray-400">
          <span>
            {todo.createdAt.toLocaleDateString()}
          </span>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="notion-button-primary text-xs px-3 py-1"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditText(todo.text);
                  setEditDescription(todo.description || '');
                  setEditPriority(todo.priority);
                  setEditCategories(todo.categories || []);
                  setCurrentEditCategory('');
                  setCurrentEditCategoryColor(CATEGORY_COLORS[0].value);
                  setShowSuggestions(false);
                  setIsEditing(false);
                }}
                className="notion-button-secondary text-xs px-3 py-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            todo.categories && todo.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {todo.categories.map((category, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: category.color,
                      color: CATEGORY_COLORS.find(c => c.value === category.color)?.textColor || '#000000'
                    }}
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};
