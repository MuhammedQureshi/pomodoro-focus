'use client';

import { useState } from 'react';
import { BarChart, Clock, Calendar, Target, Zap, Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DailyStats {
  date: string;
  focusMinutes: number;
  sessions: number;
  completedTasks: number;
  interruptions: number;
}

interface Streak {
  current: number;
  best: number;
  lastActive: string;
}

const mockWeeklyData: DailyStats[] = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  focusMinutes: Math.floor(Math.random() * 240),
  sessions: Math.floor(Math.random() * 8),
  completedTasks: Math.floor(Math.random() * 6),
  interruptions: Math.floor(Math.random() * 4),
}));

const mockStreak: Streak = {
  current: 4,
  best: 7,
  lastActive: new Date().toISOString(),
};

export default function Analytics() {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const todayStats = mockWeeklyData[mockWeeklyData.length - 1];
  
  const totalFocusTime = mockWeeklyData.reduce((acc, curr) => acc + curr.focusMinutes, 0);
  const totalSessions = mockWeeklyData.reduce((acc, curr) => acc + curr.sessions, 0);
  const totalTasks = mockWeeklyData.reduce((acc, curr) => acc + curr.completedTasks, 0);
  const productivityScore = Math.round((totalFocusTime / (mockWeeklyData.length * 240)) * 100);

  // Calculate trends
  const previousWeekMinutes = 840; // Mock data
  const focusTimeTrend = ((totalFocusTime - previousWeekMinutes) / previousWeekMinutes) * 100;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className={`flex gap-1 p-1 rounded-lg w-fit
        ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}
      >
        {(['today', 'week', 'month'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
              selectedPeriod === period 
                ? theme === 'dark'
                  ? 'bg-white/10 text-white'
                  : 'bg-white text-slate-900 shadow-sm'
                : theme === 'dark'
                  ? 'text-white/60 hover:text-white/80'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-2xl p-4 transition-colors
          ${theme === 'dark'
            ? 'bg-white/5 backdrop-blur-lg'
            : 'bg-white shadow-lg shadow-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            <h3 className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
              Focus Time
            </h3>
          </div>
          <p className="text-2xl font-light">
            {selectedPeriod === 'today' 
              ? `${todayStats.focusMinutes} min`
              : `${totalFocusTime} min`
            }
          </p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            focusTimeTrend >= 0 ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {focusTimeTrend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(Math.round(focusTimeTrend))}% vs last week
          </div>
        </div>

        <div className={`rounded-2xl p-4 transition-colors
          ${theme === 'dark'
            ? 'bg-white/5 backdrop-blur-lg'
            : 'bg-white shadow-lg shadow-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <h3 className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
              Sessions
            </h3>
          </div>
          <p className="text-2xl font-light">
            {selectedPeriod === 'today' ? todayStats.sessions : totalSessions}
          </p>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
            Avg {Math.round(totalSessions / mockWeeklyData.length)} per day
          </p>
        </div>

        <div className={`rounded-2xl p-4 transition-colors
          ${theme === 'dark'
            ? 'bg-white/5 backdrop-blur-lg'
            : 'bg-white shadow-lg shadow-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            <h3 className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
              Productivity
            </h3>
          </div>
          <p className="text-2xl font-light">{productivityScore}%</p>
          <div className={`w-full rounded-full h-1.5 mt-2 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${productivityScore}%` }}
            />
          </div>
        </div>

        <div className={`rounded-2xl p-4 transition-colors
          ${theme === 'dark'
            ? 'bg-white/5 backdrop-blur-lg'
            : 'bg-white shadow-lg shadow-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <h3 className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
              Streak
            </h3>
          </div>
          <p className="text-2xl font-light">{mockStreak.current} days</p>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
            Best: {mockStreak.best} days
          </p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Focus Distribution */}
        <div className={`rounded-2xl p-6 transition-colors
          ${theme === 'dark'
            ? 'bg-white/5 backdrop-blur-lg'
            : 'bg-white shadow-lg shadow-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart className="w-5 h-5 text-emerald-500" />
            <h3 className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
              Focus Distribution
            </h3>
          </div>
          <div className="space-y-4">
            {mockWeeklyData.map((day, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className={`text-sm w-10 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
                  {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(day.focusMinutes / 240) * 100}%` }}
                  />
                </div>
                <span className={`text-sm w-16 text-right ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                  {day.focusMinutes} min
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Completion */}
        <div className={`rounded-2xl p-6 transition-colors
          ${theme === 'dark'
            ? 'bg-white/5 backdrop-blur-lg'
            : 'bg-white shadow-lg shadow-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <h3 className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
              Task Completion
            </h3>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between text-sm">
              <span className={theme === 'dark' ? 'text-white/60' : 'text-slate-500'}>Total Tasks Completed</span>
              <span className="font-medium">{totalTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={theme === 'dark' ? 'text-white/60' : 'text-slate-500'}>Daily Average</span>
              <span className="font-medium">
                {Math.round(totalTasks / mockWeeklyData.length)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={theme === 'dark' ? 'text-white/60' : 'text-slate-500'}>Focus Time per Task</span>
              <span className="font-medium">
                {Math.round(totalFocusTime / totalTasks)} min
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={theme === 'dark' ? 'text-white/60' : 'text-slate-500'}>Interruptions</span>
              <span className="font-medium text-red-400">
                {mockWeeklyData.reduce((acc, curr) => acc + curr.interruptions, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 