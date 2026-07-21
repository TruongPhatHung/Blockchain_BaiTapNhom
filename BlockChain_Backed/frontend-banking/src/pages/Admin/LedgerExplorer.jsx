// src/pages/Admin/LedgerExplorer.jsx
import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import { ShieldCheck, ShieldAlert, Edit3, X, RefreshCw } from 'lucide-react';
import './LedgerExplorer.css'; // Import file CSS chúng ta vừa tạo

const LedgerExplorer = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [verifyStatus, setVerifyStatus] = useState(null);
    const [verifyMessage, setVerifyMessage] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const [editingBlock, setEditingBlock] = useState(null);
    const [tamperForm, setTamperForm] = useState({ amount: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const data = await adminService.getLedger();
            setBlocks(data);
        } catch (error) {
            console.error("Lỗi khi lấy sổ cái:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, []);

    const handleVerify = async () => {
        setIsVerifying(true);
        setVerifyStatus(null);
        try {
            const message = await adminService.verifyBlockchain();
            setVerifyStatus('SAFE');
            setVerifyMessage(message || 'Dữ liệu Blockchain an toàn và toàn vẹn!');
        } catch (error) {
            setVerifyStatus('TAMPERED');
            setVerifyMessage(error.response?.data || 'CẢNH BÁO: Phát hiện dữ liệu bị can thiệp trái phép!');
        } finally {
            setIsVerifying(false);
        }
    };

    const openTamperModal = (block) => {
        setEditingBlock(block);
        setTamperForm({
            amount: block.amount || 0,
            description: block.description || ''
        });
    };

    const handleTamperSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await adminService.tamperTransaction(editingBlock.transactionId, tamperForm);
            alert("Đã lưu dữ liệu sai lệch vào Database thành công!");
            setEditingBlock(null);
            fetchLedger();
            setVerifyStatus(null);
        } catch (error) {
            alert("Lỗi: Không thể sửa dữ liệu. Backend cần mở API /admin/tamper.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="ledger-container">

            <div className="ledger-header-wrapper">
                <h2 className="ledger-title">Sổ Cái Blockchain</h2>

                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchLedger}>
                        <RefreshCw size={16} /> Làm mới
                    </button>
                    <button
                        className="btn-verify"
                        onClick={handleVerify}
                        disabled={isVerifying}
                    >
                        {isVerifying ? 'Đang quét khối...' : <><ShieldCheck size={18} /> Kiểm tra tính toàn vẹn</>}
                    </button>
                </div>
            </div>

            {verifyStatus && (
                <div className={`verify-status-box ${verifyStatus === 'SAFE' ? 'status-safe' : 'status-tampered'}`}>
                    {verifyStatus === 'SAFE' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                    <strong>{verifyMessage}</strong>
                </div>
            )}

            {loading ? (
                <p>Đang tải dữ liệu từ chuỗi khối...</p>
            ) : (
                <div className="block-list">
                    {blocks.map((block) => (
                        <div key={block.transactionId} className="block-card">
                            <div className="block-card-header">
                                <div className="block-header-info">
                                    <strong className="block-id">Khối #{block.transactionId}</strong>
                                    <span className="block-time">
                                        {new Date(block.timestamp).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <button
                                    className="btn-tamper"
                                    onClick={() => openTamperModal(block)}
                                >
                                    <Edit3 size={14} /> Sửa (Giả mạo) DB
                                </button>
                            </div>

                            <div className="block-details">
                                <div><strong>Từ:</strong> {block.senderAccount}</div>
                                <div><strong>Đến:</strong> {block.receiverAccount}</div>
                                <div><strong>Số tiền:</strong> <span className="text-amount">{block.amount} ETH</span></div>
                                <div><strong>Nội dung:</strong> {block.description}</div>
                            </div>

                            <div className="block-hashes">
                                <div className="hash-row"><span className="hash-label">Tx Hash (On-chain):</span> {block.onChainTxHash || 'N/A'}</div>
                                <div className="hash-row"><span className="hash-label">DB Block Hash:</span> {block.blockHash}</div>
                                <div className="hash-row"><span className="hash-label">DB Prev Hash:</span> {block.previousHash}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingBlock && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Giả mạo dữ liệu Khối #{editingBlock.transactionId}</h3>
                            <button className="btn-close" onClick={() => setEditingBlock(null)}><X size={20} /></button>
                        </div>
                        <p className="modal-warning">
                            Hành động này sẽ sửa trực tiếp dữ liệu trong SQL nhưng KHÔNG cập nhật lại Block Hash. Hãy dùng nút "Kiểm tra toàn vẹn" sau đó để xem Blockchain phát hiện gian lận.
                        </p>

                        <form onSubmit={handleTamperSubmit}>
                            <div className="form-group">
                                <label className="form-label">Sửa số tiền (ETH)</label>
                                <input
                                    className="form-input"
                                    type="number" step="0.0001"
                                    value={tamperForm.amount}
                                    onChange={(e) => setTamperForm({ ...tamperForm, amount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sửa nội dung</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={tamperForm.description}
                                    onChange={(e) => setTamperForm({ ...tamperForm, description: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setEditingBlock(null)}>Hủy</button>
                                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang lưu...' : 'Thực hiện giả mạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LedgerExplorer;