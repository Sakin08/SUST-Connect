import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBookRequest } from '../api/bookRequests';
import { BookOpen, ArrowLeft, Upload, X } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const CreateBookRequest = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bookTitle: '',
        author: '',
        course: '',
        requestType: 'borrow',
        description: '',
        urgency: 'normal',
        images: []
    });
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, images: files });

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('bookTitle', formData.bookTitle);
            data.append('author', formData.author);
            data.append('course', formData.course);
            data.append('requestType', formData.requestType);
            data.append('description', formData.description);
            data.append('urgency', formData.urgency);

            formData.images.forEach(image => {
                data.append('images', image);
            });

            await createBookRequest(data);
            navigate('/books');
        } catch (error) {
            console.error('Failed to create book request:', error);
            alert('Failed to create book request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-20 md:pb-8">
            <PageTitle title="Request Book" />
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/books')}
                        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Books
                    </button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        Request a Book
                    </h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                    <div className="space-y-5">
                        {/* Book Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Book Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.bookTitle}
                                onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                                placeholder="e.g., Introduction to Algorithms"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Author */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Author (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                placeholder="e.g., Thomas H. Cormen"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Course */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Course Code (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.course}
                                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                placeholder="e.g., CSE201, ENG101"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Request Type and Urgency */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Request Type
                                </label>
                                <select
                                    value={formData.requestType}
                                    onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="borrow">Borrow</option>
                                    <option value="need-to-buy">Need to Buy</option>
                                    <option value="looking-for">Looking For</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Urgency
                                </label>
                                <select
                                    value={formData.urgency}
                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Add any additional details about your request..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Book Cover (Optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-600">Click to upload book cover</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                </label>
                            </div>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mt-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/books')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.bookTitle.trim()}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Request'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBookRequest;
