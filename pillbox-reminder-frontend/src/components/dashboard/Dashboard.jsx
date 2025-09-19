import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircleIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  HeartIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TodayReminders from './TodayReminders';
import AdherenceStats from './AdherenceStats';
import QuickActions from './QuickActions';
import UpcomingDoses from './UpcomingDoses';
import { useMedicines } from '../hooks/useMedicines';
import { useReminders } from '../hooks/useReminders';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const { medicines } = useMedicines();
  const { todayReminders, adherenceData, weeklyStats } = useReminders();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sample data for charts
  const weeklyAdherence = weeklyStats || [
    { day: 'Mon', taken: 8, missed: 2, scheduled: 10 },
    { day: 'Tue', taken: 9, missed: 1, scheduled: 10 },
    { day: 'Wed', taken: 7, missed: 3, scheduled: 10 },
    { day: 'Thu', taken: 10, missed: 0, scheduled: 10 },
    { day: 'Fri', taken: 8, missed: 2, scheduled: 10 },
    { day: 'Sat', taken: 9, missed: 1, scheduled: 10 },
    { day: 'Sun', taken: 8, missed: 2, scheduled: 10 },
  ];

  const medicineTypes = [
    { name: 'Tablets', value: 45, color: '#0ea5e9', count: medicines?.filter(m => m.type === 'tablet').length || 0 },
    { name: 'Capsules', value: 30, color: '#8b5cf6', count: medicines?.filter(m => m.type === 'capsule').length || 0 },
    { name: 'Liquid', value: 15, color: '#06d6a0', count: medicines?.filter(m => m.type === 'liquid').length || 0 },
    { name: 'Injection', value: 10, color: '#f59e0b', count: medicines?.filter(m => m.type === 'injection').length || 0 },
  ];

  const monthlyTrend = [
    { month: 'Jan', adherence: 85, target: 90 },
    { month: 'Feb', adherence: 88, target: 90 },
    { month: 'Mar', adherence: 92, target: 90 },
    { month: 'Apr', adherence: 87, target: 90 },
    { month: 'May', adherence: 94, target: 90 },
    { month: 'Jun', adherence: 89, target: 90 },
  ];

  const calculateAdherence = () => {
    if (!todayReminders?.length) return 0;
    const completed = todayReminders.filter(r => r.taken).length;
    return Math.round((completed / todayReminders.length) * 100);
  };

  const stats = [
    {
      title: 'Total Medicines',
      value: medicines?.length || 0,
      icon: PlusCircleIcon,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Today\'s Reminders',
      value: todayReminders?.length || 0,
      icon: ClockIcon,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Completed Today',
      value: todayReminders?.filter(r => r.taken)?.length || 0,
      icon: CheckCircleIcon,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Today\'s Adherence',
      value: `${calculateAdherence()}%`,
      icon: HeartIcon,
      color: 'bg-gradient-to-r from-pink-500 to-pink-600',
      trend: calculateAdherence() >= 90 ? '+2%' : '-1%',
      trendUp: calculateAdherence() >= 90
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pill-500 via-blue-600 to-purple-600 p-8 text-white"
      >
        {/* PatternCraft Background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `
        }} />
        
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.displayName || 'User'}! 👋</h1>
              <p className="text-lg opacity-90 mb-4">Stay on track with your medication schedule</p>
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-4xl">💊</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {/* PatternCraft Background */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 197, 253, 0.05) 100%),
                radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)
              `,
              backgroundSize: '100% 100%, 20px 20px'
            }} />
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Adherence Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-white rounded-xl shadow-lg p-6 overflow-hidden"
          >
            {/* PatternCraft Background */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 40%, rgba(59, 130, 246, 0.03) 50%, transparent 60%),
                radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.1) 1px, transparent 0)
              `,
              backgroundSize: '100% 100%, 15px 15px'
            }} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Weekly Adherence</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-pill-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Taken</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Missed</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyAdherence}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="taken" 
                    stackId="a" 
                    fill="#0ea5e9" 
                    radius={[0, 0, 4, 4]}
                    name="Taken"
                  />
                  <Bar 
                    dataKey="missed" 
                    stackId="a" 
                    fill="#ef4444" 
                    radius={[4, 4, 0, 0]}
                    name="Missed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Adherence Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-white rounded-xl shadow-lg p-6 overflow-hidden"
          >
            {/* PatternCraft Background */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `
                conic-gradient(from 90deg at 50% 50%, transparent, rgba(59, 130, 246, 0.1), transparent),
                radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)
              `,
              backgroundSize: '100% 100%, 25px 25px'
            }} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">6-Month Adherence Trend</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Target: 90%</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="adherence"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    fill="url(#adherenceGradient)"
                    name="Adherence %"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <TodayReminders />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Medicine Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-white rounded-xl shadow-lg p-6 overflow-hidden"
          >
            {/* PatternCraft Background */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `
                repeating-conic-gradient(from 0deg, transparent 0deg 45deg, rgba(59, 130, 246, 0.05) 45deg 90deg),
                radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)
              `,
              backgroundSize: '60px 60px, 20px 20px'
            }} />
            
            <div className="relative">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Medicine Types</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={medicineTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {medicineTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-3">
                {medicineTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm text-gray-600">{type.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{type.count}</span>
                      <span className="text-xs text-gray-500">({type.value}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <QuickActions />
          <UpcomingDoses />
          <AdherenceStats />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
