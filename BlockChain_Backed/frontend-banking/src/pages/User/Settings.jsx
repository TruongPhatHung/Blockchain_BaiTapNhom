// src/pages/User/Settings.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
import { ChevronRight, Edit3, Lock, Shield, Fingerprint, Bell, Megaphone, Globe } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const { user, token, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Lấy chữ cái đầu làm Avatar
    const avatarLetter = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    // Hàm gọi API cập nhật nhanh cấu hình Toggles trực tiếp lên Database
    const handleToggleSetting = async (settingKey, currentValue) => {
        if (!user?.username) return;

        const newValue = !currentValue;
        try {
            const response = await fetch(`http://localhost:8080/api/users/${user.username}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Gửi kèm token nếu có bảo mật
                },
                body: JSON.stringify({
                    [settingKey]: newValue
                })
            });

            if (response.ok) {
                // Cập nhật lại Context
                updateUser({ [settingKey]: newValue });
            } else {
                alert('Không thể lưu cấu hình cài đặt.');
            }
        } catch (error) {
            console.error('Lỗi khi lưu cài đặt:', error);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2 className="settings-title">Cài đặt</h2>
                <p className="settings-subtitle">Quản lý tài khoản, bảo mật và tùy chọn hệ thống của bạn.</p>
            </div>

            <div className="settings-grid">
                {/* Cột Trái */}
                <div className="settings-col">
                    {/* Thẻ Thông tin cá nhân */}
                    <div className="st-card">
                        <div className="st-card-header">
                            <h3 className="st-card-title">Thông tin cá nhân</h3>
                            <button className="btn-edit-profile" onClick={() => navigate('/settings/edit-profile')}>
                                <Edit3 size={16} /> Chỉnh sửa
                            </button>
                        </div>
                        
                        <div className="st-profile-header">
                            <div className="st-avatar-circle">{avatarLetter}</div>
                            <button className="btn-change-avatar">Thay đổi ảnh</button>
                        </div>

                        {/* ĐÃ SỬA: Xóa bỏ các ChevronRight, đổi class sang static-item */}
                        <div className="st-list">
                            <div className="st-list-item static-item">
                                <div className="st-item-content">
                                    <span className="st-label">Họ và tên</span>
                                    <span className="st-value">{user?.username || 'Chưa cập nhật'}</span>
                                </div>
                            </div>
                            <div className="st-list-item static-item">
                                <div className="st-item-content">
                                    <span className="st-label">Email</span>
                                    <span className="st-value">{user?.email || 'Chưa cập nhật email'}</span>
                                </div>
                            </div>
                            <div className="st-list-item static-item">
                                <div className="st-item-content">
                                    <span className="st-label">Số điện thoại</span>
                                    {/* Sử dụng phoneNumber đồng bộ backend */}
                                    <span className="st-value">{user?.phoneNumber || 'Chưa cập nhật số ĐT'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ Ngôn ngữ & Vùng */}
                    <div className="st-card">
                        <h3 className="st-card-title">Ngôn ngữ & Vùng</h3>
                        <div className="st-list">
                            <div className="st-list-item">
                                <div className="st-item-icon-wrapper blue-bg"><Globe size={18} /></div>
                                <div className="st-item-content">
                                    <span className="st-label">Ngôn ngữ</span>
                                    <span className="st-value">Tiếng Việt</span>
                                </div>
                                <ChevronRight size={18} className="st-icon-right" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột Phải */}
                <div className="settings-col">
                    {/* Thẻ Bảo mật */}
                    <div className="st-card">
                        <h3 className="st-card-title">Bảo mật</h3>
                        <div className="st-list">
                            <div className="st-list-item hoverable">
                                <div className="st-item-icon-wrapper gray-bg"><Lock size={18} /></div>
                                <div className="st-item-content">
                                    <span className="st-label-main">Đổi mật khẩu</span>
                                    <span className="st-desc">Cập nhật lần cuối: 30 ngày trước</span>
                                </div>
                                <ChevronRight size={18} className="st-icon-right" />
                            </div>
                            <div className="st-list-item hoverable">
                                <div className="st-item-icon-wrapper gray-bg"><Shield size={18} /></div>
                                <div className="st-item-content">
                                    <span className="st-label-main">Cài đặt mã PIN SmartOTP</span>
                                    <span className="st-desc">Dùng cho xác thực giao dịch</span>
                                </div>
                                <ChevronRight size={18} className="st-icon-right" />
                            </div>
                            <div className="st-list-item">
                                <div className="st-item-icon-wrapper gray-bg"><Fingerprint size={18} /></div>
                                <div className="st-item-content">
                                    <span className="st-label-main">Xác thực sinh trắc học</span>
                                    <span className="st-desc">Face ID / Vân tay</span>
                                </div>
                                <label className="st-toggle">
                                    <input 
                                        type="checkbox" 
                                        checked={!!user?.isBiometricEnabled} 
                                        onChange={() => handleToggleSetting('isBiometricEnabled', user?.isBiometricEnabled)} 
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ Thông báo */}
                    <div className="st-card">
                        <h3 className="st-card-title">Thông báo</h3>
                        <div className="st-list">
                            <div className="st-list-item">
                                <div className="st-item-icon-wrapper blue-bg"><Bell size={18} /></div>
                                <div className="st-item-content">
                                    <span className="st-label-main">Thông báo ứng dụng</span>
                                    <span className="st-desc">Nhận tin báo số dư & hệ thống qua Push</span>
                                </div>
                                <label className="st-toggle">
                                    <input 
                                        type="checkbox" 
                                        checked={!!user?.isNotificationEnabled} 
                                        onChange={() => handleToggleSetting('isNotificationEnabled', user?.isNotificationEnabled)} 
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="st-list-item">
                                <div className="st-item-icon-wrapper purple-bg"><Megaphone size={18} /></div>
                                <div className="st-item-content">
                                    <span className="st-label-main">Ưu đãi & Khuyến mãi</span>
                                    <span className="st-desc">Tin tức từ Ngân hàng</span>
                                </div>
                                <label className="st-toggle">
                                    {/* Ví dụ toggles phụ chưa có trên database, có thể giữ state hoặc kết nối tùy ý */}
                                    <input type="checkbox" defaultChecked={false} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;