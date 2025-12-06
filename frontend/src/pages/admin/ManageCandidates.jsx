import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import electionsApi from '../../api/elections';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import PageTitle from '../../components/PageTitle';

const ManageCandidates = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [election, setElection] = useState(null);
    const [positions, setPositions] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [candidateForm, setCandidateForm] = useState({
        userId: '',
        positionId: '',
        manifesto: '',
        photoUrl: ''
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchElectionData();
    }, [id]);

    const fetchElectionData = async () => {
        try {
            setLoading(true);
            const res = await electionsApi.getById(id);
            setElection(res.data.election);
            setPositions(res.data.positions);
            setCandidates(res.data.candidates);
        } catch (error) {
            console.error('Failed to fetch election:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setCandidateForm({ ...candidateForm, photoUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await electionsApi.addCandidate({
                electionId: id,
                ...candidateForm
            });
            alert('Candidate added successfully!');
            fetchElectionData();
            setCandidateForm({ userId: '', positionId: '', manifesto: '', photoUrl: '' });
            setPhotoPreview(null);
        } catch (error) {
            console.error('Failed to add candidate:', error);
            alert(error.response?.data?.message || 'Failed to add candidate');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-red-600">Access Denied</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
            <PageTitle title={`Manage Candidates - ${election?.title}`} />
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to={`/elections/${id}`} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-6">
                    <ArrowLeft size={20} />
                    Back to Election
                </Link>

                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h1 className="text-3xl font-black text-gray-900 mb-6">Manage Candidates</h1>

                    <form onSubmit={handleAddCandidate} className="space-y-4 mb-8 p-4 bg-purple-50 rounded-xl">
                        <h3 className="font-bold text-gray-900">Add New Candidate</h3>

                        <select
                            value={candidateForm.positionId}
                            onChange={(e) => setCandidateForm({ ...candidateForm, positionId: e.target.value })}
                            className="w-full px-4 py-3 border rounded-xl"
                            required
                        >
                            <option value="">Select Position</option>
                            {positions.map(pos => (
                                <option key={pos._id} value={pos._id}>{pos.positionName}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            value={candidateForm.userId}
                            onChange={(e) => setCandidateForm({ ...candidateForm, userId: e.target.value })}
                            className="w-full px-4 py-3 border rounded-xl"
                            placeholder="User ID"
                            required
                        />

                        <textarea
                            value={candidateForm.manifesto}
                            onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
                            className="w-full px-4 py-3 border rounded-xl"
                            placeholder="Manifesto"
                            rows={3}
                        />

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {submitting ? 'Adding...' : 'Add Candidate'}
                        </button>
                    </form>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Current Candidates ({candidates.length})</h3>
                        <div className="space-y-3">
                            {candidates.map(candidate => (
                                <div key={candidate._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <img
                                        src={candidate.user?.profilePicture || '/default-avatar.png'}
                                        alt={candidate.user?.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{candidate.user?.name}</p>
                                        <p className="text-sm text-gray-600">{candidate.position?.positionName}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCandidates;
