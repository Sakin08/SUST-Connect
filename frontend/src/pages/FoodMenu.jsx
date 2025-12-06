import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Search, MapPin, Phone, Calendar, Utensils, Clock, Trash2 } from 'lucide-react';
import { canDelete } from '../utils/permissions';

const FoodMenu = () => {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        loadMenus();
    }, []);

    const loadMenus = async () => {
        try {
            setLoading(true);
            const res = await api.get('/quick-menu');
            setMenus(res.data || []);
        } catch (err) {
            console.error('Failed to load menus:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (menuId, restaurantName) => {
        if (!window.confirm(`Delete menu post from "${restaurantName}"?`)) return;

        try {
            await api.delete(`/quick-menu/${menuId}`);
            setMenus(menus.filter(m => m._id !== menuId));
        } catch (err) {
            console.error('Failed to delete menu:', err);
            alert('Failed to delete menu post');
        }
    };

    const filteredMenus = menus.filter(menu => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            menu.restaurantName?.toLowerCase().includes(search) ||
            menu.location?.toLowerCase().includes(search) ||
            menu.menuItems?.toLowerCase().includes(search) ||
            menu.mealType?.toLowerCase().includes(search)
        );
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
                <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
                    <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-bold text-gray-800">Loading delicious menus...</p>
                    <p className="text-sm text-gray-500 mt-2">Finding the best food for you</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-8 sm:py-12">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Header */}
                <header className="mb-8 sm:mb-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-2xl shadow-lg">
                                <Utensils className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent tracking-tight">
                                    Campus Eats
                                </h1>
                                <p className="text-sm sm:text-base text-amber-200 mt-1">Discover what's cooking around campus today</p>
                            </div>
                        </div>

                        {user && (
                            <Link
                                to="/quick-menu/post"
                                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                            >
                                <PlusCircle className="w-5 h-5" />
                                <span>Post Menu</span>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Search */}
                <div className="mb-8">
                    <div className="relative max-w-3xl mx-auto">
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                        <input
                            type="text"
                            placeholder="Search restaurants, locations, or food items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-md transition-all bg-white/80 backdrop-blur-sm text-lg"
                        />
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6 flex items-center justify-center gap-3">
                    <div className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl shadow-md">
                        <span className="text-2xl font-black">{filteredMenus.length}</span>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-800">
                            {filteredMenus.length === 1 ? 'Menu Available' : 'Menus Available'}
                        </p>
                        <p className="text-sm text-gray-600">Fresh and delicious</p>
                    </div>
                </div>

                {/* Menu Grid */}
                {filteredMenus.length === 0 ? (
                    <div className="text-center py-20 bg-white/80 backdrop-blur-lg rounded-2xl border-2 border-dashed border-gray-300 shadow-xl">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Utensils className="w-12 h-12 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800 mb-2">No menus posted yet</p>
                        <p className="text-gray-600 mb-6">Be the first to share today's delicious menu!</p>
                        {user && (
                            <Link
                                to="/quick-menu/post"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Post First Menu
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filteredMenus.map(menu => {
                            const showDelete = canDelete(user, menu.postedBy);
                            return (
                                <div key={menu._id} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20 hover:scale-105 hover:-translate-y-1">
                                    {/* Menu Images */}
                                    {menu.images && menu.images.length > 0 ? (
                                        <div className="relative group">
                                            {menu.images.length === 1 ? (
                                                <div className="h-52 overflow-hidden relative">
                                                    <img
                                                        src={menu.images[0]}
                                                        alt={menu.restaurantName}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-1 h-52">
                                                    {menu.images.slice(0, 4).map((image, idx) => (
                                                        <div key={idx} className="relative overflow-hidden">
                                                            <img
                                                                src={image}
                                                                alt={`${menu.restaurantName} ${idx + 1}`}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                            {idx === 3 && menu.images.length > 4 && (
                                                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                                                                    <span className="text-white text-2xl font-black">
                                                                        +{menu.images.length - 4}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            {/* Date Badge */}
                                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/20">
                                                <span className="text-sm font-black text-orange-600">
                                                    {formatDate(menu.date)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-40 bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 flex items-center justify-center relative group">
                                            <Utensils className="w-20 h-20 text-orange-300 group-hover:scale-110 transition-transform" />
                                            {/* Date Badge for text-only posts */}
                                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/20">
                                                <span className="text-sm font-black text-orange-600">
                                                    {formatDate(menu.date)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-5 sm:p-6">
                                        {/* Restaurant Name */}
                                        <h3 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                                            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                                                <Utensils className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="line-clamp-1">{menu.restaurantName}</span>
                                        </h3>

                                        {/* Location & Contact */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                                <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                                <span className="line-clamp-1">{menu.location}</span>
                                            </div>
                                            {menu.contactNumber && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                    <a href={`tel:${menu.contactNumber}`} className="text-gray-700 font-semibold hover:text-green-600 transition-colors">
                                                        {menu.contactNumber}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Meal Type Badge */}
                                        <div className="mb-4">
                                            {menu.mealType === 'breakfast' && (
                                                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-4 py-2 rounded-xl text-xs font-black border-2 border-yellow-200">
                                                    🌅 BREAKFAST
                                                </span>
                                            )}
                                            {menu.mealType === 'lunch' && (
                                                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-4 py-2 rounded-xl text-xs font-black border-2 border-orange-200">
                                                    🍛 LUNCH
                                                </span>
                                            )}
                                            {menu.mealType === 'dinner' && (
                                                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-xl text-xs font-black border-2 border-blue-200">
                                                    🌙 DINNER
                                                </span>
                                            )}
                                            {menu.mealType === 'snacks' && (
                                                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-xl text-xs font-black border-2 border-green-200">
                                                    🍪 SNACKS
                                                </span>
                                            )}
                                            {menu.mealType === 'special' && (
                                                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-xl text-xs font-black border-2 border-purple-200">
                                                    ⭐ SPECIAL
                                                </span>
                                            )}
                                        </div>

                                        {/* Menu Items */}
                                        {menu.menuItems && menu.menuItems.trim() && (
                                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border-l-4 border-orange-500">
                                                <p className="text-sm font-black text-gray-800 mb-2">📋 Menu Items:</p>
                                                <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-3">{menu.menuItems}</p>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                {new Date(menu.createdAt).toLocaleDateString()}
                                            </div>
                                            {showDelete && (
                                                <button
                                                    onClick={() => handleDelete(menu._id, menu.restaurantName)}
                                                    className="text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-xl transition-all font-bold"
                                                    title="Delete menu"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodMenu;
