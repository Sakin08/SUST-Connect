import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import UserAvatar from './UserAvatar';
import api from '../api/axios';
import { Locate, Phone, Hospital, Calendar, AlertTriangle, CheckCircle, XCircle, HeartPulse, User, Trash2, ShieldCheck, MessageCircle } from 'lucide-react';

const RequestCard = ({ request, onUpdate }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Safety check - if request or request.requester is null, don't render
    if (!request || !request.requester) {
        return null;
    }

    const isUrgent = request.urgency === 'urgent';
    const isOwner = user && request.requester && user._id === request.requester._id;
    const showDelete = canDelete(user, request.requester);

    const statusConfig = {
        open: { bg: 'bg-green-100', text: 'text-green-700', icon: <HeartPulse size={18} />, label: 'Open' },
        active: { bg: 'bg-green-100', text: 'text-green-700', icon: <HeartPulse size={18} />, label: 'Active' },
        fulfilled: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <ShieldCheck size={18} />, label: 'Fulfilled' },
        cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', icon: <XCircle size={18} />, label: 'Cancelled' }
    };
    const status = statusConfig[request.status] || statusConfig.open;

    const handleMarkFulfilled = async () => {
        if (!confirm('Mark this request as fulfilled? The request will be automatically removed.')) return;
        try {
            // First mark as fulfilled
            await api.patch(
                `/blood-donation/requests/${request._id}/status`,
                { status: 'fulfilled' }
            );
            // Then delete it
            await api.delete(`/blood-donation/requests/${request._id}`);
            if (onUpdate) onUpdate();
            alert('Blood request marked as fulfilled and removed!');
        } catch (err) {
            alert('Failed to mark as fulfilled');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this blood request?')) return;
        try {
            await api.delete(`/blood-donation/requests/${request._id}`);
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Failed to delete request');
        }
    };

    // Dynamic styling based on urgency
    const primaryClass = isUrgent ? 'border-red-500' : 'border-blue-500';
    const urgencyBarClass = isUrgent ? 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse shadow-red-500/50' : 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/50';

    const handleCardClick = (e) => {
        // Don't navigate if clicking on buttons or links
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        navigate(`/blood-donation/request/${request._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className={`
                bg-white/90 backdrop-blur-lg rounded-xl shadow-lg 
                hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]
                overflow-hidden border-t-2 border-l ${primaryClass} flex flex-col cursor-pointer
            `}
        >
            {/* Urgency Bar - Used as a clean accent top border */}
            <div className={`h-1.5 ${urgencyBarClass} shadow-md`}></div>

            <div className="p-3 flex flex-col flex-grow">

                {/* 1. HEADER: Requester & Blood Group */}
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-gray-200 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Link to={`/profile/${request.requester._id}`} className="flex-shrink-0">
                            <UserAvatar user={request.requester} size="md" />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-500">Requested By</p>
                            <Link
                                to={`/profile/${request.requester._id}`}
                                className="font-bold text-sm sm:text-lg text-gray-900 hover:text-red-600 transition truncate block"
                            >
                                {request.requester.name}
                            </Link>
                            <p className="text-xs text-gray-600 truncate">{request.requester.department}</p>
                        </div>
                    </div>

                    {/* Blood Group Needed (Prominent) */}
                    <div className="flex flex-col items-center bg-gradient-to-br from-red-50 to-rose-100 px-3 sm:px-4 py-2 rounded-xl border-2 border-red-200 shadow-lg flex-shrink-0">
                        <HeartPulse size={20} className="text-red-600 sm:w-6 sm:h-6" />
                        <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-red-600 to-rose-700 bg-clip-text text-transparent leading-none mt-1">{request.bloodGroup}</div>
                        <div className="text-xs font-black text-red-500 mt-1">Needed</div>
                    </div>
                </div>

                {/* 2. PATIENT INFO (Highlighted) - Only show if data exists */}
                {(request.patientName || request.patientAge) && (
                    <div className="rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 shadow-lg">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <User size={18} className="text-red-600 sm:w-5 sm:h-5 flex-shrink-0" />
                            <h4 className="text-sm sm:text-base font-extrabold text-red-900 truncate">
                                Patient: {request.patientName || 'N/A'}
                            </h4>
                        </div>
                        <div className="pl-6 sm:pl-7 space-y-0.5">
                            {request.patientAge && (
                                <p className="text-xs sm:text-sm text-red-800"><span className="font-bold">Age:</span> {request.patientAge} years</p>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. DETAILS GRID */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">

                    {/* Hospital & Location - Highlighted */}
                    <div className="flex items-start gap-2 sm:gap-3 bg-gradient-to-r from-purple-50 to-indigo-100 px-3 py-2.5 rounded-xl border-2 border-purple-300 shadow-md">
                        <Hospital size={20} className="text-purple-700 flex-shrink-0 mt-1 sm:w-6 sm:h-6" />
                        <div className="flex-1 min-w-0">
                            {request.hospital && (
                                <>
                                    <p className="text-xs text-purple-600 font-bold mb-0.5">Hospital</p>
                                    <p className="text-base sm:text-lg font-black text-purple-900 leading-tight">{request.hospital}</p>
                                </>
                            )}
                            <p className="text-xs text-purple-700 flex items-center gap-1 mt-1.5 font-semibold">
                                <Locate size={12} className="flex-shrink-0" />
                                <span className="truncate">{request.location}</span>
                            </p>
                        </div>
                    </div>

                    {/* Contact & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2.5 rounded-xl border border-green-200 shadow-sm">
                            <Phone size={16} className="text-green-600 flex-shrink-0 sm:w-4.5 sm:h-4.5" />
                            <a href={`tel:${request.contactPhone || request.contactNumber}`} className="text-xs sm:text-sm font-medium text-gray-700 hover:text-green-700 transition truncate">
                                {request.contactPhone || request.contactNumber}
                            </a>
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2.5 rounded-xl border border-gray-200 shadow-sm">
                            <Calendar size={16} className="text-gray-500 flex-shrink-0 sm:w-4.5 sm:h-4.5" />
                            <span className="text-xs font-medium text-gray-600 truncate">
                                {request.neededBy || request.requiredDate
                                    ? new Date(request.neededBy || request.requiredDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                    : 'ASAP'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. URGENCY & STATUS BADGES */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4 mt-auto">
                    {isUrgent && (
                        <div className="flex-1 bg-gradient-to-r from-red-100 to-rose-200 border-2 border-red-300 rounded-xl p-2.5 sm:p-3 shadow-lg">
                            <div className="flex items-center justify-center gap-2">
                                <AlertTriangle size={18} className="text-red-600 animate-pulse sm:w-5 sm:h-5 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-extrabold text-red-700">URGENT CALL</span>
                            </div>
                        </div>
                    )}
                    <div className={`flex-1 ${status.bg} rounded-xl p-2.5 sm:p-3 flex items-center justify-center gap-1.5 border-2 ${status.bg} shadow-md`}>
                        {status.icon}
                        <p className={`text-xs sm:text-sm font-bold ${status.text}`}>
                            {status.label}
                        </p>
                    </div>
                </div>

                {/* 5. Patient Condition/Description - Highlighted */}
                {(request.description || request.message) && (
                    <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-400 rounded-xl p-3 mb-3 sm:mb-4 shadow-lg">
                        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-extrabold mb-1.5 flex items-center gap-1.5">
                            <span className="text-amber-600">⚠️</span> Patient Condition:
                        </p>
                        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed line-clamp-3 font-semibold">
                            {request.description || request.message}
                        </p>
                    </div>
                )}

                {/* 6. Action Buttons with Comment Count - ALL IN ONE ROW */}
                {isOwner ? (
                    <div className="flex items-center gap-2">
                        {/* Comment Count */}
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-3 py-2 shadow-sm">
                            <MessageCircle size={14} className="text-blue-600" />
                            <span className="text-sm font-bold text-blue-700">{request.commentCount || 0}</span>
                        </div>

                        {/* Mark Fulfilled Button */}
                        {(request.status === 'active' || request.status === 'open') && (
                            <button
                                onClick={handleMarkFulfilled}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 rounded-lg font-bold transition text-xs"
                            >
                                <CheckCircle size={14} />
                                <span className="hidden sm:inline">Fulfilled</span>
                            </button>
                        )}

                        {/* Delete Button */}
                        {showDelete && (
                            <button
                                onClick={handleDelete}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-2 rounded-lg font-bold transition text-xs"
                            >
                                <Trash2 size={14} />
                                <span className="hidden sm:inline">Delete</span>
                            </button>
                        )}
                    </div>
                ) : user ? (
                    <div className="flex items-center gap-2">
                        {/* Comment Count */}
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-3 py-2 shadow-sm">
                            <MessageCircle size={14} className="text-blue-600" />
                            <span className="text-sm font-bold text-blue-700">{request.commentCount || 0}</span>
                        </div>

                        {/* View Details Button */}
                        <Link
                            to={`/blood-donation/request/${request._id}`}
                            className="flex-1 text-center flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-bold transition text-xs"
                        >
                            View
                        </Link>

                        {/* Help Button */}
                        <Link
                            to={`/chat/${request.requester._id}`}
                            className="flex-1 text-center flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-2 rounded-lg font-bold transition text-xs"
                        >
                            <MessageCircle size={14} />
                            <span className="hidden sm:inline">Help</span>
                        </Link>
                    </div>
                ) : (
                    <Link
                        to={`/blood-donation/request/${request._id}`}
                        className="block w-full text-center flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 sm:py-3 rounded-xl font-bold transition shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                    >
                        View Details
                    </Link>
                )}
            </div>
        </div>
    );
};

export default RequestCard;