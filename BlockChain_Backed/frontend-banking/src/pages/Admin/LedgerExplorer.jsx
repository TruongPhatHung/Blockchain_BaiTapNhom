import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { RefreshCw, ShieldCheck, ShieldAlert } from 'lucide-react';
import './LedgerExplorer.css';
import axios from 'axios';
const Ledger = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);

    // Trạng thái tổng của toàn hệ thống (Safe / Danger)
    const [systemStatus, setSystemStatus] = useState('SAFE');

    const fetchLedger = async () => {
        try {
            setLoading(true);
            // Lấy dữ liệu sổ cái từ Database
            const response = await api.get('/admin/verify-blockchain');
            // Mặc định ban đầu chưa quét Web3, ta gắn thêm cờ web3Tampered = false
            const initialBlocks = response.data.map(block => ({
                ...block,
                web3Tampered: false,
                web3ErrorMsg: ''
            }));
            setBlocks(initialBlocks);
            setSystemStatus('SAFE');
        } catch (error) {
            console.error("Lỗi khi tải Sổ cái:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, []);

    /**
     * HÀM KIỂM TOÁN CHUẨN WEB3 (GỌI TRỰC TIẾP LÊN MẠNG SEPOLIA)
     */
    const verifyAgainstWeb3 = async (txHash) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/transactions/verify-onchain/${txHash}`
            );

            console.log("Dữ liệu xác thực từ Web3:", response.data);

            return {
                isSafe: true,
                data: response.data
            };

        } catch (error) {
            console.error("Lỗi Web3:", error);

            return {
                isSafe: false,
                error: error.response?.data || error.message
            };
        }
    };
    // Xử lý khi bấm nút "Kiểm tra tính toàn vẹn"
    const handleVerifyIntegrity = async () => {
        setIsVerifying(true);
        let hasSystemError = false;

        const verifiedBlocks = await Promise.all(blocks.map(async (block) => {
            // Lấy Hash on-chain từ dữ liệu DB (giả sử backend trả về trường onChainTxHash trong dbData hoặc blockchainData)
            const onChainTxHash = block.blockchainData?.onChainTxHash || block.dbData?.onChainTxHash;
            const dbAmount = block.dbData?.amount;

            // Kiểm tra lỗi nội bộ trước (Thuật toán Hash SHA-256)
            let isTampered = block.isTampered;
            let web3Tampered = false;
            let web3ErrorMsg = '';

            // Nếu giao dịch này có ghi nhận trên Web3, tiến hành tra cứu chéo
            if (onChainTxHash && onChainTxHash.startsWith('0x')) {
                const web3Check = await verifyAgainstWeb3(onChainTxHash, dbAmount);
                if (!web3Check.isSafe) {
                    isTampered = true;
                    web3Tampered = true;
                    web3ErrorMsg = `Phát hiện giả mạo! Số tiền thật trên mạng Web3 chỉ là: ${web3Check.realAmount} ETH`;
                    hasSystemError = true;
                }
            }

            if (isTampered) hasSystemError = true;

            return { ...block, isTampered, web3Tampered, web3ErrorMsg };
        }));

        setBlocks(verifiedBlocks);
        setSystemStatus(hasSystemError ? 'DANGER' : 'SAFE');
        setIsVerifying(false);
    };

    return (
        <div className="ledger-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#0f172a', margin: 0 }}>Sổ Cái Blockchain</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={fetchLedger}
                        style={{ padding: '10px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
                    >
                        <RefreshCw size={18} /> Làm mới
                    </button>
                    <button
                        onClick={handleVerifyIntegrity}
                        disabled={isVerifying}
                        style={{ padding: '10px 16px', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
                    >
                        {isVerifying ? <RefreshCw size={18} className="spinning" /> : <ShieldCheck size={18} />}
                        {isVerifying ? 'Đang quét Mạng Web3...' : 'Kiểm tra tính toàn vẹn'}
                    </button>
                </div>
            </div>

            {/* Banner trạng thái hệ thống */}
            <div style={{
                padding: '20px',
                marginBottom: '20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                background: systemStatus === 'SAFE' ? '#ecfdf5' : '#fef2f2',
                border: systemStatus === 'SAFE' ? '1px solid #10b981' : '1px solid #ef4444',
                color: systemStatus === 'SAFE' ? '#065f46' : '#991b1b'
            }}>
                {systemStatus === 'SAFE' ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>
                        {systemStatus === 'SAFE' ? 'HỆ THỐNG AN TOÀN' : 'CẢNH BÁO BẢO MẬT NGHIÊM TRỌNG'}
                    </h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>
                        {systemStatus === 'SAFE'
                            ? 'Dữ liệu Blockchain nội bộ và Mạng Web3 đồng bộ toàn vẹn!'
                            : 'Phát hiện dữ liệu trong Database không khớp với sổ cái phi tập trung Web3!'}
                    </p>
                </div>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', marginTop: '50px', color: '#64748b' }}>Đang tải dữ liệu chuỗi khối...</p>
            ) : (
                <div className="blocks-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {blocks.map((block) => (
                        <div
                            key={block.transactionId}
                            style={{
                                background: '#fff',
                                padding: '24px',
                                borderRadius: '8px',
                                border: block.isTampered ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                boxShadow: block.isTampered ? '0 0 15px rgba(239, 68, 68, 0.3)' : '0 4px 6px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px' }}>
                                <strong style={{ fontSize: '18px', color: '#1e293b' }}>Khối #{block.blockIndex}</strong>

                                {/* Cảnh báo lỗi */}
                                {block.isTampered && (
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                                            <ShieldAlert size={18} /> DỮ LIỆU ĐÃ BỊ THAY ĐỔI TRÁI PHÉP
                                        </span>
                                        {block.web3Tampered && (
                                            <small style={{ color: '#b91c1c', display: 'block', marginTop: '5px' }}>
                                                {block.web3ErrorMsg}
                                            </small>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '15px', color: '#334155' }}>
                                <div><strong>Từ:</strong> {block.blockchainData?.accountNumber || 'N/A'}</div>
                                <div>
                                    <strong>Số tiền:</strong>
                                    <span style={{ color: block.isTampered ? '#ef4444' : '#10b981', fontWeight: 'bold', marginLeft: '5px' }}>
                                        {block.dbData?.amount} ETH
                                    </span>
                                </div>
                                <div><strong>Đến:</strong> {block.dbData?.accountNumber || 'N/A'}</div>
                                <div><strong>Nội dung:</strong> {block.dbData?.description}</div>
                            </div>

                            <div style={{ marginTop: '20px', background: '#f8fafc', padding: '15px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace', color: '#64748b', lineHeight: '1.8' }}>
                                {/* Bạn cần đảm bảo Backend có trả về trường onChainTxHash, nếu tên khác hãy sửa lại */}
                                <div><strong style={{ color: '#0f172a' }}>Tx Hash (On-chain):</strong> {block.blockchainData?.onChainTxHash || block.dbData?.onChainTxHash || 'Chưa đồng bộ mạng'}</div>
                                <div><strong style={{ color: '#0f172a' }}>DB Block Hash:</strong> {block.currentHash}</div>
                                <div><strong style={{ color: '#0f172a' }}>DB Prev Hash:</strong> {block.previousHash}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Ledger;