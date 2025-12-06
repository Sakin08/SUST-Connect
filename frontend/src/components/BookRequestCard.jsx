import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import { BookOpen, MessageCircle, Edit, Trash2, Clock, Zap, User } from 'lucide-react';
import ReportButton from './ReportButton';
import SaveButton from './SaveButton';
import { deleteBookRequest } from '../api/bookRequests';

const BookRequestCard = ({ request, onUpdate }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Safety check
    if (!request || !request.requester) {
        return null;
    }

    const showDelete = canDelete(user, request.requester);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this book request?')) return;

        try {
            await deleteBookRequest(request._id);
            if (onUpdate) onUpdate();
            alert('Book request deleted successfully');
        } catch (error) {
            console.error('Failed to delete book request:', error);
            alert('Failed to delete book request');
        }
    };

    const getTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const posted = new Date(date);
        const diffMs = now - posted;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return posted.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    const handleCardClick = (e) => {
        if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".save-area")) return;
        navigate(`/books/${request._id}`);
    };

    const mainImage = request.images?.[0];
    const isUrgent = request.urgency === 'urgent';

    // Get request type styling
    const getRequestTypeStyle = () => {
        switch (request.requestType) {
            case 'borrow':
                return {
                    label: '📖 Need to Borrow',
                    bg: 'bg-blue-500',
                    border: 'border-blue-600',
                    text: 'text-blue-600'
                };
            case 'need-to-buy':
                return {
                    label: '💰 Need to Buy',
                    bg: 'bg-emerald-500',
                    border: 'border-emerald-600',
                    text: 'text-emerald-600'
                };
            case 'looking-for':
                return {
                    label: '🔍 Looking For',
                    bg: 'bg-purple-500',
                    border: 'border-purple-600',
                    text: 'text-purple-600'
                };
            default:
                return {
                    label: '📚 Request',
                    bg: 'bg-gray-500',
                    border: 'border-gray-600',
                    text: 'text-gray-600'
                };
        }
    };

    const typeStyle = getRequestTypeStyle();

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full group"
        >
            {/* HEADER SECTION - Colored Bar */}
            <div className={`${typeStyle.bg} h-2`}></div>

            {/* IMAGE SECTION */}
            <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                {mainImage ? (
                    <img
                        src={mainImage}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={request.bookTitle}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-slate-300" strokeWidth={1.5} />
                    </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {request.status === 'open' && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Open
                        </span>
                    )}
                    {request.status === 'fulfilled' && (
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Fulfilled
                        </span>
                    )}
                    {request.status === 'closed' && (
                        <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Closed
                        </span>
                    )}
                    {isUrgent && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
                            <Zap size={12} />
                            Urgent
                        </span>
                    )}
                </div>

                {/* Top right actions */}
                <div className="absolute top-3 right-3 flex gap-2">
                    <div className="save-area" onClick={(e) => e.stopPropagation()}>
                        <SaveButton postId={request._id} postType="bookrequest" />
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                        <ReportButton itemType="bookrequest" itemId={request._id} reportedUserId={request.requester?._id} />
                    </div>
                </div>

                {/* Request type badge at bottom */}
                <div className="absolute bottom-3 left-3">
                    <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-white">
                        {typeStyle.label}
                    </span>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Book Title */}
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2 leading-tight">
                    {request.bookTitle}
                </h3>

                {/* Author */}
                {request.author && (
                    <p className="text-base text-gray-700 mb-3 font-medium">
                        by <span className="text-gray-900 font-semibold">{request.author}</span>
                    </p>
                )}

                {/* Course */}
                {request.course && (
                    <div className="mb-3">
                        <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${typeStyle.border} ${typeStyle.text} bg-white`}>
                            📚 {request.course}
                        </span>
                    </div>
                )}

                {/* Description */}
                {request.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                        {request.description}
                    </p>
                )}

                {/* Spacer */}
                <div className="flex-grow"></div>

                {/* Time & Responses */}
                <div className="flex items-center justify-between text-sm mb-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={16} />
                        <span className="font-medium">{getTimeAgo(request.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
                        <MessageCircle size={16} />
                        <span className="font-bold">{(request.responses?.length || 0) + (request.commentCount || 0)}</span>
                    </div>
                </div>

                {/* Requester Info */}
                <Link
                    to={`/profile/${request.requester?._id}`}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-3"
                >
                    {request.requester?.profilePicture ? (
                        <img
                            src={request.requester.profilePicture}
                            alt={request.requester.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-gray-200">
                            {request.requester?.name?.charAt(0)?.toUpperCase() || <User size={18} />}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate text-sm">
                            {request.requester?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {request.requester?.department}
                            {request.requester?.batch && ` • Batch ${request.requester.batch}`}
                        </p>
                    </div>
                </Link>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <Link
                        to={`/books/${request._id}`}
                        onClick={e => e.stopPropagation()}
                        className={`flex-1 ${typeStyle.bg} text-white px-4 py-2.5 rounded-lg font-bold text-sm text-center hover:opacity-90 transition-all`}
                    >
                        View Details
                    </Link>

                    {showDelete && (
                        <>
                            <Link
                                to={`/books/edit/${request._id}`}
                                onClick={e => e.stopPropagation()}
                                className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                                <Edit size={16} />
                            </Link>
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                                className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookRequestCard;
