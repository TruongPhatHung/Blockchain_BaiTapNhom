// src/pages/Admin/AuditLogs.jsx
import React, { useState } from 'react';
import './AuditLogs.css'; // Liên kết với file CSS ở Bước 2

const AuditLogs = () => {
    // Sử dụng state để lưu dữ liệu giả lập, sau này bạn chỉ cần thay bằng dữ liệu từ API
    const [logs, setLogs] = useState([
        { id: 1, timestamp: '2026-07-17 10:30:00', actor: 'admin01', action: 'Tạo tài khoản mới: nguyenvana', status: 'SUCCESS' },
        { id: 2, timestamp: '2026-07-17 10:35:12', actor: 'admin01', action: 'Khóa tài khoản: tranthib', status: 'SUCCESS' },
        { id: 3, timestamp: '2026-07-17 11:00:00', actor: 'system', action: 'Quét toàn vẹn Sổ Cái Blockchain', status: 'WARNING' },
        { id: 4, timestamp: '2026-07-17 11:45:00', actor: 'staff02', action: 'Cập nhật phân quyền thất bại', status: 'ERROR' },
    ]);

    return (
        <div className="audit-logs-container">
            <div className="audit-logs-header">
                <h2 className="audit-logs-title">Nhật Ký Hệ Thống (Audit Logs)</h2>
                <p className="audit-logs-subtitle">
                    Hiển thị lịch sử các thao tác quan trọng trên hệ thống. Dữ liệu được bảo vệ và chống sửa đổi.
                </p>
            </div>

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
                    {logs.map((log) => (
                        <tr key={log.id}>
                            <td>{log.id}</td>
                            <td>{log.timestamp}</td>
                            <td><strong>{log.actor}</strong></td>
                            <td>{log.action}</td>
                            <td>
                                {/* Gắn class động dựa trên trạng thái (SUCCESS, WARNING, ERROR) */}
                                <span className={`log-status status-${log.status.toLowerCase()}`}>
                                    {log.status === 'SUCCESS' ? 'Thành công' : log.status === 'WARNING' ? 'Cảnh báo' : 'Thất bại'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AuditLogs;