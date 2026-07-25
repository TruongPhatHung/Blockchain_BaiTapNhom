// src/pages/User/Settings.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
import { useLanguage } from '../../store/LanguageContext'; // IMPORT HOOK NGÔN NGỮ
import { ChevronRight, Edit3, Lock, Shield, Fingerprint, Bell, Megaphone, Globe } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const { user, token, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Lấy các hàm từ LanguageContext
    const { t, language, changeLanguage } = useLanguage();

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
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    [settingKey]: newValue
                })
            });

            if (response.ok) {
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
                {/* SỬ DỤNG HÀM t() ĐỂ DỊCH NGÔN NGỮ */}
                <h2 className="settings-title">{t('settingsTitle')}</h2>
                <p className="settings-subtitle">{t('settingsSubtitle')}</p>
            </div>

            <div className="settings-grid">
                {/* Cột Trái */}
                <div className="settings-col">
                    <div className="st-card">
                        <div className="st-card-header">
                            <h3 className="st-card-title">{t('personalInfo')}</h3>
                            <button className="btn-edit-profile" onClick={() => navigate('/settings/edit-profile')}>
                                <Edit3 size={16} /> {t('edit')}
                            </button>
                        </div>
                        
                        <div className="st-profile-header">
                            <div className="st-avatar-circle">{user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" /> : avatarLetter}</div>
                            <button className="btn-change-avatar">{t('changePhoto')}</button>
                        </div>

                        <div className="st-list">
                            <div className="st-list-item static-item">
                                <div className="st-item-content">
                                    <span className="st-label">{t('fullName')}</span>
                                    <span className="st-value">{user?.username || t('notUpdated')}</span>
                                </div>
                            </div>
                            <div className="st-list-item static-item">
                                <div className="st-item-content">
                                    <span className="st-label">{t('email')}</span>
                                    <span className="st-value">{user?.email || t('notUpdated')}</span>
                                </div>
                            </div>
                            <div className="st-list-item static-item">
                                <div className="st-item-content">
                                    <span className="st-label">{t('phone')}</span>
                                    <span className="st-value">{user?.phoneNumber || t('notUpdated')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="st-card">
                        <h3 className="st-card-title">{t('langAndRegion')}</h3>
                        <div className="st-list">
                            <div className="st-list-item">
                                <div className="st-item-icon-wrapper blue-bg"><Globe size={18} /></div>
                                <div className="st-item-content">
                                    <span className="st-label">{t('language')}</span>
                                    {/* THÊM DROPDOWN CHỌN NGÔN NGỮ TẠI ĐÂY */}
                                    <select 
                                        value={language} 
                                        onChange={(e) => changeLanguage(e.target.value)}
                                        className="st-language-select"
                                        style={{ 
                                            border: 'none', 
                                            background: 'transparent', 
                                            outline: 'none', 
                                            fontSize: '14px', 
                                            color: '#333', 
                                            cursor: 'pointer', 
                                            padding: '4px 0',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <option value="vi">{t('vietnamese')}</option>
                                        <option value="en">{t('english')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột Phải */}
                <div className="settings-col">
                    <div className="st-card">
                        <h3 className="st-card-title">{t('security')}</h3>
                        <div className="st-list">
                            <div className="st-list-item hoverable">
                                <div className="st-item-icon-wrapper gray-bg"><Lock size={18} /></div>
                                <div className="st-item-content">
                                    <span className="st-label-main">{t('changePassword')}</span>
                                    <span className="st-desc">{t('lastChanged30Days')}</span>
                                </div>
                                <ChevronRight size={18} className="st-icon-right" />
                            </div>
                            <div className="st-list-item hoverable">
                                <div className="st-item-icon-wrapper gray-bg"><Shield size={18} /></div>
                                <div className="st-item-content">
                                    <span className="st-label-main">{t('smartOtp')}</span>
                                    <span className="st-desc">{t('smartOtpDesc')}</span>
                                </div>
                                <ChevronRight size={18} className="st-icon-right" />
                            </div>
                            <div className="st-list-item">
                                <div className="st-item-icon-wrapper gray-bg"><Fingerprint size={18} /></div>
                                <div className="st-item-content">
                                    <span className="st-label-main">{t('biometric')}</span>
                                    <span className="st-desc">{t('biometricDesc')}</span>
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

                    <div className="st-card">
                        <h3 className="st-card-title">{t('notifications')}</h3>
                        <div className="st-list">
                            <div className="st-list-item">
                                <div className="st-item-icon-wrapper blue-bg"><Bell size={18} /></div>
                                <div className="st-item-content">
                                    <span className="st-label-main">{t('appNotifications')}</span>
                                    <span className="st-desc">{t('appNotifDesc')}</span>
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
                                    <span className="st-label-main">{t('promotions')}</span>
                                    <span className="st-desc">{t('promotionsDesc')}</span>
                                </div>
                                <label className="st-toggle">
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