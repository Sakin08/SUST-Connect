import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PollCard from '../components/PollCard';
import pollsApi from '../api/polls';
import { BarChart3, Plus, Filter } from 'lucide-react';

const Polls = () => {
    const { user } = useAuth();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ type: '', category: '', status: '' });

    useEffect(() => {
        loadPolls();
    }, [filter]);

    const loadPolls = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter.type) params.type = filter.type;
            if (filter.category) params.category = filter.category;
            if (filter.status) params.status = filter.status;

            const res = await pollsApi.getAll(params);
            setPolls(res.data);
        } catch (error) {
            console.error('Failed to load polls:', error);
        } finally {
            setLoading(false);
        }
    };

    // All logged-in users can create polls (restrictions apply based on type)
    const canCreatePoll = !!user;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
                <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-bold text-gray-800">Loading polls...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 sm:py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-2xl shadow-lg">
                                <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                                    Campus Polls
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 mt-1">Voice your opinion, shape your campus</p>
                            </div>
                        </div>

                        {canCreatePoll && (
                            <Link
                                to="/polls/create"
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Create Poll</span>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Filters */}
                <div className="mb-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-gray-900">Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                            value={filter.type}
                            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Types</option>
                            <option value="opinion">Opinion</option>
                            <option value="election">Election</option>
                            <option value="feedback">Feedback</option>
                            <option value="survey">Survey</option>
                        </select>

                        <select
                            value={filter.category}
                            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            <option value="general">General</option>
                            <option value="union">Student Union</option>
                            <option value="department">Department</option>
                            <option value="club">Club</option>
                            <option value="hall">Hall/Residential</option>
                            <option value="academic">Academic</option>
                            <option value="transport">Transport</option>
                            <option value="dining">Dining</option>
                            <option value="hostel">Hostel</option>
                            <option value="event">Event</option>
                        </select>

                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="ended">Ended</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-md">
                        <span className="text-2xl font-black">{polls.length}</span>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-800">
                            {polls.length === 1 ? 'Poll Found' : 'Polls Found'}
                        </p>
                    </div>
                </div>

                {/* Polls Grid */}
                {polls.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-16 text-center border border-white/20">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="w-12 h-12 text-purple-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No polls found</h3>
                        <p className="text-gray-600 mb-6">
                            {filter.type || filter.category || filter.status
                                ? "Try adjusting your filters"
                                : "Be the first to create a poll!"}
                        </p>
                        {canCreatePoll && (
                            <Link
                                to="/polls/create"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Create First Poll
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {polls.map(poll => (
                            <PollCard key={poll._id} poll={poll} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Polls;
