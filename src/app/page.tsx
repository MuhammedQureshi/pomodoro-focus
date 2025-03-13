'use client';

import { Play, Pause, RotateCcw, Settings, Plus, Check, X, Moon, Sun } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Analytics from './components/Analytics';
import SoundManager from './utils/sound';
import { useTheme } from './contexts/ThemeContext';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';
type TimerStatus = 'idle' | 'running' | 'paused';
type TabType = 'timer' | 'analytics';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface TimerSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  
  // Timer State
  const [mode, setMode] = useState<TimerMode>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('timer');
  
  // Settings State
  const [settings, setSettings] = useState<TimerSettings>({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: true,
    autoStartPomodoros: true,
    soundEnabled: true,
    soundVolume: 0.7,
  });

  // Task State
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoro-tasks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [currentTask, setCurrentTask] = useState<string>('');

  // Add new state for start time and last update
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Timer Controls
  const toggleTimer = useCallback(() => {
    setStatus(status => status === 'running' ? 'paused' : 'running');
  }, []);

  const resetTimer = useCallback(() => {
    setStatus('idle');
    setTimeLeft(settings[mode] * 60);
  }, [mode, settings]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setStatus('idle');
    setTimeLeft(settings[newMode] * 60);
  }, [settings]);

  // Update the Play Sound function
  const playNotification = useCallback(() => {
    if (settings.soundEnabled) {
      SoundManager.playNotification(settings.soundVolume);
    }
  }, [settings]);

  // Timer Logic
  useEffect(() => {
    let animationFrameId: number;
    
    const updateTimer = (currentTime: number) => {
      if (!startTime || !lastUpdate) return;
      
      const elapsed = Math.floor((currentTime - lastUpdate) / 1000);
      
      if (elapsed >= 1) {
        setTimeLeft((time) => {
          if (time <= 1) {
            setStatus('idle');
            playNotification();
            
            // Auto-start next session if enabled
            if (mode === 'work' && settings.autoStartBreaks) {
              setTimeout(() => switchMode('shortBreak'), 1000);
            } else if ((mode === 'shortBreak' || mode === 'longBreak') && settings.autoStartPomodoros) {
              setTimeout(() => switchMode('work'), 1000);
            }
            
            return 0;
          }
          return time - elapsed;
        });
        setLastUpdate(currentTime);
      }
      
      if (status === 'running') {
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };

    if (status === 'running') {
      if (!startTime || !lastUpdate) {
        const now = performance.now();
        setStartTime(now);
        setLastUpdate(now);
      }
      animationFrameId = requestAnimationFrame(updateTimer);
    } else {
      setStartTime(null);
      setLastUpdate(null);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [status, mode, settings, startTime, lastUpdate, playNotification, switchMode]);

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard Shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Only handle shortcuts when timer tab is active
    if (activeTab !== 'timer') return;

    switch (event.key.toLowerCase()) {
      case ' ':  // Space
        event.preventDefault();
        toggleTimer();
        break;
      case 'r':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          resetTimer();
        }
        break;
      case 'w':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          switchMode('work');
        }
        break;
      case 'b':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          switchMode('shortBreak');
        }
        break;
      case 'l':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          switchMode('longBreak');
        }
        break;
      case 's':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          setIsSettingsOpen(true);
        }
        break;
    }
  }, [activeTab, toggleTimer, resetTimer, switchMode]);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Task Functions
  const addTask = () => {
    if (!currentTask.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: currentTask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    setTasks(prev => [newTask, ...prev]);
    setCurrentTask('');
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTask();
    }
  };

  return (
    <main className={`min-h-screen transition-colors duration-300
      ${theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' 
        : 'bg-gradient-to-br from-slate-100 to-white text-slate-900'
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-light tracking-wide">Pomodoro Focus</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors
                ${theme === 'dark'
                  ? 'hover:bg-white/10'
                  : 'hover:bg-slate-100'
                }`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-full transition-colors
                ${theme === 'dark'
                  ? 'hover:bg-white/10'
                  : 'hover:bg-slate-100'
                }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className={`flex gap-1 p-1 rounded-lg w-fit mb-8
          ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}
        >
          <button
            onClick={() => setActiveTab('timer')}
            className={`py-2 px-6 rounded-md text-sm font-medium transition-all ${
              activeTab === 'timer' 
                ? theme === 'dark'
                  ? 'bg-white/10 text-white'
                  : 'bg-white text-slate-900 shadow-sm'
                : theme === 'dark'
                  ? 'text-white/60 hover:text-white/80'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-6 rounded-md text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? theme === 'dark'
                  ? 'bg-white/10 text-white'
                  : 'bg-white text-slate-900 shadow-sm'
                : theme === 'dark'
                  ? 'text-white/60 hover:text-white/80'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Timer View */}
        {activeTab === 'timer' && (
          <>
            {/* Timer Card */}
            <div className={`rounded-2xl p-8 mb-8 transition-colors
              ${theme === 'dark'
                ? 'bg-white/5 backdrop-blur-lg'
                : 'bg-white shadow-lg shadow-slate-200'
              }`}
            >
              {/* Mode Selector */}
              <div className={`flex gap-1 mb-8 p-1 rounded-lg
                ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}
              >
                {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((timerMode) => (
                  <button
                    key={timerMode}
                    onClick={() => switchMode(timerMode)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all group relative ${
                      mode === timerMode 
                        ? theme === 'dark'
                          ? 'bg-white/10 text-white'
                          : 'bg-white text-slate-900'
                        : theme === 'dark'
                          ? 'text-white/60 hover:text-white/80'
                          : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {timerMode === 'work' ? 'Focus' : timerMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/40 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {timerMode === 'work' ? 'Ctrl+W' : timerMode === 'shortBreak' ? 'Ctrl+B' : 'Ctrl+L'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="text-8xl font-light tracking-tighter mb-4 tabular-nums">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleTimer}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors group relative"
                >
                  {status === 'running' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {status === 'running' ? 'Pause' : 'Start'}
                  <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                    ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}`}
                  >
                    Space
                  </span>
                </button>
                <button
                  onClick={resetTimer}
                  className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors group relative
                    ${theme === 'dark'
                      ? 'bg-white/5 hover:bg-white/10'
                      : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                  <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                    ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}`}
                  >
                    Ctrl+R
                  </span>
                </button>
              </div>
            </div>

            {/* Task Section */}
            <div className={`rounded-2xl p-6 transition-colors
              ${theme === 'dark'
                ? 'bg-white/5 backdrop-blur-lg'
                : 'bg-white shadow-lg shadow-slate-200'
              }`}
            >
              <h2 className="text-lg font-medium mb-4">Tasks</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentTask}
                    onChange={(e) => setCurrentTask(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What are you working on?"
                    className={`flex-1 rounded-lg px-4 py-3 transition-all placeholder:text-slate-400
                      ${theme === 'dark'
                        ? 'bg-white/5 border border-white/10 focus:ring-2 focus:ring-emerald-500/50'
                        : 'bg-slate-100 border border-slate-200 focus:ring-2 focus:ring-emerald-500/50'
                      }`}
                  />
                  <button
                    onClick={addTask}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Task List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {tasks.map(task => (
                    <div 
                      key={task.id}
                      className={`group flex items-center gap-3 rounded-lg p-3 transition-colors
                        ${theme === 'dark'
                          ? 'bg-white/5 hover:bg-white/10'
                          : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                    >
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                          ${task.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : theme === 'dark'
                              ? 'border-white/20 hover:border-white/40'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                      >
                        {task.completed
                          ? <Check className="w-3 h-3 text-white" />
                          : <X className="w-4 h-4" />}
                      </button>
                      <span className={`flex-1 ${
                        task.completed
                          ? theme === 'dark'
                            ? 'text-white/40 line-through'
                            : 'text-slate-400 line-through'
                          : ''
                      }`}>
                        {task.title}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity
                          ${theme === 'dark'
                            ? 'text-white/40 hover:text-white/60'
                            : 'text-slate-400 hover:text-slate-600'
                          }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Analytics View */}
        {activeTab === 'analytics' && <Analytics />}

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className={`rounded-2xl p-6 w-full max-w-md m-4 transition-colors
              ${theme === 'dark'
                ? 'bg-slate-800'
                : 'bg-white shadow-xl'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Settings</h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className={`${theme === 'dark' 
                    ? 'text-white/60 hover:text-white' 
                    : 'text-slate-400 hover:text-slate-600'}`}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className={`text-sm uppercase tracking-wider ${
                    theme === 'dark' ? 'text-white/60' : 'text-slate-500'
                  }`}>Time (minutes)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(settings)
                      .filter(([key]) => ['work', 'shortBreak', 'longBreak'].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <label className={`text-sm ${
                            theme === 'dark' ? 'text-white/80' : 'text-slate-600'
                          }`}>
                            {key === 'work' ? 'Focus' : key === 'shortBreak' ? 'Short Break' : 'Long Break'}
                          </label>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => setSettings({ ...settings, [key]: parseInt(e.target.value) })}
                            className={`w-full rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                              ${theme === 'dark'
                                ? 'bg-white/5 border border-white/10'
                                : 'bg-slate-100 border border-slate-200'
                              }`}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className={`text-sm uppercase tracking-wider ${
                    theme === 'dark' ? 'text-white/60' : 'text-slate-500'
                  }`}>Auto Start</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-600'}>
                        Auto-start Breaks
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.autoStartBreaks}
                        onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })}
                        className={`w-5 h-5 rounded transition-colors focus:ring-emerald-500/50 checked:bg-emerald-500
                          ${theme === 'dark'
                            ? 'border-white/10 bg-white/5'
                            : 'border-slate-300 bg-white'
                          }`}
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-600'}>
                        Auto-start Pomodoros
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.autoStartPomodoros}
                        onChange={(e) => setSettings({ ...settings, autoStartPomodoros: e.target.checked })}
                        className={`w-5 h-5 rounded transition-colors focus:ring-emerald-500/50 checked:bg-emerald-500
                          ${theme === 'dark'
                            ? 'border-white/10 bg-white/5'
                            : 'border-slate-300 bg-white'
                          }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className={`text-sm uppercase tracking-wider ${
                    theme === 'dark' ? 'text-white/60' : 'text-slate-500'
                  }`}>Sound</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-600'}>
                        Enable Sound
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                        className={`w-5 h-5 rounded transition-colors focus:ring-emerald-500/50 checked:bg-emerald-500
                          ${theme === 'dark'
                            ? 'border-white/10 bg-white/5'
                            : 'border-slate-300 bg-white'
                          }`}
                      />
                    </label>
                    <div className="space-y-2">
                      <label className={`text-sm ${
                        theme === 'dark' ? 'text-white/80' : 'text-slate-600'
                      }`}>Volume</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.soundVolume}
                        onChange={(e) => setSettings({ ...settings, soundVolume: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-500"
                        disabled={!settings.soundEnabled}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
