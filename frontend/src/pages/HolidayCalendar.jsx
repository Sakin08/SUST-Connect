import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const HolidayCalendar = () => {
    const { user } = useAuth();
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [holidayName, setHolidayName] = useState('');
    const [holidayType, setHolidayType] = useState('university');
    const [rangeMode, setRangeMode] = useState(false);
    const [rangeStart, setRangeStart] = useState(null);
    const [rangeEnd, setRangeEnd] = useState(null);

    const isAdmin = user && user.role === 'admin';

    useEffect(() => {
        loadHolidays();
    }, []);

    const loadHolidays = async () => {
        try {
            const res = await api.get('/holidays');
            setHolidays(res.data);
        } catch (error) {
            console.error('Failed to load holidays:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const isHoliday = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return holidays.find(h => h.date.split('T')[0] === dateStr);
    };

    const handleDateClick = (day) => {
        if (!isAdmin) return;

        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const holiday = isHoliday(clickedDate);

        if (holiday) {
            // Delete holiday
            if (confirm(`Remove holiday: ${holiday.name}?`)) {
                deleteHoliday(holiday._id);
            }
        } else {
            // Add holiday
            if (rangeMode) {
                // Range selection mode
                if (!rangeStart) {
                    setRangeStart(clickedDate);
                } else if (!rangeEnd) {
                    if (clickedDate < rangeStart) {
                        setRangeEnd(rangeStart);
                        setRangeStart(clickedDate);
                    } else {
                        setRangeEnd(clickedDate);
                    }
                    setShowModal(true);
                }
            } else {
                // Single date mode
                setSelectedDate(clickedDate);
                setShowModal(true);
            }
        }
    };

    const addHoliday = async () => {
        if (!holidayName.trim()) {
            alert('Please enter holiday name');
            return;
        }

        try {
            if (rangeMode && rangeStart && rangeEnd) {
                // Add holidays for date range
                const dates = [];
                const current = new Date(rangeStart);
                while (current <= rangeEnd) {
                    dates.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                }

                // Create holiday for each date
                await Promise.all(dates.map(date =>
                    api.post('/holidays', {
                        name: holidayName,
                        date: date.toISOString(),
                        type: holidayType
                    })
                ));
            } else {
                // Single date
                await api.post('/holidays', {
                    name: holidayName,
                    date: selectedDate.toISOString(),
                    type: holidayType
                });
            }

            setShowModal(false);
            setHolidayName('');
            setHolidayType('university');
            setRangeStart(null);
            setRangeEnd(null);
            loadHolidays();
        } catch (error) {
            alert('Failed to add holiday');
        }
    };

    const deleteHoliday = async (id) => {
        try {
            await api.delete(`/holidays/${id}`);
            loadHolidays();
        } catch (error) {
            alert('Failed to delete holiday');
        }
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="h-16 sm:h-20 bg-gray-50 rounded"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday (5) or Saturday (6)
        const holiday = isHoliday(date);
        const isToday = new Date().toDateString() === date.toDateString();
        const isRangeStart = rangeStart && date.toDateString() === rangeStart.toDateString();
        const isInRange = rangeStart && rangeEnd && date >= rangeStart && date <= rangeEnd;
        const isRangePreview = rangeStart && !rangeEnd && date >= rangeStart;

        days.push(
            <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`h-16 sm:h-20 border p-1 sm:p-2 transition rounded ${isAdmin ? 'cursor-pointer hover:shadow' : ''
                    } ${isToday ? 'ring-2 ring-blue-500' : ''
                    } ${holiday
                        ? 'bg-green-100 border-green-300'
                        : isWeekend
                            ? 'bg-red-50 border-red-200'
                            : isInRange
                                ? 'bg-blue-100 border-blue-300'
                                : isRangeStart
                                    ? 'bg-blue-200 ring-2 ring-blue-500 border-blue-400'
                                    : isRangePreview
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
            >
                <div className="flex justify-between items-start">
                    <span className={`text-xs sm:text-sm font-bold ${isToday
                        ? 'text-blue-600'
                        : holiday
                            ? 'text-green-700'
                            : isWeekend
                                ? 'text-red-600'
                                : 'text-gray-700'
                        }`}>
                        {day}
                    </span>
                    {holiday && (
                        <span className="text-xs sm:text-sm">
                            {holiday.type === 'national' ? '🇧🇩' : holiday.type === 'religious' ? '🕌' : '🎓'}
                        </span>
                    )}
                </div>
                {holiday && (
                    <div className="mt-0.5">
                        <p className="text-[9px] sm:text-xs font-semibold text-green-800 line-clamp-2 leading-tight">
                            {holiday.name}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-teal-100">
                <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-bold text-gray-800">Loading calendar...</p>
                    <p className="text-sm text-gray-500 mt-2">Fetching holiday information</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-4 sm:py-6 pb-20 sm:pb-8">
            <div className="container mx-auto px-2 sm:px-4 max-w-5xl">
                {/* Header */}
                <header className="text-center mb-4 sm:mb-6">
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-xl shadow-lg">
                            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                Holiday Calendar
                            </h1>
                            <p className="text-xs text-emerald-200">SUST</p>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                            <button
                                onClick={() => {
                                    setRangeMode(!rangeMode);
                                    setRangeStart(null);
                                    setRangeEnd(null);
                                }}
                                className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${rangeMode
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300'
                                    }`}
                            >
                                {rangeMode ? 'Range Mode' : 'Single Date'}
                            </button>
                            {rangeMode && rangeStart && !rangeEnd && (
                                <button
                                    onClick={() => {
                                        setRangeStart(null);
                                        setRangeEnd(null);
                                    }}
                                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-xs sm:text-sm"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    )}
                    {isAdmin && rangeMode && (
                        <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                            {!rangeStart ? 'Click start date' : !rangeEnd ? 'Click end date' : 'Range selected'}
                        </div>
                    )}
                </header>

                {/* Calendar Navigation */}
                <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <button
                            onClick={previousMonth}
                            className="p-2 hover:bg-green-500 hover:text-white rounded-lg transition"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg sm:text-xl font-bold text-green-600">
                            {monthName} {year}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-green-500 hover:text-white rounded-lg transition"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1 sm:mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                            <div
                                key={day}
                                className={`text-center font-bold text-xs py-1.5 sm:py-2 rounded ${idx === 5 || idx === 6
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                    }`}
                            >
                                <span className="hidden sm:inline">{day}</span>
                                <span className="sm:hidden">{day.slice(0, 1)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {days}
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
                    <div className="flex gap-4 justify-center items-center">
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                            <div className="w-3 h-3 bg-red-400 rounded"></div>
                            <span className="text-xs font-semibold text-red-800">Weekend (Fri & Sat)</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg border border-green-200">
                            <div className="w-3 h-3 bg-green-400 rounded"></div>
                            <span className="text-xs font-semibold text-green-800">Holiday</span>
                        </div>
                    </div>
                </div>

                {/* Add Holiday Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-white/20 animate-slideUp">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                                    <CalendarIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900">
                                    {rangeMode ? 'Add Holiday Range' : 'Add Holiday'}
                                </h3>
                            </div>

                            {rangeMode && rangeStart && rangeEnd ? (
                                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                                    <p className="text-sm font-bold text-gray-800 mb-2">
                                        📅 <strong>From:</strong> {rangeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-sm font-bold text-gray-800 mb-2">
                                        📅 <strong>To:</strong> {rangeEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs font-bold text-blue-600 mt-2 px-3 py-1 bg-blue-100 rounded-lg inline-block">
                                        {Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1} days total
                                    </p>
                                </div>
                            ) : (
                                <p className="text-gray-700 font-semibold mb-6 p-3 bg-gray-100 rounded-xl">
                                    📅 {selectedDate?.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        <span className="text-green-600">✏️</span> Holiday Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={holidayName}
                                        onChange={(e) => setHolidayName(e.target.value)}
                                        placeholder="e.g., Independence Day"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        <span className="text-purple-600">🏷️</span> Holiday Type
                                    </label>
                                    <select
                                        value={holidayType}
                                        onChange={(e) => setHolidayType(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-bold"
                                    >
                                        <option value="national">🇧🇩 National Holiday</option>
                                        <option value="religious">🕌 Religious Holiday</option>
                                        <option value="university">🎓 University Holiday</option>
                                    </select>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={addHoliday}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-black shadow-lg hover:shadow-xl hover:scale-105"
                                    >
                                        ✓ Add Holiday
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setHolidayName('');
                                            setHolidayType('university');
                                            setRangeStart(null);
                                            setRangeEnd(null);
                                        }}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold hover:scale-105"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HolidayCalendar;
