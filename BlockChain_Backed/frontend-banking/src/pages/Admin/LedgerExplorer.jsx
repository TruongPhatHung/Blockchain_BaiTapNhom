import { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import { ShieldCheck, ShieldAlert, RefreshCw, AlertTriangle, X, Search } from 'lucide-react';
import './LedgerExplorer.css';

const LedgerExplorer = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Quản lý trạng thái đối soát
    const [verifyStatus, setVerifyStatus] = useState(null); // 'SAFE' | 'TAMPERED' | null
    const [verifyMessage, setVerifyMessage] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Danh sách các transactionId bị phát hiện sửa đổi
    const [tamperedIds, setTamperedIds] = useState([]);

    // Block đang được chọn để xem chi tiết sai lệch
    const [selectedTamperedBlock, setSelectedTamperedBlock] = useState(null);

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

    // Hàm kiểm tra toàn vẹn
    const handleVerify = async () => {
        setIsVerifying(true);
        setVerifyStatus(null);
        try {
            // Nếu Backend trả về 200 OK -> Blockchain an toàn
            const response = await adminService.verifyBlockchain();
            setVerifyStatus('SAFE');
            setVerifyMessage(typeof response === 'string' ? response : 'Dữ liệu Blockchain an toàn và toàn vẹn!');
        } catch (error) {
            // Nếu Backend trả về 400 -> Phát hiện gian lận
            setVerifyStatus('TAMPERED');

            // Lấy đúng câu văn cảnh báo mà Backend gửi về trong error.response.data
            const serverMessage = error.response?.data;

            if (typeof serverMessage === 'string') {
                setVerifyMessage(serverMessage);
            } else if (serverMessage?.message) {
                setVerifyMessage(serverMessage.message);
            } else {
                setVerifyMessage('CẢNH BÁO: Phát hiện dữ liệu sổ cái đã bị thay đổi trái phép!');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="ledger-container">
            {/* HEADER */}
            <div className="ledger-header-wrapper">
                <h2 className="ledger-title">Sổ Cái Blockchain</h2>

                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchLedger}>
                        <RefreshCw size={16} /> Làm mới
                    </button>
                    <button
                        className={`btn-verify ${isVerifying ? 'loading' : ''}`}
                        onClick={handleVerify}
                        disabled={isVerifying}
                    >
                        {isVerifying ? 'Đang quét Hash...' : <><ShieldCheck size={18} /> Kiểm tra tính toàn vẹn</>}
                    </button>
                </div>
            </div>

            {/* BANNER THÔNG BÁO TỔNG QUAN */}
            {verifyStatus && (
                <div className={`verify-status-box ${verifyStatus === 'SAFE' ? 'status-safe' : 'status-tampered'}`}>
                    {verifyStatus === 'SAFE' ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
                    <div>
                        <h4>{verifyStatus === 'SAFE' ? 'HỆ THỐNG AN TOÀN' : 'PHÁT HIỆN GIAN LẬN'}</h4>
                        <p>{verifyMessage}</p>
                    </div>
                </div>
            )}

            {/* DANH SÁCH CÁC KHỐI BLOCK */}
            {loading ? (
                <p className="loading-text">Đang tải dữ liệu từ chuỗi khối...</p>
            ) : (
                <div className="block-list">
                    {blocks.map((block) => {
                        // Kiểm tra xem block này có nằm trong danh sách bị sửa không
                        const isTampered = tamperedIds.includes(block.transactionId) || block.isTampered;

                        return (
                            <div
                                key={block.transactionId}
                                className={`block-card ${isTampered ? 'block-card-tampered' : ''}`}
                            >
                                <div className="block-card-header">
                                    <div className="block-header-info">
                                        <strong className="block-id">Khối #{block.transactionId}</strong>
                                        <span className="block-time">
                                            {new Date(block.timestamp).toLocaleString('vi-VN')}
                                        </span>
                                    </div>

                                    {/* BADGE BÁO LỖI VÀ NÚT XEM TRUY TỐ */}
                                    {isTampered && (
                                        <div className="tamper-action-group">
                                            <span className="badge-tampered-warning">
                                                <AlertTriangle size={14} /> SAI LỆCH HASH DB
                                            </span>
                                            <button
                                                className="btn-inspect-diff"
                                                onClick={() => setSelectedTamperedBlock(block)}
                                            >
                                                <Search size={14} /> Xem vết sửa
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="block-details">
                                    <div><strong>Từ:</strong> {block.senderAccount}</div>
                                    <div><strong>Đến:</strong> {block.receiverAccount}</div>
                                    <div>
                                        <strong>Số tiền:</strong>
                                        <span className={isTampered ? "text-amount-danger" : "text-amount"}>
                                            {block.amount} ETH
                                        </span>
                                    </div>
                                    <div><strong>Nội dung:</strong> {block.description}</div>
                                </div>

                                <div className="block-hashes">
                                    <div className="hash-row">
                                        <span className="hash-label">Tx Hash (On-chain):</span> {block.onChainTxHash || 'N/A'}
                                    </div>
                                    <div className={`hash-row ${isTampered ? 'hash-mismatch' : ''}`}>
                                        <span className="hash-label">DB Block Hash:</span> {block.blockHash}
                                    </div>
                                    <div className="hash-row">
                                        <span className="hash-label">DB Prev Hash:</span> {block.previousHash}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL TRUY TỐ BẰNG CỨ DỮ LIỆU ĐÃ BỊ SỬA */}
            {selectedTamperedBlock && (
                <div className="modal-overlay">
                    <div className="modal-content modal-inspect">
                        <div className="modal-header">
                            <h3 className="modal-title-danger">
                                🚨 Truy Tố Sai Lệch Khối #{selectedTamperedBlock.transactionId}
                            </h3>
                            <button className="btn-close" onClick={() => setSelectedTamperedBlock(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="inspect-body">
                            <p className="inspect-desc">
                                Dữ liệu trong <strong>Database (SQL)</strong> đã bị thay đổi trực tiếp, khiến Hash tính toán lại không trùng với <strong>Hash gốc trên Blockchain</strong>.
                            </p>

                            <table className="diff-table">
                                <thead>
                                    <tr>
                                        <th>Trường dữ liệu</th>
                                        <th>Dữ liệu hiện tại (Database)</th>
                                        <th>Dữ liệu gốc (Blockchain Ledger)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Số tiền (Amount)</strong></td>
                                        <td className="diff-val-db">{selectedTamperedBlock.amount} ETH</td>
                                        <td className="diff-val-chain">{selectedTamperedBlock.originalAmount || selectedTamperedBlock.amount} ETH</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Nội dung (Description)</strong></td>
                                        <td className="diff-val-db">{selectedTamperedBlock.description}</td>
                                        <td className="diff-val-chain">{selectedTamperedBlock.originalDescription || selectedTamperedBlock.description}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Mã Block Hash</strong></td>
                                        <td className="diff-hash-err">{selectedTamperedBlock.blockHash} (Sai)</td>
                                        <td className="diff-hash-ok">{selectedTamperedBlock.calculatedHash || "Hash gốc toàn vẹn"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setSelectedTamperedBlock(null)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LedgerExplorer;