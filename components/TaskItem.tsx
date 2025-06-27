

import React, { useState, useEffect, useRef } from 'react';
import { Task, PriorityLevel } from '../types';
import { PRIORITY_STYLES } from '../constants';
import { CheckIcon } from './icons/CheckIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import TaskInput from './TaskInput'; 

interface TaskItemProps {
  task: Task;
  taskSetId: string;
  onToggleComplete: (taskSetId: string, id: string) => void;
  onDeleteTask: (taskSetId: string, id: string) => void;
  onUpdateTask: (taskSetId: string, task: Task) => void;
  isBeingCaptured: boolean; // Added prop
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  taskSetId, 
  onToggleComplete, 
  onDeleteTask, 
  onUpdateTask,
  isBeingCaptured // Destructure prop
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const priorityStyle = PRIORITY_STYLES[task.priority];
  const { name: priorityName, badgeColor, textColor: priorityTextColor } = priorityStyle;

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => setIsEditing(false);

  const handleSave = (text: string, priority: PriorityLevel, dueDate: string) => {
    onUpdateTask(taskSetId, { ...task, text, priority, dueDate });
    setIsEditing(false);
  };
  
  const isPastDue = !task.completed && new Date(task.dueDate + 'T00:00:00') < new Date(new Date().setHours(0,0,0,0));

  if (isEditing && !isBeingCaptured) { // Only allow editing if not capturing
    return (
        <div className="p-3 bg-indigo-50 rounded-lg shadow-sm border border-indigo-300">
            <TaskInput 
                onAddTask={handleSave}
                initialText={task.text}
                initialPriority={task.priority}
                initialDueDate={task.dueDate}
                submitButtonText="Save Changes"
                onCancel={handleCancelEdit}
            />
        </div>
    );
  }

  return (
    <div className={`p-3 bg-white rounded-md shadow-sm flex flex-col transition-all duration-300 hover:shadow-md ${task.completed ? 'opacity-70' : 'opacity-100'}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
                <button
                    onClick={() => !isBeingCaptured && onToggleComplete(taskSetId, task.id)} // Disable toggle during capture
                    disabled={isBeingCaptured} // Explicitly disable
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150
                        ${task.completed ? 'bg-indigo-500 border-indigo-500' : `border-slate-400 ${!isBeingCaptured ? 'hover:border-indigo-500' : ''} ${PRIORITY_STYLES[task.priority].ringColor} ring-1 ring-opacity-30`}
                        ${isBeingCaptured ? 'cursor-default' : ''}`}
                    aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    title={isBeingCaptured ? task.text : (task.completed ? "Mark as incomplete" : "Mark as complete")}
                >
                    {task.completed && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                </button>
                <span className={`text-slate-700 text-sm truncate ${task.completed ? 'line-through text-slate-400' : ''}`} title={task.text}>
                    {task.text}
                </span>
            </div>
            {!isBeingCaptured && ( // Conditionally render action buttons
              <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <button onClick={handleEdit} className="p-1 text-slate-500 hover:text-indigo-600 transition-colors" aria-label="Edit task" title="Edit task">
                      <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteTask(taskSetId, task.id)} className="p-1 text-slate-500 hover:text-red-500 transition-colors" aria-label="Delete task" title="Delete task">
                      <TrashIcon className="w-4 h-4" />
                  </button>
              </div>
            )}
        </div>
        <div className="mt-1.5 flex items-center justify-start space-x-2 text-xs pl-8">
            <span className={`px-1.5 py-0.5 rounded-full font-medium text-xs ${badgeColor} ${priorityTextColor}`}>
                {priorityName}
            </span>
            <span className={`text-slate-500 ${isPastDue ? 'text-red-500 font-semibold' : ''}`}>
                Due: {new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                {isPastDue && <span className="ml-1">(Past Due)</span>}
            </span>
        </div>
    </div>
  );
};

export default TaskItem;