import React, { useState } from 'react';
import { Zap, Droplets, Wifi, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';
import txService from '../../services/tx.service';
import { useLanguage } from '../../store/LanguageContext'; // IMPORT HOOK NGÔN NGỮ
import './BillPay.css';

const BillPay = () => {
    const { t } = useLanguage(); // KHỞI TẠO HÀM DỊCH

    const [billType, setBillType] = useState('ELECTRIC');
    const [formData, setFormData] = useState({ billCode: '', amount: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Đưa mảng services vào trong component để sử dụng được hàm t()
    const services = [
        { id: 'ELECTRIC', name: t('billElectric') || 'Tiền Điện', icon: Zap },
        { id: 'WATER', name: t('billWater') || 'Tiền Nước', icon: Droplets },
        { id: 'INTERNET', name: t('billInternet') || 'Internet / 4G', icon: Wifi },
    ];

    const handleSelectService = (type) => {
        setBillType(type);
        setFormData({ billCode: '', amount: '' }); 
        setMessage({ type: '', text: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            const payload = {
                billType: billType,
                billCode: formData.billCode,
                amount: parseFloat(formData.amount),
            };
            await txService.payBill(payload);
            setMessage({ type: 'success', text: t('billPaySuccess') || 'Thanh toán hóa đơn thành công!' });
            setFormData({ billCode: '', amount: '' });
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || t('billPayError') || 'Không thể thanh toán, vui lòng thử lại sau.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bill-wrapper">
            <div className="bill-container">
                <div className="bill-header">
                    <Receipt className="header-icon" size={28} />
                    <div>
                        <h2 className="bill-title">{t('billPayTitle') || 'Thanh Toán Dịch Vụ'}</h2>
                        <p className="bill-subtitle">{t('billPaySubtitle') || 'Lựa chọn dịch vụ và nhập thông tin để thanh toán nhanh chóng.'}</p>
                    </div>
                </div>
                
                <div className="service-section-title">{t('selectServiceType') || 'Chọn loại dịch vụ'}</div>
                <div className="service-grid">
                    {services.map((service) => {
                        const IconComponent = service.icon;
                        const isSelected = billType === service.id;
                        return (
                            <div 
                                key={service.id}
                                className={`service-card ${isSelected ? 'selected' : ''}`} 
                                onClick={() => handleSelectService(service.id)}
                            >
                                <div className="service-icon-wrapper">
                                    <IconComponent size={24} strokeWidth={isSelected ? 2.5 : 1.5} />
                                </div>
                                <span className="service-name">{service.name}</span>
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit} className="bill-form">
                    <div className="form-group">
                        <label className="form-label">{t('customerCode') || 'Mã khách hàng / Số hợp đồng'}</label>
                        <input 
                            type="text" 
                            name="billCode"
                            className="form-input" 
                            placeholder={t('customerCodePlaceholder') || 'Vd: PE0123456789'} 
                            value={formData.billCode}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('paymentAmountVND') || 'Số tiền cần thanh toán (VNĐ)'}</label>
                        <div className="input-with-currency">
                            <input 
                                type="number" 
                                name="amount"
                                className="form-input" 
                                placeholder="0" 
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                min="1000"
                            />
                            <span className="currency-suffix">VND</span>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`alert-message ${message.type}`}>
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (t('processingTx') || 'Đang xử lý giao dịch...') : (t('payNow') || 'Thanh Toán Ngay')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BillPay;