// src/pages/User/Transfer.jsx
import React, { useState } from 'react';
import txService from '../../services/tx.service';
import './Transfer.css';

const Transfer = () => {
    const [formData, setFormData] = useState({
        toAccount: '',
        amount: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Xử lý khi người dùng gõ vào form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Xử lý gửi giao dịch
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validate cơ bản
        if (formData.amount <= 0) {
            setError('Số tiền chuyển phải lớn hơn 0');
            return;
        }

        setLoading(true);
        try {
            // Chuẩn bị dữ liệu gửi lên API theo đúng định dạng Backend cần
            const payload = {
                toAccount: formData.toAccount,
                amount: parseFloat(formData.amount),
                transactionType: 'TRANSFER',
                description: formData.description || 'Chuyen tien'
            };

            // Gọi API
            await txService.transfer(payload);
            
            // Nếu thành công, chuyển sang màn hình Success
            setIsSuccess(true);
        } catch (err) {
            // Bắt lỗi từ Backend trả về (Ví dụ: Số dư không đủ, Sai số TK)
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi chuyển tiền. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    // Hàm reset form để thực hiện giao dịch mới
    const handleNewTransfer = () => {
        setFormData({ toAccount: '', amount: '', description: '' });
        setIsSuccess(false);
        setError('');
    };

    // 1. MÀN HÌNH THÀNH CÔNG
    if (isSuccess) {
        return (
            <div className="transfer-container">
                <div className="success-screen">
                    <div className="success-icon">✅</div>
                    <div className="success-text">Chuyển tiền thành công!</div>
                    <p>Số tiền <strong>{parseFloat(formData.amount).toLocaleString()} VNĐ</strong> đã được chuyển đến tài khoản <strong>{formData.toAccount}</strong>.</p>
                    <button className="new-transfer-btn" onClick={handleNewTransfer}>
                        Thực hiện giao dịch khác
                    </button>
                </div>
            </div>
        );
    }

    // 2. MÀN HÌNH NHẬP FORM CHUYỂN TIÊN
    return (
        <div className="transfer-container">
            <h2 className="transfer-title">Chuyển Tiền Liên Ngân Hàng</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Số tài khoản người nhận</label>
                    <input 
                        type="text" 
                        name="toAccount"
                        className="form-input" 
                        placeholder="Nhập số tài khoản..." 
                        value={formData.toAccount}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Số tiền cần chuyển (VNĐ)</label>
                    <input 
                        type="number" 
                        name="amount"
                        className="form-input" 
                        placeholder="0" 
                        value={formData.amount}
                        onChange={handleChange}
                        required
                    />
                    {error && <div className="error-message">{error}</div>}
                </div>

                <div className="form-group">
                    <label className="form-label">Nội dung chuyển tiền (Tùy chọn)</label>
                    <input 
                        type="text" 
                        name="description"
                        className="form-input" 
                        placeholder="VD: Nguyen Van A chuyen tien" 
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Xác Nhận Chuyển Tiền'}
                </button>
            </form>
        </div>
    );
};

export default Transfer;