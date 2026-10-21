import React, { useState } from 'react';
import { Task } from '../../types';
import { TaskItem } from './TaskItem';
import { CheckCircle2, ListFilter, Sparkles } from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
}

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks }) => {
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'daily') return task.type === 'daily';
    if (filter === 'weekly') return task.type === 'weekly';
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: `All (${tasks.length})` },
          { id: 'daily', label: `Daily (${tasks.filter(t => t.type === 'daily').length})` },
          { id: 'weekly', label: `Weekly (${tasks.filter(t => t.type === 'weekly').length})` },
          { id: 'pending', label: `Pending (${tasks.filter(t => !t.completed).length})` },
          { id: 'completed', label: `Completed (${tasks.filter(t => t.completed).length})` },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as typeof filter)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filter === item.id
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-sky-400 opacity-60" />
          <p className="text-sm font-semibold">No tasks found for this view</p>
          <p className="text-xs text-slate-400 mt-1">Tap "+ Add Task" to schedule a reminder.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
