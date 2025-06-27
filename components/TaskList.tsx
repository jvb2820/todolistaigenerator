
import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  taskSetId: string;
  onToggleComplete: (taskSetId: string, taskId: string) => void;
  onDeleteTask: (taskSetId: string, taskId: string) => void;
  onUpdateTask: (taskSetId: string, task: Task) => void;
  isBeingCaptured: boolean; // Added prop
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  taskSetId, 
  onToggleComplete, 
  onDeleteTask, 
  onUpdateTask,
  isBeingCaptured // Destructure prop
}) => {
  if (tasks.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-slate-500 text-sm">No tasks in this paper yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          taskSetId={taskSetId}
          onToggleComplete={onToggleComplete}
          onDeleteTask={onDeleteTask}
          onUpdateTask={onUpdateTask}
          isBeingCaptured={isBeingCaptured} // Pass prop
        />
      ))}
    </div>
  );
};

export default TaskList;
