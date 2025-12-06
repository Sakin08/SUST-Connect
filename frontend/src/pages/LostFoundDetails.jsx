import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CommentsSection from '../components/CommentsSection';
import ImageGallery from '../components/ImageGallery';
import PosterInfo from '../components/PosterInfo';
import MessageButton from '../components/MessageButton';
import ReportButton from '../components/ReportButton';

import {
    ArrowLeft, MapPin, Calendar, Tag, HardHat, AlertTriangle,
    CheckCircle, Mail, Trash2, Eye, MessageCircle, Search, Edit
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const LostFoundDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    const isLost = item?.type === 'lost';
    const bgPrimaryClass = isLost ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

    useEffect(() => {
        loadItem();
    }, [id]);

    const loadItem = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/lost-found/${id}`);
            setItem(res.data);
        } catch (err) {
            console.error('Failed to load item:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        const message = isLost
            ? 'Confirm you found this item? The poster will be notified.'
            : 'Confirm this is your item? The poster will be notified.';

        if (!confirm(message)) return;

        try {
            const res = await axios.post(`${API_URL}/lost-found/${id}/claim`, {}, { withCredentials: true });
            setItem(res.data);
            alert(`Success! Status updated to "Claimed". Please contact the poster.`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit claim.');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to permanently delete this post?')) return;
        try {
            await axios.delete(`${API_URL}/lost-found/${id}`, { withCredentials: true });
            navigate('/lost-found');
        } catch (err) {
            alert('Failed to delete post.');
        }
    };

    if (loading || !item) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-900">
                <div className="text-center p-12 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-bold text-white">Loading details...</p>
                </div>
            </div>
        );
    }

    const isOwner = item.poster?._id === user?._id;

    const renderStatusBadge = () => {
        let statusClass = '';
        let statusIcon = '';
        let statusLabel = '';

        switch (item.status) {
            case 'active':
                statusClass = 'bg-green-100 text-green-700';
                statusIcon = <CheckCircle size={16} />;
                statusLabel = 'Active';
                break;
            case 'claimed':
                statusClass = 'bg-yellow-100 text-yellow-700';
                statusIcon = <AlertTriangle size={16} />;
                statusLabel = 'Claimed';
                break;
            case 'resolved':
                statusClass = 'bg-gray-100 text-gray-700';
                statusIcon = <Tag size={16} />;
                statusLabel = 'Resolved';
                break;
            default:
                statusClass = 'bg-gray-100 text-gray-700';
                statusIcon = <Tag size={16} />;
                statusLabel = 'Unknown';
        }

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${statusClass}`}>
                {statusIcon} {statusLabel}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <Link
                    to="/lost-found"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 px-5 py-3 rounded-xl font-bold mb-8 shadow-lg hover:shadow-xl transition-all border border-white/10"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Lost & Found
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-7">
                        {/* Header Card */}
                        <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Image Gallery */}
                            {item.images && item.images.length > 0 && (
                                <div className="relative">
                                    <ImageGallery images={item.images} />
                                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white flex items-center gap-1 ${isLost ? 'bg-red-500' : 'bg-green-500'}`}>
                                            <Search className="w-4 h-4" />
                                            {isLost ? 'LOST' : 'FOUND'}
                                        </span>
                                        {renderStatusBadge()}
                                    </div>
                                </div>
                            )}

                            <div className="p-8">
                                <h1 className="text-4xl font-black text-white mb-5">{item.title}</h1>

                                {/* Category Badge */}
                                <div className="mb-6">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-full font-bold border border-cyan-400/40">
                                        <Tag className="w-5 h-5" />
                                        {item.category}
                                    </span>
                                </div>

                                {/* Quick Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                    <div className="bg-gray-900/70 border border-cyan-800/40 rounded-xl p-5 text-center">
                                        <MapPin className="w-9 h-9 text-cyan-400 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400">Location</p>
                                        <p className="text-lg font-bold text-white">{item.location}</p>
                                    </div>

                                    <div className="bg-gray-900/70 border border-blue-800/40 rounded-xl p-5 text-center">
                                        <Calendar className="w-9 h-9 text-blue-400 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400">Date</p>
                                        <p className="text-lg font-bold text-white">
                                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>

                                    {item.color && (
                                        <div className="bg-gray-900/70 border border-purple-800/40 rounded-xl p-5 text-center">
                                            <Tag className="w-9 h-9 text-purple-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">Color</p>
                                            <p className="text-lg font-bold text-white">{item.color}</p>
                                        </div>
                                    )}

                                    {item.brand && (
                                        <div className="bg-gray-900/70 border border-orange-800/40 rounded-xl p-5 text-center">
                                            <HardHat className="w-9 h-9 text-orange-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">Brand</p>
                                            <p className="text-lg font-bold text-white">{item.brand}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
                                <MessageCircle className="w-7 h-7 text-cyan-400" />
                                Item Description
                            </h2>
                            <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">{item.description}</p>
                        </div>

                        {/* Identifying Features */}
                        {item.identifyingFeatures && (
                            <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
                                    <HardHat className="w-7 h-7 text-cyan-400" />
                                    Unique Marks / Features
                                </h2>
                                <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">{item.identifyingFeatures}</p>
                            </div>
                        )}

                        {/* Comments Section */}
                        <CommentsSection postType="lostfound" postId={id} />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Poster Info Card */}
                        <div className="bg-gray-800/95 backdrop-blur-xl border border-cyan-700/30 rounded-2xl shadow-2xl p-7 sticky top-6">
                            <h3 className="text-2xl font-black text-white mb-6 tracking-tight">Posted By</h3>

                            {/* User Profile Highlight */}
                            <div className="p-4 bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-pink-900/30 border-2 border-indigo-500/40 rounded-xl shadow-lg mb-6">
                                <PosterInfo user={item.poster} createdAt={item.createdAt} />
                            </div>

                            {/* Contact Info */}
                            {item.contactInfo && (
                                <div className="mt-6 p-5 bg-gradient-to-r from-cyan-900/40 to-blue-900/30 border border-cyan-600/40 rounded-xl">
                                    <p className="text-sm text-gray-400 mb-1">Contact Info</p>
                                    <p className="text-lg font-bold text-white">{item.contactInfo}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-7 space-y-4">
                                {/* Claim Status */}
                                {item.status === 'claimed' && item.claimedBy && (
                                    <div className="p-4 bg-yellow-500/20 border border-yellow-400/40 rounded-xl">
                                        <p className="text-sm font-bold text-yellow-300 mb-1 flex items-center gap-2">
                                            <AlertTriangle size={18} /> Claimed
                                        </p>
                                        <p className="text-xs text-yellow-200">
                                            Claimed by {item.claimedBy.name}
                                        </p>
                                    </div>
                                )}

                                {/* Claim Button */}
                                {user && !isOwner && item.status === 'active' && (
                                    <button
                                        onClick={handleClaim}
                                        className={`w-full block text-center ${isLost ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500' : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500'} text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200`}
                                    >
                                        <CheckCircle className="inline mr-2" size={20} />
                                        {isLost ? 'I Found This Item!' : 'This is My Item!'}
                                    </button>
                                )}

                                {/* Contact Buttons */}
                                {user && !isOwner && item.poster && (
                                    <>
                                        <MessageButton recipientId={item.poster._id} />
                                        {item.poster.email && (
                                            <a
                                                href={`mailto:${item.poster.email}`}
                                                className="w-full block text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                                            >
                                                <Mail className="inline mr-2" size={20} />
                                                Send Email
                                            </a>
                                        )}
                                    </>
                                )}

                                {/* Login Prompt */}
                                {!user && (
                                    <Link
                                        to="/login"
                                        className="w-full text-center block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                                    >
                                        Log in to Contact or Claim
                                    </Link>
                                )}

                                {/* Owner Message */}
                                {isOwner ? (
                                    <>
                                        <Link
                                            to={`/lost-found/edit/${item._id}`}
                                            className="w-full block text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                                        >
                                            <Edit className="inline mr-2" size={20} />
                                            Edit Post
                                        </Link>
                                        <div className="text-center py-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-600/40 rounded-xl">
                                            <p className="text-purple-300 font-medium">This is your post</p>
                                        </div>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                                        >
                                            <Trash2 size={20} />
                                            Delete Post
                                        </button>
                                    </>
                                ) : user && (
                                    <ReportButton
                                        itemId={item._id}
                                        itemType="lostfound"
                                        reportedUserId={item.poster?._id}
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

export default LostFoundDetails;
