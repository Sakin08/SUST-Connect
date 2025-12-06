import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import PosterInfo from './PosterInfo';
import SaveButton from './SaveButton';
import ReportButton from './ReportButton';
import { MapPin, Phone, UserPlus, Camera, Home, Trash2, ArrowRight, Edit } from 'lucide-react';

const HousingCard = ({ post, onDelete }) => {
    const { user: currentUser } = useAuth();

    // Safety check
    if (!post || !post.user) {
        return null;
    }

    const showDelete = onDelete && canDelete(currentUser, post.user);
    const mainImage = post.images?.[0];

    const formatRent = (rent) => {
        return rent?.toLocaleString('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).replace('BDT', '৳');
    };

    // Smart rent label
    const getRentLabel = () => {
        if (post.totalSeats && post.totalSeats > 1) {
            return (
                <>
                    <span className="text-2xl font-black text-white drop-shadow-md">
                        {formatRent(post.rent)}
                    </span>
                    <span className="text-white/90 font-bold text-sm"> per seat</span>
                </>
            );
        }
        if (post.housingType?.toLowerCase().includes('room')) {
            return (
                <>
                    <span className="text-2xl font-black text-white drop-shadow-md">
                        {formatRent(post.rent)}
                    </span>
                    <span className="text-white/90 font-bold text-sm"> per room</span>
                </>
            );
        }
        return (
            <>
                <span className="text-2xl font-black text-white drop-shadow-md">
                    {formatRent(post.rent)}
                </span>
                <span className="text-white/90 font-bold text-sm"> /mo</span>
            </>
        );
    };

    return (
        <div className="
            group bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200/80
            shadow-lg hover:shadow-2xl hover:shadow-blue-500/20
            transition-all duration-400 ease-out
            transform hover:-translate-y-1.5 hover:scale-[1.02]
            overflow-hidden flex flex-col h-full
        ">
            {/* IMAGE SECTION */}
            <div className="relative h-56 overflow-hidden">
                <Link to={`/housing/${post._id}`} className="block absolute inset-0">
                    {mainImage ? (
                        <img
                            src={mainImage}
                            alt={post.address || 'Housing'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <Home className="w-20 h-20 text-gray-300" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </Link>

                <div className="absolute top-3 left-3 flex gap-2 z-10 pointer-events-none">
                    <div className="pointer-events-auto">
                        <SaveButton postId={post._id} postType="housing" />
                    </div>
                    <div className="pointer-events-auto">
                        <ReportButton itemType="housing" itemId={post._id} reportedUserId={post.user?._id} />
                    </div>
                </div>

                <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-none">
                    {post.roommatesNeeded ? (
                        <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <UserPlus size={14} />
                            {post.roommatesNeeded} Roommate{post.roommatesNeeded > 1 ? 's' : ''}
                        </div>
                    ) : post.type && (
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            {post.type}
                        </div>
                    )}
                    {post.images?.length > 1 && (
                        <div className="bg-black/70 text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 backdrop-blur">
                            <Camera size={13} /> {post.images.length}
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${post.postType === 'available'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                        {post.postType === 'available' ? 'Available' : 'Looking For'}
                    </span>
                    {post.housingType && (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 capitalize">
                            {post.housingType}
                        </span>
                    )}
                    {post.totalSeats && (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                            {post.totalSeats} Seats
                        </span>
                    )}
                </div>

                {/* SMART PRICE DISPLAY */}
                <div className="mb-3">
                    <div className="inline-flex items-baseline gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                        {getRentLabel()}
                    </div>
                </div>

                <div className="flex items-center gap-2.5 text-gray-800 font-semibold mb-2">
                    <MapPin size={19} className="text-blue-600 flex-shrink-0" />
                    <span className="line-clamp-2 text-sm">{post.address}</span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                    {post.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                    <PosterInfo user={post.user} createdAt={post.createdAt} compact={true} />
                    {post.commentCount !== undefined && (
                        <div className="flex items-center gap-1.5 bg-blue-50 rounded-lg px-2.5 py-1 border border-blue-200">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-bold text-blue-700 text-sm">{post.commentCount}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                    <Link
                        to={`/housing/${post._id}`}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                    >
                        View Details
                        <ArrowRight size={16} />
                    </Link>

                    {post.phone && (
                        <a
                            href={`tel:${post.phone}`}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
                        >
                            <Phone size={16} />
                            Call
                        </a>
                    )}

                    {showDelete && (
                        <div className="flex gap-2 ml-auto">
                            <Link
                                to={`/housing/edit/${post._id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                                <Edit size={15} />
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to delete this post?')) {
                                        onDelete(post._id);
                                    }
                                }}
                                className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HousingCard;