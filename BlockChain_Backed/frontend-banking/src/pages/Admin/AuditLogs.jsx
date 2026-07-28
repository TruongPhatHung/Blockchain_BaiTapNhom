// src/pages/Admin/AuditLogs.jsx
import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import { RefreshCw } from 'lucide-react'; // Lấy icon làm mới
import './AuditLogs.css';

const AuditLogs = () => {
    // Các State quản lý dữ liệu và trạng thái trang
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm gọi API lấy dữ liệu thật
    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminService.getAuditLogs();
            setLogs(data);
        } catch (err) {
            console.error("Lỗi khi tải nhật ký:", err);
            setError("Không thể tải nhật ký hệ thống. Vui lòng kiểm tra lại kết nối.");
        } finally {
            setLoading(false);
        }
    };

    // Tự động chạy hàm fetchLogs một lần khi trang vừa được mở
    useEffect(() => {
        fetchLogs();
    }, []);

    // Hàm phụ trợ: Định dạng thời gian cho dễ nhìn (VD: 26/07/2026 10:30:00)
    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN');
    };

    return (
        <div className="audit-logs-container">
            <div className="audit-logs-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="audit-logs-title">Nhật Ký Hệ Thống (Audit Logs)</h2>
                    <p className="audit-logs-subtitle">
                        Hiển thị lịch sử các thao tác quan trọng trên hệ thống. Dữ liệu được bảo vệ và chống sửa đổi.
                    </p>
                </div>

                {/* Nút làm mới dữ liệu thủ công */}
                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                >
                    <RefreshCw size={16} className={loading ? "spinning" : ""} />
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {/* Hiển thị lỗi nếu API sập */}
            {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '5px' }}>{error}</div>}

            <table className="logs-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Thời Gian</th>
                        <th>Người Thực Hiện</th>
                        <th>Hành Động</th>
                        <th>Trạng Thái</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Nếu đang tải, hiển thị thông báo */}
                    {loading && logs.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu từ máy chủ...</td>
                        </tr>
                    ) : logs.length === 0 ? (
                        // Nếu tải xong mà mảng rỗng
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Chưa có nhật ký hệ thống nào.</td>
                        </tr>
                    ) : (
                        // Lặp qua mảng dữ liệu thật từ DB
                        logs.map((log) => (
                            <tr key={log.id}>
                                <td>#{log.id}</td>
                                <td>{formatDateTime(log.timestamp)}</td>
                                <td><strong>{log.actor || 'Hệ thống'}</strong></td>
                                <td>{log.action}</td>
                                <td>
                                    {/* Xử lý CSS dựa trên trạng thái thật */}
                                    <span className={`log-status status-${(log.status || 'SUCCESS').toLowerCase()}`}>
                                        {log.status === 'SUCCESS' ? 'Thành công'
                                            : log.status === 'WARNING' ? 'Cảnh báo'
                                                : log.status === 'ERROR' ? 'Thất bại'
                                                    : log.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AuditLogs;