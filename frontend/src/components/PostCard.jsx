import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import UserAvatar from './UserAvatar';
import CommentsSection from './CommentsSection';
import SaveButton from './SaveButton';
import ReportButton from './ReportButton';
import api from '../api/axios';
import { MoreHorizontal, MessageCircle, EyeOff } from 'lucide-react';

const PostCard = ({ post, onUpdate, onDelete }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(post.content.text || '');
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    // Check if post is hidden
    useEffect(() => {
        const hidden = localStorage.getItem(`hidden_post_${post._id}`);
        if (hidden === 'true') {
            setIsHidden(true);
        }
    }, [post._id]);

    // Keyboard navigation for image viewer
    useEffect(() => {
        if (!showImageViewer) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowImageViewer(false);
            } else if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
                setCurrentImageIndex(currentImageIndex - 1);
            } else if (e.key === 'ArrowRight' && currentImageIndex < (post.content.images?.length || 0) - 1) {
                setCurrentImageIndex(currentImageIndex + 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showImageViewer, currentImageIndex, post.content.images]);

    // Safety checks
    if (!post || !post.author) {
        return null;
    }

    const isLiked = post.likes?.some(like => like.user?._id === user?._id || like.user === user?._id);
    const showDelete = canDelete(user, post.author);

    const handleUnhidePost = () => {
        setIsHidden(false);
        localStorage.removeItem(`hidden_post_${post._id}`);
    };

    // Show collapsed state if hidden
    if (isHidden) {
        return (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                        <EyeOff className="w-4 h-4" />
                        <span className="text-sm">Post hidden</span>
                    </div>
                    <button
                        onClick={handleUnhidePost}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Undo
                    </button>
                </div>
            </div>
        );
    }

    const handleLike = async () => {
        try {
            const res = await api.post(`/posts/${post._id}/like`);
            onUpdate(res.data);
        } catch (err) {
            console.error('Failed to like post:', err);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditText(post.content.text || '');
        setShowOptionsMenu(false);
    };

    const handleUpdatePost = async () => {
        if (!editText.trim()) return;

        try {
            const res = await api.put(`/posts/${post._id}`, {
                text: editText
            });
            onUpdate(res.data);
            setIsEditing(false);
        } catch (err) {
            alert('Failed to update post');
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditText(post.content.text || '');
    };

    const handleDelete = async () => {
        if (!confirm('Delete this post?')) return;

        try {
            await api.delete(`/posts/${post._id}`);
            onDelete(post._id);
        } catch (err) {
            alert('Failed to delete post');
        }
    };

    const handleHidePost = () => {
        setIsHidden(true);
        setShowOptionsMenu(false);
        // You can also save this to localStorage or backend
        localStorage.setItem(`hidden_post_${post._id}`, 'true');
    };

    const formatTime = (date) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffMs = now - postDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return postDate.toLocaleDateString();
    };

    const getLikesText = () => {
        if (!post.likes || post.likes.length === 0) return '';

        const likeCount = post.likes.length;
        const names = post.likes.slice(0, 3).map(like => like.user?.name || 'Someone').filter(Boolean);

        if (likeCount === 1) {
            return names[0];
        } else if (likeCount === 2) {
            return `${names[0]} and ${names[1]}`;
        } else if (likeCount === 3) {
            return `${names[0]}, ${names[1]} and ${names[2]}`;
        } else {
            return `${names[0]}, ${names[1]} and ${likeCount - 2} others`;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="px-4 pt-3 pb-2">
                <div className="flex items-center justify-between">
                    <Link to={`/profile/${post.author._id}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 -ml-1 pr-3 transition flex-1 min-w-0">
                        <UserAvatar user={post.author} size="md" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate hover:underline">{post.author.name}</p>
                                {post.author.isStudentVerified && (
                                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                                <span className="truncate">{post.author.department}</span>
                                <span>·</span>
                                <span className="flex-shrink-0">{formatTime(post.createdAt)}</span>
                                {post.isEdited && (
                                    <>
                                        <span>·</span>
                                        <span className="flex-shrink-0">Edited</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Link>

                    <div className="relative">
                        <button
                            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <MoreHorizontal className="w-5 h-5 text-gray-600" />
                        </button>

                        {showOptionsMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowOptionsMenu(false)}></div>
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 min-w-[220px]">
                                    {showDelete ? (
                                        <>
                                            <button
                                                onClick={handleEdit}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span className="font-medium">Edit post</span>
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={handleDelete}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <span className="font-medium">Delete post</span>
                                            </button>
                                        </>
                                    ) : user && (
                                        <>
                                            <button
                                                onClick={handleHidePost}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                                            >
                                                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                                                <span className="font-medium">Hide post</span>
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={() => {
                                                    setShowOptionsMenu(false);
                                                    setShowReportModal(true);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                                </svg>
                                                <span className="font-medium">Report post</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
                {isEditing ? (
                    <div className="space-y-3">
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                            rows="4"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleUpdatePost}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                            >
                                Save
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content.text}</p>
                )}
            </div>

            {/* Images */}
            {post.content.images && post.content.images.length > 0 && (
                <div className="mt-2">
                    <div className={`grid gap-0.5 ${post.content.images.length === 1 ? 'grid-cols-1' :
                        post.content.images.length === 2 ? 'grid-cols-2' :
                            post.content.images.length === 3 ? 'grid-cols-3' :
                                'grid-cols-2'
                        }`}>
                        {post.content.images.slice(0, 4).map((image, index) => (
                            <div
                                key={index}
                                className="relative overflow-hidden bg-gray-100 cursor-pointer group"
                                style={{ paddingBottom: post.content.images.length === 1 ? '56.25%' : '100%' }}
                                onClick={() => {
                                    setCurrentImageIndex(index);
                                    setShowImageViewer(true);
                                }}
                            >
                                <img
                                    src={image}
                                    alt={`Post image ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {index === 3 && post.content.images.length > 4 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                        <span className="text-white text-3xl font-bold">+{post.content.images.length - 4}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Bar */}
            {(post.likes?.length > 0 || commentCount > 0) && (
                <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100">
                    <div className="relative">
                        {post.likes?.length > 0 && (
                            <button
                                onClick={() => setShowReactions(!showReactions)}
                                className="flex items-center gap-2 hover:underline"
                            >
                                <div className="flex items-center -space-x-1">
                                    <div className="w-5 h-5 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                        <svg className="w-3 h-3 text-white fill-white" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-gray-700">{getLikesText()}</span>
                            </button>
                        )}

                        {/* Reactions Modal */}
                        {showReactions && post.likes?.length > 0 && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowReactions(false)}></div>
                                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20 w-72 max-h-80 overflow-y-auto">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900">Reactions</h4>
                                        <button
                                            onClick={() => setShowReactions(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {post.likes.map((like, index) => {
                                            const userId = typeof like.user === 'object' ? like.user?._id : like.user;
                                            const userName = typeof like.user === 'object' ? like.user?.name : null;
                                            const userPicture = typeof like.user === 'object' ? like.user?.profilePicture : null;
                                            const userDept = typeof like.user === 'object' ? like.user?.department : null;

                                            if (!userId) return null;

                                            return (
                                                <Link
                                                    key={index}
                                                    to={`/profile/${userId}`}
                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
                                                    onClick={() => setShowReactions(false)}
                                                >
                                                    {userPicture ? (
                                                        <img
                                                            src={userPicture}
                                                            alt={userName || 'User'}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {userName?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 text-sm truncate">
                                                            {userName || 'SUST User'}
                                                        </p>
                                                        {userDept && (
                                                            <p className="text-xs text-gray-500 truncate">{userDept}</p>
                                                        )}
                                                    </div>
                                                    <svg className="w-4 h-4 text-red-500 fill-red-500" viewBox="0 0 24 24">
                                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    {commentCount > 0 && (
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="hover:underline"
                        >
                            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                        </button>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="px-2 py-1">
                <div className="flex items-center">
                    <button
                        onClick={handleLike}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition text-sm ${isLiked
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <svg className={`w-5 h-5 ${isLiked ? 'fill-red-600' : ''}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>Love</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition text-sm"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>Comment</span>
                    </button>

                    <div className="flex-1 flex items-center justify-center px-2">
                        <SaveButton postId={post._id} postType="post" />
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="border-t border-gray-200">
                    <CommentsSection
                        postType="post"
                        postId={post._id}
                        onCommentCountChange={setCommentCount}
                    />
                </div>
            )}

            {/* Image Viewer Modal */}
            {showImageViewer && post.content.images && post.content.images.length > 0 && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
                    onClick={() => setShowImageViewer(false)}
                >
                    <button
                        onClick={() => setShowImageViewer(false)}
                        className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition z-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {post.content.images.length > 1 && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            {currentImageIndex + 1} / {post.content.images.length}
                        </div>
                    )}

                    {post.content.images.length > 1 && currentImageIndex > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(currentImageIndex - 1);
                            }}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {post.content.images.length > 1 && currentImageIndex < post.content.images.length - 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(currentImageIndex + 1);
                            }}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    <div
                        className="max-w-7xl max-h-screen p-4 flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={post.content.images[currentImageIndex]}
                            alt={`Image ${currentImageIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <ReportButton
                    itemId={post._id}
                    itemType="post"
                    reportedUserId={post.author?._id}
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </div>
    );
};

export default PostCard;
