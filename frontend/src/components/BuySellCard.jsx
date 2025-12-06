import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canDelete } from "../utils/permissions";
import PosterInfo from "./PosterInfo";
import SaveButton from "./SaveButton";
import ReportButton from "./ReportButton";
import { MapPin, MessageCircle, Camera, Edit } from "lucide-react";

const BuySellCard = ({ post, onDelete }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    // Check if current user can delete this post
    const showDelete = onDelete && canDelete(currentUser, post.user);

    const mainImage = post.images?.[0] || post.image;
    const hasMultipleImages = post.images && post.images.length > 1;

    const formatPrice = (price) =>
        "৳" + Number(price).toLocaleString("en-BD");

    const handleCardClick = (e) => {
        if (
            e.target.closest("button") ||
            e.target.closest("a") ||
            e.target.closest(".save-area")
        ) {
            return;
        }
        navigate(`/buysell/${post._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="
                group bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200
                hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 
                cursor-pointer overflow-hidden flex flex-col relative h-full
            "
        >
            {/* IMAGE SECTION */}
            <div className="relative h-56 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 overflow-hidden">
                {mainImage ? (
                    <>
                        <img
                            src={mainImage}
                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                            alt={post.title}
                        />
                        {/* Clean gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </>
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                        <Camera className="w-24 h-24 text-gray-400 relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                    </div>
                )}

                {/* Floating Save Button */}
                <div
                    className="absolute top-3 right-3 z-20 save-area opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <SaveButton postId={post._id} postType="buysell" />
                </div>

                {/* Multiple images badge */}
                {hasMultipleImages && (
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg border border-blue-400/30">
                        <Camera size={14} strokeWidth={2.5} />
                        <span>{post.images.length} Photos</span>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-5 flex flex-col flex-grow relative">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* TITLE */}
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-4 leading-tight group-hover:text-blue-600 transition-colors duration-300 relative z-10">
                    {post.title}
                </h3>

                {/* PRICE */}
                <div className="mb-4">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow duration-300">
                        <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Price</span>
                        <div className="w-px h-5 bg-white/30"></div>
                        <p className="text-2xl font-black text-white tracking-tight">
                            {formatPrice(post.price)}
                        </p>
                    </div>
                </div>

                {/* LOCATION */}
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                        <MapPin size={16} className="text-white flex-shrink-0" />
                    </div>
                    <span className="truncate">{post.location}</span>
                </div>

                {/* DESCRIPTION */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed flex-1">
                    {post.description}
                </p>

                {/* POSTER INFO */}
                <div className="border-t border-gray-200 pt-4 mt-auto">
                    <PosterInfo user={post.user} createdAt={post.createdAt} compact={true} />
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200 mt-3">
                    {/* Comments Count */}
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                        <MessageCircle size={16} className="text-blue-600" />
                        <span className="font-bold text-blue-700">{post.commentCount || 0}</span>
                        <span className="text-xs text-blue-600 hidden sm:inline">comments</span>
                    </div>

                    {/* Edit & Delete Buttons */}
                    {showDelete ? (
                        <div className="flex gap-2">
                            <Link
                                to={`/buysell/edit/${post._id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-blue-600 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold"
                            >
                                <Edit size={14} />
                                <span>Edit</span>
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("Delete this post?")) {
                                        onDelete(post._id);
                                    }
                                }}
                                className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-bold"
                            >
                                Delete
                            </button>
                        </div>
                    ) : (
                        <ReportButton
                            itemId={post._id}
                            itemType="buysell"
                            reportedUserId={post.user?._id}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuySellCard;