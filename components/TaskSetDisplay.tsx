
import React, { useState } from 'react';
import { TaskSet, Task, PriorityLevel } from '../types';
import TaskInput from './TaskInput';
import TaskList from './TaskList';
import PaperPins from './PaperPins';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { SaveIcon } from './icons/SaveIcon';
import { PlusIcon } from './icons/PlusIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface TaskSetDisplayProps {
  taskSet: TaskSet;
  onAddTask: (taskSetId: string, text: string, priority: PriorityLevel, dueDate: string) => void;
  onToggleComplete: (taskSetId: string, taskId: string) => void;
  onDeleteTask: (taskSetId: string, taskId: string) => void;
  onUpdateTask: (taskSetId: string, updatedTask: Task) => void;
  onDeleteTaskSet: (taskSetId: string) => void;
  onUpdateTitle: (taskSetId: string, newTitle: string) => void;
  onAutoAddTasks: (taskSetId: string, themeHint: string) => Promise<void>;
  isGeneratingTasks: boolean;
  generationError: string | null;
  isBeingCaptured?: boolean;
  onDownloadAsImageRequest?: (taskSetId: string, paperTitle: string) => void;
  isLoadingCapture?: boolean;
}

const getDisplayDate = (createdAt: number, id: string): Date => {
    const baseDate = new Date(createdAt);
    // Simple hash from ID to get a deterministic day offset (-15 to +14 days)
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    const dayOffset = (Math.abs(hash) % 30) - 15; // Ensure offset is within -15 to +14
    baseDate.setDate(baseDate.getDate() + dayOffset);
    return baseDate;
};


const TaskSetDisplay: React.FC<TaskSetDisplayProps> = ({
  taskSet,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  onDeleteTaskSet,
  onUpdateTitle,
  onAutoAddTasks,
  isGeneratingTasks,
  generationError,
  isBeingCaptured = false, // Default to false
  onDownloadAsImageRequest,
  isLoadingCapture,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(taskSet.title);
  const [showInput, setShowInput] = useState(false);

  const handleTitleSave = () => {
    if (editableTitle.trim()) {
      onUpdateTitle(taskSet.id, editableTitle.trim());
    }
    setIsEditingTitle(false);
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleTitleSave();
    if (e.key === 'Escape') {
      setEditableTitle(taskSet.title);
      setIsEditingTitle(false);
    }
  };

  const handleDownloadPaperAsImage = () => {
    if (onDownloadAsImageRequest) {
        onDownloadAsImageRequest(taskSet.id, taskSet.title);
    }
  };

  const headerTextColor = taskSet.themeColor.includes('yellow') || taskSet.themeColor.includes('amber') || taskSet.themeColor.includes('lime') ? 'text-gray-800' : 'text-white';

  const handleSuggestTasks = () => {
    onAutoAddTasks(taskSet.id, taskSet.title);
  };

  const taskListContainerClasses = isBeingCaptured 
    ? "flex-grow pr-1" 
    : "flex-grow overflow-y-auto max-h-96 pr-1 simple-scrollbar";

  const displayDate = getDisplayDate(taskSet.createdAt, taskSet.id);

  return (
    <div 
        id={`task-set-paper-${taskSet.id}`} 
        className="bg-white rounded-lg shadow-lg flex flex-col relative overflow-hidden h-full"
    >
      <PaperPins showPins={!isBeingCaptured} />
      <header className={`p-4 ${taskSet.themeColor} relative`}>
        <div className="flex items-center justify-between">
          {isEditingTitle && !isBeingCaptured ? ( 
            <input 
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleSave}
              className={`w-full text-xl font-semibold bg-transparent border-b-2 ${headerTextColor === 'text-white' ? 'border-white/70 placeholder-white/70' : 'border-gray-600/70 placeholder-gray-600/70'} focus:outline-none ${headerTextColor}`}
              autoFocus
            />
          ) : (
            <h2 
              className={`text-xl font-semibold ${headerTextColor} ${!isBeingCaptured && !isEditingTitle ? 'cursor-pointer' : ''} truncate mr-2`} 
              onClick={() => !isBeingCaptured && !isEditingTitle && setIsEditingTitle(true)}
              title={!isBeingCaptured && !isEditingTitle ? taskSet.title + " (Click to edit)" : taskSet.title}
            >
              {taskSet.title}
            </h2>
          )}
          {!isBeingCaptured && (
           <div className="flex items-center flex-shrink-0">
            {isEditingTitle ? (
                 <button onClick={handleTitleSave} className={`p-1 ${headerTextColor} opacity-80 hover:opacity-100 ml-2`} title="Save title">
                    <SaveIcon className="w-5 h-5"/>
                </button>
            ) : (
                <button onClick={() => setIsEditingTitle(true)} className={`p-1 ${headerTextColor} opacity-60 hover:opacity-100 ml-2`} title="Edit title">
                    <PencilIcon className="w-4 h-4"/>
                </button>
            )}
            <button
                onClick={handleDownloadPaperAsImage}
                disabled={isLoadingCapture}
                className={`p-1 ${headerTextColor} opacity-60 hover:opacity-100 ml-1`}
                aria-label="Download this paper as PNG"
                title="Download Paper as PNG"
            >
                {isLoadingCapture ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <DownloadIcon className="w-4 h-4" />
                )}
            </button>
            <button
                onClick={() => {
                    if (window.confirm(`Are you sure you want to delete the paper "${taskSet.title}"? This action cannot be undone.`)) {
                        onDeleteTaskSet(taskSet.id);
                    }
                }}
                className={`p-1 ${headerTextColor} opacity-60 hover:opacity-100 ml-1`}
                aria-label="Delete this paper"
                title="Delete Paper"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
           </div>
          )}
        </div>
        <p className={`text-xs ${headerTextColor} opacity-80 mt-1`}>
            {taskSet.tasks.length} task(s) | {displayDate.toLocaleDateString()}
        </p>
      </header>

      <div className="p-4 flex-grow flex flex-col">
        {!isBeingCaptured && ( 
            <div className="mb-3 space-y-2">
                <button 
                    onClick={() => setShowInput(!showInput)}
                    className="w-full text-sm py-2 px-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors flex items-center justify-center font-medium"
                >
                    {showInput ? 'Cancel Adding Task' : 'Add New Task Manually'}
                </button>
                {showInput && (
                    <div className="mt-2 border border-indigo-200 rounded-md p-3 bg-white shadow-sm">
                        <TaskInput
                            onAddTask={(text, priority, dueDate) => {
                                onAddTask(taskSet.id, text, priority, dueDate);
                                setShowInput(false); 
                            }}
                            submitButtonText="Add to Paper"
                        />
                    </div>
                )}
                <button
                    onClick={handleSuggestTasks}
                    disabled={isGeneratingTasks}
                    className="w-full text-sm py-2 px-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors flex items-center justify-center font-medium disabled:opacity-60"
                >
                    {isGeneratingTasks ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Suggesting...
                        </>
                    ) : (
                        <>
                            <PlusIcon className="w-4 h-4 mr-1.5" /> 
                            Suggest Tasks with AI
                        </>
                    )}
                </button>
                {generationError && !isBeingCaptured && <p className="text-xs text-red-500 mt-1 text-center">{generationError}</p>}
            </div>
        )}
        
        <div className={taskListContainerClasses}> 
            <TaskList
                tasks={taskSet.tasks}
                taskSetId={taskSet.id}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
                isBeingCaptured={isBeingCaptured} 
            />
        </div>
      </div>
       <style>{`
        .simple-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .simple-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .simple-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
        .simple-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }
      `}</style>
    </div>
  );
};

export default TaskSetDisplay;
