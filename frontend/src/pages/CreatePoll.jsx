import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pollsApi from '../api/polls';
import { ArrowLeft, Plus, X, BarChart3 } from 'lucide-react';

const CreatePoll = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'opinion',
        pollType: 'single',
        category: 'general',
        endDate: '',
        showLiveResults: true,
        allowChangeVote: false,
        isAnonymous: false
    });
    const [options, setOptions] = useState(['', '']);
    const [eligibility, setEligibility] = useState({
        electionType: 'cr', // 'cr' or 'society'
        department: '',
        batch: '',
        position: '',
        organization: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Check if user is logged in
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
                <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl">
                    <p className="text-xl font-bold text-gray-800">Login Required</p>
                    <p className="text-gray-600 mt-2">Please login to create polls</p>
                </div>
            </div>
        );
    }

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            alert('Please enter a title');
            return;
        }

        const validOptions = options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            alert('Please provide at least 2 options');
            return;
        }

        if (!formData.endDate) {
            alert('Please select an end date');
            return;
        }

        try {
            setSubmitting(true);
            const pollData = {
                ...formData,
                options: validOptions.map(text => ({ text }))
            };

            // Add election info if it's an election with restrictions
            if (formData.type === 'election' && eligibility.department) {
                const eligibleDepts = [eligibility.department];
                let eligibleBatches = [];

                if (eligibility.electionType === 'cr') {
                    // CR Election: specific department + specific batch
                    eligibleBatches = eligibility.batch ? [eligibility.batch] : [];
                } else if (eligibility.electionType === 'society') {
                    // Society Election: specific department + all running batches (17-25)
                    eligibleBatches = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
                }

                pollData.electionInfo = {
                    position: eligibility.position || (eligibility.electionType === 'cr' ? 'Class Representative' : 'Society Representative'),
                    organization: eligibility.organization || 'SUST',
                    eligibleVoters: {
                        departments: eligibleDepts,
                        batches: eligibleBatches,
                        halls: []
                    }
                };
            }

            const res = await pollsApi.create(pollData);
            alert('Poll created successfully!');
            navigate(`/polls/${res.data._id}`);
        } catch (error) {
            console.error('Failed to create poll:', error);
            alert(error.response?.data?.message || 'Failed to create poll');
        } finally {
            setSubmitting(false);
        }
    };

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Back Button */}
                <Link
                    to="/polls"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Polls
                </Link>

                {/* Form Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-black">Create New Poll</h1>
                        </div>
                        <p className="text-white/90">Gather opinions and make decisions together</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Poll Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="What would you like to ask?"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Add more context to your poll..."
                            />
                        </div>

                        {/* Info Banner */}
                        {user.role !== 'admin' && user.role !== 'super_admin' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> You can create Opinion polls.
                                    Elections require admin approval.
                                </p>
                            </div>
                        )}

                        {/* Type and Poll Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Poll Type *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="opinion">Opinion Poll</option>
                                    {(user.role === 'admin' || user.role === 'super_admin') && (
                                        <option value="election">Election (Admin Only)</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Answer Type *
                                </label>
                                <select
                                    value={formData.pollType}
                                    onChange={(e) => setFormData({ ...formData, pollType: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="single">Single Choice</option>
                                    <option value="multiple">Multiple Choice</option>
                                </select>
                            </div>
                        </div>

                        {/* Category and End Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="general">General</option>
                                    {(user.role === 'admin' || user.role === 'super_admin') && (
                                        <>
                                            <option value="union">Student Union (SUCSU)</option>
                                            <option value="department">Department</option>
                                        </>
                                    )}
                                    <option value="club">Club</option>
                                    <option value="hall">Hall/Residential</option>
                                    <option value="academic">Academic</option>
                                    <option value="transport">Transport</option>
                                    <option value="dining">Dining</option>
                                    <option value="hostel">Hostel</option>
                                    <option value="event">Event</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    min={today}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Options */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Options * (minimum 2)
                            </label>
                            <div className="space-y-3">
                                {options.map((option, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder={`Option ${index + 1}`}
                                        />
                                        {options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(index)}
                                                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={handleAddOption}
                                className="mt-3 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                            >
                                <Plus size={18} />
                                Add Option
                            </button>
                        </div>

                        {/* Voter Eligibility (for elections only) */}
                        {formData.type === 'election' && (
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                                <h3 className="font-bold text-gray-900 mb-3">🗳️ Election Configuration</h3>

                                <div className="space-y-4">
                                    {/* Election Type */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Election Type *</label>
                                        <select
                                            value={eligibility.electionType}
                                            onChange={(e) => setEligibility({ ...eligibility, electionType: e.target.value, batch: '' })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="cr">CR Election (One Department + One Batch)</option>
                                            <option value="society">Society Election (One Department + All Running Batches)</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {eligibility.electionType === 'cr'
                                                ? 'CR elections are for a specific batch within a department'
                                                : 'Society elections include all running batches (2017-2025) of a department'}
                                        </p>
                                    </div>

                                    {/* Department Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                                        <select
                                            value={eligibility.department}
                                            onChange={(e) => setEligibility({ ...eligibility, department: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Select Department</option>
                                            <option value="CSE">CSE</option>
                                            <option value="EEE">EEE</option>
                                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                                            <option value="Civil Engineering">Civil Engineering</option>
                                            <option value="Chemical Engineering">Chemical Engineering</option>
                                            <option value="Architecture">Architecture</option>
                                            <option value="IPE">IPE</option>
                                            <option value="Software Engineering">Software Engineering</option>
                                            <option value="Petroleum and Mining Engineering">Petroleum and Mining Engineering</option>
                                            <option value="Physics">Physics</option>
                                            <option value="Chemistry">Chemistry</option>
                                            <option value="Mathematics">Mathematics</option>
                                            <option value="Statistics">Statistics</option>
                                            <option value="Forestry and Environmental Science">Forestry and Environmental Science</option>
                                            <option value="Economics">Economics</option>
                                            <option value="Business Administration">Business Administration</option>
                                            <option value="Accounting and Information Systems">Accounting and Information Systems</option>
                                            <option value="Management Studies">Management Studies</option>
                                            <option value="Finance and Banking">Finance and Banking</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="English">English</option>
                                            <option value="Bangla">Bangla</option>
                                            <option value="Public Administration">Public Administration</option>
                                            <option value="Sociology">Sociology</option>
                                            <option value="Anthropology">Anthropology</option>
                                            <option value="Geography and Environment">Geography and Environment</option>
                                        </select>
                                    </div>

                                    {/* Batch Selection (only for CR elections) */}
                                    {eligibility.electionType === 'cr' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Batch *</label>
                                            <select
                                                value={eligibility.batch}
                                                onChange={(e) => setEligibility({ ...eligibility, batch: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="">Select Batch</option>
                                                <option value="2025">2025</option>
                                                <option value="2024">2024</option>
                                                <option value="2023">2023</option>
                                                <option value="2022">2022</option>
                                                <option value="2021">2021</option>
                                                <option value="2020">2020</option>
                                                <option value="2019">2019</option>
                                                <option value="2018">2018</option>
                                                <option value="2017">2017</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Preview */}
                                    {eligibility.department && (
                                        <div className="bg-white p-3 rounded-lg border border-purple-300">
                                            <p className="text-sm font-bold text-purple-900">✓ Eligible Voters:</p>
                                            <p className="text-sm text-gray-700">
                                                <strong>Department:</strong> {eligibility.department}
                                                <br />
                                                <strong>Batch:</strong> {eligibility.electionType === 'cr'
                                                    ? (eligibility.batch || 'Not selected')
                                                    : 'All running batches (2017-2025)'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Settings */}
                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-3">Poll Settings</h3>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.showLiveResults}
                                    onChange={(e) => setFormData({ ...formData, showLiveResults: e.target.checked })}
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">Show Live Results</p>
                                    <p className="text-sm text-gray-600">Display results while poll is active</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.allowChangeVote}
                                    onChange={(e) => setFormData({ ...formData, allowChangeVote: e.target.checked })}
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">Allow Vote Changes</p>
                                    <p className="text-sm text-gray-600">Let users change their vote</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isAnonymous}
                                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">Anonymous Voting</p>
                                    <p className="text-sm text-gray-600">Hide voter identities from everyone</p>
                                </div>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Creating Poll...' : 'Create Poll'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePoll;
