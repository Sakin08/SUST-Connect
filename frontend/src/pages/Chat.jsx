import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chatApi from '../api/chat.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Chat = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showDeleteMenu, setShowDeleteMenu] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    const chatId = [user._id, userId].sort().join(':');

    useEffect(() => {
        loadMessages();
    }, [userId]);

    useEffect(() => {
        if (!socket) return;

        socket.emit('joinRoom', chatId);

        socket.on('receiveMessage', (message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        });

        socket.on('userTyping', ({ isTyping }) => {
            setIsTyping(isTyping);
        });

        socket.on('messagesRead', () => {
            setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
        });

        socket.on('messageDeleted', ({ messageId, deleteType }) => {
            if (deleteType === 'everyone') {
                setMessages(prev => prev.map(msg =>
                    msg._id === messageId
                        ? { ...msg, deletedForEveryone: true, message: 'This message was deleted', attachments: [] }
                        : msg
                ));
            }
        });

        // Mark as read when entering chat
        socket.emit('markAsRead', { chatId, userId: user._id });

        return () => {
            socket.off('receiveMessage');
            socket.off('userTyping');
            socket.off('messagesRead');
            socket.off('messageDeleted');
        };
    }, [socket, chatId]);

    const loadMessages = async () => {
        try {
            const res = await chatApi.getChatHistory(userId);
            setMessages(res.data);
            if (res.data.length > 0) {
                const other = res.data[0].senderId._id === user._id
                    ? res.data[0].receiverId
                    : res.data[0].senderId;
                setOtherUser(other);
            }
            scrollToBottom();
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await chatApi.uploadFile(formData);
            return res.data;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !socket) return;

        setUploading(true);
        try {
            let attachments = [];
            let messageType = 'text';

            if (selectedFile) {
                const fileData = await uploadFile(selectedFile);
                attachments = [fileData];

                // Determine message type based on file
                if (selectedFile.type.startsWith('image/')) {
                    messageType = 'image';
                } else if (selectedFile.type.includes('pdf') || selectedFile.type.includes('document')) {
                    messageType = 'document';
                } else {
                    messageType = 'file';
                }
            }

            socket.emit('sendMessage', {
                chatId,
                senderId: user._id,
                receiverId: userId,
                message: newMessage.trim(),
                messageType,
                attachments,
            });

            setNewMessage('');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            socket.emit('typing', { chatId, userId: user._id, isTyping: false });
        } catch (error) {
            alert('Failed to send message');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteForMe = async (messageId) => {
        try {
            await chatApi.deleteMessageForMe(messageId);
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
            setShowDeleteMenu(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete message');
        }
    };

    const handleDeleteForEveryone = async (messageId) => {
        try {
            await chatApi.deleteMessageForEveryone(messageId);
            socket.emit('deleteMessage', { chatId, messageId, deleteType: 'everyone' });
            setMessages(prev => prev.map(msg =>
                msg._id === messageId
                    ? { ...msg, deletedForEveryone: true, message: 'This message was deleted', attachments: [] }
                    : msg
            ));
            setShowDeleteMenu(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete message');
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socket) return;

        socket.emit('typing', { chatId, userId: user._id, isTyping: true });

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing', { chatId, userId: user._id, isTyping: false });
        }, 1000);
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-lg border-b-2 border-indigo-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-lg">
                <button
                    onClick={() => navigate('/messages')}
                    className="flex items-center gap-1 px-2 sm:px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold shadow-sm hover:shadow-md hover:scale-105"
                    aria-label="Go back to messages"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm sm:text-base">Back</span>
                </button>
                {otherUser?.profilePicture ? (
                    <img
                        src={otherUser.profilePicture.startsWith('http') ? otherUser.profilePicture : `http://localhost:5001${otherUser.profilePicture}`}
                        alt={otherUser.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-indigo-300 shadow-md"
                    />
                ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                        {otherUser?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-sm sm:text-base text-gray-900 truncate">{otherUser?.name || 'Loading...'}</h2>
                    {isTyping && <p className="text-xs text-green-600 font-medium animate-pulse">typing...</p>}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-white/50 backdrop-blur-sm">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-12 p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 max-w-md mx-auto">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-gray-900">No messages yet</p>
                        <p className="text-xs sm:text-sm mt-2 text-gray-500">Start the conversation!</p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {messages.map((msg, idx) => {
                            const isOwn = msg.senderId._id === user._id;
                            const canDeleteForEveryone = isOwn && !msg.deletedForEveryone &&
                                (new Date() - new Date(msg.createdAt)) < 3600000; // Within 1 hour

                            return (
                                <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                                    <div className="relative max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
                                        <div className={`${isOwn ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white' : 'bg-white/90 backdrop-blur-lg border border-gray-200'} rounded-2xl p-3 shadow-lg hover:shadow-xl transition-shadow ${msg.deletedForEveryone ? 'italic opacity-70' : ''}`}>
                                            {/* Attachments */}
                                            {!msg.deletedForEveryone && msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mb-2">
                                                    {msg.messageType === 'image' ? (
                                                        <img
                                                            src={msg.attachments[0].url}
                                                            alt="attachment"
                                                            className="rounded max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition"
                                                            onClick={() => setPreviewImage(msg.attachments[0].url)}
                                                        />
                                                    ) : (
                                                        <a
                                                            href={msg.attachments[0].url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-2 p-2 rounded ${isOwn ? 'bg-blue-700' : 'bg-gray-100'}`}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-sm">{msg.attachments[0].filename || 'File'}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {msg.message && <p className="break-words">{msg.message}</p>}
                                            <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                                {formatTime(msg.createdAt)}
                                            </p>
                                        </div>

                                        {/* Delete Menu Button */}
                                        {!msg.deletedForEveryone && (
                                            <button
                                                onClick={() => setShowDeleteMenu(showDeleteMenu === msg._id ? null : msg._id)}
                                                className={`absolute top-1 ${isOwn ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-gray-200`}
                                            >
                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        )}

                                        {/* Delete Menu */}
                                        {showDeleteMenu === msg._id && (
                                            <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-10 bg-white shadow-lg rounded-lg py-2 z-10 min-w-[180px]`}>
                                                <button
                                                    onClick={() => handleDeleteForMe(msg._id)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                                                >
                                                    Delete for me
                                                </button>
                                                {canDeleteForEveryone && (
                                                    <button
                                                        onClick={() => handleDeleteForEveryone(msg._id)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                                                    >
                                                        Delete for everyone
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="bg-white/90 backdrop-blur-lg border-t-2 border-indigo-200 p-3 sm:p-4 shadow-lg">
                {/* File Preview */}
                {selectedFile && (
                    <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200 shadow-sm">
                        {selectedFile.type.startsWith('image/') ? (
                            <div className="flex items-start gap-2">
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Preview"
                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-white shadow-md"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-bold truncate text-gray-900">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span className="text-xs sm:text-sm flex-1 truncate font-medium text-gray-900">{selectedFile.name}</span>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-2 items-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 sm:p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition shadow-sm hover:shadow-md hover:scale-110"
                        title="Attach file"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="flex-1 border-2 border-gray-300 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm sm:text-base"
                    />
                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && !selectedFile) || uploading}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 font-bold text-sm sm:text-base"
                    >
                        {uploading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">Sending...</span>
                            </span>
                        ) : (
                            'Send'
                        )}
                    </button>
                </div>
            </form>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <a
                        href={previewImage}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </a>
                </div>
            )}
        </div>
    );
};

export default Chat;
