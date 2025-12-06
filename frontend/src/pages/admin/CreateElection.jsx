import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import electionsApi from '../../api/elections';
import { ArrowLeft, Plus, X, Vote } from 'lucide-react';

const CreateElection = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'society',
        department: '',
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

    // Check if user is admin
    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="text-center p-12 bg-white rounded-3xl shadow-2xl">
                    <p className="text-xl font-bold text-red-800">Access Denied</p>
                    <p className="text-red-600 mt-2">Admin access required</p>
                    <Link to="/elections" className="text-indigo-600 hover:underline mt-4 inline-block">
                        Back to Elections
                    </Link>
                </div>
            </div>
        );
    }

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

        // For society elections, check if position name is filled
        if (formData.type === 'society') {
            const selectedPosition = positions[candidateForm.positionIndex];
            if (!selectedPosition || !selectedPosition.positionName.trim()) {
                alert('Please fill in the position name before adding candidates');
                return;
            }
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
            positionName: formData.type === 'cr' ? 'CR' : (positions[candidateForm.positionIndex]?.positionName || 'Position'),
            positionIndex: candidateForm.positionIndex // Store the index for reference
        };

        console.log('Adding candidate:', newCandidate); // Debug log

        setCandidates([...candidates, newCandidate]);
        // Keep the same position selected, only clear registration and manifesto
        setCandidateForm({
            registrationNumber: '',
            manifesto: '',
            positionIndex: candidateForm.positionIndex // Keep the same position
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
            const electionData = {
                ...formData,
                year: formData.type === 'cr' ? parseInt(formData.year) : undefined,
                positions: finalPositions
            };

            // Step 1: Create the election
            const res = await electionsApi.create(electionData);
            const electionId = res.data.election._id;

            // Step 2: Get the created positions to map candidates
            const electionDetailsRes = await electionsApi.getById(electionId);
            const createdPositions = electionDetailsRes.data.positions;

            // Step 3: Add candidates if any were added
            if (candidates.length > 0) {
                let successCount = 0;
                let failCount = 0;

                const failedCandidates = [];

                console.log('=== ADDING CANDIDATES ===');
                console.log('Created positions:', createdPositions);
                console.log('Candidates to add:', candidates);

                for (const candidate of candidates) {
                    try {
                        // Find the position ID based on position name (exact match, case-sensitive)
                        const position = createdPositions.find(p =>
                            p.positionName.trim() === candidate.positionName.trim()
                        );

                        if (position) {
                            console.log('✅ Position found for candidate:', {
                                candidateRegNo: candidate.registrationNumber,
                                candidatePosition: candidate.positionName,
                                matchedPosition: position.positionName,
                                positionId: position._id
                            });

                            await electionsApi.addCandidate({
                                electionId,
                                positionId: position._id,
                                registrationNumber: candidate.registrationNumber,
                                manifesto: candidate.manifesto
                            });
                            successCount++;
                            console.log('✅ Successfully added:', candidate.registrationNumber);
                        } else {
                            console.error('❌ Position not found for candidate:', {
                                candidateRegNo: candidate.registrationNumber,
                                candidatePosition: candidate.positionName,
                                availablePositions: createdPositions.map(p => p.positionName)
                            });
                            failCount++;
                            failedCandidates.push({
                                regNo: candidate.registrationNumber,
                                reason: `Position "${candidate.positionName}" not found`
                            });
                        }
                    } catch (err) {
                        console.error('❌ Failed to add candidate:', candidate.registrationNumber, err);
                        console.error('Error details:', err.response?.data);
                        failCount++;
                        failedCandidates.push({
                            regNo: candidate.registrationNumber,
                            reason: err.response?.data?.message || err.message || 'Unknown error'
                        });
                    }
                }

                if (failCount > 0) {
                    const failedList = failedCandidates.map(c => `\n• ${c.regNo}: ${c.reason}`).join('');
                    alert(`Election created!\n\n✅ ${successCount} candidates added successfully\n❌ ${failCount} failed:${failedList}\n\nNote: Check if the registration number is correct or if the candidate was already added.`);
                } else {
                    alert(`Election created successfully with ${successCount} candidates!`);
                }
            } else {
                alert('Election created successfully!');
            }

            navigate(`/elections/${electionId}`);
        } catch (error) {
            console.error('Failed to create election:', error);
            alert(error.response?.data?.message || 'Failed to create election');
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
                            <h1 className="text-3xl font-black">Create New Election</h1>
                        </div>
                        <p className="text-white/90">Set up a new election for your campus</p>
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
                                Department *
                            </label>
                            <select
                                value={formData.department}
                                onChange={(e) => handleFormDataChange('department', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Department</option>
                                <option value="CSE">CSE</option>
                                <option value="EEE">EEE</option>
                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                <option value="Civil Engineering">Civil Engineering</option>
                                <option value="Chemical Engineering">Chemical Engineering</option>
                                <option value="IPE">IPE</option>
                                <option value="PME">PME</option>
                                <option value="Food Engineering">Food Engineering</option>
                                <option value="Architecture">Architecture</option>
                                <option value="Software Engineering">Software Engineering</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Statistics">Statistics</option>
                                <option value="Oceanography">Oceanography</option>
                                <option value="Geography and Environmental Studies">Geography and Environmental Studies</option>
                                <option value="Bio-Chemistry and Molecular Biology">Bio-Chemistry and Molecular Biology</option>
                                <option value="Genetic Engineering and Biotechnology">Genetic Engineering and Biotechnology</option>
                                <option value="Forestry and Environmental Science">Forestry and Environmental Science</option>
                                <option value="Business Administration">Business Administration</option>
                                <option value="Economics">Economics</option>
                                <option value="Anthropology">Anthropology</option>
                                <option value="Political Studies">Political Studies</option>
                                <option value="Public Administration">Public Administration</option>
                                <option value="Social Work">Social Work</option>
                                <option value="Sociology">Sociology</option>
                                <option value="English">English</option>
                                <option value="Bangla">Bangla</option>
                            </select>
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
                                            onChange={(e) => {
                                                const newIndex = parseInt(e.target.value);
                                                console.log('Position selected:', newIndex, positions[newIndex]?.positionName);
                                                setCandidateForm({ ...candidateForm, positionIndex: newIndex });
                                            }}
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
                            {submitting ? 'Creating Election...' : 'Create Election'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateElection;
