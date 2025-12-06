import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CommentsSection from '../components/CommentsSection';
import PosterInfo from '../components/PosterInfo';
import MessageButton from '../components/MessageButton';
import ImageGallery from '../components/ImageGallery';
import ReportButton from '../components/ReportButton';

import {
    ArrowLeft, MapPin, Clock, Eye, Mail, Phone,
    ExternalLink, Briefcase, Calendar, Tag, MessageCircle, Trash2, CheckCircle, Edit
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const JobDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        loadJob();
    }, [id]);

    const loadJob = async () => {
        try {
            const res = await axios.get(`${API_URL}/jobs/${id}`);
            setJob(res.data);
            setHasApplied(res.data.applicants?.includes(user?._id));
        } catch (err) {
            console.error('Failed to load job:', err);
        }
        setLoading(false);
    };

    const handleApply = async () => {
        if (!user) {
            alert('You must be logged in to apply for a job.');
            navigate('/login');
            return;
        }

        try {
            setHasApplied(true);
            await axios.post(`${API_URL}/jobs/${id}/apply`, {}, { withCredentials: true });
            alert('Application submitted successfully!');
        } catch (err) {
            setHasApplied(false);
            alert(err.response?.data?.message || 'Failed to apply.');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this job posting?')) return;

        try {
            await axios.delete(`${API_URL}/jobs/${id}`, { withCredentials: true });
            navigate('/jobs');
        } catch (err) {
            alert('Failed to delete job.');
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

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-pink-900 p-6">
                <div className="max-w-md w-full p-10 text-center bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                    <Briefcase className="w-20 h-20 text-red-400 mx-auto mb-6" />
                    <p className="text-2xl font-bold text-white mb-6">Job Not Found</p>
                    <Link to="/jobs" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition">
                        <ArrowLeft /> Back to Jobs
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = job.poster && user && job.poster._id === user._id;

    const jobTypeClasses = (type) => {
        switch (type) {
            case 'full-time': return 'bg-blue-500';
            case 'part-time': return 'bg-yellow-500';
            case 'internship': return 'bg-purple-500';
            case 'freelance': return 'bg-teal-500';
            default: return 'bg-gray-500';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 px-5 py-3 rounded-xl font-bold mb-8 shadow-lg hover:shadow-xl transition-all border border-white/10"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Jobs
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-7">
                        {/* Header Card */}
                        <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Images Gallery */}
                            {job.images && job.images.length > 0 && (
                                <div className="relative">
                                    <ImageGallery images={job.images} />
                                    <div className="absolute top-4 left-4 flex gap-2 z-10 pointer-events-none">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${jobTypeClasses(job.type)}`}>
                                            {job.type.replace('-', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="p-8">
                                <h1 className="text-4xl font-black text-white mb-5">{job.title}</h1>
                                <p className="text-2xl text-cyan-400 font-bold mb-6 flex items-center gap-3">
                                    <Briefcase className="w-7 h-7" />
                                    {job.company}
                                </p>

                                {/* Deadline */}
                                {job.applicationDeadline && (
                                    <div className="mb-6">
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-full font-bold border border-red-400/40">
                                            <Calendar className="w-5 h-5" />
                                            Deadline: {formatDate(job.applicationDeadline)}
                                        </span>
                                    </div>
                                )}

                                {/* Quick Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                    <div className="bg-gray-900/70 border border-cyan-800/40 rounded-xl p-5 text-center">
                                        <MapPin className="w-9 h-9 text-cyan-400 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400">Location</p>
                                        <p className="text-lg font-bold text-white">{job.location}</p>
                                    </div>

                                    {job.salary && (
                                        <div className="bg-gray-900/70 border border-emerald-800/40 rounded-xl p-5 text-center">
                                            <p className="text-2xl font-bold text-emerald-400 mb-1">৳</p>
                                            <p className="text-xs text-gray-400">Salary</p>
                                            <p className="text-lg font-bold text-white">{job.salary}</p>
                                        </div>
                                    )}

                                    {job.duration && (
                                        <div className="bg-gray-900/70 border border-blue-800/40 rounded-xl p-5 text-center">
                                            <Clock className="w-9 h-9 text-blue-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">Duration</p>
                                            <p className="text-lg font-bold text-white">{job.duration}</p>
                                        </div>
                                    )}


                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
                                <MessageCircle className="w-7 h-7 text-cyan-400" />
                                Job Description
                            </h2>
                            <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">{job.description}</p>
                        </div>

                        {/* Requirements */}
                        {job.requirements && (
                            <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
                                    <CheckCircle className="w-7 h-7 text-cyan-400" />
                                    Requirements
                                </h2>
                                <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">{job.requirements}</p>
                            </div>
                        )}

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                            <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Tag className="w-7 h-7 text-cyan-400" />
                                    Required Skills
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {job.skills.map((skill, idx) => (
                                        <span key={idx} className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-bold border border-cyan-400/40">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <CommentsSection postType="job" postId={id} />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Poster Info Card */}
                        <div className="bg-gray-800/95 backdrop-blur-xl border border-cyan-700/30 rounded-2xl shadow-2xl p-7 sticky top-6">
                            <h3 className="text-2xl font-black text-white mb-6 tracking-tight">Contact Information</h3>

                            {/* User Profile Highlight */}
                            <div className="p-4 bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-pink-900/30 border-2 border-indigo-500/40 rounded-xl shadow-lg mb-6">
                                <PosterInfo user={job.poster} createdAt={job.createdAt} />
                            </div>

                            {/* Contact Details */}
                            <div className="mt-6 space-y-4">
                                <div className="p-5 bg-gradient-to-r from-cyan-900/40 to-blue-900/30 border border-cyan-600/40 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-cyan-500/20 rounded-lg">
                                            <Mail className="w-7 h-7 text-cyan-300" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-400">Email</p>
                                            <a href={`mailto:${job.contactEmail}`} className="text-lg font-bold text-white hover:text-cyan-300 transition truncate block">
                                                {job.contactEmail}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {job.contactPhone && (
                                    <div className="p-5 bg-gradient-to-r from-emerald-900/40 to-green-900/30 border border-emerald-600/40 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-500/20 rounded-lg">
                                                <Phone className="w-7 h-7 text-emerald-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Phone</p>
                                                <a href={`tel:${job.contactPhone}`} className="text-lg font-bold text-white hover:text-emerald-300 transition">
                                                    {job.contactPhone}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {job.applicationLink && (
                                    <div className="p-5 bg-gradient-to-r from-purple-900/40 to-indigo-900/30 border border-purple-600/40 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                                <ExternalLink className="w-7 h-7 text-purple-300" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-400">Application Link</p>
                                                <a
                                                    href={job.applicationLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-lg font-bold text-purple-300 hover:text-purple-200 transition truncate block"
                                                >
                                                    Apply Here
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-7 space-y-4">
                                {/* Apply Button */}
                                {/* {user && !isOwner && !hasApplied && (
                                    <button
                                        onClick={handleApply}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Apply Now
                                    </button>
                                )} */}

                                {user && !isOwner && hasApplied && (
                                    <button
                                        disabled
                                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Applied
                                    </button>
                                )}

                                {/* Contact Buttons */}
                                {user && !isOwner && job.poster && (
                                    <>
                                        <MessageButton recipientId={job.poster._id} />
                                        <a
                                            href={`mailto:${job.contactEmail}`}
                                            className="w-full block text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                                        >
                                            <Mail className="inline mr-2" size={20} />
                                            Send Email
                                        </a>
                                    </>
                                )}

                                {/* Login Prompt */}
                                {!user && (
                                    <Link
                                        to="/login"
                                        className="w-full text-center block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                                    >
                                        Log in to Apply
                                    </Link>
                                )}

                                {/* Owner Actions */}
                                {isOwner ? (
                                    <>
                                        <Link
                                            to={`/jobs/edit/${job._id}`}
                                            className="w-full block text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                                        >
                                            <Edit className="inline mr-2" size={20} />
                                            Edit Job
                                        </Link>
                                        <div className="text-center py-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-600/40 rounded-xl">
                                            <p className="text-purple-300 font-medium">This is your post</p>
                                        </div>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                                        >
                                            <Trash2 size={20} />
                                            Delete Job
                                        </button>
                                    </>
                                ) : user && (
                                    <ReportButton
                                        itemId={job._id}
                                        itemType="job"
                                        reportedUserId={job.poster?._id}
                                        className="w-full justify-center"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
