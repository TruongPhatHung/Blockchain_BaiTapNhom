// src/pages/Staff/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import staffService from '../../services/staff.service';
import './ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        role: 'USER',
        accountTier: 'STANDARD'
    });

    // 1. LẤY DỮ LIỆU THẬT KHI MỞ TRANG
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Gọi API lấy toàn bộ danh sách người dùng từ Backend
                const data = await staffService.getUsers();
                setUsers(data);
            } catch (error) {
                console.error("Lỗi lấy danh sách người dùng:", error);
                alert("Không thể tải dữ liệu từ máy chủ!");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // 2. CẬP NHẬT TRẠNG THÁI THẬT XUỐNG DATABASE
    const toggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        try {
            // Giả định bạn dùng API updateUser để cập nhật riêng trường status
            await staffService.updateUser(userId, { status: newStatus });

            // Cập nhật lại giao diện sau khi API báo thành công
            setUsers(users.map(u => u.username === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi cập nhật trạng thái trên máy chủ!');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditClick = (user) => {
        setIsEditMode(true);
        setCurrentUserId(user.id);
        setFormData({
            username: user.username,
            password: '',
            fullName: user.fullName,
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            role: user.role || 'USER',
            accountTier: user.accountTier || 'STANDARD'
        });
        setShowModal(true);
    };

    const handleCreateClick = () => {
        setIsEditMode(false);
        setCurrentUserId(null);
        setFormData({
            username: '', password: '', fullName: '',
            email: '', phoneNumber: '', role: 'USER', accountTier: 'STANDARD'
        });
        setShowModal(true);
    };

    // 3. LƯU DỮ LIỆU THẬT (TẠO MỚI HOẶC SỬA)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isEditMode) {
                // Gọi API PUT để cập nhật
                const updatedUser = await staffService.updateUser(currentUserId, formData);

                // Cập nhật state để giao diện hiển thị ngay lập tức
                setUsers(users.map(u => u.username === currentUserId ? { ...u, ...updatedUser } : u));
                alert("Cập nhật tài khoản thành công!");
            } else {
                // Gọi API POST để tạo mới
                const createdUser = await staffService.createUser(formData);

                // Thêm người dùng mới trả về từ Backend vào đầu danh sách
                setUsers([createdUser, ...users]);
                alert(`Tạo tài khoản thành công!`);
            }
            setShowModal(false);
        } catch (error) {
            console.error("Lỗi lưu dữ liệu:", error);
            alert("Có lỗi xảy ra khi lưu dữ liệu, vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="manage-users-container">
            <div className="manage-users-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="manage-users-title">Quản Lý Tài Khoản</h2>
                <button className="btn-add-user" onClick={handleCreateClick}>
                    + Tạo Tài Khoản
                </button>
            </div>

            {loading ? <p>Đang tải dữ liệu từ hệ thống...</p> : (
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Tên Đăng Nhập</th>
                            <th>Họ Tên</th>
                            <th>Số Tài Khoản</th>
                            <th>Quyền / Hạng</th>
                            <th>Trạng Thái</th>
                            <th style={{ textAlign: 'center' }}>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.username}>
                                <td><strong>{u.username}</strong></td>
                                <td>{u.fullName}</td>
                                <td>{u.accountNumber || 'Chưa cấp'}</td>
                                <td>
                                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{u.role}</span>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: u.accountTier === 'PREMIUM' ? '#d97706' : '#2563eb' }}>
                                        {u.accountTier}
                                    </span>
                                </td>
                                <td className={u.status === 'ACTIVE' ? 'status-active' : 'status-locked'}>
                                    {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                                </td>
                                <td className="action-buttons">
                                    <button
                                        className="btn-action btn-edit"
                                        onClick={() => handleEditClick(u)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className={`btn-action ${u.status === 'ACTIVE' ? 'btn-lock' : 'btn-unlock'}`}
                                        onClick={() => toggleStatus(u.id, u.status)}
                                    >
                                        {u.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-lg">
                        <h3>{isEditMode ? 'Cập Nhật Tài Khoản' : 'Tạo Tài Khoản Mới'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Tên đăng nhập (*)</label>
                                    <input
                                        type="text" name="username" value={formData.username}
                                        onChange={handleInputChange} required
                                        disabled={isEditMode}
                                        style={{ backgroundColor: isEditMode ? '#f1f5f9' : '#ffffff' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        Mật khẩu {isEditMode ? '(Bỏ trống nếu không đổi)' : '(*)'}
                                    </label>
                                    <input
                                        type="password" name="password" value={formData.password}
                                        onChange={handleInputChange}
                                        required={!isEditMode}
                                        placeholder={isEditMode ? "Nhập mật khẩu mới..." : ""}
                                    />
                                </div>

                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Họ và tên (*)</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                                </div>

                                <div className="form-group">
                                    <label>Phân quyền</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange}>
                                        <option value="USER">Khách hàng (USER)</option>
                                        <option value="STAFF">Nhân viên (STAFF)</option>
                                        <option value="ADMIN">Quản trị viên (ADMIN)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Hạng tài khoản</label>
                                    <select name="accountTier" value={formData.accountTier} onChange={handleInputChange}>
                                        <option value="STANDARD">Hạng Thường (STANDARD)</option>
                                        <option value="PREMIUM">Hạng Cao Cấp (PREMIUM)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Xác nhận tạo')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;