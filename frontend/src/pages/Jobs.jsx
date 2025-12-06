import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { user } = useAuth();

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const res = await api.get('/jobs');
            setJobs(res.data);
        } catch (err) {
            console.error('Failed to load jobs:', err);
        }
        setLoading(false);
    };

    const handleDelete = async (jobId) => {
        try {
            await api.delete(`/jobs/${jobId}`);
            setJobs(jobs.filter(job => job._id !== jobId));
        } catch (err) {
            console.error('Failed to delete job:', err);
            alert(err.response?.data?.message || 'Failed to delete job. Please try again.');
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (filter === 'all') return true;
        return job.type === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100">
                <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-bold text-gray-800">Loading opportunities...</p>
                    <p className="text-sm text-gray-500 mt-2">Finding the perfect job for you</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                <header className="mb-8 sm:mb-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 rounded-2xl shadow-lg">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                                    Jobs & Internships
                                </h1>
                                <p className="text-sm sm:text-base text-purple-200 mt-1">Find opportunities to grow your career</p>
                            </div>
                        </div>

                        {user && (
                            <Link
                                to="/jobs/create"
                                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Post Job</span>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-5 mb-8 border border-white/20">
                    <div className="flex flex-wrap gap-3">
                        {[
                            { value: 'all', label: 'All Jobs', icon: '📋', count: jobs.length },
                            { value: 'full-time', label: 'Full-Time', icon: '💼', count: jobs.filter(j => j.type === 'full-time').length },
                            { value: 'part-time', label: 'Part-Time', icon: '⏰', count: jobs.filter(j => j.type === 'part-time').length },
                            { value: 'internship', label: 'Internship', icon: '🎓', count: jobs.filter(j => j.type === 'internship').length },
                            { value: 'freelance', label: 'Freelance', icon: '💻', count: jobs.filter(j => j.type === 'freelance').length },
                            { value: 'work-study', label: 'Work-Study', icon: '📚', count: jobs.filter(j => j.type === 'work-study').length }
                        ].map(({ value, label, icon, count }) => (
                            <button
                                key={value}
                                onClick={() => setFilter(value)}
                                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold transition-all ${filter === value
                                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                    }`}
                            >
                                <span className="text-base">{icon}</span>
                                <span className="text-sm">{label}</span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${filter === value ? 'bg-white/30' : 'bg-gray-200'
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Jobs List */}
                {filteredJobs.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-16 text-center border border-white/20">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
                        <p className="text-gray-600 mb-6">Check back later for new opportunities!</p>
                        {user && (
                            <Link
                                to="/jobs/create"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Post First Job
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredJobs.map(job => (
                            <JobCard key={job._id} job={job} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;
