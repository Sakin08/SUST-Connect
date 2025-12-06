import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
    Newspaper, MessageCircle, Calendar, ShoppingBag, GraduationCap, Droplet,
    Users, Briefcase, MapPin, TrendingUp, Sparkles, ArrowRight, CheckCircle,
    Home as HousingIcon, BookOpen, Heart, Zap, Shield, Clock, Building2
} from 'lucide-react';
import axios from 'axios';
import ImageGalleryViewer from '../components/ImageGalleryViewer.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Home = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeStudents: 0,
        dailyPosts: 0,
        verifiedDonors: 0,
        activeGroups: 0
    });
    const [trendingPost, setTrendingPost] = useState(null);
    const [upcomingEvent, setUpcomingEvent] = useState(null);
    const [urgentRequest, setUrgentRequest] = useState(null);
    const [marketplaceItems, setMarketplaceItems] = useState([]);
    const [housingPosts, setHousingPosts] = useState([]);
    const [jobPosts, setJobPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [landmarkViewer, setLandmarkViewer] = useState({ isOpen: false, images: [], currentIndex: 0 });

    useEffect(() => {
        loadHomeData();
    }, []);

    const loadHomeData = async () => {
        try {
            const [statsRes, postsRes, eventsRes, bloodRes, marketRes, housingRes, jobsRes, donorsRes, lostFoundRes] = await Promise.all([
                axios.get(`${API_URL}/posts/campus-stats`, { withCredentials: true }).catch(() => ({ data: {} })),
                axios.get(`${API_URL}/posts/feed?limit=1&filter=trending`, { withCredentials: true }).catch(() => ({ data: { posts: [] } })),
                axios.get(`${API_URL}/events?limit=1`, { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/blood-donation/requests?limit=1`, { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/buysell?limit=2`, { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/housing?limit=2`, { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/jobs?limit=2`, { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/blood-donation/donors`, { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/lost-found?status=found`, { withCredentials: true }).catch(() => ({ data: [] }))
            ]);

            setStats({
                activeStudents: statsRes.data.totalUsers || 5300,
                dailyPosts: statsRes.data.averageDailyPosts || 120,
                verifiedDonors: donorsRes.data.length || 40,
                activeGroups: lostFoundRes.data.length || 20
            });

            if (postsRes.data.posts?.length > 0) setTrendingPost(postsRes.data.posts[0]);
            if (eventsRes.data.length > 0) setUpcomingEvent(eventsRes.data[0]);
            if (bloodRes.data.length > 0) setUrgentRequest(bloodRes.data[0]);
            setMarketplaceItems(marketRes.data.slice(0, 2));
            setHousingPosts(housingRes.data.slice(0, 2));
            setJobPosts(jobsRes.data.slice(0, 2));

            setLoading(false);
        } catch (err) {
            console.error('Failed to load home data:', err);
            setLoading(false);
        }
    };

    // Check if user has "other" role - show limited features
    const isOtherRole = user?.role === 'other';

    // Campus Landmarks data
    const landmarks = [
        {
            src: '/image/sust_nameplate_gate.jpg',
            title: 'Main Gate',
            desc: 'Welcome to SUST',
            color: 'indigo'
        },
        {
            src: '/image/shahidminar_3.jpg',
            title: 'Shahid Minar',
            desc: 'Symbol of Pride',
            color: 'purple'
        },
        {
            src: '/image/iict.jpg',
            title: 'IICT',
            desc: 'Innovation Hub',
            color: 'pink'
        },
        {
            src: '/image/mujtabaalihall.jpg',
            title: 'Mujtaba Ali Hall',
            desc: 'Student Residence',
            color: 'cyan'
        }
    ];

    const openLandmarkViewer = (index) => {
        setLandmarkViewer({
            isOpen: true,
            images: landmarks.map(l => l.src),
            currentIndex: index
        });
    };

    const closeLandmarkViewer = () => {
        setLandmarkViewer({ isOpen: false, images: [], currentIndex: 0 });
    };

    const navigateLandmark = (direction) => {
        if (typeof direction === 'number') {
            setLandmarkViewer(prev => ({ ...prev, currentIndex: direction }));
        } else if (direction === 'prev') {
            setLandmarkViewer(prev => ({
                ...prev,
                currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
            }));
        } else if (direction === 'next') {
            setLandmarkViewer(prev => ({
                ...prev,
                currentIndex: (prev.currentIndex + 1) % prev.images.length
            }));
        }
    };

    const allFeatures = [
        { icon: Newspaper, title: 'Newsfeed', desc: 'See what\'s happening on campus right now', link: '/feed', color: 'from-blue-500 to-cyan-500', bg: 'bg-gray-800/80 border border-blue-500/20', allowedRoles: ['student', 'teacher', 'admin'] },
        { icon: MessageCircle, title: 'Chat', desc: 'Instant messaging with friends & groups', link: '/messages', color: 'from-purple-500 to-pink-500', bg: 'bg-gray-800/80 border border-purple-500/20', allowedRoles: ['student', 'teacher', 'admin'] },
        { icon: Calendar, title: 'Events', desc: 'Discover & join campus events', link: '/events', color: 'from-green-500 to-emerald-500', bg: 'bg-gray-800/80 border border-green-500/20', allowedRoles: ['student', 'teacher', 'admin'] },
        { icon: ShoppingBag, title: 'Marketplace', desc: 'Buy/sell books, gadgets, room rentals', link: '/buysell', color: 'from-orange-500 to-red-500', bg: 'bg-gray-800/80 border border-orange-500/20', allowedRoles: ['student', 'teacher', 'admin'] },
        { icon: MapPin, title: 'Lost & Found', desc: 'Report lost items or find what you\'ve lost', link: '/lost-found', color: 'from-indigo-500 to-purple-500', bg: 'bg-gray-800/80 border border-indigo-500/20', allowedRoles: ['student', 'teacher', 'admin'] },
        { icon: Droplet, title: 'Blood Donation', desc: 'Find donors or respond to urgent requests', link: '/blood-donation', color: 'from-red-500 to-rose-500', bg: 'bg-gray-800/80 border border-red-500/20', allowedRoles: ['student', 'teacher', 'admin', 'other'] },
        { icon: ShoppingBag, title: 'Campus Eats', desc: 'Order food from campus restaurants', link: '/restaurants', color: 'from-yellow-500 to-orange-500', bg: 'bg-gray-800/80 border border-yellow-500/20', allowedRoles: ['student', 'teacher', 'admin', 'other'] }
    ];

    const quickAccessFeatures = !user
        ? allFeatures.filter(f => ['Events', 'Blood Donation', 'Lost & Found'].includes(f.title))
        : isOtherRole
            ? allFeatures.filter(f => f.allowedRoles.includes('other'))
            : allFeatures.filter(f => !f.allowedRoles || f.allowedRoles.includes(user?.role || 'student'));

    const allCategories = [
        { name: 'Events', icon: '�', link: '/events', allowedRoles: ['student', 'teacher', 'admin'] },
        { name: 'Blood Donation', icon: '🩸', link: '/blood-donation', allowedRoles: ['student', 'teacher', 'admin', 'other'] },
        { name: 'Jobs', icon: '💼', link: '/jobs', allowedRoles: ['student', 'teacher', 'admin'] },
        { name: 'Housing', icon: '🏠', link: '/housing', allowedRoles: ['student', 'teacher', 'admin'] },
        { name: 'Food', icon: '🍔', link: '/restaurants', allowedRoles: ['student', 'teacher', 'admin', 'other'] },
        { name: 'Marketplace', icon: '🛒', link: '/buysell', allowedRoles: ['student', 'teacher', 'admin'] },
        { name: 'Lost & Found', icon: '🔍', link: '/lost-found', allowedRoles: ['student', 'teacher', 'admin'] }
    ];

    const categories = !user
        ? allCategories.filter(c => ['Events', 'Blood Donation', 'Lost & Found'].includes(c.name))
        : isOtherRole
            ? allCategories.filter(c => c.allowedRoles.includes('other'))
            : allCategories.filter(c => !c.allowedRoles || c.allowedRoles.includes(user?.role || 'student'));

    const whyChoose = [
        { icon: Zap, title: 'All-in-One', desc: 'One unified platform for everything at SUST.' },
        { icon: Clock, title: 'Real-time', desc: 'Live feed, chats, alerts, notifications.' },
        { icon: Shield, title: 'Student-Verified', desc: 'Every user is a real SUST student.' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
                {/* SUST Iconic History Background - Premium Style */}
                <div className="absolute inset-0">
                    {/* Base layer for contrast */}
                    <div className="absolute inset-0 bg-black/30"></div>

                    {/* Historic campus image with enhanced quality */}
                    <img
                        src="/image/iconic_history.jpg"
                        alt="SUST Iconic History"
                        className="w-full h-full object-cover brightness-[1.15] contrast-[1.08] saturate-[1.15] scale-105"
                    />

                    {/* Premium gradient overlay with depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/65 via-purple-600/60 to-pink-600/65"></div>

                    {/* Subtle blur for glassmorphism */}
                    <div className="absolute inset-0 backdrop-blur-[1px]"></div>

                    {/* Vignette for focus */}
                    <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40"></div>

                    {/* Light overlay from top for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>
                </div>

                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                {/* Floating Shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30 shadow-lg">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs sm:text-sm font-bold">Welcome to SUST Connect</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight px-4">
                            Your Smart Campus
                        </h1>

                        <p className="text-base sm:text-xl md:text-2xl text-indigo-100 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
                            News, Events, Marketplace, Books, Blood Donation & More
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                            {!user ? (
                                <>
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-2xl hover:scale-105 transform"
                                    >
                                        Get Started
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center gap-2 bg-indigo-500 bg-opacity-30 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-40 transition border-2 border-white border-opacity-30"
                                    >
                                        Login
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/feed"
                                    className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-2xl hover:scale-105 transform"
                                >
                                    Go to Newsfeed
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249, 250, 251)" />
                    </svg>
                </div>
            </div>

            {/* Quick Access Feature Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 sm:-mt-16 relative z-10 mb-16 sm:mb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {quickAccessFeatures.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.link}
                            className={`${feature.bg} rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group backdrop-blur-sm`}
                        >
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{feature.title}</h3>
                            <p className="text-sm sm:text-base text-gray-300">{feature.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Dynamic Feed Preview - Hidden for "other" role */}
            {user && !isOtherRole && (
                <div className="max-w-7xl mx-auto px-4 mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-8 h-8 text-indigo-600" />
                            Live Campus Activity
                        </h2>
                        <Link to="/feed" className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Trending Post - Only for logged-in users */}
                        {user && trendingPost && (
                            <Link to={`/post/${trendingPost._id}`} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer block">
                                <div className="flex items-center gap-2 text-orange-600 font-semibold mb-4">
                                    <TrendingUp className="w-5 h-5" />
                                    Top Trending Post
                                </div>
                                <p className="text-gray-800 mb-4 line-clamp-3">{trendingPost.content?.text}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>❤️ {trendingPost.likes?.length || 0} likes</span>
                                    <span>💬 {trendingPost.commentCount || 0} comments</span>
                                </div>
                            </Link>
                        )}

                        {/* Upcoming Event */}
                        {upcomingEvent && (
                            <Link to="/events" className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer block">
                                <div className="flex items-center gap-2 text-purple-600 font-semibold mb-4">
                                    <Calendar className="w-5 h-5" />
                                    Upcoming Event
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{upcomingEvent.title}</h3>
                                <p className="text-gray-600 text-sm mb-4">{new Date(upcomingEvent.date).toLocaleDateString()}</p>
                                <span className="text-purple-600 font-semibold hover:underline">
                                    View Details →
                                </span>
                            </Link>
                        )}

                        {/* Urgent Blood Request */}
                        {urgentRequest && (
                            <Link to="/blood-donation" className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition border-2 border-red-200 cursor-pointer block">
                                <div className="flex items-center gap-2 text-red-600 font-semibold mb-4">
                                    <Droplet className="w-5 h-5" />
                                    Urgent Blood Request
                                </div>
                                <p className="text-gray-800 mb-2">Blood Type: <span className="font-bold text-red-600">{urgentRequest.bloodType}</span></p>
                                <p className="text-gray-600 text-sm mb-4">{urgentRequest.location}</p>
                                <span className="text-red-600 font-semibold hover:underline">
                                    Respond Now →
                                </span>
                            </Link>
                        )}

                        {/* Marketplace Picks */}
                        {marketplaceItems.length > 0 && (
                            <Link to="/buysell" className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer block">
                                <div className="flex items-center gap-2 text-green-600 font-semibold mb-4">
                                    <ShoppingBag className="w-5 h-5" />
                                    Marketplace Picks
                                </div>
                                <div className="space-y-3">
                                    {marketplaceItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            {item.image && (
                                                <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                                                <p className="text-green-600 font-bold">৳{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <span className="text-green-600 font-semibold hover:underline mt-4 inline-block">
                                    View More →
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Community Highlights */}
            <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-12 sm:py-16 mb-16 sm:mb-20 border-y-2 border-indigo-500/30 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-500/20 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">{stats.activeStudents.toLocaleString()}+</div>
                            <div className="text-xs sm:text-sm text-gray-300 font-bold uppercase tracking-wider">Total Members</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">{stats.dailyPosts}+</div>
                            <div className="text-xs sm:text-sm text-gray-300 font-bold uppercase tracking-wider">Avg Daily Posts</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 backdrop-blur-sm border border-red-500/20 hover:border-red-400/40 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent mb-2">{stats.verifiedDonors}+</div>
                            <div className="text-xs sm:text-sm text-gray-300 font-bold uppercase tracking-wider">Verified Donors</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 hover:border-green-400/40 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">{stats.activeGroups}+</div>
                            <div className="text-xs sm:text-sm text-gray-300 font-bold uppercase tracking-wider">Items Found</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-7xl mx-auto px-4 mb-20">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">Explore Categories</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    {categories.map((cat, idx) => (
                        <Link
                            key={idx}
                            to={cat.link}
                            className="inline-flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md hover:shadow-xl transition-all hover:scale-105 font-semibold text-gray-200 hover:text-indigo-400 border border-gray-700"
                        >
                            <span className="text-2xl">{cat.icon}</span>
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Why SUST Connect */}
            <div className="max-w-7xl mx-auto px-4 mb-20">
                <h2 className="text-3xl font-bold text-white mb-12 text-center">Why SUST Connect?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {whyChoose.map((item, idx) => (
                        <div key={idx} className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition border border-gray-700">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <item.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-gray-300">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Campus Landmarks - Modern Design */}
            <div className="max-w-7xl mx-auto px-4 mb-20">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-indigo-500/30">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-semibold text-indigo-300">Discover SUST</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
                        Campus Landmarks
                    </h2>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Explore the iconic places that make SUST special
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {landmarks.map((landmark, index) => (
                        <div
                            key={index}
                            onClick={() => openLandmarkViewer(index)}
                            className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer"
                        >
                            <div className="relative h-72 overflow-hidden">
                                <img
                                    src={landmark.src}
                                    alt={landmark.title}
                                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                                {/* Animated overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-t from-${landmark.color}-600/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                {/* Click to view indicator */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30">
                                        <span className="text-white font-semibold text-sm">Click to view</span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-500 group-hover:translate-y-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-8 h-1 bg-${landmark.color}-400 rounded-full`}></div>
                                </div>
                                <h3 className={`text-xl font-black mb-1 group-hover:text-${landmark.color}-300 transition-colors`}>{landmark.title}</h3>
                                <p className="text-sm text-gray-300 opacity-90">{landmark.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SUST Campus Gallery Carousel */}
            <CampusCarousel />

            {/* CTA Section */}
            {!user && (
                <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20 mb-0 overflow-hidden">
                    {/* Gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20"></div>

                    {/* Animated background elements */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                            Join the SUST Community Today
                        </h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Connect with fellow students and access everything you need in one place
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 transform shadow-xl"
                        >
                            Create Free Account
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Landmark Image Viewer */}
            {landmarkViewer.isOpen && (
                <ImageGalleryViewer
                    images={landmarkViewer.images}
                    currentIndex={landmarkViewer.currentIndex}
                    onClose={closeLandmarkViewer}
                    onNavigate={navigateLandmark}
                />
            )}
        </div>
    );
};

// Campus Carousel Component
const CampusCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const campusImages = [
        { src: '/image/sust_gate.jpg', caption: 'SUST Main Gate' },
        { src: '/image/shadilminar.jpg', caption: 'Shahid Minar' },
        { src: '/image/iict.jpg', caption: 'IICT Building' },
        { src: '/image/mujtabaalihall.jpg', caption: 'Mujtaba Ali Hall' },
        { src: '/image/kiloroad.jpg', caption: 'Campus Road' },
        { src: '/image/inchi_road.jpg', caption: 'Inchi Road' },
        // { src: '/image/482960815_993190686245235_4424343453997937682_n.jpg', caption: 'Campus Life' },
        { src: '/image/482984952_993190959578541_8366529342364279980_n.jpg', caption: 'Campus View' },
        { src: '/image/484187055_993183852912585_3503423309300225521_n.jpg', caption: 'SUST Campus' },
        { src: '/image/97228811_102348561497001_192103811156803584_n.jpg', caption: 'Beautiful Campus' }
    ];

    // Auto-slide every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % campusImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [campusImages.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % campusImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + campusImages.length) % campusImages.length);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 mb-20">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-green-500/30">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold text-green-300">Virtual Tour</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
                    Our Beautiful Campus
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                    Shahjalal University of Science and Technology - Where innovation meets nature
                </p>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
                {/* Main Image */}
                <div className="relative h-96 md:h-[550px]">
                    {campusImages.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-all duration-1000 ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                                }`}
                        >
                            <img
                                src={image.src}
                                alt={image.caption}
                                className="w-full h-full object-cover"
                            />
                            {/* Enhanced gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                            {/* Animated gradient accent */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-pink-600/20 opacity-60"></div>

                            {/* Modern Caption with glassmorphism */}
                            <div className="absolute bottom-20 left-6 right-6 md:left-8 md:right-auto md:max-w-md">
                                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
                                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Featured</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-1">{image.caption}</h3>
                                    <p className="text-sm text-gray-300">Discover the beauty of SUST</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modern Navigation Buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-2xl shadow-xl transition-all hover:scale-110 z-10 border border-white/30"
                    aria-label="Previous slide"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-2xl shadow-xl transition-all hover:scale-110 z-10 border border-white/30"
                    aria-label="Next slide"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Modern Progress Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {campusImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide
                                ? 'bg-gradient-to-r from-indigo-400 to-purple-400 w-12 shadow-lg shadow-indigo-500/50'
                                : 'bg-white/40 w-8 hover:bg-white/60'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Modern Counter Badge */}
                <div className="absolute top-6 right-6 bg-gradient-to-br from-indigo-500/90 to-purple-600/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl text-sm font-black z-10 border border-white/20 shadow-xl">
                    <span className="text-lg">{currentSlide + 1}</span>
                    <span className="text-white/70 mx-1">/</span>
                    <span className="text-white/90">{campusImages.length}</span>
                </div>

                {/* Auto-play indicator */}
                <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold z-10 border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Auto-play
                </div>
            </div>
        </div>
    );
};

export default Home;
