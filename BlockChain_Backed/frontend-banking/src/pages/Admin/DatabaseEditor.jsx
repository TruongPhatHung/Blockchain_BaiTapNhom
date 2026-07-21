// src/pages/Admin/DatabaseEditor.jsx
import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import './DatabaseEditor.css';

const DatabaseEditor = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);

    // State lưu trữ dữ liệu đang được nhập trên các ô
    const [editForm, setEditForm] = useState({});

    // ĐÃ SỬA LỖI: Chỉ có đúng MỘT hàm fetchTransactions ở đây
    const fetchTransactions = async () => {
        try {
            // Sử dụng API lấy dữ liệu thô từ Database
            const data = await adminService.getRawDatabaseRecords();
            setTransactions(data);

            const initialFormState = {};
            data.forEach(tx => {
                initialFormState[tx.transactionId] = {
                    amount: tx.amount,
                    description: tx.description
                };
            });
            setEditForm(initialFormState);
        } catch (error) {
            console.error("Lỗi tải dữ liệu DB:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);
    
    const handleInputChange = (txId, field, value) => {
        setEditForm(prev => ({
            ...prev,
            [txId]: {
                ...prev[txId],
                [field]: value
            }
        }));
    };

    const handleSaveToDB = async (txId) => {
        setSavingId(txId);
        try {
            const tamperedData = editForm[txId];
            await adminService.tamperTransaction(txId, tamperedData);
            alert(`THÀNH CÔNG: Đã lưu lén dữ liệu Khối #${txId} vào Cơ sở dữ liệu!`);
        } catch (error) {
            alert("LỖI: Hãy đảm bảo Backend đã có API /admin/tamper");
            console.error(error);
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="db-editor-container">
            <div className="db-editor-header">
                <h2 className="db-editor-title">⚠️ Trình can thiệp Cơ sở dữ liệu (Database Editor)</h2>
                <p className="db-editor-subtitle">
                    Khu vực mô phỏng thao tác truy cập trực tiếp vào SQL. Việc sửa dữ liệu tại đây sẽ phá vỡ cấu trúc mã băm (Hash) của Blockchain.
                </p>
            </div>

            {loading ? (
                <p>Đang kết nối Database...</p>
            ) : (
                <table className="db-table">
                    <thead>
                        <tr>
                            <th>Mã Khối (TxID)</th>
                            <th>Người Gửi</th>
                            <th>Người Nhận</th>
                            <th>Số Tiền (Có thể sửa)</th>
                            <th>Nội Dung (Có thể sửa)</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.transactionId}>
                                <td><strong>#{tx.transactionId}</strong></td>
                                <td>{tx.senderAccount}</td>
                                <td>{tx.receiverAccount}</td>
                                <td>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        className="tamper-input"
                                        value={editForm[tx.transactionId]?.amount || ''}
                                        onChange={(e) => handleInputChange(tx.transactionId, 'amount', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="tamper-input"
                                        value={editForm[tx.transactionId]?.description || ''}
                                        onChange={(e) => handleInputChange(tx.transactionId, 'description', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <button
                                        className="btn-save-tamper"
                                        disabled={savingId === tx.transactionId}
                                        onClick={() => handleSaveToDB(tx.transactionId)}
                                    >
                                        {savingId === tx.transactionId ? 'Đang lưu...' : 'Lưu lén vào DB'}
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

export default DatabaseEditor;