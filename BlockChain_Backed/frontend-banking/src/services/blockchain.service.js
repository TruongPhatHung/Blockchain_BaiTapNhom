// src/pages/User/Settings.jsx
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
// ĐÃ SỬA: Import thêm icon Wallet cho ví MetaMask
import { ChevronRight, Edit3, Lock, Shield, Fingerprint, Bell, Megaphone, Globe, Wallet } from 'lucide-react';
// ĐÃ SỬA: Import dịch vụ blockchain
import { blockchainService } from '../../services/blockchain.service';
import './Settings.css';

const Settings = () => {
    const { user, token, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- STATE MỚI CHO METAMASK ---
    const [walletAddress, setWalletAddress] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

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

    // --- HÀM MỚI: XỬ LÝ KẾT NỐI METAMASK ---
    const handleConnectMetaMask = async () => {
        setIsConnecting(true);
        try {
            const result = await blockchainService.connectWallet();
            setWalletAddress(result.address);
            alert("Kết nối ví thành công!");
            // Sau này bạn có thể gọi thêm API để lưu địa chỉ ví này vào Database (bảng User) nếu muốn
        } catch (error) {
            alert(error.message);
        } finally {
            setIsConnecting(false);
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

                    {/* --- ĐÃ BỔ SUNG: THẺ KẾT NỐI VÍ WEB3 & BLOCKCHAIN --- */}
                    <div className="st-card">
                        <h3 className="st-card-title">Web3 & Blockchain</h3>
                        <div className="st-list">
                            <div className="st-list-item">
                                <div className="st-item-icon-wrapper" style={{ backgroundColor: '#f6851b', color: 'white' }}>
                                    <Wallet size={18} />
                                </div>
                                <div className="st-item-content">
                                    <span className="st-label-main">Ví MetaMask</span>
                                    <span className="st-desc">
                                        {walletAddress 
                                            ? `Đã kết nối: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` 
                                            : 'Dùng để ký giao dịch chuyển tiền'}
                                    </span>
                                </div>
                                <button 
                                    onClick={handleConnectMetaMask}
                                    disabled={isConnecting || walletAddress !== null}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: walletAddress ? '#d1d5db' : '#f6851b',
                                        color: walletAddress ? '#4b5563' : 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: walletAddress ? 'default' : 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '13px'
                                    }}
                                >
                                    {isConnecting ? 'Đang chờ...' : (walletAddress ? 'Đã kết nối' : 'Kết nối')}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* ---------------------------------------------------- */}

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