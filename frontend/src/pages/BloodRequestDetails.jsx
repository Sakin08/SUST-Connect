import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PosterInfo from '../components/PosterInfo';
import MessageButton from '../components/MessageButton';
import CommentsSection from '../components/CommentsSection';
import api from '../api/axios';
import {
    ArrowLeft, MapPin, Phone, Calendar, AlertTriangle, CheckCircle,
    XCircle, HeartPulse, User, Trash2, Hospital, MessageCircle, Edit, Droplet
} from 'lucide-react';

const BloodRequestDetails = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequest();
    }, [id]);

    const loadRequest = async () => {
        try {
            const res = await api.get(`/blood-donation/requests/${id}`);
            setRequest(res.data);
        } catch (err) {
            console.error('Failed to load request:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkFulfilled = async () => {
        if (!confirm('Mark this request as fulfilled?')) return;
        try {
            await api.patch(`/blood-donation/requests/${id}/status`, { status: 'fulfilled' });
            setRequest({ ...request, status: 'fulfilled' });
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this blood request? This action cannot be undone.')) return;
        try {
            await api.delete(`/blood-donation/requests/${id}`);
            navigate('/blood-donation');
        } catch (err) {
            alert('Failed to delete request');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 to-black">
                <div className="text-center p-12 bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-800/50">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-2xl font-black text-red-400">Loading blood request...</p>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 to-black p-6">
                <div className="max-w-md w-full p-10 text-center bg-black/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-800">
                    <Droplet className="w-24 h-24 text-red-500 mx-auto mb-6 animate-pulse" />
                    <p className="text-3xl font-black text-white mb-6">Request Not Found</p>
                    <Link to="/blood-donation" className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition shadow-xl">
                        <ArrowLeft /> Back to Requests
                    </Link>
                </div>
            </div>
        );
    }

    const isOwnRequest = currentUser?._id === request.requester?._id;
    const isUrgent = request.urgency === 'urgent' || request.urgency === 'critical';

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-7xl">

                <Link
                    to="/blood-donation"
                    className="inline-flex items-center gap-2 bg-red-900/40 backdrop-blur-lg text-red-300 hover:text-white hover:bg-red-800/80 px-5 py-3 rounded-xl font-bold mb-8 shadow-lg hover:shadow-red-500/40 border border-red-800/50 transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Blood Requests
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-7">

                        {/* Hero Card */}
                        <div className="bg-gray-900/95 backdrop-blur-xl border border-red-800/60 rounded-2xl shadow-2xl shadow-2xl overflow-hidden">
                            <div className="p-6 relative">
                                {/* Subtle blood glow */}
                                <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none"></div>

                                <div className="relative z-10">
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        <span className={`px-4 py-2 rounded-full font-semibold text-sm shadow-lg ${request.status === 'open' ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-gray-300'
                                            }`}>
                                            {request.status.toUpperCase()}
                                        </span>
                                        <span className={`px-4 py-2 rounded-full font-semibold text-sm shadow-lg animate-pulse ${isUrgent ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                                            }`}>
                                            {request.urgency?.toUpperCase()} URGENCY
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex-1">
                                            <h1 className="text-3xl font-bold text-white">
                                                Need <span className="text-red-500">{request.bloodGroup}</span> Blood
                                            </h1>
                                            {isUrgent && (
                                                <p className="text-base text-red-400 mt-2 font-semibold animate-pulse">
                                                    Immediate Donation Required
                                                </p>
                                            )}
                                        </div>

                                        {/* Blood Drop Badge */}
                                        <div className="relative flex-shrink-0">
                                            <Droplet className="w-24 h-24 text-red-600 drop-shadow-xl animate-pulse" fill="currentColor" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-3xl font-black text-white drop-shadow-lg">
                                                    {request.bloodGroup}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4 text-center">
                                            <MapPin className="w-6 h-6 text-red-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">Location</p>
                                            <p className="text-sm font-bold text-white">{request.location}</p>
                                        </div>
                                        <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4 text-center">
                                            <Calendar className="w-6 h-6 text-red-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">Needed By</p>
                                            <p className="text-sm font-bold text-white">
                                                {request.neededBy
                                                    ? new Date(request.neededBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                    : 'ASAP'}
                                            </p>
                                        </div>
                                        <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4 text-center">
                                            <Phone className="w-6 h-6 text-red-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">Contact</p>
                                            <a href={`tel:${request.contactPhone}`} className="text-sm font-bold text-white hover:text-red-300">
                                                {request.contactPhone}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Patient Info */}
                        {(request.patientName || request.patientAge) && (
                            <div className="bg-gray-800/90 backdrop-blur-lg border border-red-800/40 rounded-xl shadow-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-red-400" />
                                    Patient Information
                                </h2>
                                <div className="space-y-3 bg-black/40 rounded-lg p-4 border border-red-900/30">
                                    {request.patientName && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Name</span>
                                            <span className="font-semibold text-white">{request.patientName}</span>
                                        </div>
                                    )}
                                    {request.patientAge && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Age</span>
                                            <span className="font-semibold text-white">{request.patientAge} years</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Hospital */}
                        {request.hospital && (
                            <div className="bg-gray-800/90 backdrop-blur-lg border border-red-800/40 rounded-xl shadow-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Hospital className="w-5 h-5 text-red-400" />
                                    Hospital
                                </h2>
                                <p className="text-base text-gray-200 bg-black/40 px-4 py-3 rounded-lg border border-red-900/30">
                                    {request.hospital}
                                </p>
                            </div>
                        )}

                        {/* Message */}
                        {request.message && (
                            <div className="bg-gray-800/90 backdrop-blur-lg border border-red-800/40 rounded-xl shadow-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-red-400" />
                                    Case Details
                                </h2>
                                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line bg-black/40 p-4 rounded-lg border border-red-900/30">
                                    {request.message}
                                </p>
                            </div>
                        )}

                        <CommentsSection postType="bloodrequest" postId={id} />
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900/95 backdrop-blur-xl border-2 border-red-800/60 rounded-xl shadow-2xl p-5 sticky top-6">
                            <h3 className="text-xl font-bold text-red-400 mb-5 text-center">
                                Be a Hero Today
                            </h3>

                            <div className="p-3 bg-gradient-to-br from-red-900/60 to-pink-900/40 border border-red-700 rounded-lg mb-4">
                                <PosterInfo user={request.requester} createdAt={request.createdAt} />
                            </div>

                            <div className="p-4 bg-red-900/40 border border-red-700 rounded-lg text-center mb-4">
                                <Phone className="w-6 h-6 text-red-300 mx-auto mb-2" />
                                <a href={`tel:${request.contactPhone}`} className="text-lg font-bold text-white block hover:text-red-300">
                                    {request.contactPhone}
                                </a>
                                <p className="text-red-400 text-xs font-medium mt-1">Call for emergency</p>
                            </div>

                            <div className="space-y-3">
                                {!isOwnRequest && request.status === 'open' && (
                                    <>
                                        <MessageButton recipientId={request.requester._id} />

                                        <a href={`tel:${request.contactPhone}`}
                                            className="w-full block text-center bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                            <Phone className="inline mr-2" size={18} /> CALL NOW
                                        </a>

                                        <button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                            <HeartPulse className="inline mr-2" size={18} /> I CAN DONATE
                                        </button>
                                    </>
                                )}

                                {isOwnRequest && (
                                    <>
                                        <Link to={`/blood-donation/edit/${id}`} className="w-full block text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                            <Edit className="inline mr-2" size={18} /> Edit Request
                                        </Link>

                                        {request.status === 'open' && (
                                            <button onClick={handleMarkFulfilled} className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                                <CheckCircle className="inline mr-2" size={18} /> Mark as Fulfilled
                                            </button>
                                        )}

                                        <button onClick={handleDelete} className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                            <Trash2 className="inline mr-2" size={18} /> Delete Request
                                        </button>

                                        <div className="text-center py-2 bg-red-900/30 border border-red-700 rounded-lg">
                                            <p className="text-red-300 text-sm font-medium">This is your request</p>
                                        </div>
                                    </>
                                )}

                                {!currentUser && (
                                    <Link to="/login" className="w-full block text-center bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                        LOG IN TO HELP
                                    </Link>
                                )}
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodRequestDetails;