// src/pages/User/BillPay.jsx
import React, { useState } from 'react';
import txService from '../../services/tx.service';
import './BillPay.css';
import '../User/Transfer.css'; // Tái sử dụng class input từ trang Transfer

const BillPay = () => {
    const [billType, setBillType] = useState('ELECTRIC');
    const [formData, setFormData] = useState({ billCode: '', amount: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSelectService = (type) => {
        setBillType(type);
        setFormData({ billCode: '', amount: '' }); // Reset form khi đổi dịch vụ
        setMessage('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        try {
            const payload = {
                billType: billType,
                billCode: formData.billCode,
                amount: parseFloat(formData.amount),
            };
            await txService.payBill(payload);
            setMessage('✅ Thanh toán hóa đơn thành công!');
            setFormData({ billCode: '', amount: '' });
        } catch (error) {
            setMessage('❌ Lỗi: ' + (error.response?.data?.message || 'Không thể thanh toán'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bill-container">
            <h2 className="bill-title">Thanh Toán Dịch Vụ</h2>
            
            {/* Lưới chọn loại dịch vụ */}
            <div className="service-grid">
                <div className={`service-card ${billType === 'ELECTRIC' ? 'selected' : ''}`} onClick={() => handleSelectService('ELECTRIC')}>
                    <div className="service-icon">⚡</div>
                    <div>Tiền Điện</div>
                </div>
                <div className={`service-card ${billType === 'WATER' ? 'selected' : ''}`} onClick={() => handleSelectService('WATER')}>
                    <div className="service-icon">💧</div>
                    <div>Tiền Nước</div>
                </div>
                <div className={`service-card ${billType === 'INTERNET' ? 'selected' : ''}`} onClick={() => handleSelectService('INTERNET')}>
                    <div className="service-icon">🌐</div>
                    <div>Internet / 4G</div>
                </div>
            </div>

            {/* Form nhập liệu */}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Mã khách hàng / Số hợp đồng</label>
                    <input 
                        type="text" 
                        name="billCode"
                        className="form-input" 
                        placeholder="Nhập mã thanh toán..." 
                        value={formData.billCode}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Số tiền cần thanh toán (VNĐ)</label>
                    <input 
                        type="number" 
                        name="amount"
                        className="form-input" 
                        placeholder="0" 
                        value={formData.amount}
                        onChange={handleChange}
                        required
                    />
                </div>

                {message && <div style={{ marginBottom: '15px', color: message.includes('✅') ? 'green' : 'red', textAlign: 'center' }}>{message}</div>}

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Thanh Toán Ngay'}
                </button>
            </form>
        </div>
    );
};

export default BillPay;