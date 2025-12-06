import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import electionRequestsApi from '../api/electionRequests';
import { ArrowLeft, Plus, X, Vote } from 'lucide-react';

const RequestElection = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'society',
        department: user?.department || '',
        year: '',
        section: '',
        startTime: '',
        endTime: '',
        allowChangeVote: false,
        showLiveResults: false
    });

    // Auto-generate title for CR elections
    const generateCRTitle = (dept, batch, section) => {
        if (!dept || !batch) return '';
        let title = `CR Election - ${dept} Batch ${batch}`;
        if (section) {
            title += ` Section ${section}`;
        }
        return title;
    };

    // Handle form data changes with auto-title for CR
    const handleFormDataChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };

        // Auto-generate title for CR elections
        if (newFormData.type === 'cr' && (field === 'department' || field === 'year' || field === 'section' || field === 'type')) {
            if (newFormData.department && newFormData.year) {
                newFormData.title = generateCRTitle(newFormData.department, newFormData.year, newFormData.section);
            }
        }

        // Clear title if switching from CR to Society
        if (field === 'type' && value === 'society') {
            newFormData.title = '';
        }

        setFormData(newFormData);
    };
    const [positions, setPositions] = useState([{ positionName: '', description: '', maxSelectable: 1 }]);
    const [candidates, setCandidates] = useState([]);
    const [candidateForm, setCandidateForm] = useState({
        registrationNumber: '',
        manifesto: '',
        positionIndex: 0
    });
    const [submitting, setSubmitting] = useState(false);

    // All logged-in users can request elections

    const handleAddPosition = () => {
        setPositions([...positions, { positionName: '', description: '', maxSelectable: 1 }]);
    };

    const handleRemovePosition = (index) => {
        if (positions.length > 1) {
            setPositions(positions.filter((_, i) => i !== index));
        }
    };

    const handlePositionChange = (index, field, value) => {
        const newPositions = [...positions];
        newPositions[index][field] = value;
        setPositions(newPositions);
    };

    const handleAddCandidate = () => {
        if (!candidateForm.registrationNumber.trim()) {
            alert('Please enter candidate registration number');
            return;
        }

        // Check for duplicates
        const isDuplicate = candidates.some(c =>
            c.registrationNumber === candidateForm.registrationNumber.trim()
        );

        if (isDuplicate) {
            alert(`Candidate with registration number ${candidateForm.registrationNumber} is already added!`);
            return;
        }

        const newCandidate = {
            ...candidateForm,
            id: Date.now(),
            positionName: formData.type === 'cr' ? 'CR' : (positions[candidateForm.positionIndex]?.positionName || 'Position')
        };

        setCandidates([...candidates, newCandidate]);
        setCandidateForm({
            registrationNumber: '',
            manifesto: '',
            positionIndex: 0
        });
    };

    const handleRemoveCandidate = (id) => {
        setCandidates(candidates.filter(c => c.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            alert('Please enter a title');
            return;
        }

        if (!formData.department) {
            alert('Please select a department');
            return;
        }

        if (formData.type === 'cr' && !formData.year) {
            alert('Please select batch for CR election');
            return;
        }

        if (!formData.startTime || !formData.endTime) {
            alert('Please select start and end times');
            return;
        }

        // For CR elections, automatically create "CR" position
        let finalPositions;
        if (formData.type === 'cr') {
            finalPositions = [{ positionName: 'CR', description: 'Class Representative', maxSelectable: 1 }];
        } else {
            // For society elections, validate positions
            const validPositions = positions.filter(p => p.positionName.trim());
            if (validPositions.length === 0) {
                alert('Please add at least one position');
                return;
            }
            finalPositions = validPositions;
        }

        try {
            setSubmitting(true);

            // Submit election request
            await electionRequestsApi.create({
                ...formData,
                year: formData.type === 'cr' ? parseInt(formData.year) : undefined,
                proposedStartDate: formData.startTime,
                proposedEndDate: formData.endTime,
                positions: finalPositions,
                candidates: candidates.map(c => ({
                    registrationNumber: c.registrationNumber,
                    name: c.name || '',
                    manifesto: c.manifesto || ''
                }))
            });

            alert('Election request submitted successfully! Admin will review it soon.');
            navigate('/elections');
        } catch (error) {
            console.error('Failed to submit request:', error);
            alert(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const today = new Date().toISOString().slice(0, 16);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Link
                    to="/elections"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Elections
                </Link>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                                <Vote className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-black">Request Election</h1>
                        </div>
                        <p className="text-white/90">Submit a request for an election. Admin will review and create it.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Election Type */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Election Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleFormDataChange('type', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="society">Society Election (Department-wide)</option>
                                <option value="cr">CR Election (Batch-specific)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.type === 'society'
                                    ? 'All students from the department can vote'
                                    : 'Only students from specific batch can vote'}
                            </p>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Election Title * {formData.type === 'cr' && <span className="text-xs text-gray-500">(Auto-generated)</span>}
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleFormDataChange('title', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder={formData.type === 'cr' ? 'Will be auto-generated from department and batch' : 'e.g., CSE Society Election 2024'}
                                required
                                readOnly={formData.type === 'cr'}
                                disabled={formData.type === 'cr'}
                            />
                            {formData.type === 'cr' && (
                                <p className="text-xs text-blue-600 mt-1">
                                    Title will be automatically generated as: "CR Election - [Department] Batch [Year]"
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleFormDataChange('description', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Add more details about this election..."
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Department * <span className="text-xs font-normal text-gray-500">(Auto-filled from your profile)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.department}
                                readOnly
                                disabled
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                            />
                            <p className="text-xs text-blue-600 mt-1">
                                📌 You can only request elections for your own department ({user?.department})
                            </p>
                        </div>

                        {/* Batch (for CR elections) */}
                        {formData.type === 'cr' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Batch *
                                </label>
                                <select
                                    value={formData.year}
                                    onChange={(e) => handleFormDataChange('year', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Batch</option>
                                    <option value="16">Batch 16 (2016)</option>
                                    <option value="17">Batch 17 (2017)</option>
                                    <option value="18">Batch 18 (2018)</option>
                                    <option value="19">Batch 19 (2019)</option>
                                    <option value="20">Batch 20 (2020)</option>
                                    <option value="21">Batch 21 (2021)</option>
                                    <option value="22">Batch 22 (2022)</option>
                                    <option value="23">Batch 23 (2023)</option>
                                    <option value="24">Batch 24 (2024)</option>
                                    <option value="25">Batch 25 (2025)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    All students from this batch in the selected department can vote
                                </p>
                            </div>
                        )}

                        {/* Section (for CR elections - optional) */}
                        {formData.type === 'cr' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Section (Optional)
                                </label>
                                <select
                                    value={formData.section}
                                    onChange={(e) => handleFormDataChange('section', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">No Section (All sections)</option>
                                    <option value="A">Section A</option>
                                    <option value="B">Section B</option>
                                    <option value="C">Section C</option>
                                    <option value="D">Section D</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Section is only used for the title. Leave empty if the election is for all sections.
                                </p>
                            </div>
                        )}

                        {/* Start and End Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Start Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    min={today}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    End Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    min={formData.startTime || today}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Positions (only for Society elections) */}
                        {formData.type === 'society' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Positions * (minimum 1)
                                </label>
                                <div className="space-y-3">
                                    {positions.map((position, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={position.positionName}
                                                onChange={(e) => handlePositionChange(index, 'positionName', e.target.value)}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder={`Position ${index + 1} (e.g., President, General Secretary)`}
                                            />
                                            {positions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePosition(index)}
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
                                    onClick={handleAddPosition}
                                    className="mt-3 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                                >
                                    <Plus size={18} />
                                    Add Position
                                </button>
                            </div>
                        )}

                        {/* CR Election Note */}
                        {formData.type === 'cr' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> CR elections have a single position (Class Representative). You can add multiple candidates below.
                                </p>
                            </div>
                        )}

                        {/* Candidates Section */}
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                            <h3 className="font-bold text-gray-900 mb-3">Add Candidates</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Enter the registration number of registered users. Their name, photo, and details will be automatically fetched from their profile.
                            </p>

                            {/* Candidate Form */}
                            <div className="space-y-3 mb-4">
                                <input
                                    type="text"
                                    value={candidateForm.registrationNumber}
                                    onChange={(e) => setCandidateForm({ ...candidateForm, registrationNumber: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Registration Number (e.g., 2021331008) *"
                                />
                                <textarea
                                    value={candidateForm.manifesto}
                                    onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Manifesto (optional)"
                                />
                                <div className="flex gap-3">
                                    {/* Position selector only for Society elections */}
                                    {formData.type === 'society' && (
                                        <select
                                            value={candidateForm.positionIndex}
                                            onChange={(e) => setCandidateForm({ ...candidateForm, positionIndex: parseInt(e.target.value) })}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            {positions.map((pos, idx) => (
                                                <option key={idx} value={idx}>
                                                    {pos.positionName || `Position ${idx + 1}`}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleAddCandidate}
                                        className={`px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors ${formData.type === 'cr' ? 'w-full' : ''}`}
                                    >
                                        Add Candidate
                                    </button>
                                </div>
                            </div>

                            {/* Candidates List */}
                            {candidates.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-700">Added Candidates ({candidates.length})</p>
                                    {candidates.map((candidate) => (
                                        <div key={candidate.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-purple-200">
                                            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-sm">
                                                {candidate.registrationNumber ? candidate.registrationNumber.charAt(0) : '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 text-sm truncate">
                                                    {candidate.registrationNumber}
                                                </p>
                                                <p className="text-xs text-gray-600 truncate">
                                                    {formData.type === 'society' && `${candidate.positionName} • `}
                                                    Will fetch user details on submit
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCandidate(candidate.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Settings */}
                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-3">Election Settings</h3>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.showLiveResults}
                                    onChange={(e) => setFormData({ ...formData, showLiveResults: e.target.checked })}
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">Show Live Results</p>
                                    <p className="text-sm text-gray-600">Display results while election is ongoing</p>
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
                                    <p className="text-sm text-gray-600">Let voters change their vote before election ends</p>
                                </div>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting Request...' : 'Submit Election Request'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RequestElection;
