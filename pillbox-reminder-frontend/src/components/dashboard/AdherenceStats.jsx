import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useReminders } from '../hooks/useReminders';

const AdherenceStats = () => {
  const { adherenceData, weeklyStats, monthlyStats } = useReminders();
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, year

  const calculateStreak = () => {
    // Mock calculation - replace with actual logic
    return adherenceData?.currentStreak || 5;
  };

  const calculateAdherence = (period = 'week') => {
    const stats = period === 'week' ? weeklyStats : monthlyStats;
    if (!stats?.length) return 0;
    
    const totalScheduled = stats.reduce((sum, day) => sum + (day.scheduled || 0), 0);
    const totalTaken = stats.reduce((sum, day) => sum + (day.taken || 0), 0);
    
    return totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;
  };

  const getAdherenceGrade = (percentage) => {
    if (percentage >= 95) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 85) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 75) return { grade: 'C+', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const currentAdherence = calculateAdherence(selectedPeriod);
  const adherenceGrade = getAdherenceGrade(currentAdherence);
  const streak = calculateStreak();

  const stats = [
    {
      title: 'Current Streak',
      value: `${streak} days`,
      icon: FireIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      trend: streak > 3 ? '+1' : '0',
      trendUp: streak > 3
    },
    {
      title: 'Best Streak',
      value: `${adherenceData?.bestStreak || 12} days`,
      icon: TrophyIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      trend: null,
      trendUp: null
    },
    {
      title: 'This Month',
      value: `${calculateAdherence('month')}%`,
      icon: CalendarDaysIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      trend: '+2%',
      trendUp: true
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="relative bg-white rounded-xl shadow-lg p-6 overflow-hidden"
    >
      {/* PatternCraft Background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
          linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)
        `,
        backgroundSize: '50px 50px, 50px 50px, 100% 100%'
      }} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-6 w-6 text-pill-600" />
            <h2 className="text-xl font-semibold text-gray-900">Adherence Stats</h2>
          </div>
          
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-pill-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <CircularProgressbar
              value={currentAdherence}
              text={`${currentAdherence}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: currentAdherence >= 90 ? '#10b981' : currentAdherence >= 75 ? '#0ea5e9' : '#ef4444',
                textColor: '#374151',
                trailColor: '#f3f4f6',
                backgroundColor: '#ffffff',
              })}
            />
            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-medium ${adherenceGrade.bg} ${adherenceGrade.color}`}>
              Grade {adherenceGrade.grade}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4 mb-6">
          {stats.map((stat, index) => (
            <div key={stat.title} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">{stat.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
                {stat.trend && (
                  <span className={`text-xs ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trendUp ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 inline mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 inline mr-1" />
                    )}
                    {stat.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Achievements</h3>
          <div className="space-y-2">
            {streak >= 7 && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <TrophyIcon className="h-4 w-4" />
                <span>Week Warrior - 7 day streak!</span>
              </div>
            )}
            {currentAdherence >= 90 && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span>Consistency Champion - 90%+ adherence</span>
              </div>
            )}
            {streak >= 30 && (
              <div className="flex items-center space-x-2 text-sm text-purple-600">
                <FireIcon className="h-4 w-4" />
                <span>Monthly Master - 30 day streak!</span>
              </div>
            )}
            
            {/* No achievements message */}
            {streak < 7 && currentAdherence < 90 && (
              <div className="text-sm text-gray-500 italic">
                Keep taking your medicines to unlock achievements! 🎯
              </div>
            )}
          </div>
        </div>

        {/* Motivational Message */}
        <div className="mt-4 p-3 bg-gradient-to-r from-pill-50 to-blue-50 rounded-lg border-l-4 border-pill-500">
          <p className="text-sm text-gray-700">
            {currentAdherence >= 95 ? (
              "🌟 Excellent work! You're maintaining perfect adherence!"
            ) : currentAdherence >= 85 ? (
              "💪 Great job! You're doing well with your medication routine."
            ) : currentAdherence >= 75 ? (
              "📈 Good progress! Try to be more consistent with your schedule."
            ) : (
              "🎯 Let's improve together! Consistency is key to better health."
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdherenceStats;
