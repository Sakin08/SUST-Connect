import { useState, useEffect } from 'react';
import { Bus, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ImageGallery from '../components/ImageGallery';

const BusSchedule = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [title, setTitle] = useState('SUST Bus Schedule');
    const [description, setDescription] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const isAdmin = user && user.role === 'admin';

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        try {
            const res = await api.get('/bus-schedule');
            setSchedule(res.data);
        } catch (error) {
            console.error('Failed to load schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImageFiles(files);
            const previews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };

    const removeImage = (index) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (imageFiles.length === 0) {
            alert('Please select at least one image');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            imageFiles.forEach(file => {
                formData.append('images', file);
            });
            formData.append('title', title);
            formData.append('description', description);

            await api.post('/bus-schedule', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowUploadModal(false);
            setImageFiles([]);
            setImagePreviews([]);
            setTitle('SUST Bus Schedule');
            setDescription('');
            loadSchedule();
        } catch (error) {
            alert('Failed to upload schedule');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete current bus schedule?')) return;
        try {
            await api.delete(`/bus-schedule/${schedule._id}`);
            setSchedule(null);
        } catch (error) {
            alert('Failed to delete schedule');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-100">
                <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-bold text-gray-800">Loading schedule...</p>
                    <p className="text-sm text-gray-500 mt-2">Getting bus timings for you</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
                <header className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 via-cyan-600 to-green-600 rounded-xl shadow-lg">
                            <Bus className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
                            Bus Schedule
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">SUST Campus Transportation</p>

                    {isAdmin && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="mt-4 flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold shadow-md text-sm"
                        >
                            <Upload className="w-4 h-4" />
                            Upload New Schedule
                        </button>
                    )}
                </header>

                {schedule ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 px-4 py-3 flex justify-between items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold text-white truncate">{schedule.title}</h2>
                                {schedule.description && (
                                    <p className="text-blue-100 text-xs mt-1 line-clamp-1">{schedule.description}</p>
                                )}
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={handleDelete}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="p-4">
                            {schedule.images && schedule.images.length > 0 ? (
                                <ImageGallery images={schedule.images} />
                            ) : schedule.imageUrl ? (
                                <ImageGallery images={[schedule.imageUrl]} />
                            ) : (
                                <div className="bg-gray-100 rounded-xl p-8 text-center">
                                    <p className="text-gray-500">No schedule image available</p>
                                </div>
                            )}
                            <div className="mt-4 flex items-center justify-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-xs text-gray-600">
                                    Updated: {new Date(schedule.updatedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bus className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Bus Schedule Available</h3>
                        <p className="text-sm text-gray-500">Check back later for updated timings</p>
                        {isAdmin && (
                            <p className="text-xs text-gray-400 mt-3 bg-blue-50 rounded-lg px-3 py-2 inline-block">
                                Upload a schedule to get started
                            </p>
                        )}
                    </div>
                )}

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto border border-white/20">
                            <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-green-600 rounded-xl">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                                    Upload Bus Schedule
                                </h3>
                            </div>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="e.g., Updated for Spring 2025"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                                        Schedule Images * (Up to 5 images)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center bg-gradient-to-br from-blue-50 to-green-50">
                                        {imagePreviews.length > 0 ? (
                                            <div>
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    {imagePreviews.map((preview, index) => (
                                                        <div key={index} className="relative">
                                                            <img
                                                                src={preview}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg shadow-md border-2 border-white"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImageFiles([]);
                                                        setImagePreviews([]);
                                                    }}
                                                    className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-bold bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                                                >
                                                    Remove All Images
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                                                </div>
                                                <label className="cursor-pointer">
                                                    <span className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition inline-block">
                                                        Click to upload
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <p className="text-xs text-gray-500 mt-3">PNG, JPG up to 5MB each (max 5 images)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 text-white py-2.5 sm:py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold disabled:opacity-50 disabled:hover:scale-100 shadow-lg text-sm sm:text-base"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Schedule'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setImageFiles([]);
                                            setImagePreviews([]);
                                        }}
                                        className="px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition font-bold shadow-md hover:shadow-lg text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusSchedule;
