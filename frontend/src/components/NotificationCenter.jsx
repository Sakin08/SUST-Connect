import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import notificationsApi from '../api/notifications';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { socket } = useSocket();

    useEffect(() => {
        loadNotifications();
        loadUnreadCount();
    }, []);

    // Listen for real-time notifications
    useEffect(() => {
        if (socket) {
            socket.on('newNotification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show browser notification if permitted
                if (Notification.permission === 'granted') {
                    new Notification(notification.title, {
                        body: notification.message,
                        icon: '/logo.png'
                    });
                }
            });

            return () => socket.off('newNotification');
        }
    }, [socket]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationsApi.getAll();
            setNotifications(res.data);
            console.log('Loaded notifications:', res.data.length);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
        setLoading(false);
    };

    const loadUnreadCount = async () => {
        try {
            const res = await notificationsApi.getUnreadCount();
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error('Failed to load unread count:', err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification._id);
        }

        // Handle report reviewed notifications with a modal
        if (notification.type === 'report_reviewed' && notification.data) {
            const { status, adminNotes } = notification.data;
            const statusEmojis = {
                reviewed: '👀',
                resolved: '✅',
                dismissed: 'ℹ️',
            };
            const statusMessages = {
                reviewed: 'Your report has been reviewed by our team',
                resolved: 'Your report has been resolved. Thank you for helping keep our community safe',
                dismissed: 'Your report has been reviewed and dismissed',
            };

            alert(
                `${statusEmojis[status] || '📋'} Report ${status.charAt(0).toUpperCase() + status.slice(1)}\n\n` +
                `${statusMessages[status] || `Your report status has been updated to ${status}`}\n\n` +
                (adminNotes ? `Admin Notes:\n${adminNotes}` : '')
            );
            setIsOpen(false);
            return;
        }

        if (notification.link) {
            setIsOpen(false);
            navigate(notification.link);
        }
    };

    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationsApi.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            const deletedNotif = notifications.find(n => n._id === id);
            if (deletedNotif && !deletedNotif.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('Delete all notifications? This action cannot be undone.')) return;
        try {
            await notificationsApi.deleteAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to delete all notifications:', err);
            alert('Failed to delete notifications');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'event_created':
            case 'event_posted':
                return '📅';
            case 'event_interest':
                return '❤️';
            case 'new_message':
                return '💬';
            case 'item_posted':
            case 'buysell_posted':
            case 'marketplace_posted':
                return '🛍️';
            case 'housing_posted':
                return '🏠';
            case 'job_posted':
                return '💼';
            case 'food_posted':
                return '🍕';
            case 'lostfound_posted':
                return '🔍';
            case 'studygroup_posted':
                return '📚';
            case 'comment_added':
                return '💬';
            case 'post_liked':
            case 'like_added':
                return '❤️';
            case 'rsvp_added':
            case 'interested_added':
                return '✅';
            case 'join_added':
                return '👥';
            case 'response_added':
                return '💬';
            case 'blood_posted':
            case 'blood_request':
            case 'blood_response':
                return '🩸';
            case 'report_submitted':
                return '🚨';
            case 'report_reviewed':
                return '✅';
            case 'admin_announcement':
                return '📢';
            case 'admin_warning':
                return '⚠️';
            case 'admin_info':
                return 'ℹ️';
            case 'system_alert':
                return '🔔';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        if (type.startsWith('admin_warning') || type === 'system_alert') {
            return 'bg-red-50 border-l-4 border-red-500';
        }
        if (type.startsWith('admin_announcement')) {
            return 'bg-purple-50 border-l-4 border-purple-500';
        }
        if (type.startsWith('admin_')) {
            return 'bg-blue-50 border-l-4 border-blue-500';
        }
        return '';
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Mobile Overlay */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notification Dropdown - Modern Glassmorphic Design */}
                    <div className="fixed md:absolute left-0 right-0 md:left-auto md:right-0 top-16 md:top-full md:mt-3 w-full md:w-[440px] lg:w-[500px] bg-white/95 md:bg-white/90 backdrop-blur-xl rounded-b-3xl md:rounded-3xl shadow-2xl border md:border border-white/20 z-50 max-h-[calc(100vh-5rem)] md:max-h-[650px] flex flex-col overflow-hidden md:shadow-[0_20px_70px_-10px_rgba(99,102,241,0.3)] animate-slideDown">
                        {/* Header with Modern Gradient */}
                        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 md:p-5 relative overflow-hidden flex-shrink-0">
                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
                                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-2 sm:p-2.5 bg-white/25 backdrop-blur-md rounded-2xl shadow-lg ring-2 ring-white/30 hover:scale-110 transition-transform">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg tracking-tight">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                    <p className="text-xs text-white/95 font-semibold">{unreadCount} new</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="md:hidden p-2 text-white/90 hover:text-white hover:bg-white/25 rounded-xl transition-all shadow-sm backdrop-blur-sm hover:scale-110"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Action Buttons - Separated Section */}
                                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-white/20">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="flex items-center gap-1.5 text-xs text-white font-bold px-3 sm:px-4 py-2 bg-white/30 hover:bg-white/40 backdrop-blur-md rounded-xl transition-all shadow-lg hover:scale-105 ring-2 ring-white/40"
                                        >
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="hidden sm:inline">Mark all read</span>
                                            <span className="sm:hidden">Read all</span>
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleDeleteAll}
                                            className="flex items-center gap-1.5 text-xs text-white font-bold px-3 sm:px-4 py-2 bg-white/30 hover:bg-white/40 backdrop-blur-md rounded-xl transition-all shadow-lg hover:scale-105 ring-2 ring-white/40"
                                        >
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span>Clear all</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            navigate('/notifications');
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-1.5 text-xs text-white font-bold px-3 sm:px-4 py-2 bg-white/30 hover:bg-white/40 backdrop-blur-md rounded-xl transition-all shadow-lg hover:scale-105 ring-2 ring-white/40 ml-auto"
                                    >
                                        <span>View all</span>
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1 bg-gradient-to-b from-gray-50/80 to-white/80 backdrop-blur-sm">
                            {loading ? (
                                <div className="p-16 text-center">
                                    <div className="relative w-16 h-16 mx-auto mb-4">
                                        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">Loading notifications...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-24 h-24 mx-auto mb-5 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl flex items-center justify-center shadow-lg">
                                        <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">All clear! 🎉</h4>
                                    <p className="text-sm text-gray-500">You're all caught up</p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {notifications.slice(0, 10).map((notification, index) => (
                                        <div
                                            key={notification._id || `notification-${index}`}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 group relative hover:scale-[1.02] ${!notification.read
                                                ? 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 shadow-md hover:shadow-xl ring-2 ring-indigo-200/50'
                                                : 'bg-white/60 hover:bg-white shadow-sm hover:shadow-lg'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                {/* User Profile Picture or Icon */}
                                                <div className="relative flex-shrink-0">
                                                    {notification.sender?.profilePicture ? (
                                                        <img
                                                            src={notification.sender.profilePicture}
                                                            alt={notification.sender.name}
                                                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-lg group-hover:ring-indigo-200 transition-all"
                                                        />
                                                    ) : notification.sender ? (
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white group-hover:ring-indigo-200 transition-all">
                                                            {notification.sender.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg ring-2 ring-white group-hover:ring-indigo-200 transition-all">
                                                            <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                                                        </div>
                                                    )}
                                                    {!notification.read && (
                                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ring-2 ring-white animate-pulse shadow-lg"></div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.read && (
                                                            <span className="px-2.5 py-1 text-[10px] font-extrabold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full shadow-md flex-shrink-0 animate-pulse">
                                                                NEW
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="font-medium">{formatTime(notification.createdAt)}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => handleDeleteNotification(e, notification._id)}
                                                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex-shrink-0 shadow-sm hover:scale-110"
                                                    title="Delete notification"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
