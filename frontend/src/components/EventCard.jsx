import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventsApi from '../api/events.js';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import RSVPButton from './RSVPButton';
import SaveButton from './SaveButton';
import ReportButton from './ReportButton';
import { Calendar, MapPin, Clock, Heart, Edit, Trash2, Users } from 'lucide-react';

const EventCard = ({ event, onUpdate }) => {
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState('');
    const [status, setStatus] = useState({ text: '', color: '', glow: '' });
    const [isInterested, setIsInterested] = useState(
        event.interested?.some(u => u._id === user?._id || u === user?._id) || false
    );

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const eventDate = new Date(event.date);
            const diff = eventDate - now;

            if (diff < 0) {
                setStatus({ text: 'Ended', color: 'bg-gray-500/20 text-gray-400', glow: '' });
                setTimeLeft('');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days === 0 && hours === 0 && minutes <= 30) {
                setStatus({ text: 'SOON', color: 'bg-red-500/20 text-red-400', glow: 'shadow-lg shadow-red-500/40 animate-pulse' });
                setTimeLeft(`${minutes}m ${Math.floor((diff % (1000 * 60)) / 1000)}s`);
            } else if (days === 0) {
                setStatus({ text: 'Today', color: 'bg-emerald-500/20 text-emerald-400', glow: 'shadow-lg shadow-emerald-500/30' });
                setTimeLeft(`${hours}h ${minutes}m`);
            } else if (days === 1) {
                setStatus({ text: 'Tomorrow', color: 'bg-blue-500/20 text-blue-400', glow: 'shadow-lg shadow-blue-500/30' });
            } else if (days <= 7) {
                setStatus({ text: `${days}d`, color: 'bg-amber-500/20 text-amber-400', glow: '' });
            } else {
                setStatus({ text: `${days}d`, color: 'bg-purple-500/20 text-purple-400', glow: '' });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [event.date]);

    const mainImage = event.images?.[0];
    const interestedCount = event.interested?.length || 0;
    const rsvpCount = event.rsvps?.length || 0;
    const showDelete = canDelete(user, event.user);

    const handleInterested = async () => {
        if (!user) return alert('Please login to show interest');
        try {
            const res = await eventsApi.markInterested(event._id);
            if (res?.data) {
                setIsInterested(res.data.interested.some(u => u._id === user._id || u === user._id));
                onUpdate?.(res.data);
            }
        } catch (err) {
            alert('Failed to update interest');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this event permanently?')) return;
        try {
            await eventsApi.remove(event._id);
            onUpdate?.();
        } catch (err) {
            alert('Failed to delete event');
        }
    };

    return (
        <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl border border-gray-200/50 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 h-full flex flex-col">
            {/* Compact Image */}
            <div className="relative h-48 overflow-hidden">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white/40" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${status.color} ${status.glow}`}>
                    {status.text}
                </div>

                {/* Counters */}
                {(interestedCount > 0 || rsvpCount > 0) && (
                    <div className="absolute bottom-3 left-3 flex gap-2">
                        {interestedCount > 0 && (
                            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-white">
                                <Heart className="w-3.5 h-3.5 fill-red-500" />
                                {interestedCount}
                            </div>
                        )}
                        {rsvpCount > 0 && (
                            <div className="flex items-center gap-1 bg-black/50 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-white">
                                <Users className="w-3.5 h-3.5" />
                                {rsvpCount}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Compact Content */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-lg line-clamp-2 text-gray-900">
                    {event.title}
                </h3>

                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="truncate font-medium">{event.location}</span>
                </div>

                {/* Short Description */}
                <p className="mt-3 text-sm text-gray-600 line-clamp-2 leading-snug">
                    {event.description || 'No description provided.'}
                </p>

                {/* Live Countdown (only if urgent) */}
                {timeLeft && (status.text === 'SOON' || status.text === 'Today') && (
                    <div className="mt-3 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                        <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                            <Clock className="w-4 h-4" />
                            {timeLeft} left
                        </div>
                    </div>
                )}

                {/* Organizer - Compact */}
                {event.user && (
                    <div className="mt-4 flex items-center gap-3 text-sm">
                        {event.user.profilePicture ? (
                            <img src={event.user.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                {event.user.name[0]}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-gray-900 truncate">{event.user.name}</p>
                            <p className="text-xs text-gray-500">{event.user.department}</p>
                        </div>
                    </div>
                )}

                {/* Action Bar */}
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-2 flex-wrap">
                    <RSVPButton event={event} onUpdate={onUpdate} size="sm" />

                    <button
                        onClick={handleInterested}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isInterested
                                ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isInterested ? 'fill-current' : ''}`} />
                        {isInterested ? 'Interested' : 'Interest'}
                    </button>

                    <SaveButton postId={event._id} postType="event" size="sm" />

                    <div className="flex-1" />

                    {showDelete && (
                        <>
                            <Link
                                to={`/events/edit/${event._id}`}
                                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                            >
                                <Edit className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    {!showDelete && (
                        <ReportButton itemId={event._id} itemType="event" reportedUserId={event.user?._id} size="sm" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventCard;