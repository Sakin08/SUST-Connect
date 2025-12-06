import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
    MapPin, Clock, Phone, Star, ArrowLeft, Utensils,
    Wifi, Wind, CreditCard, Smartphone, Home as HomeIcon
} from 'lucide-react';

const FoodMenuDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);

    useEffect(() => {
        loadMenu();
    }, [id]);

    const loadMenu = async () => {
        try {
            const res = await api.get(`/food-menu/${id}`);
            setMenu(res.data);
        } catch (err) {
            console.error('Failed to load menu:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRating = async (value) => {
        try {
            await api.post(`/food-menu/${id}/rating`, { rating: value });
            setRating(value);
            loadMenu(); // Reload to get updated rating
        } catch (err) {
            console.error('Failed to submit rating:', err);
        }
    };

    const getFeatureIcon = (feature) => {
        const icons = {
            wifi: Wifi,
            ac: Wind,
            'card-payment': CreditCard,
            bkash: Smartphone,
            'home-delivery': HomeIcon,
            takeaway: Utensils,
            'outdoor-seating': Wind
        };
        return icons[feature] || Utensils;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="text-center p-12 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-bold text-gray-800">Loading menu details...</p>
                </div>
            </div>
        );
    }

    if (!menu) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
                <div className="max-w-md w-full p-8 text-center bg-white border border-red-200 rounded-2xl shadow-xl">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Utensils className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-xl font-bold text-red-800 mb-4">Menu not found</p>
                    <button
                        onClick={() => navigate('/food-menu')}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Menus
                    </button>
                </div>
            </div>
        );
    }

    const menuByCategory = menu.menuItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/food-menu')}
                    className="inline-flex items-center gap-2 bg-white text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 px-4 py-2.5 rounded-xl font-bold mb-6 shadow-md hover:shadow-lg transition-all border border-gray-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Menus
                </button>

                {/* Header */}
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-200">
                    {menu.coverImage && (
                        <div className="relative h-56 overflow-hidden">
                            <img
                                src={menu.coverImage}
                                alt={menu.vendorName}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                    )}

                    <div className="p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{menu.vendorName}</h1>
                                <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                    {menu.vendorType.replace('-', ' ').toUpperCase()}
                                </span>
                            </div>
                            {menu.isOpen ? (
                                <span className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2.5 rounded-xl shadow-md">
                                    ● OPEN NOW
                                </span>
                            ) : (
                                <span className="text-sm font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2.5 rounded-xl shadow-md">
                                    ● CLOSED
                                </span>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <span className="font-semibold text-gray-800 text-sm">{menu.location}</span>
                            </div>
                            {menu.openingTime && menu.closingTime && (
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                    <span className="font-semibold text-gray-800 text-sm">{menu.openingTime} - {menu.closingTime}</span>
                                </div>
                            )}
                            {menu.phone && (
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <a href={`tel:${menu.phone}`} className="font-semibold text-gray-800 hover:text-green-600 transition-colors text-sm">{menu.phone}</a>
                                </div>
                            )}
                            {menu.averageCost && (
                                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <span className="font-bold text-gray-800 text-sm">💰 Average Cost:</span>
                                    <span className="text-emerald-600 font-bold text-base">৳{menu.averageCost}</span>
                                </div>
                            )}
                        </div>

                        {/* Rating */}
                        <div className="mt-5 pt-5 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center">
                                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                                    <span className="text-xl font-bold text-gray-900">
                                        {menu.rating ? menu.rating.toFixed(1) : 'No ratings yet'}
                                    </span>
                                    {menu.totalReviews > 0 && (
                                        <span className="text-gray-500 ml-2 text-sm">({menu.totalReviews} reviews)</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 mr-1">Rate:</span>
                                    {[1, 2, 3, 4, 5].map(value => (
                                        <button
                                            key={value}
                                            onClick={() => handleRating(value)}
                                            className={`${rating >= value ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition`}
                                        >
                                            <Star className="w-5 h-5" fill={rating >= value ? 'currentColor' : 'none'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Today's Special */}
                        {menu.todaySpecial && (
                            <div className="mt-4 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                                <p className="text-sm font-semibold text-amber-800">
                                    ⭐ Today's Special: {menu.todaySpecial}
                                </p>
                            </div>
                        )}

                        {/* Notice */}
                        {menu.notice && (
                            <div className="mt-3 bg-red-50 border border-red-200 p-3 rounded-lg">
                                <p className="text-sm font-semibold text-red-800">
                                    ⚠️ {menu.notice}
                                </p>
                            </div>
                        )}

                        {/* Features */}
                        {menu.features && menu.features.length > 0 && (
                            <div className="mt-5">
                                <h3 className="text-base font-bold text-gray-900 mb-3">Features</h3>
                                <div className="flex flex-wrap gap-2">
                                    {menu.features.map(feature => {
                                        const FeatureIcon = getFeatureIcon(feature);
                                        return (
                                            <span key={feature} className="flex items-center px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700">
                                                <FeatureIcon className="w-3.5 h-3.5 mr-1.5" />
                                                {feature.replace('-', ' ').toUpperCase()}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu Items */}
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-5 sm:p-6 border border-gray-200">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                            <Utensils className="w-6 h-6 text-white" />
                        </div>
                        Full Menu
                    </h2>

                    {Object.keys(menuByCategory).length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Utensils className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-600">No menu items available</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(menuByCategory).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 capitalize pb-2 border-b-2 border-blue-200 flex items-center gap-2">
                                        <span className="text-2xl">
                                            {category === 'breakfast' && '🌅'}
                                            {category === 'lunch' && '🍛'}
                                            {category === 'dinner' && '🌙'}
                                            {category === 'snacks' && '🍪'}
                                            {category === 'beverages' && '☕'}
                                        </span>
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-start p-4 bg-white rounded-lg hover:bg-blue-50 transition-all border border-gray-200 hover:border-blue-300 hover:shadow-md">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-gray-900 text-base">{item.name}</h4>
                                                        {!item.available && (
                                                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded font-bold">
                                                                OUT
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                                    )}
                                                </div>
                                                <span className="text-lg font-bold text-emerald-600 ml-4 flex-shrink-0">
                                                    ৳{item.price}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Posted By */}
                {menu.postedBy && (
                    <div className="mt-6 text-center text-sm text-gray-500">
                        Posted by{' '}
                        <Link to={`/profile/${menu.postedBy._id}`} className="text-blue-600 hover:underline font-semibold">
                            {menu.postedBy.name}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodMenuDetails;
