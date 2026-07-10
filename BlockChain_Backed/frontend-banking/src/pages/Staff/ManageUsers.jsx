// src/pages/Staff/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import staffService from '../../services/staff.service';
import './ManageUsers.css'; // Chỉ gọi CSS của riêng nó

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await staffService.getUsers();
                setUsers(data);
            } catch (error) {
                console.error("Lỗi lấy danh sách:", error);
                setUsers([
                    { id: 1, username: 'nguyenvana', fullName: 'Nguyễn Văn A', accountNumber: '99998888', status: 'ACTIVE' },
                    { id: 2, username: 'tranthib', fullName: 'Trần Thị B', accountNumber: '77776666', status: 'LOCKED' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const toggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        try {
            await staffService.updateUserStatus(userId, newStatus);
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            alert('Có lỗi xảy ra khi cập nhật trạng thái!');
        }
    };

    return (
        <div className="manage-users-container">
            <div className="manage-users-header">
                <h2 className="manage-users-title">Quản Lý Khách Hàng</h2>
            </div>
            
            {loading ? <p>Đang tải dữ liệu...</p> : (
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên Đăng Nhập</th>
                            <th>Họ Tên</th>
                            <th>Số Tài Khoản</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.username}</td>
                                <td>{u.fullName}</td>
                                <td>{u.accountNumber}</td>
                                <td className={u.status === 'ACTIVE' ? 'status-active' : 'status-locked'}>
                                    {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                                </td>
                                <td>
                                    <button 
                                        className={`btn-status ${u.status === 'ACTIVE' ? 'btn-lock' : 'btn-unlock'}`}
                                        onClick={() => toggleStatus(u.id, u.status)}
                                    >
                                        {u.status === 'ACTIVE' ? 'Khóa TK' : 'Mở Khóa'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageUsers;