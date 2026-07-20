import React, { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Calendar, X } from 'lucide-react';
import txService from '../../services/tx.service';
import './History.css';

const shortAddress = (address = '') => address.length > 14 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address;
const formatDate = (timestamp) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(timestamp));

const History = () => {
    const [transactions, setTransactions] = useState([]);
    const [walletAddress, setWalletAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                if (!window.ethereum) throw new Error('Không tìm thấy MetaMask. Hãy kết nối ví để xem lịch sử.');
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (!accounts.length) throw new Error('Hãy kết nối ví MetaMask để xem lịch sử giao dịch.');
                const address = accounts[0];
                setWalletAddress(address);
                setTransactions(await txService.getHistory(address));
            } catch (requestError) {
                console.error('Lỗi khi tải lịch sử:', requestError);
                setError(requestError.response?.data?.message || requestError.message || 'Không thể tải lịch sử giao dịch.');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const showDetail = async (transactionId) => {
        setDetailLoading(true);
        try {
            setSelectedTransaction(await txService.getDetail(transactionId));
        } catch (detailError) {
            setError(detailError.response?.data?.message || 'Không thể tải chi tiết giao dịch.');
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <div className="history-wrapper"><div className="history-container">
            <div className="history-header"><div><h2 className="history-title">Lịch sử giao dịch</h2><p className="history-subtitle">Các giao dịch SepoliaETH của ví {walletAddress ? shortAddress(walletAddress) : 'MetaMask'}.</p></div></div>
            <div className="filter-section"><div className="filter-group"><span className="filter-label">Dữ liệu</span><div className="filter-buttons"><button className="btn-filter active" type="button">Tất cả giao dịch</button><button className="btn-filter with-icon" type="button">Đã xác nhận <Calendar size={14} /></button></div></div></div>
            <div className="transaction-list-container">
                <div className="list-header"><span className="month-title">Giao dịch on-chain</span><span className="month-total">{transactions.length} giao dịch</span></div>
                {loading ? <div className="loading-state">Đang tải dữ liệu...</div> : error ? <div className="empty-state">{error}</div> : transactions.length === 0 ? <div className="empty-state">Chưa có giao dịch nào từ ví này.</div> : (
                    <div className="transaction-list">{transactions.map((tx) => {
                        const isIncoming = tx.receiverAccount?.toLowerCase() === walletAddress.toLowerCase();
                        const TxIcon = isIncoming ? ArrowDownToLine : ArrowUpRight;
                        const counterparty = isIncoming ? tx.senderAccount : tx.receiverAccount;
                        return <div className="tx-item" key={tx.transactionId}>
                            <span className="tx-item-left"><span className={`tx-icon-wrapper ${isIncoming ? 'icon-deposit' : 'icon-transfer'}`}><TxIcon size={20} /></span><span className="tx-info"><span className="tx-name">{tx.description || (isIncoming ? 'Nhận SepoliaETH' : 'Chuyển SepoliaETH')}</span><span className="tx-meta">{formatDate(tx.timestamp)} • {shortAddress(counterparty)}</span></span></span>
                            <span className="tx-item-right"><span className={`tx-amount ${isIncoming ? 'positive' : 'negative'}`}>{isIncoming ? '+' : '-'}{Number(tx.amount).toFixed(4)} SepoliaETH</span><span className="tx-status">{tx.status === 'SUCCESS' ? 'Thành công' : tx.status}</span><button className="btn-tx-detail" type="button" onClick={() => showDetail(tx.transactionId)}>Xem chi tiết</button></span>
                        </div>;
                    })}</div>
                )}
            </div>
        </div>
        {(selectedTransaction || detailLoading) && <div className="tx-modal-backdrop" role="presentation" onMouseDown={() => !detailLoading && setSelectedTransaction(null)}>
            <div className="tx-modal" role="dialog" aria-modal="true" aria-label="Chi tiết giao dịch" onMouseDown={(event) => event.stopPropagation()}>
                <button type="button" className="tx-modal-close" onClick={() => setSelectedTransaction(null)} disabled={detailLoading} aria-label="Đóng"><X size={20} /></button>
                <h3>Chi tiết giao dịch</h3>
                {detailLoading ? <div className="loading-state">Đang tải chi tiết...</div> : <>
                    <div className="tx-detail-status">{selectedTransaction.status === 'SUCCESS' ? 'Thành công' : selectedTransaction.status}</div>
                    <div className="tx-detail-grid">
                        <span>Mã giao dịch</span><strong>#{selectedTransaction.transactionId}</strong>
                        <span>Thời gian</span><strong>{formatDate(selectedTransaction.timestamp)}</strong>
                        <span>Số tiền</span><strong>{Number(selectedTransaction.amount).toFixed(4)} SepoliaETH</strong>
                        <span>Người gửi</span><strong className="tx-detail-break">{selectedTransaction.senderAccount}</strong>
                        <span>Người nhận</span><strong className="tx-detail-break">{selectedTransaction.receiverAccount}</strong>
                        <span>Nội dung</span><strong>{selectedTransaction.description || 'Không có nội dung'}</strong>
                        <span>Tx hash</span><strong className="tx-detail-break">{selectedTransaction.onChainTxHash || 'Chưa có'}</strong>
                        <span>Block hash</span><strong className="tx-detail-break">{selectedTransaction.blockHash}</strong>
                    </div>
                </>}
            </div>
        </div>}
        </div>
    );
};

export default History;
