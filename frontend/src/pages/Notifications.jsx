import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import notificationsApi from '../api/notifications';
import {
    Bell, Check, CheckCheck, Trash2, Calendar, MessageCircle,
    ShoppingBag, Home, Briefcase, Pizza, Search, BookOpen,
    Heart, Users, Droplet, AlertCircle, Info, Megaphone, X
} from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const { socket } = useSocket();

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('newNotification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
            });

            return () => socket.off('newNotification');
        }
    }, [socket]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationsApi.getAll();
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
        setLoading(false);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await notificationsApi.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('Delete all notifications? This action cannot be undone.')) return;
        try {
            await notificationsApi.deleteAll();
            setNotifications([]);
        } catch (err) {
            console.error('Failed to delete all notifications:', err);
            alert('Failed to delete notifications');
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getNotificationIcon = (type) => {
        const iconMap = {
            'event_created': Calendar,
            'event_posted': Calendar,
            'event_interest': Heart,
            'new_message': MessageCircle,
            'item_posted': ShoppingBag,
            'buysell_posted': ShoppingBag,
            'marketplace_posted': ShoppingBag,
            'housing_posted': Home,
            'job_posted': Briefcase,
            'food_posted': Pizza,
            'lostfound_posted': Search,
            'studygroup_posted': BookOpen,
            'comment_added': MessageCircle,
            'post_liked': Heart,
            'like_added': Heart,
            'rsvp_added': Check,
            'interested_added': Check,
            'join_added': Users,
            'response_added': MessageCircle,
            'blood_posted': Droplet,
            'blood_request': Droplet,
            'blood_response': Droplet,
            'admin_announcement': Megaphone,
            'admin_warning': AlertCircle,
            'admin_info': Info,
            'system_alert': Bell,
        };
        return iconMap[type] || Bell;
    };

    const getNotificationColor = (type) => {
        if (type.startsWith('admin_warning') || type === 'system_alert') {
            return 'from-red-500 to-rose-500';
        }
        if (type.startsWith('admin_announcement')) {
            return 'from-purple-500 to-pink-500';
        }
        if (type.startsWith('admin_')) {
            return 'from-blue-500 to-cyan-500';
        }
        if (type.includes('blood')) {
            return 'from-red-500 to-rose-500';
        }
        if (type.includes('event')) {
            return 'from-purple-500 to-indigo-500';
        }
        if (type.includes('message') || type.includes('comment')) {
            return 'from-blue-500 to-cyan-500';
        }
        if (type.includes('like') || type.includes('heart')) {
            return 'from-pink-500 to-rose-500';
        }
        return 'from-indigo-500 to-purple-500';
    };

    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifDate.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 pb-20 md:pb-8">
            <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
                {/* Header */}
                <div className="mb-6 sm:mb-8 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl shadow-lg hover:scale-110 transition-transform">
                                <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                                    Notifications
                                </h1>
                                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
                                    {unreadCount > 0
                                        ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                        : 'All caught up! 🎉'}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg animate-pulse self-start sm:self-auto">
                                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                <span className="text-sm font-semibold">{unreadCount} New</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 sm:p-5 mb-6 animate-fadeIn">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                        {/* Filter Tabs */}
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
                            {[
                                { value: 'all', label: 'All', count: notifications.length, icon: '📋' },
                                { value: 'unread', label: 'Unread', count: unreadCount, icon: '🔔' },
                                { value: 'read', label: 'Read', count: notifications.length - unreadCount, icon: '✓' }
                            ].map(({ value, label, count, icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setFilter(value)}
                                    className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${filter === value
                                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                        }`}
                                >
                                    <span className="text-base">{icon}</span>
                                    <span className="text-xs sm:text-sm">{label}</span>
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${filter === value ? 'bg-white/30' : 'bg-gray-200'
                                        }`}>
                                        {count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap justify-start lg:justify-end">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all hover:scale-105 shadow-sm"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    <span className="hidden sm:inline">Mark all read</span>
                                    <span className="sm:hidden">Mark all</span>
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleDeleteAll}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all hover:scale-105 shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Clear all</span>
                                    <span className="sm:hidden">Clear</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-16 text-center">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-16 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <Bell className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No notifications</h3>
                        <p className="text-gray-600">
                            {filter === 'unread' ? "You don't have any unread notifications" :
                                filter === 'read' ? "You don't have any read notifications" :
                                    "You don't have any notifications yet"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {filteredNotifications.map((notification, index) => {
                            const IconComponent = getNotificationIcon(notification.type);
                            const colorClass = getNotificationColor(notification.type);

                            return (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer group animate-fadeIn ${!notification.read ? 'ring-2 ring-indigo-300 bg-gradient-to-r from-indigo-50/50 to-purple-50/50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        {/* Icon/Avatar */}
                                        {notification.sender?.profilePicture ? (
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={notification.sender.profilePicture}
                                                    alt={notification.sender.name}
                                                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg group-hover:ring-indigo-200 transition-all"
                                                />
                                                {!notification.read && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ring-2 ring-white animate-pulse"></div>
                                                )}
                                            </div>
                                        ) : notification.sender ? (
                                            <div className="relative flex-shrink-0">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl lg:text-2xl shadow-lg ring-4 ring-white group-hover:ring-indigo-200 transition-all">
                                                    {notification.sender.name?.charAt(0).toUpperCase()}
                                                </div>
                                                {!notification.read && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ring-2 ring-white animate-pulse"></div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-white group-hover:ring-indigo-200 transition-all`}>
                                                <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                            {notification.title}
                                                        </h3>
                                                        {!notification.read && (
                                                            <span className="px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-sm flex-shrink-0">
                                                                NEW
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-2 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>{formatTime(notification.createdAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 flex-shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification._id);
                                                            }}
                                                            className="p-2 sm:p-2.5 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all hover:scale-110 shadow-sm"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteNotification(notification._id);
                                                        }}
                                                        className="p-2 sm:p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all hover:scale-110 shadow-sm"
                                                        title="Delete"
                                                    >
                                                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                </div>
                                            </div>
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

export default Notifications;
