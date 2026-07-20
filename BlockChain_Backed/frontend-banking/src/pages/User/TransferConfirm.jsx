import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import './TransferConfirm.css'; // File CSS mới sẽ tạo ở bước 3

const TransferConfirm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Lấy dữ liệu được truyền từ trang Transfer
    const transferData = location.state; 
    
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', status: '' });

    // Nếu không có dữ liệu (người dùng truy cập trực tiếp link), đẩy về trang Transfer
    if (!transferData) {
        navigate('/transfer');
        return null;
    }

    const { sender, recipient, amount, memo } = transferData;

    // HÀM THỰC THI GIAO DỊCH
    const executeTransfer = async () => {
        setLoading(true);
        setNotification({ message: 'Đang xử lý giao dịch. Vui lòng xác nhận trên MetaMask...', status: 'info' });

        try {
            if (!window.ethereum) throw new Error("Không tìm thấy MetaMask");
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const parsedAmount = ethers.parseEther(amount.toString());

            const txConfig = {
                to: recipient,
                value: parsedAmount
            };

            if (memo.trim() !== '') {
                txConfig.data = ethers.hexlify(ethers.toUtf8Bytes(memo));
            }

            const tx = await signer.sendTransaction(txConfig);

            setNotification({ message: 'Giao dịch đang được đưa vào mạng lưới...', status: 'info' });
            await tx.wait(); // Đợi block xác nhận

            setNotification({ 
                message: `Chuyển tiền thành công! Mã giao dịch: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`, 
                status: 'success' 
            });
            
            // Thành công thì ẩn nút đi, hoặc có thể navigate về trang lịch sử
        } catch (error) {
            console.error(error);
            setNotification({ message: 'Giao dịch thất bại hoặc bị từ chối!', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transfer-page-wrapper">
            <div className="transfer-container">
                <div className="transfer-header-text">
                    <h1>Xác nhận giao dịch</h1>
                    <p>Vui lòng kiểm tra kỹ thông tin trước khi thực hiện gửi tiền</p>
                </div>

                <div className="transfer-card-modern">
                    {/* Hiển thị thông báo */}
                    {notification.message && (
                        <div className={`notification-alert ${notification.status}`}>
                            {notification.status === 'success' && <CheckCircle2 size={20} />}
                            {notification.status === 'error' && <AlertCircle size={20} />}
                            {notification.status === 'info' && <div className="spinner-sm"></div>}
                            <span>{notification.message}</span>
                        </div>
                    )}

                    <div className="confirmation-wrapper">
                        <div className="confirmation-details">
                            <div className="detail-row">
                                <span className="detail-label">Người gửi:</span>
                                <span className="detail-value">{sender}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Người nhận:</span>
                                <span className="detail-value highlight-address">{recipient}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Số tiền:</span>
                                <span className="detail-value highlight-amount">{amount} SepoliaETH</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Nội dung:</span>
                                <span className="detail-value">{memo || 'Không có nội dung'}</span>
                            </div>
                        </div>

                        <div className="warning-box">
                            <ShieldCheck size={20} className="text-green" />
                            <p>Vui lòng kiểm tra kỹ địa chỉ ví. Giao dịch Blockchain không thể hoàn tác sau khi đã xác nhận.</p>
                        </div>

                        {notification.status !== 'success' && (
                            <div className="btn-group">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => navigate(-1)} // Quay lại trang trước đó
                                    disabled={loading}
                                >
                                    <ArrowLeft size={18} />
                                    <span>Quay lại sửa</span>
                                </button>
                                <button 
                                    type="button" 
                                    className={`btn-transfer-modern ${loading ? 'loading' : ''}`}
                                    onClick={executeTransfer}
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Xác nhận chuyển tiền'}
                                </button>
                            </div>
                        )}
                        
                        {/* Nút quay về trang chủ hoặc lịch sử sau khi thành công */}
                        {notification.status === 'success' && (
                            <button 
                                type="button" 
                                className="btn-secondary" 
                                onClick={() => navigate('/transfer')} 
                                style={{ width: '100%', marginTop: '20px' }}
                            >
                                <ArrowLeft size={18} />
                                <span>Thực hiện giao dịch mới</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferConfirm;