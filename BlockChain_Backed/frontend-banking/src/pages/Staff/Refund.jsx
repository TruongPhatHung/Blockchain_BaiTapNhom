// src/pages/Staff/Refund.jsx
import React, { useState } from 'react';
import staffService from '../../services/staff.service';
import './Refund.css'; // Import đúng file CSS của riêng nó

const Refund = () => {
    const [txId, setTxId] = useState('');
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(false);

    // Tìm kiếm giao dịch bị lỗi dựa trên mã ID khách hàng cung cấp
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!txId.trim()) return alert('Vui lòng nhập mã giao dịch!');

        setLoading(true);
        try {
            // Giả lập gọi API tra soát thông tin giao dịch lỗi
            // const data = await staffService.getTransactionDetail(txId);
            // setTransaction(data);

            // Bản mô phỏng dữ liệu lỗi để bạn test giao diện:
            setTransaction({
                id: txId,
                sender: 'Nguyễn Văn A (99998888)',
                receiver: 'Trần Thị B (77776666)',
                amount: '5,000,000 VNĐ',
                time: '2026-07-09 15:20:11',
                status: 'FAILED_BUT_DEDUCTED' // Trạng thái: Lỗi hệ thống nhưng đã trừ tiền khách
            });
        } catch (error) {
            alert('Không tìm thấy mã giao dịch này hoặc có lỗi hệ thống!');
            setTransaction(null);
        } finally {
            setLoading(false);
        }
    };

    // Hành động 1: Tạo lệnh hoàn tác (Trả lại tiền về cho người gửi)
    const handleCreateRefund = async () => {
        if (!window.confirm(`Xác nhận TẠO LỆNH HOÀN TÁC số tiền của giao dịch #${transaction.id}?`)) return;
        
        try {
            // await staffService.createRefundOrder(transaction.id);
            alert('🎉 Lệnh hoàn tác đã được tạo thành công! Tiền đang được chuyển trả lại ví gốc.');
            setTransaction(null);
            setTxId('');
        } catch (error) {
            alert('Lỗi khi tạo lệnh hoàn tác!');
        }
    };

    // Hành động 2: Khởi tạo hồ sơ/yêu cầu đền bù
    const handleInitCompensation = async () => {
        if (!window.confirm(`Xác nhận KHỞI TẠO YÊU CẦU ĐỀN BÙ cho giao dịch lỗi này?`)) return;
        
        try {
            // await staffService.initiateCompensation(transaction.id);
            alert('📋 Đã chuyển tiếp yêu cầu đền bù lên phòng ban thẩm định phê duyệt hồ sơ.');
            setTransaction(null);
            setTxId('');
        } catch (error) {
            alert('Lỗi khi khởi tạo đền bù!');
        }
    };

    return (
        <div className="refund-container">
            <div className="refund-header">
                <h2 className="refund-title">Xử Lý & Tra Soát Giao Dịch Lỗi</h2>
            </div>

            {/* Form nhập mã tìm kiếm */}
            <form onSubmit={handleSearch} className="search-box">
                <input 
                    type="text" 
                    className="search-input"
                    placeholder="Nhập mã giao dịch cần tra soát (Ví dụ: TX99201)..."
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                />
                <button type="submit" className="btn-search">
                    {loading ? 'Đang tìm...' : 'Tra Soát'}
                </button>
            </form>

            {/* Chi tiết giao dịch tìm thấy và các hành động xử lý khắc phục */}
            {transaction && (
                <div className="tx-detail-section">
                    <div className="tx-detail-card">
                        <h3 className="tx-detail-title">🔍 Kết Quả Tra Soát Giao Dịch #{transaction.id}</h3>
                        <div className="tx-info-grid">
                            <div className="tx-info-item"><span>Người gửi:</span> {transaction.sender}</div>
                            <div className="tx-info-item"><span>Người nhận:</span> {transaction.receiver}</div>
                            <div className="tx-info-item"><span>Số tiền:</span> <strong style={{color: '#f5222d'}}>{transaction.amount}</strong></div>
                            <div className="tx-info-item"><span>Thời gian:</span> {transaction.time}</div>
                            <div className="tx-info-item">
                                <span>Trạng thái sự cố:</span> 
                                <span style={{color: '#fa8c16', marginLeft: '5px', fontWeight: 'bold'}}>
                                    Lỗi hệ thống ngân hàng (Đã trừ tiền nguồn)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nút bấm chức năng dựa theo nghiệp vụ trong sổ ghi chép */}
                    <div className="action-group">
                        <button className="btn-action btn-refund-trigger" onClick={handleCreateRefund}>
                            🔄 Tạo Lệnh Hoàn Tác (Refund)
                        </button>
                        <button className="btn-action btn-compensate-trigger" onClick={handleInitCompensation}>
                            🎁 Khởi Tạo Yêu Cầu Đền Bù
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Refund;