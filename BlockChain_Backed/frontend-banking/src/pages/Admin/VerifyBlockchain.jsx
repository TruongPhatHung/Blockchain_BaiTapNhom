import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
            // Gọi API kiểm tra và so sánh DB với Blockchain
            const response = await api.get('/admin/verify-blockchain');
            setAuditList(response.data);
        } catch (error) {
            console.error("Lỗi đối soát dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-container">
            <div className="verify-header">
                <h2>🛡️ Kiểm Thử & Truy Tố Dữ Liệu Blockchain</h2>
                <button className="btn-refresh" onClick={fetchVerificationData}>
                    🔄 Tải lại & Đối soát
                </button>
            </div>

            {loading ? (
                <div className="loading">Đang đối soát dữ liệu với Ledger...</div>
            ) : (
                <div className="audit-table-wrapper">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>Block #</th>
                                <th>Mã Giao Dịch</th>
                                <th>Trạng Thái</th>
                                <th>Dữ Liệu Trong Database (Hiện tại)</th>
                                <th>Dữ Liệu Gốc Blockchain (Ledger)</th>
                                <th>Hành Động Truy Tố</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditList.map((item, index) => {
                                const isTampered = item.isTampered; // Boolean từ backend trả về

                                return (
                                    <tr key={index} className={isTampered ? "row-tampered" : "row-valid"}>
                                        <td><strong>#{item.blockIndex}</strong></td>
                                        <td><code>{item.transactionId}</code></td>

                                        {/* Cột trạng thái */}
                                        <td>
                                            {isTampered ? (
                                                <span className="badge badge-danger">🚨 BỊ CHỈNH SỬA</span>
                                            ) : (
                                                <span className="badge badge-success">✅ HỢP LỆ</span>
                                            )}
                                        </td>

                                        {/* Dữ liệu Database hiện tại */}
                                        <td className="data-cell">
                                            <div><strong>Tài khoản:</strong> {item.dbData?.accountNumber}</div>
                                            <div className={isTampered && item.dbData?.amount !== item.blockchainData?.amount ? "highlight-diff" : ""}>
                                                <strong>Số tiền:</strong> {item.dbData?.amount?.toLocaleString()} VNĐ
                                            </div>
                                            <div><strong>Nội dung:</strong> {item.dbData?.description}</div>
                                        </td>

                                        {/* Dữ liệu Gốc Blockchain */}
                                        <td className="data-cell">
                                            <div><strong>Tài khoản:</strong> {item.blockchainData?.accountNumber}</div>
                                            <div>
                                                <strong>Số tiền gốc:</strong> {item.blockchainData?.amount?.toLocaleString()} VNĐ
                                            </div>
                                            <div><strong>Nội dung:</strong> {item.blockchainData?.description}</div>
                                        </td>

                                        {/* Cột Chi tiết Hash & Truy tố */}
                                        <td className="action-cell">
                                            <div className="hash-box">
                                                <small><strong>Current Hash (DB):</strong></small>
                                                <div className="hash-text">{item.currentHash}</div>
                                                <small><strong>Original Hash (Chain):</strong></small>
                                                <div className="hash-text">{item.previousHash}</div>
                                            </div>
                                            {isTampered && (
                                                <div className="alert-box">
                                                    ⚠️ Phát hiện sai lệch giá trị! Dữ liệu DB đã bị can thiệp trái phép.
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