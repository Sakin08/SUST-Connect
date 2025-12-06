import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/buysell.js';
import MessageButton from '../components/MessageButton.jsx';
import ImageGallery from '../components/ImageGallery.jsx';

import PosterInfo from '../components/PosterInfo.jsx';
import DeleteButton from '../components/DeleteButton.jsx';
import ReportButton from '../components/ReportButton.jsx';
import CommentsSection from '../components/CommentsSection.jsx';
import {
  MapPin, Eye, ArrowLeft, Phone, Mail, Tag, MessageCircle, ShoppingBag, Edit
} from 'lucide-react';

const BuySellDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const res = await api.getOne(id);
      setPost(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load post:', err);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.remove(id);
      alert('Post deleted successfully!');
      navigate('/buysell');
    } catch (err) {
      console.error('Failed to delete post:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete post';
      alert(`Error: ${errorMsg}`);
    }
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-pink-900 p-6">
        <div className="max-w-md w-full p-10 text-center bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
          <ShoppingBag className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <p className="text-2xl font-bold text-white mb-6">Post Not Found</p>
          <Link to="/buysell" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition">
            <ArrowLeft /> Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Check if post.user exists (user might have been deleted)
  if (!post.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-900 to-orange-900 p-6">
        <div className="max-w-md w-full p-10 text-center bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
          <p className="text-xl text-yellow-300 mb-6">This post's owner account no longer exists.</p>
          <Link to="/buysell" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition">
            <ArrowLeft /> Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const images = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);
  const isOwnPost = currentUser && post.user && currentUser._id === post.user._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <Link
          to="/buysell"
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 px-5 py-3 rounded-xl font-bold mb-8 shadow-lg hover:shadow-xl transition-all border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-7">
            {/* Header Card */}
            <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              {images.length > 0 && (
                <div className="relative">
                  <ImageGallery images={images} />
                  <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4" />
                      For Sale
                    </span>
                  </div>
                </div>
              )}

              <div className="p-8">
                <h1 className="text-4xl font-black text-white mb-5">{post.title}</h1>

                {/* Price */}
                <div className="mb-6">
                  <div className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-2xl">
                    <span className="text-4xl font-black text-white drop-shadow-lg">
                      ৳{post.price}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-4 text-gray-200 mb-8">
                  <MapPin className="w-7 h-7 text-cyan-400" />
                  <span className="text-xl font-semibold text-white">{post.location}</span>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-gray-900/70 border border-cyan-800/40 rounded-xl p-5 text-center">
                    <Tag className="w-9 h-9 text-cyan-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Category</p>
                    <p className="text-lg font-bold text-white">Marketplace</p>
                  </div>

                  <div className="bg-gray-900/70 border border-emerald-800/40 rounded-xl p-5 text-center">
                    <ShoppingBag className="w-9 h-9 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Status</p>
                    <p className="text-lg font-bold text-white">For Sale</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
                <MessageCircle className="w-7 h-7 text-cyan-400" />
                Description
              </h2>
              <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">{post.description}</p>
            </div>

            {/* Comments Section */}
            <CommentsSection postType="buysell" postId={post._id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="bg-gray-800/95 backdrop-blur-xl border border-cyan-700/30 rounded-2xl shadow-2xl p-7 sticky top-6">
              <h3 className="text-2xl font-black text-white mb-6 tracking-tight">Seller Information</h3>

              {/* User Profile Highlight */}
              <div className="p-4 bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-pink-900/30 border-2 border-indigo-500/40 rounded-xl shadow-lg mb-6">
                <PosterInfo user={post.user} createdAt={post.createdAt} />
              </div>

              {/* Contact Details */}
              {post.user?.phone && (
                <div className="mt-6 p-5 bg-gradient-to-r from-cyan-900/40 to-blue-900/30 border border-cyan-600/40 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/20 rounded-lg">
                      <Phone className="w-7 h-7 text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <a href={`tel:${post.user.phone}`} className="text-xl font-bold text-white hover:text-cyan-300 transition">
                        {post.user.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-7 space-y-4">
                {!isOwnPost && post.user && (
                  <>
                    <MessageButton recipientId={post.user._id} />
                    {post.user.email && (
                      <a
                        href={`mailto:${post.user.email}`}
                        className="w-full block text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        <Mail className="inline mr-2" size={20} />
                        Send Email
                      </a>
                    )}
                    {post.user.phone && (
                      <a
                        href={`tel:${post.user.phone}`}
                        className="w-full block text-center bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        <Phone className="inline mr-2" size={22} />
                        Call Now
                      </a>
                    )}
                  </>
                )}

                {isOwnPost ? (
                  <>
                    <Link
                      to={`/buysell/edit/${post._id}`}
                      className="w-full block text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <Edit className="inline mr-2" size={20} />
                      Edit Post
                    </Link>
                    <div className="text-center py-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-600/40 rounded-xl">
                      <p className="text-purple-300 font-medium">This is your post</p>
                    </div>
                    <DeleteButton
                      currentUser={currentUser}
                      contentOwner={post.user}
                      onDelete={handleDelete}
                      itemName="post"
                      size="md"
                    />
                  </>
                ) : currentUser && (
                  <ReportButton
                    itemId={post._id}
                    itemType="buysell"
                    reportedUserId={post.user?._id}
                    className="w-full justify-center"
                  />
                )}

                {/* No Phone Warning */}
                {!post.user?.phone && !isOwnPost && (
                  <div className="mt-4 bg-yellow-500/20 border border-yellow-400/40 rounded-xl p-4">
                    <p className="text-sm text-yellow-300 mb-1 font-bold">No phone number available</p>
                    <p className="text-xs text-yellow-200">Send a message to contact the seller</p>
                  </div>
                )}

                {!post.user?.phone && isOwnPost && (
                  <div className="mt-4 bg-blue-500/20 border border-blue-400/40 rounded-xl p-4">
                    <p className="text-sm text-blue-300 mb-1 font-bold">Add your phone number</p>
                    <p className="text-xs text-blue-200 mb-2">Help buyers contact you easily</p>
                    {currentUser && (
                      <Link to={`/profile/${currentUser._id}`} className="text-sm text-cyan-300 hover:text-cyan-200 font-bold">
                        Update Profile →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuySellDetails; 