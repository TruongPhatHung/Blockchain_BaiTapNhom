// src/pages/User/Transfer.jsx
import React, { useState } from 'react';
import txService from '../../services/tx.service';
import './Transfer.css';

const Transfer = () => {
    const [activeTab, setActiveTab] = useState('internal');
    const [formData, setFormData] = useState({
        toAccount: '',
        recipientName: '', 
        amount: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Mock data số dư
    const availableBalance = 125500000;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleQuickAmount = (amount) => {
        setFormData({ ...formData, amount: amount });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.amount <= 0) {
            setError('Số tiền chuyển phải lớn hơn 0');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                toAccount: formData.toAccount,
                amount: parseFloat(formData.amount),
                transactionType: 'TRANSFER',
                description: formData.description || 'Chuyen tien'
            };

            await txService.transfer(payload);
            setIsSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi chuyển tiền. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleNewTransfer = () => {
        setFormData({ toAccount: '', recipientName: '', amount: '', description: '' });
        setIsSuccess(false);
        setError('');
    };

    // MÀN HÌNH THÀNH CÔNG
    if (isSuccess) {
        return (
            <div className="transfer-page-container">
                <div className="success-screen">
                    <div className="success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div className="success-text">Giao dịch thành công!</div>
                    <p className="success-amount">Đã chuyển <strong>{parseFloat(formData.amount).toLocaleString()} VNĐ</strong></p>
                    <p className="success-account">Đến tài khoản: <strong>{formData.toAccount}</strong></p>
                    <button className="btn-primary mt-4" onClick={handleNewTransfer}>
                        Thực hiện giao dịch khác
                    </button>
                </div>
            </div>
        );
    }

    // MÀN HÌNH CHUYỂN TIỀN
    return (
        <div className="transfer-page-container">
            <div className="transfer-header">
                <h2>Chuyển tiền</h2>
                <p>Thực hiện giao dịch chuyển khoản an toàn và nhanh chóng.</p>
            </div>

            <div className="transfer-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'internal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('internal')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path><path d="M8 14v3"></path><path d="M12 14v3"></path><path d="M16 14v3"></path></svg>
                    Trong Mini Bank
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'external' ? 'active' : ''}`}
                    onClick={() => setActiveTab('external')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M9 8h1"></path><path d="M9 12h1"></path><path d="M9 16h1"></path><path d="M14 8h1"></path><path d="M14 12h1"></path><path d="M14 16h1"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>
                    Liên ngân hàng
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'phone' ? 'active' : ''}`}
                    onClick={() => setActiveTab('phone')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    Qua số điện thoại
                </button>
            </div>

            <form className="transfer-form-card" onSubmit={handleSubmit}>
                {/* TÀI KHOẢN NGUỒN */}
                <div className="form-section-title">Tài khoản nguồn</div>
                <div className="form-group source-account-group">
                    <select className="form-input select-input" disabled>
                        <option>TK Thanh toán - 999988888</option>
                    </select>
                    <div className="balance-info">
                        Số dư khả dụng: <strong>{availableBalance.toLocaleString()} VNĐ</strong>
                    </div>
                </div>

                {/* THÔNG TIN NGƯỜI NHẬN */}
                <div className="form-section-title">Thông tin người nhận</div>
                <div className="form-group">
                    <label className="form-label">Số tài khoản thụ hưởng</label>
                    <div className="input-with-icon">
                        <input 
                            type="text" 
                            name="toAccount"
                            className="form-input" 
                            placeholder="Nhập số tài khoản..." 
                            value={formData.toAccount}
                            onChange={handleChange}
                            required
                        />
                        <span className="input-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </span>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Tên người nhận</label>
                    <input 
                        type="text" 
                        name="recipientName"
                        className="form-input readonly-input" 
                        placeholder="Vui lòng nhập số tài khoản trước..." 
                        value={formData.recipientName}
                        onChange={handleChange}
                        readOnly 
                    />
                </div>

                {/* CHI TIẾT GIAO DỊCH */}
                <div className="form-section-title">Chi tiết giao dịch</div>
                <div className="form-group">
                    <label className="form-label">Số tiền chuyển</label>
                    <div className="amount-input-wrapper">
                        <input 
                            type="number" 
                            name="amount"
                            className="form-input amount-input" 
                            placeholder="0" 
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />
                        <span className="currency-suffix">VND</span>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="quick-amount-buttons">
                        <button type="button" onClick={() => handleQuickAmount(500000)}>500,000</button>
                        <button type="button" onClick={() => handleQuickAmount(1000000)}>1,000,000</button>
                        <button type="button" onClick={() => handleQuickAmount(2000000)}>2,000,000</button>
                        <button type="button" onClick={() => handleQuickAmount(5000000)}>5,000,000</button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Nội dung chuyển khoản</label>
                    <textarea 
                        name="description"
                        className="form-input textarea-input" 
                        placeholder="Nhập nội dung chuyển khoản..." 
                        value={formData.description}
                        onChange={handleChange}
                        rows="2"
                    ></textarea>
                </div>

                {/* SUBMIT AREA */}
                <div className="form-submit-area">
                    <span className="fee-text">Phí giao dịch: <strong className="free-text">Miễn phí</strong></span>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Tiếp tục giao dịch'}
                    </button>
                </div>
            </form>

            {/* NGƯỜI NHẬN GẦN ĐÂY */}
            <div className="recent-recipients-section">
                <h4>Người nhận gần đây</h4>
                <div className="recent-list">
                    <div className="recent-item add-new">
                        <div className="avatar">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
                        <span>Thêm mới</span>
                    </div>
                    <div className="recent-item">
                        <div className="avatar bg-blue">HT</div>
                        <span>Hoàng T.</span>
                    </div>
                    <div className="recent-item">
                        <div className="avatar bg-brown">LM</div>
                        <span>Lê Minh</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transfer;