import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, X } from 'lucide-react';
import txService from '../../services/tx.service';
import './TransferConfirm.css';

const TransferConfirm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const transferData = location.state;
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', status: '' });
    
    // 🌟 THÊM STATE ĐỂ QUẢN LÝ TOAST THÔNG BÁO
    const [showToast, setShowToast] = useState(false);

    // 🌟 EFFECT TỰ ĐỘNG ẨN TOAST SAU 5 GIÂY
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);
            return () => clearTimeout(timer); // Xóa timer nếu component unmount
        }
    }, [showToast]);

    if (!transferData) {
        navigate('/transfer');
        return null;
    }

    const { sender, recipient, amount, memo } = transferData;

    const executeTransfer = async () => {
        setLoading(true);
        setNotification({ message: 'Đang chờ bạn xác nhận giao dịch trên MetaMask...', status: 'info' });

        try {
            if (!window.ethereum) throw new Error('Không tìm thấy MetaMask');

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const txConfig = { to: recipient, value: ethers.parseEther(amount.toString()) };

            if (memo.trim()) txConfig.data = ethers.hexlify(ethers.toUtf8Bytes(memo));

            const tx = await signer.sendTransaction(txConfig);
            setNotification({ message: 'Giao dịch đang được xác nhận trên blockchain...', status: 'info' });
            await tx.wait();

            await txService.recordOnChainTransfer({
                senderWallet: sender,
                receiverWallet: recipient,
                amount,
                description: memo,
                onChainTxHash: tx.hash,
            });

            setNotification({
                message: `Chuyển tiền thành công. Mã giao dịch: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`,
                status: 'success',
            });
            // 🌟 HIỂN THỊ TOAST KHI THÀNH CÔNG
            setShowToast(true);
            
        } catch (error) {
            console.error(error);
            const isRecordError = error.response?.data || error.message;
            setNotification({
                message: `Giao dịch chưa hoàn tất: ${isRecordError || 'Vui lòng thử lại.'}`,
                status: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transfer-page-wrapper">
            
            {/* 🌟 TOAST NOTIFICATION GÓC MÀN HÌNH */}
            <div className={`toast-notification ${showToast ? 'show' : ''}`}>
                <CheckCircle2 size={24} color="#ffffff" />
                <div className="toast-content">
                    <h4>Giao dịch thành công!</h4>
                    <p>Tiền đã được chuyển đến người nhận an toàn.</p>
                </div>
                <button className="toast-close-btn" onClick={() => setShowToast(false)}>
                    <X size={18} />
                </button>
            </div>

            <div className="transfer-container">
                <div className="transfer-header-text">
                    <h1>Xác nhận giao dịch</h1>
                    <p>Kiểm tra kỹ thông tin trước khi gửi tiền.</p>
                </div>

                <div className="transfer-card-modern">
                    {/* GIỮ LẠI THÔNG BÁO LỖI/ĐANG XỬ LÝ NẾU CẦN TRONG FORM */}
                    {notification.message && (
                        <div className={`notification-alert ${notification.status}`}>
                            {notification.status === 'success' && <CheckCircle2 size={20} />}
                            {notification.status === 'error' && <AlertCircle size={20} />}
                            {notification.status === 'info' && <div className="spinner-sm" />}
                            <span>{notification.message}</span>
                        </div>
                    )}

                    <div className="confirmation-wrapper">
                        <div className="confirmation-details">
                            <div className="detail-row"><span className="detail-label">Người gửi:</span><span className="detail-value">{sender}</span></div>
                            <div className="detail-row"><span className="detail-label">Người nhận:</span><span className="detail-value highlight-address">{recipient}</span></div>
                            <div className="detail-row"><span className="detail-label">Số tiền:</span><span className="detail-value highlight-amount">{amount} SepoliaETH</span></div>
                            <div className="detail-row"><span className="detail-label">Nội dung:</span><span className="detail-value">{memo || 'Không có nội dung'}</span></div>
                        </div>

                        <div className="warning-box"><ShieldCheck size={20} className="text-green" /><p>Giao dịch blockchain không thể hoàn tác sau khi xác nhận.</p></div>

                        {notification.status !== 'success' ? (
                            <div className="btn-group">
                                <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={loading}><ArrowLeft size={18} /><span>Quay lại sửa</span></button>
                                <button type="button" className={`btn-transfer-modern ${loading ? 'loading' : ''}`} onClick={executeTransfer} disabled={loading}>{loading ? 'Đang xử lý...' : 'Xác nhận chuyển tiền'}</button>
                            </div>
                        ) : (
                            <div className="btn-group" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn-secondary" onClick={() => navigate('/transfer')}><ArrowLeft size={18} /><span>Giao dịch mới</span></button>
                                <button type="button" className="btn-transfer-modern" onClick={() => navigate('/history')}>Xem lịch sử giao dịch</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferConfirm;