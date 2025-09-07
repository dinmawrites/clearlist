export interface TodoCategory {
  name: string;
  color: string;
}

export interface Todo {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high';
  categories?: TodoCategory[];
}


export type TodoFilter = 'all' | 'active' | 'completed';
export type TodoSort = 'created' | 'updated' | 'priority' | 'alphabetical' | 'category';

export const CATEGORY_COLORS = [
  { name: 'Rose', value: '#fecaca', textColor: '#991b1b' },
  { name: 'Orange', value: '#fed7aa', textColor: '#9a3412' },
  { name: 'Yellow', value: '#fef3c7', textColor: '#92400e' },
  { name: 'Lime', value: '#d9f99d', textColor: '#365314' },
  { name: 'Green', value: '#bbf7d0', textColor: '#14532d' },
  { name: 'Teal', value: '#a7f3d0', textColor: '#134e4a' },
  { name: 'Blue', value: '#bfdbfe', textColor: '#1e40af' },
  { name: 'Indigo', value: '#c7d2fe', textColor: '#3730a3' },
  { name: 'Purple', value: '#ddd6fe', textColor: '#581c87' },
  { name: 'Pink', value: '#fce7f3', textColor: '#831843' },
] as const;
