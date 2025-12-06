import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import UserAvatar from './UserAvatar';
import ReportButton from './ReportButton';
import { Edit, MessageCircle, Calendar, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

const LostFoundCard = ({ item, onDelete }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    // Safety check
    if (!item || !item.poster) {
        return null;
    }

    const showDelete = onDelete && canDelete(currentUser, item.poster);
    const isLost = item.type === 'lost';

    const statusConfig = {
        active: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', icon: CheckCircle, label: 'Active' },
        claimed: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', icon: AlertCircle, label: 'Claimed' },
        resolved: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', icon: CheckCircle, label: 'Resolved' }
    };

    const status = statusConfig[item.status] || statusConfig.active;
    const StatusIcon = status.icon;

    const handleCardClick = (e) => {
        if (e.target.closest('a, button, [role="button"]')) return;
        navigate(`/lost-found/${item._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 cursor-pointer
                       hover:-translate-y-2 hover:scale-[1.02] hover:ring-4 hover:ring-blue-500/10"
        >
            {/* Gradient Top Bar */}
            <div className={`h-1.5 ${isLost
                ? 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-500'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
                }`} />

            {/* Image Section - Compact */}
            <div className="relative overflow-hidden bg-gray-50">
                {item.images?.[0] ? (
                    <div className="h-44 relative">
                        <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Photo Count */}
                        {item.images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4h12v12H4V4zm4 3a1 1 0 100 2 1 1 0 000-2zm6 0h2v2h-2V7zm-6 4h8v6H8v-6z" /></svg>
                                {item.images.length}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`h-44 flex items-center justify-center ${isLost ? 'bg-gradient-to-br from-rose-50 to-red-50' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
                        <div className={`p-6 rounded-full ${isLost ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                            {isLost ? (
                                <AlertCircle className={`w-12 h-12 ${isLost ? 'text-rose-500' : 'text-emerald-500'}`} />
                            ) : (
                                <CheckCircle className={`w-12 h-12 ${isLost ? 'text-rose-500' : 'text-emerald-500'}`} />
                            )}
                        </div>
                    </div>
                )}

                {/* Floating Status Badge */}
                <div className={`absolute top-3 left-3 ${status.bg} ${status.text} ${status.border} border-2 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm`}>
                    <StatusIcon className="w-4 h-4" />
                    {status.label}
                </div>
            </div>

            {/* Content - Compact */}
            <div className="p-4 space-y-3">
                {/* Type + Category */}
                <div className="flex items-center justify-between">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isLost
                        ? 'bg-rose-100 text-rose-700 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        } shadow-sm`}>
                        {isLost ? 'LOST' : 'FOUND'}
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                        {item.category}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
                    {item.description}
                </p>

                {/* Location & Date */}
                <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2.5 text-gray-700">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-600">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm">
                            {new Date(item.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                {/* Poster Info */}
                {item.poster && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <UserAvatar user={item.poster} size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-xs truncate">
                                {item.poster.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {item.poster.department}{item.poster.batch ? ` • ${item.poster.batch}` : ''}
                            </p>
                        </div>

                        {/* Comment Count */}
                        {item.commentCount !== undefined && (
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-200">
                                <MessageCircle className="w-3.5 h-3.5" />
                                {item.commentCount}
                            </div>
                        )}
                    </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <Link
                        to={`/lost-found/${item._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-md hover:shadow-lg
                            ${isLost
                                ? 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                            }`}
                    >
                        View
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>

                    <div className="flex items-center gap-2">
                        <div onClick={(e) => e.stopPropagation()}>
                            <ReportButton itemType="lostfound" itemId={item._id} reportedUserId={item.poster?._id} />
                        </div>

                        {showDelete && (
                            <>
                                <Link
                                    to={`/lost-found/edit/${item._id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this item?')) {
                                            onDelete(item._id);
                                        }
                                    }}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2.375 2.375 0 0116.138 21H7.862a2.375 2.375 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LostFoundCard;