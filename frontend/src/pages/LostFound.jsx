import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LostFoundCard from '../components/LostFoundCard';
import { Search, PlusCircle, AlertTriangle, CheckCircle, Frown } from 'lucide-react'; // Suggested icons

const LostFound = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { user } = useAuth();

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const res = await api.get('/lost-found?status=all');
            setItems(res.data);
        } catch (err) {
            console.error('Failed to load items:', err);
        }
        setLoading(false);
    };

    const handleDelete = async (itemId) => {
        try {
            await api.delete(`/lost-found/${itemId}`);
            setItems(items.filter(item => item._id !== itemId));
        } catch (err) {
            console.error('Failed to delete item:', err);
            alert(err.response?.data?.message || 'Failed to delete item. Please try again.');
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === 'all') return true;
        return item.type === filter;
    });

    // --- Loading State Enhancement ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100">
                <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-bold text-gray-800">Searching for items...</p>
                    <p className="text-sm text-gray-500 mt-2">Helping reunite lost belongings</p>
                </div>
            </div>
        );
    }

    // --- Main Render (Enhanced UI) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

                {/* Header and Action Button */}
                <header className="mb-8 sm:mb-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-red-500 via-orange-600 to-yellow-600 rounded-2xl shadow-lg">
                                <Search className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent tracking-tight">
                                    Lost & Found
                                </h1>
                                <p className="text-sm sm:text-base text-amber-200 mt-1">Help reunite people with their belongings</p>
                            </div>
                        </div>

                        {user && (
                            <Link
                                to="/lost-found/create"
                                className="flex items-center gap-2 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                            >
                                <PlusCircle className="w-5 h-5" />
                                <span>Report Item</span>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Filters (Enhanced design) */}
                <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-3 mb-6 border border-white/20">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${filter === 'all'
                                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md scale-[1.02]'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <span className="text-base">📋</span>
                            <span>All</span>
                            <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${filter === 'all' ? 'bg-white/30' : 'bg-gray-200'
                                }`}>
                                {items.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setFilter('lost')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${filter === 'lost'
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md scale-[1.02]'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                                }`}
                        >
                            <AlertTriangle className={`w-4 h-4 ${filter === 'lost' ? 'text-white' : 'text-red-500'}`} />
                            <span>Lost</span>
                            <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${filter === 'lost' ? 'bg-white/30' : 'bg-red-100'
                                }`}>
                                {items.filter(i => i.type === 'lost').length}
                            </span>
                        </button>
                        <button
                            onClick={() => setFilter('found')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${filter === 'found'
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md scale-[1.02]'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                                }`}
                        >
                            <CheckCircle className={`w-4 h-4 ${filter === 'found' ? 'text-white' : 'text-green-500'}`} />
                            <span>Found</span>
                            <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${filter === 'found' ? 'bg-white/30' : 'bg-green-100'
                                }`}>
                                {items.filter(i => i.type === 'found').length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {filteredItems.map(item => (
                        <LostFoundCard key={item._id} item={item} onDelete={handleDelete} />
                    ))}
                </div>

                {/* Empty State (Enhanced design) */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-20 bg-white/80 backdrop-blur-lg rounded-2xl border-2 border-dashed border-gray-300 shadow-xl mt-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Frown className="w-12 h-12 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Nothing found here</h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all' ? 'No items have been reported yet.' : `No ${filter} items at the moment.`}
                        </p>
                        {user && (
                            <Link
                                to="/lost-found/create"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Report First Item
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LostFound;