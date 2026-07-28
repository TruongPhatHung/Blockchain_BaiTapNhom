// src/pages/Admin/VerifyBlockchain.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import adminService from '../../services/admin.service'; // ĐÃ SỬA: Thêm import này
import { ShieldCheck, RefreshCw, RotateCcw } from 'lucide-react'; // ĐÃ SỬA: Thêm icon
import './VerifyBlockchain.css';

const VerifyBlockchain = () => {
    const [auditList, setAuditList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVerificationData();
    }, []);

    const fetchVerificationData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/verify-blockchain');
            setAuditList(response.data);
        } catch (error) {
            console.error("Lỗi đối soát dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    // ĐÃ SỬA: Tách hàm khôi phục riêng biệt và nhận đúng ID của khối
    const handleRestore = async (txId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn khôi phục dữ liệu gốc cho Khối #${txId}?`)) {
            return;
        }

        try {
            const responseMessage = await adminService.restoreTransaction(txId);

            // Báo thành công
            alert(`✅ THÀNH CÔNG: ${responseMessage}`);
            await adminService.restoreTransaction(txId);
            alert(`Thành công! Khối #${txId} đã được khôi phục về nguyên bản.`);
            fetchVerificationData(); // Tải lại bảng để thấy kết quả xanh an toàn
        } catch (error) {
            // Bóc tách câu thông báo lỗi thực sự từ Backend trả về
            const backendErrorMsg = error.response?.data || error.message;

            // Báo lỗi chi tiết
            alert(`❌ THẤT BẠI: ${backendErrorMsg}\n\n(Gợi ý: Có thể khối dữ liệu này quá cũ và chưa có bản sao lưu)`);
            console.error("Chi tiết lỗi khôi phục:", error);
        }
    };

    return (
        <div className="verify-container">
            <div className="verify-header">
                <h2><ShieldCheck size={26} color="#3b82f6" /> Kiểm Thử & Truy Tố Dữ Liệu</h2>
                <button className="btn-refresh" onClick={fetchVerificationData} disabled={loading}>
                    <RefreshCw size={18} className={loading ? "spinning" : ""} />
                    {loading ? "Đang đối soát..." : "Tải lại & Đối soát"}
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Hệ thống đang quét toàn bộ chuỗi khối để tìm điểm bất thường...
                </div>
            ) : (
                <div className="audit-table-wrapper">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>Block #</th>
                                <th>Trạng Thái</th>
                                <th>Dữ Liệu Database (Hiện tại)</th>
                                <th>Dữ Liệu Gốc Blockchain</th>
                                <th>Hành Động Truy Tố</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditList.map((item, index) => {
                                const isTampered = item.isTampered;

                                return (
                                    <tr key={index} className={isTampered ? "row-tampered" : "row-valid"}>
                                        <td><strong>#{item.blockIndex}</strong><br /><code>ID:{item.transactionId}</code></td>

                                        <td>
                                            {isTampered ? (
                                                <span className="badge badge-danger">🚨 BỊ CHỈNH SỬA</span>
                                            ) : (
                                                <span className="badge badge-success">✅ HỢP LỆ</span>
                                            )}
                                        </td>

                                        <td className="data-cell">
                                            <div><strong>Tài khoản:</strong> {item.dbData?.accountNumber}</div>
                                            <div className={isTampered && item.dbData?.amount !== item.blockchainData?.amount ? "highlight-diff" : ""}>
                                                <strong>Số tiền:</strong> {item.dbData?.amount?.toLocaleString()} VNĐ
                                            </div>
                                            <div><strong>Nội dung:</strong> {item.dbData?.description}</div>
                                        </td>

                                        <td className="data-cell">
                                            <div><strong>Tài khoản:</strong> {item.blockchainData?.accountNumber}</div>
                                            <div><strong>Số tiền gốc:</strong> {item.blockchainData?.amount?.toLocaleString()} VNĐ</div>
                                            <div><strong>Nội dung:</strong> {item.blockchainData?.description}</div>
                                        </td>

                                        <td className="action-cell">
                                            <div className="hash-box">
                                                <small><strong>Current Hash (DB):</strong></small>
                                                <div className="hash-text">{item.currentHash}</div>
                                                <small><strong>Original Hash (Chain):</strong></small>
                                                <div className="hash-text">{item.previousHash}</div>
                                            </div>

                                            {/* ĐÃ SỬA: Nút khôi phục chỉ xuất hiện ở những dòng bị lỗi */}
                                            {isTampered && (
                                                <div>
                                                    <div className="alert-box">⚠️ Dữ liệu đã bị can thiệp!</div>
                                                    <button
                                                        className="btn-restore"
                                                        onClick={() => handleRestore(item.transactionId)}
                                                    >
                                                        <RotateCcw size={16} /> Khôi Phục Dữ Liệu
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VerifyBlockchain;