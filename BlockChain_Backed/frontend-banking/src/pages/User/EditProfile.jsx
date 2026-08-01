import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Mail, Phone, Save, User } from 'lucide-react';
import { AuthContext } from '../../store/AuthContext';
import api from '../../services/api';
import './EditProfile.css';

const EditProfile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    const [formData, setFormData] = useState({ 
        fullName: user?.fullName || '', 
        email: user?.email || '', 
        phoneNumber: user?.phoneNumber || '', 
        avatarUrl: user?.avatarUrl || '' 
    });

    // Cập nhật lại formData khi thông tin user trong AuthContext thay đổi
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                avatarUrl: user.avatarUrl || ''
            });
        }
    }, [user]);

    // 🌟 HÀM TỰ ĐỘNG CHUYỂN ĐỔI URL (ĐÃ ĐƯỢC NÂNG CẤP XỬ LÝ TÊN FILE THÔ)
    const getImageUrl = (rawUrl) => {
        if (!rawUrl) return '';

        // Lấy URL gốc máy chủ từ Axios
        const apiBase = api.defaults.baseURL || 'http://localhost:8080';
        let serverOrigin = 'http://localhost:8080';
        
        try {
            serverOrigin = new URL(apiBase, window.location.href).origin;
        } catch (e) {
            console.error("Lỗi xác định domain máy chủ:", e);
        }

        // Trường hợp 1: Đã là đường dẫn tuyệt đối (có http)
        if (rawUrl.startsWith('http')) {
            try {
                const parsedUrl = new URL(rawUrl);
                // Nếu URL chứa localhost, thay thế bằng IP server thực tế
                if (parsedUrl.hostname === 'localhost') {
                    return `${serverOrigin}${parsedUrl.pathname}${parsedUrl.search}`;
                }
                return rawUrl;
            } catch (e) {
                return rawUrl;
            }
        }

        // Trường hợp 2: Đường dẫn tương đối hoặc chỉ là tên file (VD: a1183969...jpg)
        // Nếu rawUrl chưa có dấu '/', ta tự động thêm '/uploads/' vào trước
        const path = rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`;
        return `${serverOrigin}${path}`;
    };

    const avatarLetter = (formData.fullName || user?.username || 'U').charAt(0).toUpperCase();

    const handleChange = (event) => {
        setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleAvatarChange = async (event) => {
        const image = event.target.files?.[0];
        if (!image) return;
        if (!image.type.startsWith('image/')) return setMessage('Vui lòng chọn một tệp ảnh.');
        if (image.size > 1_500_000) return setMessage('Ảnh phải nhỏ hơn 1.5 MB.');

        setMessage('Đang tải ảnh lên...');
        
        const uploadData = new FormData();
        uploadData.append('file', image);

        try {
            const uploadResponse = await api.post('/upload', uploadData);
            const shortImageUrl = uploadResponse.data.url; 
            
            setFormData((current) => ({ ...current, avatarUrl: shortImageUrl }));
            setMessage('Tải ảnh lên thành công! Nhấn Lưu thay đổi.');
        } catch (error) {
            console.error("Lỗi upload:", error);
            setMessage('Lỗi khi tải ảnh lên máy chủ.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user?.username) return setMessage('Không xác định được tài khoản.');
        setLoading(true); 
        setMessage('');
        try {
            const response = await api.put(`/users/${user.username}/settings`, formData);
            updateUser(response.data);
            navigate('/settings');
        } catch (error) {
            setMessage(error.response?.data || 'Không thể lưu thông tin. Vui lòng thử lại.');
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="edit-profile-container">
            <button className="ep-back-btn" type="button" onClick={() => navigate('/settings')} disabled={loading}>
                <ArrowLeft size={20} /> Quay lại Cài đặt
            </button>
            <div className="ep-header">
                <h2 className="ep-title">Chỉnh sửa thông tin</h2>
                <p className="ep-subtitle">Cập nhật ảnh đại diện và thông tin liên hệ của bạn.</p>
            </div>
            <div className="ep-card">
                <form onSubmit={handleSubmit} className="ep-form">
                    <div className="ep-avatar-section">
                        {formData.avatarUrl ? (
                            <img 
                                className="ep-avatar-preview" 
                                src={getImageUrl(formData.avatarUrl)} 
                                alt="Ảnh đại diện" 
                            />
                        ) : (
                            <div className="ep-avatar-preview ep-avatar-fallback">{avatarLetter}</div>
                        )}
                        <div>
                            <strong>Ảnh đại diện</strong>
                            <p>JPG, PNG hoặc WEBP, tối đa 1.5 MB.</p>
                            <label className="ep-upload-btn">
                                <Camera size={17} /> Chọn ảnh
                                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} disabled={loading} />
                            </label>
                        </div>
                    </div>
                    
                    <div className="ep-form-group">
                        <label className="ep-label">Tên đăng nhập</label>
                        <div className="ep-input-wrapper disabled">
                            <User size={18} className="ep-input-icon" />
                            <input className="ep-input" value={user?.username || ''} disabled />
                        </div>
                    </div>

                    <div className="ep-form-group">
                        <label className="ep-label">Họ và tên</label>
                        <div className="ep-input-wrapper">
                            <User size={18} className="ep-input-icon" />
                            <input name="fullName" className="ep-input" value={formData.fullName} onChange={handleChange} required disabled={loading} />
                        </div>
                    </div>

                    <div className="ep-form-group">
                        <label className="ep-label">Địa chỉ email</label>
                        <div className="ep-input-wrapper">
                            <Mail size={18} className="ep-input-icon" />
                            <input type="email" name="email" className="ep-input" value={formData.email} onChange={handleChange} required disabled={loading} />
                        </div>
                    </div>

                    <div className="ep-form-group">
                        <label className="ep-label">Số điện thoại</label>
                        <div className="ep-input-wrapper">
                            <Phone size={18} className="ep-input-icon" />
                            <input type="tel" name="phoneNumber" className="ep-input" value={formData.phoneNumber} onChange={handleChange} required disabled={loading} />
                        </div>
                    </div>

                    {message && <div className="ep-message">{message}</div>}

                    <div className="ep-actions">
                        <button type="button" className="ep-btn-cancel" onClick={() => navigate('/settings')} disabled={loading}>Hủy bỏ</button>
                        <button type="submit" className="ep-btn-save" disabled={loading}>
                            <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;