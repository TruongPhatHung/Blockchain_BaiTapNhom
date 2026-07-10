// src/pages/Admin/LedgerExplorer.jsx
import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import './LedgerExplorer.css';

const LedgerExplorer = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                const data = await adminService.getLedger();
                setBlocks(data);
            } catch (error) {
                console.error("Lỗi khi lấy sổ cái:", error);
                // Dữ liệu giả lập mô phỏng Blockchain
                setBlocks([
                    { index: 0, timestamp: '2026-07-01 10:00:00', data: 'Genesis Block (Khởi tạo)', previousHash: '0', hash: '0000x8a9b1c...' },
                    { index: 1, timestamp: '2026-07-05 14:30:00', data: '3 Giao dịch', previousHash: '0000x8a9b1c...', hash: '0000x5f4e3d...' },
                    { index: 2, timestamp: '2026-07-09 08:15:00', data: '1 Giao dịch', previousHash: '0000x5f4e3d...', hash: '0000x1a2b3c...' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchLedger();
    }, []);

    return (
        <div className="ledger-container">
            <h2 className="ledger-title">Sổ Cái Blockchain (Ledger Explorer)</h2>

            {loading ? (
                <p>Đang tải dữ liệu Blockchain...</p>
            ) : (
                <div className="blockchain-list">
                    {blocks.map((block) => (
                        <div key={block.index} className="block-card">
                            <div className="block-header">
                                <div className="block-index">Block #{block.index}</div>
                                <div className="block-time">🕒 {block.timestamp}</div>
                            </div>
                            
                            <div className="block-data-row">
                                <span className="hash-label">Prev Hash:</span>
                                <span className="hash-value">{block.previousHash}</span>
                            </div>
                            
                            <div className="block-data-row">
                                <span className="hash-label">Block Hash:</span>
                                <span className="hash-value" style={{ color: '#52c41a' }}>{block.hash}</span>
                            </div>

                            <div className="tx-count">
                                📦 Nội dung / Giao dịch: {block.data}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LedgerExplorer;