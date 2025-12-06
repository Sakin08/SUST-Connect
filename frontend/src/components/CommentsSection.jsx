import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import ReportButton from './ReportButton';
import { ThumbsUp, MessageCircle, MoreHorizontal } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CommentsSection = ({ postType, postId, onCommentCountChange }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [showOptionsMenu, setShowOptionsMenu] = useState(null);
    const [showAllComments, setShowAllComments] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState({});
    const { user } = useAuth();

    const INITIAL_COMMENTS_SHOW = 3;
    const INITIAL_REPLIES_SHOW = 2;

    useEffect(() => {
        loadComments();
    }, [postType, postId]);

    const loadComments = async () => {
        try {
            const res = await axios.get(`${API_URL}/comments?postType=${postType}&postId=${postId}`);
            setComments(res.data);

            // Calculate total comment count (including replies)
            const totalCount = res.data.reduce((count, comment) => {
                return count + 1 + (comment.replies?.length || 0);
            }, 0);

            // Notify parent component of comment count
            if (onCommentCountChange) {
                onCommentCountChange(totalCount);
            }
        } catch (err) {
            console.error('Failed to load comments:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const payload = {
                content: newComment,
                postType,
                postId
            };

            // Add reply info if replying
            if (replyingTo) {
                payload.parentComment = replyingTo.commentId;
                payload.replyTo = replyingTo.userId;
            }

            const res = await axios.post(`${API_URL}/comments`, payload, {
                withCredentials: true
            });

            // Reload comments to get updated structure
            await loadComments();
            setNewComment('');
            setReplyingTo(null);
        } catch (err) {
            alert('Failed to post comment');
        }
        setLoading(false);
    };

    const handleReply = (comment) => {
        setReplyingTo({
            commentId: comment._id,
            userId: comment.author._id,
            userName: comment.author.name
        });
        setNewComment('');
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setNewComment('');
    };

    const handleLike = async (commentId) => {
        if (!user) {
            alert('Please login to like comments');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/comments/${commentId}/like`, {}, {
                withCredentials: true
            });

            setComments(comments.map(c =>
                c._id === commentId
                    ? { ...c, likes: Array(res.data.likes).fill(null) }
                    : c
            ));
        } catch (err) {
            console.error('Failed to like comment:', err);
        }
    };

    const handleEdit = (comment) => {
        setEditingComment(comment._id);
        setEditText(comment.content);
    };

    const handleUpdateComment = async (commentId) => {
        if (!editText.trim()) return;

        try {
            await axios.put(`${API_URL}/comments/${commentId}`, {
                content: editText
            }, {
                withCredentials: true
            });

            await loadComments();
            setEditingComment(null);
            setEditText('');
        } catch (err) {
            alert('Failed to update comment');
        }
    };

    const cancelEdit = () => {
        setEditingComment(null);
        setEditText('');
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Delete this comment?')) return;

        try {
            await axios.delete(`${API_URL}/comments/${commentId}`, {
                withCredentials: true
            });
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            alert('Failed to delete comment');
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const commentDate = new Date(date);
        const diffMs = now - commentDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        const diffWeeks = Math.floor(diffMs / 604800000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        if (diffWeeks < 4) return `${diffWeeks}w`;
        return commentDate.toLocaleDateString();
    };

    return (
        <div className="bg-white">
            {/* Comment Form */}
            {user ? (
                <div className="px-4 py-3 border-b border-gray-200">
                    {replyingTo && (
                        <div className="mb-2 flex items-center gap-2 text-xs text-gray-600 bg-blue-50 px-3 py-1.5 rounded-full">
                            <span>Replying to <strong>{replyingTo.userName}</strong></span>
                            <button
                                type="button"
                                onClick={cancelReply}
                                className="ml-auto text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <UserAvatar user={user} size="sm" />
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:bg-gray-200 text-sm"
                            />
                            {newComment.trim() && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm disabled:opacity-50"
                                >
                                    {loading ? '...' : '➤'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            ) : (
                <div className="px-4 py-3 border-b border-gray-200 text-center">
                    <p className="text-gray-600 text-sm">Please login to comment</p>
                </div>
            )}

            {/* Comments List */}
            <div className="px-4 py-2">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">No comments yet. Be the first to comment!</p>
                ) : (
                    <>
                        {(showAllComments ? comments : comments.slice(0, INITIAL_COMMENTS_SHOW)).map(comment => (
                            <div key={comment._id} className="py-3">
                                {/* Main Comment */}
                                <div className="flex gap-2">
                                    <Link to={`/profile/${comment.author?._id}`}>
                                        <UserAvatar user={comment.author} size="sm" />
                                    </Link>

                                    <div className="flex-1 min-w-0">
                                        {editingComment === comment._id ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:bg-gray-200 text-sm"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2 px-2">
                                                    <button
                                                        onClick={() => handleUpdateComment(comment._id)}
                                                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="text-xs text-gray-600 hover:text-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                                                    <Link
                                                        to={`/profile/${comment.author?._id}`}
                                                        className="font-semibold text-gray-900 hover:underline text-sm block"
                                                    >
                                                        {comment.author?.name || 'Unknown User'}
                                                    </Link>
                                                    {comment.replyTo && (
                                                        <Link
                                                            to={`/profile/${comment.replyTo._id}`}
                                                            className="text-xs text-blue-600 hover:underline"
                                                        >
                                                            @{comment.replyTo.name}
                                                        </Link>
                                                    )}
                                                    <p className="text-gray-900 text-sm whitespace-pre-wrap break-words">
                                                        {comment.replyTo && comment.content.startsWith(`@${comment.replyTo.name}`)
                                                            ? comment.content.replace(`@${comment.replyTo.name}`, '').trim()
                                                            : comment.content}
                                                    </p>
                                                </div>

                                                {/* Like badge */}
                                                {comment.likes?.length > 0 && (
                                                    <div className="flex items-center gap-1 ml-2 mt-1">
                                                        <div className="bg-blue-600 rounded-full p-0.5 flex items-center justify-center">
                                                            <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
                                                        </div>
                                                        <span className="text-xs text-gray-600">{comment.likes.length}</span>
                                                    </div>
                                                )}

                                                {/* Action buttons */}
                                                <div className="flex items-center gap-4 mt-1 px-3">
                                                    <button
                                                        onClick={() => handleLike(comment._id)}
                                                        className={`text-xs font-semibold transition ${comment.likes?.some(l => l === user?._id)
                                                            ? 'text-blue-600'
                                                            : 'text-gray-600 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        Like
                                                    </button>

                                                    {user && (
                                                        <button
                                                            onClick={() => handleReply(comment)}
                                                            className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition"
                                                        >
                                                            Reply
                                                        </button>
                                                    )}

                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(comment.createdAt)}
                                                    </span>

                                                    {comment.isEdited && (
                                                        <span className="text-xs text-gray-500">Edited</span>
                                                    )}

                                                    {user && comment.author?._id === user._id ? (
                                                        <div className="relative ml-auto">
                                                            <button
                                                                onClick={() => setShowOptionsMenu(showOptionsMenu === comment._id ? null : comment._id)}
                                                                className="text-gray-400 hover:text-gray-600 transition"
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>

                                                            {showOptionsMenu === comment._id && (
                                                                <div className="absolute right-0 top-6 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10 min-w-[120px]">
                                                                    <button
                                                                        onClick={() => {
                                                                            handleEdit(comment);
                                                                            setShowOptionsMenu(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleDelete(comment._id);
                                                                            setShowOptionsMenu(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : user && (
                                                        <div className="ml-auto">
                                                            <ReportButton
                                                                itemId={comment._id}
                                                                itemType="comment"
                                                                reportedUserId={comment.author?._id}
                                                                className="text-xs"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="ml-10 mt-2 space-y-3">
                                        {/* Show more replies button */}
                                        {comment.replies.length > INITIAL_REPLIES_SHOW && !expandedReplies[comment._id] && (
                                            <button
                                                onClick={() => setExpandedReplies({ ...expandedReplies, [comment._id]: true })}
                                                className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition flex items-center gap-1 py-2"
                                            >
                                                <MessageCircle className="w-3 h-3" />
                                                View {comment.replies.length - INITIAL_REPLIES_SHOW} more {comment.replies.length - INITIAL_REPLIES_SHOW === 1 ? 'reply' : 'replies'}
                                            </button>
                                        )}

                                        {(expandedReplies[comment._id] ? comment.replies : comment.replies.slice(0, INITIAL_REPLIES_SHOW)).map(reply => (
                                            <div key={reply._id} className="flex gap-2">
                                                <Link to={`/profile/${reply.author?._id}`}>
                                                    <UserAvatar user={reply.author} size="sm" />
                                                </Link>

                                                <div className="flex-1 min-w-0">
                                                    {editingComment === reply._id ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text"
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:bg-gray-200 text-sm"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2 px-2">
                                                                <button
                                                                    onClick={() => handleUpdateComment(reply._id)}
                                                                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={cancelEdit}
                                                                    className="text-xs text-gray-600 hover:text-gray-700"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                                                                <Link
                                                                    to={`/profile/${reply.author?._id}`}
                                                                    className="font-semibold text-gray-900 hover:underline text-sm block"
                                                                >
                                                                    {reply.author?.name || 'Unknown User'}
                                                                </Link>
                                                                {reply.replyTo && (
                                                                    <Link
                                                                        to={`/profile/${reply.replyTo._id}`}
                                                                        className="text-xs text-blue-600 hover:underline"
                                                                    >
                                                                        @{reply.replyTo.name}
                                                                    </Link>
                                                                )}
                                                                <p className="text-gray-900 text-sm whitespace-pre-wrap break-words">
                                                                    {reply.replyTo && reply.content.startsWith(`@${reply.replyTo.name}`)
                                                                        ? reply.content.replace(`@${reply.replyTo.name}`, '').trim()
                                                                        : reply.content}
                                                                </p>
                                                            </div>

                                                            {/* Like badge */}
                                                            {reply.likes?.length > 0 && (
                                                                <div className="flex items-center gap-1 ml-2 mt-1">
                                                                    <div className="bg-blue-600 rounded-full p-0.5 flex items-center justify-center">
                                                                        <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
                                                                    </div>
                                                                    <span className="text-xs text-gray-600">{reply.likes.length}</span>
                                                                </div>
                                                            )}

                                                            {/* Action buttons */}
                                                            <div className="flex items-center gap-4 mt-1 px-3">
                                                                <button
                                                                    onClick={() => handleLike(reply._id)}
                                                                    className={`text-xs font-semibold transition ${reply.likes?.some(l => l === user?._id)
                                                                        ? 'text-blue-600'
                                                                        : 'text-gray-600 hover:text-gray-900'
                                                                        }`}
                                                                >
                                                                    Like
                                                                </button>

                                                                {user && (
                                                                    <button
                                                                        onClick={() => handleReply(reply)}
                                                                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition"
                                                                    >
                                                                        Reply
                                                                    </button>
                                                                )}

                                                                <span className="text-xs text-gray-500">
                                                                    {formatTime(reply.createdAt)}
                                                                </span>

                                                                {reply.isEdited && (
                                                                    <span className="text-xs text-gray-500">Edited</span>
                                                                )}

                                                                {user && reply.author?._id === user._id ? (
                                                                    <div className="relative ml-auto">
                                                                        <button
                                                                            onClick={() => setShowOptionsMenu(showOptionsMenu === reply._id ? null : reply._id)}
                                                                            className="text-gray-400 hover:text-gray-600 transition"
                                                                        >
                                                                            <MoreHorizontal className="w-4 h-4" />
                                                                        </button>

                                                                        {showOptionsMenu === reply._id && (
                                                                            <div className="absolute right-0 top-6 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10 min-w-[120px]">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleEdit(reply);
                                                                                        setShowOptionsMenu(null);
                                                                                    }}
                                                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                >
                                                                                    Edit
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleDelete(reply._id);
                                                                                        setShowOptionsMenu(null);
                                                                                    }}
                                                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : user && (
                                                                    <div className="ml-auto">
                                                                        <ReportButton
                                                                            itemId={reply._id}
                                                                            itemType="comment"
                                                                            reportedUserId={reply.author?._id}
                                                                            className="text-xs"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Show more comments button */}
                        {comments.length > INITIAL_COMMENTS_SHOW && !showAllComments && (
                            <div className="py-3 border-t border-gray-100">
                                <button
                                    onClick={() => setShowAllComments(true)}
                                    className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition w-full text-center py-2"
                                >
                                    View {comments.length - INITIAL_COMMENTS_SHOW} more {comments.length - INITIAL_COMMENTS_SHOW === 1 ? 'comment' : 'comments'}
                                </button>
                            </div>
                        )}

                        {/* Show less comments button */}
                        {showAllComments && comments.length > INITIAL_COMMENTS_SHOW && (
                            <div className="py-3 border-t border-gray-100">
                                <button
                                    onClick={() => setShowAllComments(false)}
                                    className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition w-full text-center py-2"
                                >
                                    Show less
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentsSection;
