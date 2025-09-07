import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Flag, FileText, Palette } from 'lucide-react';
import { cn } from '../utils/cn';
import { CATEGORY_COLORS } from '../types/todo';

interface AddTodoProps {
  onAdd: (text: string, priority: 'low' | 'medium' | 'high', categories?: { name: string; color: string }[], description?: string) => void;
  existingCategories: { name: string; color: string }[];
  onUpdateCategoryColor: (categoryName: string, newColor: string) => void;
}

const priorityOptions = [
  { value: 'low' as const, label: 'Low', color: 'text-notion-gray-400' },
  { value: 'medium' as const, label: 'Medium', color: 'text-yellow-500' },
  { value: 'high' as const, label: 'High', color: 'text-red-500' },
];

export const AddTodo: React.FC<AddTodoProps> = ({ onAdd, existingCategories, onUpdateCategoryColor }) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [categories, setCategories] = useState<{ name: string; color: string }[]>([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentCategoryColor, setCurrentCategoryColor] = useState<string>(CATEGORY_COLORS[0].value);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter existing categories based on input
  const filteredSuggestions = React.useMemo(() => {
    if (!currentCategory.trim() || currentCategory.trim().length < 1) return [];
    return existingCategories.filter(cat => 
      cat.name.toLowerCase().includes(currentCategory.toLowerCase())
    );
  }, [currentCategory, existingCategories]);

  const handleSuggestionSelect = (suggestion: { name: string; color: string }) => {
    setCurrentCategory(suggestion.name);
    setCurrentCategoryColor(suggestion.color);
    setShowSuggestions(false);
  };

  const handleCategoryChange = (value: string) => {
    setCurrentCategory(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const addCategory = () => {
    if (currentCategory.trim() && categories.length < 3) {
      const categoryName = currentCategory.trim();
      const existingCategoryIndex = categories.findIndex(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
      const globalCategoryExists = existingCategories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
      
      if (existingCategoryIndex !== -1) {
        // Update existing category color locally and globally
        setCategories(prev => prev.map((cat, index) => 
          index === existingCategoryIndex 
            ? { ...cat, color: currentCategoryColor }
            : cat
        ));
        // Update globally across all todos
        onUpdateCategoryColor(categoryName, currentCategoryColor);
      } else if (globalCategoryExists) {
        // Category exists globally but not locally - add it with the global color, then update globally
        const globalCategory = existingCategories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        const newCategory = { name: categoryName, color: currentCategoryColor };
        setCategories(prev => [...prev, newCategory]);
        // Update globally across all todos
        onUpdateCategoryColor(categoryName, currentCategoryColor);
      } else {
        // Add new category
        const newCategory = { name: categoryName, color: currentCategoryColor };
        setCategories(prev => [...prev, newCategory]);
      }
      
      setCurrentCategory('');
      setCurrentCategoryColor(CATEGORY_COLORS[0].value);
      setShowSuggestions(false);
    }
  };

  const removeCategory = (index: number) => {
    setCategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim(), priority, categories.length > 0 ? categories : undefined, description.trim() || undefined);
      setText('');
      setDescription('');
      setCategories([]);
      setCurrentCategory('');
      setCurrentCategoryColor(CATEGORY_COLORS[0].value);
      setPriority('medium');
      setIsExpanded(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="notion-card p-4 mb-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-5 h-5 rounded border-2 border-notion-gray-300 flex items-center justify-center hover:border-notion-blue-500 transition-colors duration-200"
          >
            <Plus size={12} className="text-notion-gray-400" />
          </button>
          
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsExpanded(true)}
            placeholder="Add a new task..."
            className="flex-1 notion-input text-sm placeholder-notion-gray-400"
          />
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 pl-8"
          >
            {/* Priority Selection */}
            <div className="flex items-center gap-2">
              <Flag size={14} className="text-notion-gray-500" />
              <span className="text-sm text-notion-gray-600">Priority:</span>
              <div className="flex gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                      priority === option.value
                        ? "bg-notion-blue-100 text-notion-blue-700"
                        : "bg-notion-gray-100 text-notion-gray-600 hover:bg-notion-gray-200"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Input */}
            <div className="flex items-start gap-2">
              <FileText size={14} className="text-notion-gray-500 mt-2" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)"
                rows={3}
                className="notion-input text-sm placeholder-notion-gray-400 resize-none flex-1"
              />
            </div>

            {/* Categories Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-notion-gray-600">Categories ({categories.length}/3):</span>
              </div>
              
              {/* Selected Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category, index) => (
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
                        onClick={() => removeCategory(index)}
                        className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Category Input */}
              {categories.length < 3 && (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={currentCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      onFocus={() => setShowSuggestions(currentCategory.trim().length > 0)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCategory();
                        }
                      }}
                      placeholder="Add category..."
                      className="notion-input text-sm placeholder-notion-gray-400 w-full"
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
                  {currentCategory.trim() && (
                    <div className="flex items-center gap-2">
                      <Palette size={14} className="text-notion-gray-500" />
                      <span className="text-sm text-notion-gray-600">Color:</span>
                      <div className="flex gap-2 flex-wrap">
                        {CATEGORY_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setCurrentCategoryColor(color.value)}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110",
                              currentCategoryColor === color.value
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
                        onClick={addCategory}
                        className="notion-button-primary text-xs px-3 py-1"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setText('');
                  setDescription('');
                  setCategories([]);
                  setCurrentCategory('');
                  setCurrentCategoryColor(CATEGORY_COLORS[0].value);
                  setShowSuggestions(false);
                }}
                className="notion-button-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className="notion-button-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Task
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};
