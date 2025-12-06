import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getBookRequest,
    updateBookRequestStatus,
    deleteBookRequest
} from '../api/bookRequests';
import {
    BookOpen, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle,
    Trash2, GraduationCap, Mail, Phone, Edit, Eye
} from 'lucide-react';
import PosterInfo from '../components/PosterInfo';
import MessageButton from '../components/MessageButton';
import ImageGallery from '../components/ImageGallery';
import CommentsSection from '../components/CommentsSection';

const BookRequestDetails = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [bookRequest, setBookRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookRequest();
    }, [id]);

    const loadBookRequest = async () => {
        setLoading(true);
        try {
            const data = await getBookRequest(id);
            setBookRequest(data);
        } catch (error) {
            console.error('Failed to load book request:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status) => {
        try {
            const updated = await updateBookRequestStatus(id, status);
            setBookRequest(updated);
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this book request permanently?')) return;
        try {
            await deleteBookRequest(id);
            navigate('/books');
        } catch (error) {
            alert('Failed to delete request');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-900">
                <div className="text-center p-12 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-bold text-white">Loading book request...</p>
                </div>
            </div>
        );
    }

    if (!bookRequest) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-6">
                <div className="max-w-md w-full p-10 text-center bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                    <BookOpen className="w-20 h-20 text-indigo-400 mx-auto mb-6" />
                    <p className="text-2xl font-bold text-white mb-6">Book Request Not Found</p>
                    <Link to="/books" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition">
                        <ArrowLeft /> Back to Books
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = currentUser?._id === bookRequest.requester._id;
    const isUrgent = bookRequest.urgency === 'urgent';
    const images = bookRequest.images?.length > 0 ? bookRequest.images : [];

    const getStatusConfig = () => {
        switch (bookRequest.status) {
            case 'open': return { color: 'emerald', label: 'Open' };
            case 'fulfilled': return { color: 'blue', label: 'Fulfilled' };
            case 'closed': return { color: 'gray', label: 'Closed' };
            default: return { color: 'emerald', label: 'Open' };
        }
    };

    const status = getStatusConfig();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Back Button */}
                <Link
                    to="/books"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 px-5 py-3 rounded-xl font-bold mb-8 shadow-lg hover:shadow-xl transition-all border border-white/10"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Books
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-7">

                        {/* Book Hero Card */}
                        <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                            {images.length > 0 && (
                                <div className="relative">
                                    <ImageGallery images={images} />
                                    <div className="absolute top-4 left-4 flex gap-3 z-10">
                                        <span className={`px-5 py-2.5 rounded-full font-bold text-white shadow-xl bg-${status.color}-600`}>
                                            {status.label}
                                        </span>
                                        {isUrgent && (
                                            <span className="px-5 py-2.5 rounded-full bg-red-600 text-white font-bold shadow-xl animate-pulse">
                                                <AlertCircle className="inline w-5 h-5 mr-2" />
                                                URGENT
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                {/* Title + Author */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                                            {bookRequest.bookTitle}
                                        </h1>
                                        {bookRequest.author && (
                                            <p className="text-lg text-cyan-300 font-semibold">by {bookRequest.author}</p>
                                        )}
                                    </div>

                                    {/* Book Icon Badge */}
                                    <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-xl flex-shrink-0">
                                        <BookOpen className="w-10 h-10 text-white" />
                                    </div>
                                </div>

                                {/* Course Badge */}
                                {bookRequest.course && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg mb-5">
                                        <GraduationCap className="w-5 h-5 text-white" />
                                        <span className="text-base font-bold text-white">{bookRequest.course}</span>
                                    </div>
                                )}

                                {/* Status Badges if no images */}
                                {!images.length && (
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        <span className={`px-4 py-2 rounded-full font-semibold text-white shadow-lg bg-${status.color}-600`}>
                                            {status.label}
                                        </span>
                                        {isUrgent && (
                                            <span className="px-4 py-2 rounded-full bg-red-600 text-white font-semibold shadow-lg animate-pulse">
                                                <AlertCircle className="inline w-4 h-4 mr-1.5" />
                                                URGENT
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Description */}
                                {bookRequest.description && (
                                    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg p-5">
                                        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-indigo-400" />
                                            Description
                                        </h2>
                                        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                                            {bookRequest.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <CommentsSection postType="bookrequest" postId={id} />
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800/95 backdrop-blur-xl border border-indigo-700/30 rounded-xl shadow-2xl p-5 sticky top-6">
                            <h3 className="text-lg font-bold text-white mb-4">
                                Request Information
                            </h3>

                            {/* Poster Card */}
                            <div className="p-3 bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-pink-900/30 border border-indigo-500/40 rounded-lg shadow-lg mb-4">
                                <PosterInfo user={bookRequest.requester} createdAt={bookRequest.createdAt} />
                            </div>

                            {/* Contact Phone */}
                            {bookRequest.requester.phone && (
                                <div className="p-4 bg-gradient-to-r from-indigo-900/40 to-purple-900/30 border border-indigo-600/40 rounded-lg mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                                            <Phone className="w-5 h-5 text-indigo-300" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Phone</p>
                                            <a href={`tel:${bookRequest.requester.phone}`} className="text-base font-bold text-white hover:text-indigo-300 transition">
                                                {bookRequest.requester.phone}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {!isOwner && bookRequest.requester && (
                                    <>
                                        <MessageButton recipientId={bookRequest.requester._id} />

                                        {bookRequest.requester.email && (
                                            <a href={`mailto:${bookRequest.requester.email}`}
                                                className="w-full block text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                                <Mail className="inline mr-2" size={18} /> Send Email
                                            </a>
                                        )}

                                        {bookRequest.requester.phone && (
                                            <a href={`tel:${bookRequest.requester.phone}`}
                                                className="w-full block text-center bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                                <Phone className="inline mr-2" size={18} /> Call Now
                                            </a>
                                        )}

                                        <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                            <BookOpen className="inline mr-2" size={18} /> I Have This Book!
                                        </button>
                                    </>
                                )}

                                {isOwner && (
                                    <>
                                        <Link to={`/books/edit/${id}`} className="w-full block text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                            <Edit className="inline mr-2" size={18} /> Edit Request
                                        </Link>

                                        {bookRequest.status === 'open' && (
                                            <button onClick={() => handleStatusUpdate('fulfilled')}
                                                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                                <CheckCircle className="inline mr-2" size={18} /> Mark as Fulfilled
                                            </button>
                                        )}

                                        {bookRequest.status !== 'closed' && (
                                            <button onClick={() => handleStatusUpdate('closed')}
                                                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                                <XCircle className="inline mr-2" size={18} /> Close Request
                                            </button>
                                        )}

                                        {bookRequest.status === 'closed' && (
                                            <button onClick={() => handleStatusUpdate('open')}
                                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                                <Clock className="inline mr-2" size={18} /> Reopen Request
                                            </button>
                                        )}

                                        <button onClick={handleDelete}
                                            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                            <Trash2 className="inline mr-2" size={18} /> Delete Request
                                        </button>

                                        <div className="text-center py-2 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-600/40 rounded-lg">
                                            <p className="text-purple-300 text-sm font-medium">This is your request</p>
                                        </div>
                                    </>
                                )}
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookRequestDetails;