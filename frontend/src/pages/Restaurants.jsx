import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import {
    PlusCircle, Search, Filter, X, MapPin, Clock, Star,
    Utensils, Coffee, Store, ShoppingBag, Trash2
} from 'lucide-react';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [shopTypeFilter, setShopTypeFilter] = useState('all');
    const [isOpenFilter, setIsOpenFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadRestaurants();
    }, []);

    const loadRestaurants = async () => {
        try {
            setLoading(true);
            const res = await api.get('/restaurants');
            setRestaurants(res.data || []);
            setError(null);
        } catch (err) {
            console.error('Failed to load restaurants:', err);
            setError('Failed to load restaurants. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (restaurantId, restaurantName, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete "${restaurantName}"? This action cannot be undone.`)) {
            return;
        }
        try {
            await api.delete(`/restaurants/${restaurantId}`);
            setRestaurants(restaurants.filter(r => r._id !== restaurantId));
        } catch (err) {
            console.error('Failed to delete restaurant:', err);
            alert(err.response?.data?.message || 'Failed to delete restaurant. Please try again.');
        }
    };

    // Apply filters
    const displayRestaurants = restaurants
        .filter(restaurant => {
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                return (
                    restaurant.name?.toLowerCase().includes(search) ||
                    restaurant.location?.toLowerCase().includes(search) ||
                    restaurant.description?.toLowerCase().includes(search)
                );
            }
            return true;
        })
        .filter(restaurant => {
            if (shopTypeFilter !== 'all') {
                return restaurant.shopType === shopTypeFilter;
            }
            return true;
        })
        .filter(restaurant => {
            if (isOpenFilter === 'open') return restaurant.isOpen;
            if (isOpenFilter === 'closed') return !restaurant.isOpen;
            return true;
        });

    const getShopIcon = (type) => {
        const icons = {
            restaurant: Utensils,
            canteen: Utensils,
            cafe: Coffee,
            'fast-food': ShoppingBag,
            bakery: Store,
            'juice-bar': Coffee
        };
        return icons[type] || Utensils;
    };

    const getShopColor = (type) => {
        const colors = {
            restaurant: 'bg-orange-100 text-orange-700',
            canteen: 'bg-blue-100 text-blue-700',
            cafe: 'bg-purple-100 text-purple-700',
            'fast-food': 'bg-red-100 text-red-700',
            bakery: 'bg-yellow-100 text-yellow-700',
            'juice-bar': 'bg-green-100 text-green-700'
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center p-8 bg-gray-50 rounded-xl shadow-lg">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-700">Loading restaurants...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-10 mt-10 text-center bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
                <p className="text-xl font-semibold text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <header className="pb-6 border-b border-gray-200 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <div>
                            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent tracking-tight mb-2">
                                🍔 Campus Eats
                            </h1>
                            <p className="text-amber-200">Order food from your favorite campus restaurants</p>
                        </div>
                        {user && (
                            <Link
                                to="/restaurants/create"
                                className="flex items-center bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition shadow-lg transform hover:-translate-y-0.5 text-lg mt-3 sm:mt-0"
                            >
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Add Restaurant
                            </Link>
                        )}
                    </div>
                </header>

                {/* Search and Filter Section - Dark Theme & Compact */}
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3 mb-6 border border-gray-700/50">
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search restaurants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition text-sm ${showFilters
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            <Filter className="w-4 h-4 mr-1.5" />
                            Filters
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-700">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">
                                    Shop Type
                                </label>
                                <select
                                    value={shopTypeFilter}
                                    onChange={(e) => setShopTypeFilter(e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
                                >
                                    <option value="all">All Types</option>
                                    <option value="restaurant">Restaurant</option>
                                    <option value="canteen">Canteen</option>
                                    <option value="cafe">Café</option>
                                    <option value="fast-food">Fast Food</option>
                                    <option value="bakery">Bakery</option>
                                    <option value="juice-bar">Juice Bar</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={isOpenFilter}
                                    onChange={(e) => setIsOpenFilter(e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
                                >
                                    <option value="all">All</option>
                                    <option value="open">Open Now</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Active Filters */}
                    {(searchTerm || shopTypeFilter !== 'all' || isOpenFilter !== 'all') && (
                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-700">
                            <span className="text-xs font-semibold text-gray-400">Active:</span>
                            {searchTerm && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-orange-600/20 text-orange-300 border border-orange-500/30">
                                    Search: {searchTerm}
                                    <X className="w-3 h-3 ml-1.5 cursor-pointer hover:text-orange-200" onClick={() => setSearchTerm('')} />
                                </span>
                            )}
                            {shopTypeFilter !== 'all' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-orange-600/20 text-orange-300 border border-orange-500/30">
                                    {shopTypeFilter}
                                    <X className="w-3 h-3 ml-1.5 cursor-pointer hover:text-orange-200" onClick={() => setShopTypeFilter('all')} />
                                </span>
                            )}
                            {isOpenFilter !== 'all' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-orange-600/20 text-orange-300 border border-orange-500/30">
                                    {isOpenFilter}
                                    <X className="w-3 h-3 ml-1.5 cursor-pointer hover:text-orange-200" onClick={() => setIsOpenFilter('all')} />
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setShopTypeFilter('all');
                                    setIsOpenFilter('all');
                                }}
                                className="text-xs text-red-400 hover:text-red-300 font-semibold"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6 text-lg font-medium text-gray-700">
                    Found <span className="font-bold text-orange-600">{displayRestaurants.length}</span> {displayRestaurants.length === 1 ? 'restaurant' : 'restaurants'}.
                </div>

                {/* Restaurant Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayRestaurants.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-md">
                            <Utensils className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl font-semibold text-gray-700">No restaurants found.</p>
                            <p className="text-gray-500 mt-2">Be the first to add a restaurant!</p>
                        </div>
                    ) : (
                        displayRestaurants.map(restaurant => {
                            const ShopIcon = getShopIcon(restaurant.shopType);
                            const showDelete = canDelete(user, restaurant.owner);
                            return (
                                <div key={restaurant._id} className="relative h-full">
                                    <Link
                                        to={`/restaurants/${restaurant._id}`}
                                        className="flex flex-col h-full bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-700/50 hover:border-orange-500/50 hover:-translate-y-1"
                                    >
                                        {/* Cover Image */}
                                        {restaurant.coverImage ? (
                                            <div className="h-52 overflow-hidden relative">
                                                <img
                                                    src={restaurant.coverImage}
                                                    alt={restaurant.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                            </div>
                                        ) : (
                                            <div className="h-52 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center relative overflow-hidden">
                                                <div className="absolute inset-0 bg-black/20"></div>
                                                <ShopIcon className="w-24 h-24 text-white/30 relative z-10" />
                                            </div>
                                        )}

                                        {/* Floating Status Badge */}
                                        <div className="absolute top-3 right-3 z-10">
                                            {restaurant.isOpen ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-green-600 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                                    OPEN
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                                    CLOSED
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            {/* Shop Type Badge */}
                                            <div className="mb-3">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getShopColor(restaurant.shopType)}`}>
                                                    <ShopIcon className="w-4 h-4 mr-1.5" />
                                                    {restaurant.shopType.replace('-', ' ').toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Restaurant Name */}
                                            <h3 className="text-2xl font-black text-white mb-2 group-hover:text-orange-400 transition leading-tight">
                                                {restaurant.name}
                                            </h3>

                                            {/* Description */}
                                            <div className="mb-3 flex-1">
                                                {restaurant.description && (
                                                    <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                                                        {restaurant.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Location & Timing */}
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-gray-300 text-sm">
                                                    <div className="p-1.5 bg-orange-600/20 rounded-lg mr-2">
                                                        <MapPin className="w-4 h-4 text-orange-400" />
                                                    </div>
                                                    <span className="truncate">{restaurant.location}</span>
                                                </div>

                                                {restaurant.openingTime && restaurant.closingTime && (
                                                    <div className="flex items-center text-gray-300 text-sm">
                                                        <div className="p-1.5 bg-blue-600/20 rounded-lg mr-2">
                                                            <Clock className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                        <span>{restaurant.openingTime} - {restaurant.closingTime}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                                                <div className="flex items-center gap-1.5 bg-yellow-600/20 px-3 py-1.5 rounded-lg border border-yellow-500/30">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-sm font-bold text-yellow-300">
                                                        {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}
                                                    </span>
                                                    {restaurant.totalReviews > 0 && (
                                                        <span className="text-xs text-gray-400">
                                                            ({restaurant.totalReviews})
                                                        </span>
                                                    )}
                                                </div>
                                                {restaurant.deliveryFee !== undefined && (
                                                    <span className="text-sm font-bold text-orange-400 bg-orange-600/20 px-3 py-1.5 rounded-lg border border-orange-500/30">
                                                        ৳{restaurant.deliveryFee} delivery
                                                    </span>
                                                )}
                                            </div>

                                            {/* Delivery Info */}
                                            {restaurant.deliveryAvailable && restaurant.estimatedDeliveryTime && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    🚚 {restaurant.estimatedDeliveryTime}
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Delete Button for Admin/Owner */}
                                    {showDelete && (
                                        <button
                                            onClick={(e) => handleDelete(restaurant._id, restaurant.name, e)}
                                            className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all duration-200"
                                            title="Delete restaurant"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Restaurants;
