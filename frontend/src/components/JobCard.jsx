import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import PosterInfo from './PosterInfo';
import SaveButton from './SaveButton';
import ReportButton from './ReportButton';
import { Edit, Briefcase, MapPin, Clock, Calendar, ArrowRight, Trash2, MessageCircle, DollarSign, Image } from 'lucide-react';

const JobCard = ({ job, onDelete }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Safety check
    if (!job || !job.poster) {
        return null;
    }

    const showDelete = onDelete && canDelete(user, job.poster);
    const hasImages = job.images && job.images.length > 0;

    const handleCardClick = (e) => {
        // Prevent navigation if clicking interactive elements
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.interactive-area')) {
            return;
        }
        navigate(`/jobs/${job._id}`);
    };

    // Refined subtle styles for job type badges
    const getJobTypeStyle = (type) => {
        const styles = {
            'full-time': 'bg-blue-100 text-blue-700 border-blue-300',
            'part-time': 'bg-orange-100 text-orange-700 border-orange-300',
            'internship': 'bg-purple-100 text-purple-700 border-purple-300',
            'freelance': 'bg-emerald-100 text-emerald-700 border-emerald-300',
        };
        return styles[type] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    return (
        <div
            onClick={handleCardClick}
            // 🌟 Enhancement 1: Subtle Glassmorphism effect for a 'floating' look
            className="group relative bg-white/95 backdrop-blur-md rounded-[1.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer overflow-hidden"
        >
            <div className="flex flex-col md:flex-row h-full">

                {/* --- Left Column: Image/Logo & Badge --- */}
                <div className="relative md:w-64 shrink-0 p-5 md:p-6">

                    {/* Image Block: Enhanced with subtle shadow and transition */}
                    <div className="w-full h-40 md:h-full rounded-2xl overflow-hidden relative 
                                    shadow-2xl shadow-indigo-200/50 
                                    border border-white/50 
                                    group-hover:shadow-indigo-300/70 transition-shadow duration-500">
                        {hasImages ? (
                            <>
                                <img
                                    src={job.images[0]}
                                    alt={job.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />

                                {/* Image Counter */}
                                {job.images.length > 1 && (
                                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                                        <Image size={12} /> +{job.images.length - 1}
                                    </div>
                                )}
                            </>
                        ) : (
                            // 🌟 Enhancement 4: Clean, high-contrast Placeholder
                            <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-800 flex flex-col items-center justify-center p-6 text-center">
                                <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                    <Briefcase size={40} className="text-white drop-shadow-md" />
                                </div>
                                <span className="mt-3 text-xs text-white/70 font-semibold tracking-wider">NO VISUALS AVAILABLE</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Right Column: Content & Details (Unchanged) --- */}
                <div className="flex-1 flex flex-col p-5 md:p-6 border-l border-gray-100/50">

                    {/* Header: Type, Title & Salary */}
                    <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                            {/* Type Badge - Cleaned up */}
                            <span className={`inline-block px-3 py-1 mb-2 rounded-full text-xs font-bold tracking-wider border ${getJobTypeStyle(job.type)}`}>
                                {job.type.replace('-', ' ').toUpperCase()}
                            </span>

                            <h3 className="text-2xl font-extrabold text-gray-900 leading-tight group-hover:text-indigo-700 transition-colors truncate">
                                {job.title}
                            </h3>
                            <p className="text-base font-semibold text-indigo-600 mt-1 mb-1">
                                {job.company}
                            </p>
                        </div>

                        {/* Salary Badge - Moved to a subtle block */}
                        {job.salary && (
                            <div className="shrink-0 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl border border-emerald-200 shadow-sm">
                                {/* <DollarSign size={20} className="text-emerald-500" /> Removed icon to simplify */}
                                <div>
                                    <div className="text-lg font-black leading-none">
                                        ৳{job.salary}
                                    </div>
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                                        / MONTH
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta Row (Cleaned up) */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 py-3 border-b border-gray-100/70 mb-4">
                        {job.location && (
                            <div className="flex items-center gap-1.5">
                                <MapPin size={16} className="text-indigo-400" />
                                <span>{job.location}</span>
                            </div>
                        )}
                        {job.duration && (
                            <div className="flex items-center gap-1.5">
                                <Clock size={16} className="text-amber-400" />
                                <span>{job.duration}</span>
                            </div>
                        )}
                        {job.applicationDeadline && (
                            <div className="flex items-center gap-1.5 text-red-500 font-semibold">
                                <Calendar size={16} />
                                <span>Due: {formatDate(job.applicationDeadline)}</span>
                            </div>
                        )}
                    </div>

                    {/* Description Snippet */}
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                        {job.description}
                    </p>

                    {/* Skills - Enhanced with Gradient Border */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="mb-auto">
                            <div className="flex flex-wrap gap-2">
                                {job.skills.slice(0, 4).map((skill, idx) => (
                                    <span
                                        key={idx}
                                        // 🌟 Enhancement 2: Gradient outline effect
                                        className="relative block px-3 py-1.5 text-xs font-bold text-indigo-700 rounded-lg bg-white border border-transparent 
                                                   before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-transparent before:bg-gradient-to-r 
                                                   before:from-indigo-300 before:to-purple-300 before:z-[-1] before:m-[-1px] transition-all hover:scale-[1.02]"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {job.skills.length > 4 && (
                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-300">
                                        +{job.skills.length - 4} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer: Poster & Action Bar */}
                    <div className="mt-5 pt-4 flex items-center justify-between border-t border-gray-100/70">
                        <div className="interactive-area">
                            <PosterInfo user={job.poster} createdAt={job.createdAt} compact={true} />
                        </div>

                        {/* 🌟 Enhancement 3: Clean, consolidated action bar */}
                        <div className="flex items-center gap-3 interactive-area">

                            {/* Comments Count */}
                            <div className="flex items-center gap-1.5 text-blue-600">
                                <MessageCircle size={16} />
                                <span className="font-bold text-sm">{job.commentCount || 0}</span>
                            </div>

                            {/* Action Group */}
                            <div className="flex items-center border-l pl-3 border-gray-200/70">
                                {/* Report Button (Placed here for clean grouping) */}
                                {!showDelete && (
                                    <ReportButton itemId={job._id} itemType="job" reportedUserId={job.poster?._id} />
                                )}

                                {showDelete ? (
                                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                        <Link
                                            to={`/jobs/edit/${job._id}`}
                                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Are you sure?')) onDelete(job._id);
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-md transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button className="flex items-center gap-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50 ml-2">
                                        View Job <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCard;