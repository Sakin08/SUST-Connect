import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { PlusCircle, X, Upload } from 'lucide-react';

const CreateFoodMenu = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        vendorName: '',
        vendorType: 'canteen',
        location: '',
        department: '',
        hallName: '',
        todaySpecial: '',
        notice: '',
        openingTime: '',
        closingTime: '',
        phone: '',
        averageCost: '',
        isOpen: true,
        features: []
    });

    const [menuItems, setMenuItems] = useState([
        { name: '', price: '', category: 'breakfast', available: true, description: '' }
    ]);

    const [images, setImages] = useState([]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFeatureToggle = (feature) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const handleMenuItemChange = (index, field, value) => {
        const updated = [...menuItems];
        updated[index][field] = value;
        setMenuItems(updated);
    };

    const addMenuItem = () => {
        setMenuItems([...menuItems, { name: '', price: '', category: 'breakfast', available: true, description: '' }]);
    };

    const removeMenuItem = (index) => {
        setMenuItems(menuItems.filter((_, i) => i !== index));
    };

    const handleImageChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();

            // Append basic fields
            Object.keys(formData).forEach(key => {
                if (key === 'features') {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Append menu items
            data.append('menuItems', JSON.stringify(menuItems.filter(item => item.name && item.price)));

            // Append images
            images.forEach(image => {
                data.append('images', image);
            });

            await api.post('/food-menu', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/food-menu');
        } catch (error) {
            console.error('Failed to create menu:', error);
            alert('Failed to create menu. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const featureOptions = [
        { value: 'wifi', label: 'WiFi' },
        { value: 'ac', label: 'AC' },
        { value: 'outdoor-seating', label: 'Outdoor Seating' },
        { value: 'home-delivery', label: 'Home Delivery' },
        { value: 'takeaway', label: 'Takeaway' },
        { value: 'card-payment', label: 'Card Payment' },
        { value: 'bkash', label: 'bKash' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-8 sm:py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-2xl shadow-lg">
                            <PlusCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 bg-clip-text text-transparent">
                                Add Food Menu
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">Share your delicious menu with the campus</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 space-y-6">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="text-orange-600">🏪</span> Vendor Name *
                            </label>
                            <input
                                type="text"
                                name="vendorName"
                                value={formData.vendorName}
                                onChange={handleChange}
                                required
                                placeholder="e.g., TSC Canteen"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="text-purple-600">🏷️</span> Vendor Type *
                            </label>
                            <select
                                name="vendorType"
                                value={formData.vendorType}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white font-medium"
                            >
                                <option value="canteen">🍽️ Canteen</option>
                                <option value="department-cafe">☕ Department Café</option>
                                <option value="gate-shop">🏪 Gate Shop</option>
                                <option value="hall-mess">🏠 Hall Mess</option>
                                <option value="restaurant">🍴 Restaurant</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="text-blue-600">📍</span> Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="e.g., TSC Building, Main Campus"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white font-medium"
                            />
                        </div>

                        {formData.vendorType === 'department-cafe' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="e.g., CSE"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        )}

                        {formData.vendorType === 'hall-mess' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hall Name
                                </label>
                                <input
                                    type="text"
                                    name="hallName"
                                    value={formData.hallName}
                                    onChange={handleChange}
                                    placeholder="e.g., Shahjalal Hall"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Timing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Opening Time
                            </label>
                            <input
                                type="text"
                                name="openingTime"
                                value={formData.openingTime}
                                onChange={handleChange}
                                placeholder="e.g., 8:00 AM"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Closing Time
                            </label>
                            <input
                                type="text"
                                name="closingTime"
                                value={formData.closingTime}
                                onChange={handleChange}
                                placeholder="e.g., 10:00 PM"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Average Cost (৳)
                            </label>
                            <input
                                type="number"
                                name="averageCost"
                                value={formData.averageCost}
                                onChange={handleChange}
                                placeholder="e.g., 80"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    {/* Contact & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="01XXXXXXXXX"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isOpen"
                                checked={formData.isOpen}
                                onChange={handleChange}
                                className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700">
                                Currently Open
                            </label>
                        </div>
                    </div>

                    {/* Special & Notice */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Today's Special
                        </label>
                        <input
                            type="text"
                            name="todaySpecial"
                            value={formData.todaySpecial}
                            onChange={handleChange}
                            placeholder="e.g., Chicken Biriyani - ৳120"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notice/Announcement
                        </label>
                        <input
                            type="text"
                            name="notice"
                            value={formData.notice}
                            onChange={handleChange}
                            placeholder="e.g., Closed on Fridays"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Features
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {featureOptions.map(feature => (
                                <label key={feature.value} className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.features.includes(feature.value)}
                                        onChange={() => handleFeatureToggle(feature.value)}
                                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{feature.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Menu Items
                            </label>
                            <button
                                type="button"
                                onClick={addMenuItem}
                                className="flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                                <PlusCircle className="w-4 h-4 mr-1" />
                                Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {menuItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
                                    <input
                                        type="text"
                                        placeholder="Item name"
                                        value={item.name}
                                        onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={item.price}
                                        onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                    <select
                                        value={item.category}
                                        onChange={(e) => handleMenuItemChange(index, 'category', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                        <option value="snacks">Snacks</option>
                                        <option value="beverages">Beverages</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => handleMenuItemChange(index, 'description', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeMenuItem(index)}
                                        className="flex items-center justify-center text-red-600 hover:text-red-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Images (up to 5)
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-500">
                                        {images.length > 0 ? `${images.length} file(s) selected` : 'Click to upload images'}
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white py-4 rounded-xl font-black text-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <PlusCircle className="w-6 h-6" />
                                    Create Menu
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/food-menu')}
                            className="px-8 py-4 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100 hover:scale-105 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFoodMenu;
