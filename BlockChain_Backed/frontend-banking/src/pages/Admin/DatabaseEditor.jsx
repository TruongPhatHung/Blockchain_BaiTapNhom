// src/pages/Admin/DatabaseEditor.jsx
import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import { AlertTriangle } from 'lucide-react';
import './DatabaseEditor.css';

const DatabaseEditor = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // 1. Chỉ giữ lại đúng MỘT hàm fetchTransactions sạch sẽ
    const fetchTransactions = async () => {
        try {
            setLoading(true);
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

    // 2. Gọi hàm trên khi trang vừa mở
    useEffect(() => {
        fetchTransactions();
    }, []);

    // 3. Hàm xử lý khi gõ phím vào ô input
    const handleInputChange = (txId, field, value) => {
        setEditForm(prev => ({
            ...prev,
            [txId]: {
                ...prev[txId],
                [field]: value
            }
        }));
    };

    // 4. Hàm Lưu ngầm vào Database
    const handleSaveToDB = async (txId) => {
        setSavingId(txId);
        try {
            const tamperedData = editForm[txId];
            // Gọi xuống API của Spring Boot
            await adminService.tamperTransaction(txId, tamperedData);

            alert(`THÀNH CÔNG: Đã lưu lén dữ liệu Khối #${txId} vào Cơ sở dữ liệu!`);

            // Tải lại bảng để hiển thị số tiền mới vừa sửa
            await fetchTransactions();
        } catch (error) {
            alert("LỖI: Không thể can thiệp DB. Vui lòng kiểm tra lại kết nối.");
            console.error(error);
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="db-editor-container">
            <div className="db-editor-header">
                <h2 className="db-editor-title">
                    <AlertTriangle size={24} /> Trình Can Thiệp Dữ Liệu Ngầm
                </h2>
                <p className="db-editor-subtitle">
                    Khu vực mô phỏng thao tác truy cập trực tiếp vào SQL. Việc sửa dữ liệu tại đây sẽ phá vỡ cấu trúc mã băm (Hash) của Blockchain.
                </p>
            </div>

            {loading ? (
                <div className="loading-text">Đang kết nối Database...</div>
            ) : (
                <div className="db-table-wrapper">
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
                                    <td><span className="tx-id-badge">#{tx.transactionId}</span></td>
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
                </div>
            )}
        </div>
    );
};

export default DatabaseEditor;