import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import {
    TrendingUp, Users, Calendar, Briefcase, Home as HousingIcon,
    Search, X, Sparkles, Clock, RefreshCw,
    MessageCircle, Droplet, ShoppingBag, MapPin, ChevronRight, BookOpen
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Newsfeed = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [trendingTopics, setTrendingTopics] = useState([]);
    const [campusStats, setCampusStats] = useState({ activeUsers: 0, postsToday: 0, eventsThisWeek: 0 });
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [followingUsers, setFollowingUsers] = useState([]);
    const observerTarget = useRef(null);

    useEffect(() => {
        loadPosts(1);
        loadTrendingTopics();
        loadCampusStats();
        if (user) {
            loadFollowingUsers();
        }
    }, [filter, user]);

    // Socket listeners for online users
    useEffect(() => {
        if (!socket) return;

        socket.on('onlineUsers', (users) => {
            setOnlineUsers(new Set(users));
        });

        socket.on('userOnline', (userId) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
        });

        socket.on('userOffline', (userId) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        });

        return () => {
            socket.off('onlineUsers');
            socket.off('userOnline');
            socket.off('userOffline');
        };
    }, [socket]);

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadPosts(page + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, page]);

    const loadPosts = async (pageNum = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/posts/feed?filter=${filter}&page=${pageNum}&limit=10`, {
                withCredentials: true
            });

            if (pageNum === 1) {
                setPosts(res.data.posts);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setPosts(prev => [...prev, ...res.data.posts]);
            }

            setHasMore(res.data.currentPage < res.data.totalPages);
            setPage(pageNum);
        } catch (err) {
            console.error('Failed to load posts:', err);
        }
        setLoading(false);
    };

    const filteredPosts = searchQuery.trim()
        ? posts.filter(post => {
            const searchLower = searchQuery.toLowerCase();
            const textMatch = post.content?.text?.toLowerCase().includes(searchLower);
            const authorMatch = post.author?.name?.toLowerCase().includes(searchLower);
            const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(searchLower));
            return textMatch || authorMatch || tagsMatch;
        })
        : posts;

    const loadTrendingTopics = async () => {
        try {
            const res = await axios.get(`${API_URL}/posts/trending-topics?limit=5`, {
                withCredentials: true
            });
            setTrendingTopics(res.data);
        } catch (err) {
            console.error('Failed to load trending topics:', err);
        }
    };

    const loadCampusStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/posts/campus-stats`, {
                withCredentials: true
            });
            setCampusStats(res.data);
        } catch (err) {
            console.error('Failed to load campus stats:', err);
        }
    };

    const loadFollowingUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users/${user._id}/following`, {
                withCredentials: true
            });
            console.log('Following users:', res.data);
            setFollowingUsers(res.data || []);
        } catch (err) {
            console.error('Failed to load following users:', err);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadPosts(1), loadTrendingTopics(), loadCampusStats()]);
        setRefreshing(false);
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    const handlePostDelete = (postId) => {
        setPosts(posts.filter(p => p._id !== postId));
    };

    const quickLinks = [
        { icon: Calendar, label: 'Events', link: '/events', color: 'from-purple-500 to-pink-500' },
        { icon: Briefcase, label: 'Jobs', link: '/jobs', color: 'from-blue-500 to-cyan-500' },
        { icon: HousingIcon, label: 'Housing', link: '/housing', color: 'from-green-500 to-emerald-500' },
        { icon: Users, label: 'Study Groups', link: '/study-groups', color: 'from-orange-500 to-red-500' },
        { icon: BookOpen, label: 'Books', link: '/books', color: 'from-teal-500 to-cyan-500' },
        { icon: Droplet, label: 'Blood', link: '/blood-donation', color: 'from-red-500 to-rose-500' },
        { icon: ShoppingBag, label: 'Marketplace', link: '/buysell', color: 'from-indigo-500 to-purple-500' },
        { icon: MapPin, label: 'Lost & Found', link: '/lost-found', color: 'from-yellow-500 to-orange-500' },
        { icon: MessageCircle, label: 'Messages', link: '/messages', color: 'from-pink-500 to-rose-500' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 pb-20 md:pb-8">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
                {/* Header */}
                <div className="mb-3 animate-fadeIn">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            <span>Newsfeed</span>
                        </h1>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all text-white"
                            >
                                {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all text-white disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    {showSearch && (
                        <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-700/50 p-3 sm:p-4 mb-4 animate-fadeIn">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search posts, people, topics..."
                                    className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
                        {[
                            { value: 'all', icon: TrendingUp, label: 'All' },
                            { value: 'following', icon: Users, label: 'Following' },
                            { value: 'trending', icon: Sparkles, label: 'Trending' },
                            { value: 'recent', icon: Clock, label: 'Recent' }
                        ].map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                onClick={() => setFilter(value)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${filter === value
                                    ? 'bg-white text-gray-900'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-12rem)]">
                    {/* Left Sidebar - Hidden on mobile - Sticky with independent scroll */}
                    <div className="hidden lg:block lg:col-span-3 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                        <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent hover:scrollbar-thumb-indigo-400 pr-2 space-y-4">
                            {/* Campus Stats */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-5 hover:shadow-xl transition-all">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                    Campus Stats
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-700">Active Users</span>
                                        <span className="font-bold text-indigo-600 text-lg">{campusStats.activeUsers || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-700">Posts Today</span>
                                        <span className="font-bold text-green-600 text-lg">{campusStats.postsToday || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-700">Events This Week</span>
                                        <span className="font-bold text-purple-600 text-lg">{campusStats.eventsThisWeek || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-5 hover:shadow-xl transition-all">
                                <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
                                <div className="space-y-2">
                                    {quickLinks.slice(0, 6).map((link, idx) => (
                                        <Link
                                            key={idx}
                                            to={link.link}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 transition-all group hover:scale-105"
                                        >
                                            <div className={`p-2 rounded-xl bg-gradient-to-br ${link.color} shadow-md`}>
                                                <link.icon className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition">
                                                {link.label}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center Column - Posts - Independent scroll */}
                    <div className="lg:col-span-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <div className="lg:h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent hover:scrollbar-thumb-purple-400 lg:pr-2 space-y-3 sm:space-y-4">
                            {/* Create Post */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-5 hover:shadow-xl transition-all">
                                <CreatePost onPostCreated={handlePostCreated} />
                            </div>

                            {/* Mobile Quick Links */}
                            <div className="lg:hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    Quick Access
                                </h3>
                                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                                    {quickLinks.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            to={link.link}
                                            className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl hover:bg-white/60 transition-all hover:scale-105"
                                        >
                                            <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${link.color} shadow-md`}>
                                                <link.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-semibold text-gray-700 text-center leading-tight">
                                                {link.label}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Posts Feed */}
                            {loading && page === 1 ? (
                                <div className="flex justify-center py-16">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                                        <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 sm:p-16 text-center">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
                                        <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
                                    <p className="text-sm sm:text-base text-gray-600">Be the first to share something!</p>
                                </div>
                            ) : (
                                <>
                                    {filteredPosts.map(post => (
                                        <PostCard
                                            key={post._id}
                                            post={post}
                                            onUpdate={handlePostUpdate}
                                            onDelete={handlePostDelete}
                                        />
                                    ))}

                                    {/* Loading More Indicator */}
                                    <div ref={observerTarget} className="py-4">
                                        {loading && (
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        {!hasMore && posts.length > 0 && (
                                            <p className="text-center text-gray-500 text-sm">You've reached the end</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Hidden on mobile - Sticky with independent scroll */}
                    <div className="hidden lg:block lg:col-span-3 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                        <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent hover:scrollbar-thumb-pink-400 pr-2 space-y-4">
                            {/* Following Users */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-5 hover:shadow-xl transition-all">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl">
                                        <Users className="w-4 h-4 text-white" />
                                    </div>
                                    Following
                                </h3>
                                {followingUsers.length > 0 ? (
                                    <>
                                        <div className="space-y-2">
                                            {followingUsers.slice(0, 5).map((followedUser) => (
                                                <Link
                                                    key={followedUser._id}
                                                    to={`/profile/${followedUser._id}`}
                                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 transition-all group hover:scale-105"
                                                >
                                                    {followedUser.profilePicture ? (
                                                        <img
                                                            src={followedUser.profilePicture}
                                                            alt={followedUser.name}
                                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                                                            {followedUser.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 truncate">
                                                            {followedUser.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{followedUser.department}</p>
                                                    </div>
                                                    {onlineUsers.has(followedUser._id) && (
                                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white shadow-sm"></div>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                        {followingUsers.length > 5 && (
                                            <Link
                                                to={`/profile/${user._id}`}
                                                className="mt-3 block text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
                                            >
                                                View all {followingUsers.length} following
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        You're not following anyone yet
                                    </p>
                                )}
                            </div>

                            {/* Trending Topics */}
                            {trendingTopics.length > 0 && (
                                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-5 hover:shadow-xl transition-all">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        Trending Topics
                                    </h3>
                                    <div className="space-y-2">
                                        {trendingTopics.map((topic, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSearchQuery(topic.tag)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-all group hover:scale-105"
                                            >
                                                <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600">
                                                    #{topic.tag}
                                                </span>
                                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{topic.count}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggested Actions */}
                            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-5 text-white relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="font-bold mb-2 text-lg">Stay Connected</h3>
                                    <p className="text-sm text-white/90 mb-4">
                                        Join study groups, find roommates, and explore campus events!
                                    </p>
                                    <Link
                                        to="/events"
                                        className="flex items-center justify-between bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 transition-all hover:scale-105 shadow-lg"
                                    >
                                        <span className="text-sm font-bold">Explore Events</span>
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Newsfeed;
