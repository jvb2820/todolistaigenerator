



import React, { useState, useEffect, useCallback } from 'react';
import { Task, PriorityLevel, TaskSet, AiGeneratedTask, AiLanguageCode, AiLanguageOption } from './types';
import { PAPER_THEME_COLORS, AI_LANGUAGE_OPTIONS } from './constants';
import AiGenerator from './components/AiGenerator';
import TaskSetDisplay from './components/TaskSetDisplay';
import { generateTasksWithGemini, generateMultiplePaperThemes, generateTasksForExistingSet } from './services/geminiService';
import { PlusIcon } from './components/icons/PlusIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { TrashIcon } from './components/icons/TrashIcon'; // Import TrashIcon
import { downloadFile, sanitizeFilename } from './utils';
import * as htmlToImage from 'html-to-image';

const App: React.FC = () => {
  const [taskSets, setTaskSets] = useState<TaskSet[]>(() => {
    const savedTaskSets = localStorage.getItem('taskSets');
    if (savedTaskSets) {
      try {
        const parsed = JSON.parse(savedTaskSets);
        return parsed.map((ts: Partial<TaskSet> & { sortOptions?: any }) => {
          const { sortOptions, ...restOfTs } = ts; // eslint-disable-line @typescript-eslint/no-unused-vars
          return {
            ...restOfTs,
            tasks: Array.isArray(ts.tasks) ? ts.tasks : [],
            themeColor: ts.themeColor || PAPER_THEME_COLORS[0],
            createdAt: ts.createdAt || Date.now(),
          };
        }) as TaskSet[];
      } catch (error) {
        console.error("Failed to parse task sets from localStorage", error);
        return [];
      }
    }
    return [];
  });

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [generatingTasksForSetId, setGeneratingTasksForSetId] = useState<string | null>(null);
  const [generatingTasksError, setGeneratingTasksError] = useState<string | null>(null);

  const [aiGenerationLanguage, setAiGenerationLanguage] = useState<AiLanguageCode>(AiLanguageCode.ENGLISH);

  const [capturingPaperId, setCapturingPaperId] = useState<string | null>(null);
  const [isBatchCapturing, setIsBatchCapturing] = useState(false);


  useEffect(() => {
    localStorage.setItem('taskSets', JSON.stringify(taskSets));
  }, [taskSets]);

  const getCurrentAiLanguageInfo = useCallback((): AiLanguageOption => {
    return AI_LANGUAGE_OPTIONS.find(opt => opt.code === aiGenerationLanguage) || AI_LANGUAGE_OPTIONS[0];
  }, [aiGenerationLanguage]);

  const mapAiTaskToTask = (aiTask: AiGeneratedTask): Omit<Task, 'id' | 'taskSetId'> => {
    const priorityMap: Record<string, PriorityLevel> = {
      'High': PriorityLevel.HIGH,
      'Medium': PriorityLevel.MEDIUM,
      'Low': PriorityLevel.LOW,
    };
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (aiTask.dueDateOffset || 0));
    return {
      text: aiTask.text,
      priority: priorityMap[aiTask.priority] || PriorityLevel.MEDIUM,
      dueDate: dueDate.toISOString().split('T')[0],
      completed: false,
      createdAt: Date.now(),
    };
  };

  const addEmptyTaskSet = useCallback(() => {
    const newTitle = `New Paper ${taskSets.length + 1}`;
    const randomThemeColor = PAPER_THEME_COLORS[Math.floor(Math.random() * PAPER_THEME_COLORS.length)];
    const newTaskSet: TaskSet = {
      id: crypto.randomUUID(),
      title: newTitle,
      tasks: [],
      themeColor: randomThemeColor,
      createdAt: Date.now(),
    };
    setTaskSets(prevTaskSets => [newTaskSet, ...prevTaskSets].sort((a,b) => b.createdAt - a.createdAt));
  }, [taskSets.length]);

  const handleGenerateThemedPaper = useCallback(async (theme: string) => {
    if (!theme.trim()) {
      setAiError("Theme cannot be empty.");
      return;
    }
    setIsLoadingAi(true);
    setAiError(null);
    const langInfo = getCurrentAiLanguageInfo();
    try {
      const aiTasks = await generateTasksWithGemini(theme, 3, 7, langInfo.code, langInfo.name);
      const newTasks: Task[] = aiTasks.map(aiTask => ({
        id: crypto.randomUUID(),
        ...mapAiTaskToTask(aiTask),
      }));
      
      const randomThemeColor = PAPER_THEME_COLORS[Math.floor(Math.random() * PAPER_THEME_COLORS.length)];
      const newTaskSet: TaskSet = {
        id: crypto.randomUUID(),
        title: theme,
        tasks: newTasks,
        themeColor: randomThemeColor,
        createdAt: Date.now(),
      };
      setTaskSets(prevTaskSets => [newTaskSet, ...prevTaskSets].sort((a,b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error("Failed to generate themed paper:", error);
      setAiError(error instanceof Error ? error.message : "An unknown error occurred during AI generation.");
    } finally {
      setIsLoadingAi(false);
    }
  }, [aiGenerationLanguage, getCurrentAiLanguageInfo]); // mapAiTaskToTask is stable

  const handleAddTaskToSet = useCallback((taskSetId: string, text: string, priority: PriorityLevel, dueDate: string) => {
    setTaskSets(prevTaskSets =>
      prevTaskSets.map(ts =>
        ts.id === taskSetId
          ? {
              ...ts,
              tasks: [...ts.tasks, { id: crypto.randomUUID(), text, priority, dueDate, completed: false, createdAt: Date.now() }]
            }
          : ts
      )
    );
  }, []);

  const handleToggleComplete = useCallback((taskSetId: string, taskId: string) => {
    setTaskSets(prevTaskSets =>
      prevTaskSets.map(ts =>
        ts.id === taskSetId
          ? { ...ts, tasks: ts.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }
          : ts
      )
    );
  }, []);

  const handleDeleteTask = useCallback((taskSetId: string, taskId: string) => {
    setTaskSets(prevTaskSets =>
      prevTaskSets.map(ts =>
        ts.id === taskSetId ? { ...ts, tasks: ts.tasks.filter(t => t.id !== taskId) } : ts
      )
    );
  }, []);

  const handleUpdateTask = useCallback((taskSetId: string, updatedTask: Task) => {
    setTaskSets(prevTaskSets =>
      prevTaskSets.map(ts =>
        ts.id === taskSetId
          ? { ...ts, tasks: ts.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) }
          : ts
      )
    );
  }, []);

  const handleDeleteTaskSet = useCallback((taskSetId: string) => {
    setTaskSets(prevTaskSets => prevTaskSets.filter(ts => ts.id !== taskSetId));
  }, []);

  const handleUpdateTaskSetTitle = useCallback((taskSetId: string, newTitle: string) => {
    setTaskSets(prevTaskSets =>
      prevTaskSets.map(ts => (ts.id === taskSetId ? { ...ts, title: newTitle } : ts))
    );
  }, []);

  const handleAutoAddTasksToSet = useCallback(async (taskSetId: string, themeHint: string) => {
    setGeneratingTasksForSetId(taskSetId);
    setGeneratingTasksError(null);
    const langInfo = getCurrentAiLanguageInfo();
    try {
      const aiTasks = await generateTasksForExistingSet(themeHint, 3, 5, langInfo.code, langInfo.name);
      const newTasks: Task[] = aiTasks.map(aiTask => ({
        id: crypto.randomUUID(),
        ...mapAiTaskToTask(aiTask),
      }));

      setTaskSets(prevTaskSets =>
        prevTaskSets.map(ts =>
          ts.id === taskSetId
            ? { ...ts, tasks: [...ts.tasks, ...newTasks] }
            : ts
        )
      );
    } catch (error) {
      console.error("Failed to auto add tasks to set:", error);
      setGeneratingTasksError(error instanceof Error ? error.message : "Failed to suggest tasks.");
    } finally {
      setGeneratingTasksForSetId(null);
    }
  }, [aiGenerationLanguage, getCurrentAiLanguageInfo]); // mapAiTaskToTask is stable
  
  const handleBatchGeneratePapers = useCallback(async (numberOfPapers: number) => {
    setIsLoadingAi(true);
    setAiError(null);
    const langInfo = getCurrentAiLanguageInfo();
    try {
      const themes = await generateMultiplePaperThemes(numberOfPapers, langInfo.code, langInfo.name);
      const newPaperPromises = themes.map(async (theme) => {
        // For single paper generation, use the provided theme directly or the generated one
        const paperTitle = numberOfPapers === 1 && typeof theme === 'string' ? theme : (Array.isArray(themes) && themes.length > 0 ? theme : "AI Generated Paper");

        const aiTasks = await generateTasksWithGemini(paperTitle, 3, 7, langInfo.code, langInfo.name);
        const newTasks: Task[] = aiTasks.map(aiTask => ({
          id: crypto.randomUUID(),
          ...mapAiTaskToTask(aiTask),
        }));
        const randomThemeColor = PAPER_THEME_COLORS[Math.floor(Math.random() * PAPER_THEME_COLORS.length)];
        return {
          id: crypto.randomUUID(),
          title: paperTitle,
          tasks: newTasks,
          themeColor: randomThemeColor,
          createdAt: Date.now(),
        } as TaskSet;
      });

      const newPapers = await Promise.all(newPaperPromises);
      setTaskSets(prevTaskSets => [...newPapers, ...prevTaskSets].sort((a,b) => b.createdAt - a.createdAt));

    } catch (error) {
      console.error("Failed to batch generate papers:", error);
      setAiError(error instanceof Error ? error.message : "An unknown error occurred during batch AI generation.");
    } finally {
      setIsLoadingAi(false);
    }
  }, [aiGenerationLanguage, getCurrentAiLanguageInfo]); // mapAiTaskToTask is stable

  const performCaptureAndDownload = useCallback(async (taskSetId: string, paperTitle: string) => {
    setCapturingPaperId(taskSetId);
    await new Promise(resolve => setTimeout(resolve, 100)); 

    const paperElement = document.getElementById(`task-set-paper-${taskSetId}`);
    if (paperElement) {
      try {
        const dataUrl = await htmlToImage.toPng(paperElement, {
            backgroundColor: '#ffffff', 
        });
        downloadFile(dataUrl, `${sanitizeFilename(paperTitle)}.png`);
      } catch (captureError) {
        console.error('Error capturing paper as image:', captureError);
        alert(`Failed to capture paper "${paperTitle}" as image. See console for details.`);
      }
    } else {
      console.error(`Paper element not found for ID: task-set-paper-${taskSetId}`);
      alert(`Could not find paper "${paperTitle}" to capture.`);
    }
    setCapturingPaperId(null);
  }, []);

  const handleRequestSinglePaperImage = useCallback(async (taskSetId: string, paperTitle: string) => {
    await performCaptureAndDownload(taskSetId, paperTitle);
  }, [performCaptureAndDownload]);

  const handleDownloadAllPapersAsImages = useCallback(async () => {
    if (taskSets.length === 0) {
      alert("No papers to download.");
      return;
    }
    setIsBatchCapturing(true);
    setAiError(null); 
    
    for (const taskSet of taskSets) {
      try {
        await performCaptureAndDownload(taskSet.id, taskSet.title);
        await new Promise(resolve => setTimeout(resolve, 200)); 
      } catch (error) {
        console.error(`Failed to capture paper "${taskSet.title}":`, error);
        setAiError(`Failed to capture paper "${taskSet.title}".`);
      }
    }
    setIsBatchCapturing(false);
  }, [taskSets, performCaptureAndDownload]);

  const handleClearAllPapers = useCallback(() => {
    if (taskSets.length === 0) {
      alert("No papers to clear.");
      return;
    }
    if (window.confirm("Are you sure you want to delete ALL papers? This action cannot be undone.")) {
      setTaskSets([]);
    }
  }, [taskSets]); 


  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-6xl mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800">JV's TodoList AI Generator</h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">Generate, organize, and conquer your tasks with AI.</p>
      </header>

      <section className="w-full max-w-4xl p-6 bg-white rounded-xl shadow-xl mb-10">
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Manage Papers</h2>
        <p className="text-sm text-slate-500 mb-5">Add, generate, or download your task papers.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <label htmlFor="aiLanguageSelect" className="block text-sm font-medium text-slate-700 mb-1">
              AI Generation Language:
            </label>
            <select
              id="aiLanguageSelect"
              value={aiGenerationLanguage}
              onChange={(e) => setAiGenerationLanguage(e.target.value as AiLanguageCode)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-slate-700"
            >
              {AI_LANGUAGE_OPTIONS.map(option => (
                <option key={option.code} value={option.code}>{option.label}</option>
              ))}
            </select>
          </div>
          <AiGenerator onGenerate={handleGenerateThemedPaper} isLoading={isLoadingAi} error={aiError} />
        </div>

        <div className="flex flex-wrap gap-3 justify-center items-center mt-4 pt-4 border-t border-slate-200">
          <button
            onClick={addEmptyTaskSet}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Blank Paper
          </button>
          <button
            onClick={() => handleBatchGeneratePapers(1)}
            disabled={isLoadingAi || isBatchCapturing}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-60"
          >
            {isLoadingAi ? 'Generating...' : <><PlusIcon className="w-5 h-5 mr-2" /> Generate 1 AI Paper</>}
          </button>
          <button
            onClick={() => handleBatchGeneratePapers(5)}
            disabled={isLoadingAi || isBatchCapturing}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-60"
          >
            {isLoadingAi ? 'Generating...' : <><PlusIcon className="w-5 h-5 mr-2" /> Generate 5 AI Papers</>}
          </button>
          <button
            onClick={() => handleBatchGeneratePapers(50)}
            disabled={isLoadingAi || isBatchCapturing}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-60"
          >
            {isLoadingAi ? 'Generating...' : <><PlusIcon className="w-5 h-5 mr-2" /> Generate 50 AI Papers</>}
          </button>
          <button
            onClick={handleDownloadAllPapersAsImages}
            disabled={isBatchCapturing || taskSets.length === 0}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-slate-300 text-sm font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-60"
          >
            <DownloadIcon className="w-5 h-5 mr-2"/>
            {isBatchCapturing ? 'Capturing All...' : 'Download All (PNG)'}
          </button>
           <button
            onClick={handleClearAllPapers}
            disabled={isLoadingAi || isBatchCapturing || taskSets.length === 0}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-60"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            Clear All Papers
          </button>
        </div>
        {(aiError && !isLoadingAi && !isBatchCapturing) && <p className="text-red-500 text-sm mt-3 text-center">{aiError}</p>}
      </section>

      {taskSets.length === 0 && !isLoadingAi && (
        <div className="text-center py-10">
          <p className="text-slate-500 text-lg">No papers yet. Try adding one or generating some with AI!</p>
        </div>
      )}

      <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
        {taskSets.map(ts => (
          <TaskSetDisplay
            key={ts.id}
            taskSet={ts}
            onAddTask={handleAddTaskToSet}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTaskSet={handleDeleteTaskSet}
            onUpdateTitle={handleUpdateTaskSetTitle}
            onAutoAddTasks={handleAutoAddTasksToSet}
            isGeneratingTasks={generatingTasksForSetId === ts.id}
            generationError={generatingTasksForSetId === ts.id ? generatingTasksError : null}
            isBeingCaptured={capturingPaperId === ts.id}
            onDownloadAsImageRequest={handleRequestSinglePaperImage}
            isLoadingCapture={capturingPaperId === ts.id}
          />
        ))}
      </main>
      <footer className="w-full max-w-6xl mt-auto pt-8 pb-4 text-center text-slate-500 text-xs">
        <p>&copy; 2025 JV's TodoList AI Generator</p>
        <p className="mt-1">Powered by @jvb &amp; Gemini</p>
      </footer>
    </div>
  );
};

export default App;