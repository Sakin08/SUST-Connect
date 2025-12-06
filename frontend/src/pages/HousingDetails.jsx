import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import MessageButton from '../components/MessageButton.jsx';
import ImageGallery from '../components/ImageGallery.jsx';
import PosterInfo from '../components/PosterInfo.jsx';
import CommentsSection from '../components/CommentsSection.jsx';
import ReportButton from '../components/ReportButton.jsx';
import {
    Home, MapPin, Calendar, Users, Phone, Mail,
    Wifi, Zap, Droplet, Car, Shield, Sofa, Wind, CheckCircle,
    Eye, ArrowLeft, MessageCircle, Building, Edit
} from 'lucide-react';

const HousingDetails = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPost();
    }, [id]);

    const loadPost = async () => {
        try {
            const res = await api.get(`/housing/${id}`);
            setPost(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load housing:', err);
            setLoading(false);
        }
    };

    const formatRent = (rent) => rent?.toLocaleString('en-BD', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    // Smart rent display
    const getRentInfo = () => {
        const rent = `৳${formatRent(post.rent)}`;
        if (post.totalSeats && post.totalSeats > 1) return `${rent} per seat/month`;
        if (post.housingType?.toLowerCase().includes('room') || post.housingType?.toLowerCase().includes('sublet')) return `${rent} per room/month`;
        return `${rent}/month`;
    };

    const getFacilityIcon = (facility) => {
        const icons = {
            attached_bath: Droplet, wifi: Wifi, gas: Zap, generator: Zap,
            parking: Car, lift: Building, security: Shield, furnished: Sofa,
            balcony: Wind, kitchen: Home, gas_line: Zap, gas_cylinder: Zap,
            house_maid: Users
        };
        return icons[facility] || CheckCircle;
    };

    const getFacilityLabel = (facility) => {
        const labels = {
            attached_bath: 'Attached Bath', wifi: 'WiFi', gas_line: 'Gas Line',
            gas_cylinder: 'Gas Cylinder', generator: 'Generator/IPS', parking: 'Parking',
            lift: 'Lift/Elevator', security: 'Security Guard', house_maid: 'House Maid',
            furnished: 'Furnished', balcony: 'Balcony', kitchen: 'Shared Kitchen'
        };
        return labels[facility] || facility.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-900">
                <div className="text-center p-12 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-bold text-white">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!post) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-pink-900 p-6">
            <div className="max-w-md w-full p-10 text-center bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                <Home className="w-20 h-20 text-red-400 mx-auto mb-6" />
                <p className="text-2xl font-bold text-white mb-6">Post Not Found</p>
                <Link to="/housing" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition">
                    <ArrowLeft /> Back to Housing
                </Link>
            </div>
        </div>
    );

    const isOwnPost = currentUser?._id === post.user?._id;
    const isAvailable = post.postType === 'available';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <Link
                    to="/housing"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 px-5 py-3 rounded-xl font-bold mb-8 shadow-lg hover:shadow-xl transition-all border border-white/10"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Housing
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-7">

                        {/* Image + Header */}
                        <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                            {post.images?.length > 0 && (
                                <div className="relative">
                                    <ImageGallery images={post.images} />
                                    <div className="absolute top-4 left-4 flex gap-3 z-10">
                                        <span className={`px-4 py-2 rounded-full text-white font-bold shadow-xl ${isAvailable ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                                            {isAvailable ? 'Available' : 'Looking For'}
                                        </span>
                                        {post.housingType && (
                                            <span className="px-4 py-2 rounded-full bg-purple-600 text-white font-bold shadow-xl">
                                                {post.housingType}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="p-8">
                                <h1 className="text-4xl font-black text-white mb-5">{post.title}</h1>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-2xl">
                                        <span className="text-4xl font-black text-white drop-shadow-lg">
                                            ৳{formatRent(post.rent)}
                                        </span>
                                        <span className="text-xl font-bold text-white/90 ml-3">
                                            {post.totalSeats && post.totalSeats > 1 ? 'per seat' :
                                                post.housingType?.toLowerCase().includes('room') || post.housingType?.toLowerCase().includes('sublet') ? 'per room' : '/month'}
                                        </span>
                                    </div>
                                    {post.negotiable && (
                                        <span className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full font-bold border border-emerald-400/40">
                                            <CheckCircle size={18} /> Negotiable
                                        </span>
                                    )}
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-4 text-gray-200 mb-8">
                                    <MapPin className="w-7 h-7 text-cyan-400" />
                                    <div>
                                        <span className="text-xl font-semibold text-white">{post.location}</span>
                                        {post.address && <span className="text-gray-400"> – {post.address}</span>}
                                        {post.distanceFromCampus && <span className="text-cyan-300 ml-3">• {post.distanceFromCampus}</span>}
                                    </div>
                                </div>

                                {/* Quick Info */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                    <div className="bg-gray-900/70 border border-cyan-800/40 rounded-xl p-5 text-center">
                                        <Calendar className="w-9 h-9 text-cyan-400 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400">Available From</p>
                                        <p className="text-lg font-bold text-white">
                                            {new Date(post.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    {post.totalSeats && (
                                        <div className="bg-gray-900/70 border border-blue-800/40 rounded-xl p-5 text-center">
                                            <Users className="w-9 h-9 text-blue-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">Total Seats</p>
                                            <p className="text-lg font-bold text-white">{post.totalSeats}</p>
                                        </div>
                                    )}
                                    {post.availableSeats && (
                                        <div className="bg-gray-900/70 border border-emerald-800/40 rounded-xl p-5 text-center">
                                            <Users className="w-9 h-9 text-emerald-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">Available</p>
                                            <p className="text-lg font-bold text-white">{post.availableSeats}</p>
                                        </div>
                                    )}
                                    {post.totalRooms && (
                                        <div className="bg-gray-900/70 border border-purple-800/40 rounded-xl p-5 text-center">
                                            <Home className="w-9 h-9 text-purple-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">Rooms</p>
                                            <p className="text-lg font-bold text-white">{post.totalRooms}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
                                <MessageCircle className="w-7 h-7 text-cyan-400" />
                                {isAvailable ? 'Description' : 'Requirements'}
                            </h2>
                            <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">{post.description}</p>
                        </div>

                        {/* Facilities */}
                        {post.facilities?.length > 0 && (
                            <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <CheckCircle className="w-7 h-7 text-cyan-400" />
                                    Facilities
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                    {post.facilities.map((f, i) => {
                                        const Icon = getFacilityIcon(f);
                                        return (
                                            <div key={i} className="flex items-center gap-4 p-5 bg-gray-900/60 border border-gray-700 rounded-xl hover:bg-gray-900/80 transition">
                                                <Icon className="w-7 h-7 text-cyan-400" />
                                                <span className="font-semibold text-gray-100">{getFacilityLabel(f)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <CommentsSection postType="housing" postId={post._id} />
                    </div>

                    {/* BEAUTIFUL CONTACT SECTION */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800/95 backdrop-blur-xl border border-cyan-700/30 rounded-2xl shadow-2xl p-7 sticky top-6">
                            <h3 className="text-2xl font-black text-white mb-6 tracking-tight">
                                Contact Information
                            </h3>

                            {/* User Profile Highlight */}
                            <div className="p-4 bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-pink-900/30 border-2 border-indigo-500/40 rounded-xl shadow-lg mb-6">
                                <PosterInfo user={post.user} createdAt={post.createdAt} />
                            </div>

                            {/* Phone Card */}
                            <div className="mt-6 p-5 bg-gradient-to-r from-cyan-900/40 to-blue-900/30 border border-cyan-600/40 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-cyan-500/20 rounded-lg">
                                        <Phone className="w-7 h-7 text-cyan-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Phone Number</p>
                                        <a href={`tel:${post.phone}`} className="text-xl font-bold text-white hover:text-cyan-300 transition">
                                            {post.phone}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {post.preferredContact && (
                                <div className="mt-3 text-center py-2 px-4 bg-cyan-900/30 border border-cyan-600/50 rounded-lg">
                                    <span className="text-cyan-300 text-sm font-semibold">
                                        Preferred: {post.preferredContact === 'both' ? 'Call & Message' : post.preferredContact}
                                    </span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-7 space-y-4">
                                {!isOwnPost && post.user && (
                                    <>
                                        <MessageButton recipientId={post.user._id} />

                                        {post.user.email && (
                                            <a href={`mailto:${post.user.email}`} className="w-full block text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                                                <Mail className="inline mr-2" size={20} /> Send Email
                                            </a>
                                        )}

                                        <a href={`tel:${post.phone}`} className="w-full block text-center bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                                            <Phone className="inline mr-2" size={22} /> Call Now
                                        </a>
                                    </>
                                )}

                                {isOwnPost ? (
                                    <>
                                        <Link to={`/housing/edit/${post._id}`} className="w-full block text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                                            <Edit className="inline mr-2" size={20} /> Edit This Post
                                        </Link>
                                        <div className="text-center py-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-600/40 rounded-xl">
                                            <p className="text-purple-300 font-medium">This is your listing</p>
                                        </div>
                                    </>
                                ) : currentUser && (
                                    <ReportButton
                                        itemId={post._id}
                                        itemType="housing"
                                        reportedUserId={post.user?._id}
                                        className="w-full justify-center"
                                    />
                                )}


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HousingDetails; 