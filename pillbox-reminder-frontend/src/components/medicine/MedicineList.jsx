import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import MedicineCard from './MedicineCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { useMedicines } from '../hooks/useMedicines';
import { useReminders } from '../hooks/useReminders';

const MedicineList = () => {
  const { medicines, loading, deleteMedicine, toggleMedicineActive } = useMedicines();
  const { todayReminders } = useReminders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = medicines || [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.prescribedBy?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(med => med.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      const now = new Date();
      switch (filterStatus) {
        case 'active':
          filtered = filtered.filter(med => med.active && new Date(med.endDate) > now);
          break;
        case 'inactive':
          filtered = filtered.filter(med => !med.active);
          break;
        case 'expired':
          filtered = filtered.filter(med => new Date(med.endDate) <= now);
          break;
        case 'expiring-soon':
          const oneWeekFromNow = new Date();
          oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
          filtered = filtered.filter(med => 
            new Date(med.endDate) > now && 
            new Date(med.endDate) <= oneWeekFromNow
          );
          break;
        case 'low-stock':
          filtered = filtered.filter(med => med.stockQuantity && med.stockQuantity < 7);
          break;
        default:
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date-added':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'end-date':
          return new Date(a.endDate) - new Date(b.endDate);
        case 'frequency':
          return a.frequency.localeCompare(b.frequency);
        case 'stock':
          return (b.stockQuantity || 0) - (a.stockQuantity || 0);
        default:
          return 0;
      }
    });

    setFilteredMedicines(filtered);
  }, [medicines, searchTerm, filterType, filterStatus, sortBy]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      await deleteMedicine(id);
    }
  };

  const handleToggleActive = async (id) => {
    await toggleMedicineActive(id);
  };

  const getStats = () => {
    if (!medicines) return { total: 0, active: 0, expired: 0, lowStock: 0 };

    const now = new Date();
    return {
      total: medicines.length,
      active: medicines.filter(m => m.active && new Date(m.endDate) > now).length,
      expired: medicines.filter(m => new Date(m.endDate) <= now).length,
      lowStock: medicines.filter(m => m.stockQuantity && m.stockQuantity < 7).length
    };
  };

  const stats = getStats();

  const medicineTypes = [
    { value: 'all', label: 'All Types', icon: '💊' },
    { value: 'tablet', label: 'Tablets', icon: '💊' },
    { value: 'capsule', label: 'Capsules', icon: '💊' },
    { value: 'liquid', label: 'Liquid', icon: '🧴' },
    { value: 'injection', label: 'Injections', icon: '💉' },
    { value: 'inhaler', label: 'Inhalers', icon: '🫁' },
    { value: 'drops', label: 'Drops', icon: '💧' },
    { value: 'cream', label: 'Creams', icon: '🧴' },
    { value: 'patch', label: 'Patches', icon: '🩹' }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Medicines', icon: ClockIcon, color: 'text-gray-600' },
    { value: 'active', label: 'Active', icon: CheckCircleIcon, color: 'text-green-600' },
    { value: 'inactive', label: 'Inactive', icon: XCircleIcon, color: 'text-gray-600' },
    { value: 'expired', label: 'Expired', icon: ExclamationTriangleIcon, color: 'text-red-600' },
    { value: 'expiring-soon', label: 'Expiring Soon', icon: ExclamationTriangleIcon, color: 'text-yellow-600' },
    { value: 'low-stock', label: 'Low Stock', icon: ExclamationTriangleIcon, color: 'text-orange-600' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'date-added', label: 'Recently Added' },
    { value: 'end-date', label: 'End Date' },
    { value: 'frequency', label: 'Frequency' },
    { value: 'stock', label: 'Stock Level' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Medicines</h1>
          <p className="text-gray-600 mt-1">Manage your medication list and schedules</p>
        </div>
        <Link
          to="/medicines/add"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pill-500 to-pill-600 text-white rounded-lg hover:from-pill-600 hover:to-pill-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Medicine
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { title: 'Total Medicines', value: stats.total, color: 'bg-blue-500', icon: '💊' },
          { title: 'Active', value: stats.active, color: 'bg-green-500', icon: '✅' },
          { title: 'Expired', value: stats.expired, color: 'bg-red-500', icon: '⚠️' },
          { title: 'Low Stock', value: stats.lowStock, color: 'bg-orange-500', icon: '📦' }
        ].map((stat, index) => (
          <div
            key={stat.title}
            className="relative bg-white rounded-lg shadow-md p-4 overflow-hidden"
          >
            {/* PatternCraft Background */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, transparent 40%, rgba(59, 130, 246, 0.1) 50%, transparent 60%)
              `
            }} />
            
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search and Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative bg-white rounded-xl shadow-lg p-6 overflow-hidden"
      >
        {/* PatternCraft Background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.05) 50%, transparent 70%),
            radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)
          `,
          backgroundSize: '100% 100%, 15px 15px'
        }} />
        
        <div className="relative space-y-4">
          {/* Search Bar and Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines by name, dosage, or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-3 border rounded-lg transition-colors ${
                showFilters 
                  ? 'border-pill-500 bg-pill-50 text-pill-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 pt-4 space-y-4"
              >
                {/* Medicine Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Type</label>
                  <div className="flex flex-wrap gap-2">
                    {medicineTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFilterType(type.value)}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterType === type.value
                            ? 'bg-pill-100 text-pill-700 border border-pill-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                        }`}
                      >
                        <span className="mr-1">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {statusFilters.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => setFilterStatus(status.value)}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === status.value
                            ? 'bg-pill-100 text-pill-700 border border-pill-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                        }`}
                      >
                        <status.icon className={`h-4 w-4 mr-1 ${status.color}`} />
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                      setFilterStatus('all');
                      setSortBy('name');
                    }}
                    className="text-sm text-pill-600 hover:text-pill-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Results Summary */}
      {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between text-sm text-gray-600"
        >
          <span>
            Showing {filteredMedicines.length} of {medicines?.length || 0} medicines
          </span>
          {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterStatus('all');
              }}
              className="text-pill-600 hover:text-pill-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </motion.div>
      )}

      {/* Medicine Grid */}
      <AnimatePresence>
        {filteredMedicines.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-16"
          >
            <div className="relative bg-white rounded-xl shadow-lg p-12 overflow-hidden">
              {/* PatternCraft Background */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%),
                  linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)
                `
              }} />
              
              <div className="relative">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">💊</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                    ? 'No medicines found' 
                    : 'No medicines yet'
                  }
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                    : 'Get started by adding your first medicine to keep track of your medication schedule.'
                  }
                </p>
                <Link
                  to="/medicines/add"
                  className="inline-flex items-center px-6 py-3 bg-pill-500 text-white rounded-lg hover:bg-pill-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Your First Medicine
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((medicine, index) => (
              <motion.div
                key={medicine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <MedicineCard 
                  medicine={medicine} 
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicineList;
