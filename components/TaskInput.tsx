import React, { useState } from 'react';
import { PriorityLevel } from '../types';
import { PRIORITY_OPTIONS } from '../constants';
import { PlusIcon } from './icons/PlusIcon';

interface TaskInputProps {
  onAddTask: (text: string, priority: PriorityLevel, dueDate: string) => void;
  initialText?: string;
  initialPriority?: PriorityLevel;
  initialDueDate?: string;
  submitButtonText?: string;
  onCancel?: () => void; // For edit mode
}

const TaskInput: React.FC<TaskInputProps> = ({ 
  onAddTask, 
  initialText = '', 
  initialPriority = PriorityLevel.MEDIUM, 
  initialDueDate,
  submitButtonText = "Add Task",
  onCancel
}) => {
  const [text, setText] = useState(initialText);
  const [priority, setPriority] = useState<PriorityLevel>(initialPriority);
  // Default to today if no initialDueDate is provided
  const [dueDate, setDueDate] = useState<string>(initialDueDate || new Date().toISOString().split('T')[0]);

  const handleAction = () => {
    if (text.trim() === '') {
      alert('Task description cannot be empty.');
      return;
    }
    onAddTask(text.trim(), priority, dueDate);
    if (!initialText) { // Reset only if it's for adding new, not editing
        setText('');
        setPriority(PriorityLevel.MEDIUM);
        setDueDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <div className="p-1"> {/* Reduced padding as it's part of a larger card */}
      <div className="grid grid-cols-1 gap-4 items-end">
        <div>
          <label htmlFor={`taskText-${submitButtonText}`} className="block text-xs font-medium text-slate-600 mb-1">
            Task Description
          </label>
          <input
            id={`taskText-${submitButtonText}`}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`priority-${submitButtonText}`} className="block text-xs font-medium text-slate-600 mb-1">
              Priority
            </label>
            <select
              id={`priority-${submitButtonText}`}
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-sm"
            >
              {PRIORITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`dueDate-${submitButtonText}`} className="block text-xs font-medium text-slate-600 mb-1">
              Due Date
            </label>
            <input
              id={`dueDate-${submitButtonText}`}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-sm"
            />
          </div>
        </div>
      </div>
      <div className={`mt-4 flex ${onCancel ? 'justify-end space-x-2' : 'justify-start'}`}>
        {onCancel && (
            <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors"
            >
                Cancel
            </button>
        )}
        <button
            type="button"
            onClick={handleAction}
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
        >
            <PlusIcon className="w-4 h-4 mr-1.5" />
            {submitButtonText}
        </button>
      </div>
    </div>
  );
};

export default TaskInput;
