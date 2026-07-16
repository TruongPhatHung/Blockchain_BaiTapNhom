// src/pages/User/EditProfile.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
import { ArrowLeft, Save, User, Mail, Phone } from 'lucide-react';
import api from "../../services/api"; // 🔥 thêm dòng này
import './EditProfile.css';

const EditProfile = () => {
    const { user, token, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Khởi tạo state - Chú ý phoneNumber đồng bộ với DB
    const [formData, setFormData] = useState({
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.username) {
            alert("Không xác định được thông tin người dùng!");
            return;
        }

        setLoading(true);

        try {
            const response = await api.put(
                `/users/${user.username}/settings`,
                formData
            );

            const updatedUserFromDB = response.data;

            // cập nhật context
            updateUser(updatedUserFromDB);

            alert("Cập nhật thông tin cá nhân thành công!");
            navigate("/settings");

        } catch (error) {
            console.error("Lỗi:", error);

            if (error.response) {
                // lỗi từ backend (403, 401, 500...)
                alert("Cập nhật thất bại: " + error.response.data);
            } else {
                // lỗi mạng
                alert("Không thể kết nối đến server!");
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="edit-profile-container">
            <button className="ep-back-btn" onClick={() => navigate('/settings')} disabled={loading}>
                <ArrowLeft size={20} />
                Quay lại Cài đặt
            </button>

            <div className="ep-header">
                <h2 className="ep-title">Chỉnh sửa thông tin</h2>
                <p className="ep-subtitle">Cập nhật thông tin cá nhân của bạn để chúng tôi hỗ trợ tốt nhất.</p>
            </div>

            <div className="ep-card">
                <form onSubmit={handleSubmit} className="ep-form">
                    
                    {/* Họ và tên (Chỉ hiển thị, không được sửa đổi vì API Backend không nhận đổi Username) */}
                    <div className="ep-form-group">
                        <label className="ep-label">Họ và tên (Tên đăng nhập)</label>
                        <div className="ep-input-wrapper disabled">
                            <User size={18} className="ep-input-icon" />
                            <input 
                                type="text" 
                                className="ep-input" 
                                value={user?.username || ''} 
                                disabled 
                            />
                        </div>
                        <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>
                            *Không thể thay đổi tên tài khoản.
                        </small>
                    </div>

                    {/* Email */}
                    <div className="ep-form-group">
                        <label className="ep-label">Địa chỉ Email</label>
                        <div className="ep-input-wrapper">
                            <Mail size={18} className="ep-input-icon" />
                            <input 
                                type="email" 
                                name="email"
                                className="ep-input" 
                                placeholder="Ví dụ: nguyenvan@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Số điện thoại */}
                    <div className="ep-form-group">
                        <label className="ep-label">Số điện thoại</label>
                        <div className="ep-input-wrapper">
                            <Phone size={18} className="ep-input-icon" />
                            <input 
                                type="tel" 
                                name="phoneNumber" // Đã chỉnh sửa thành phoneNumber khớp Backend
                                className="ep-input" 
                                placeholder="Nhập số điện thoại..."
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="ep-actions">
                        <button 
                            type="button" 
                            className="ep-btn-cancel" 
                            onClick={() => navigate('/settings')}
                            disabled={loading}
                        >
                            Hủy bỏ
                        </button>
                        <button type="submit" className="ep-btn-save" disabled={loading}>
                            <Save size={18} />
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;