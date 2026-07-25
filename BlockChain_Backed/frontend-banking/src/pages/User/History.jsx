import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Calendar, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import txService from '../../services/tx.service';
import { useLanguage } from '../../store/LanguageContext'; // IMPORT HOOK NGÔN NGỮ
import './History.css';

const shortAddress = (address = '') => address.length > 14 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address;
const formatDate = (timestamp) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));

const History = () => {
    const { t } = useLanguage(); // KHỞI TẠO HÀM DỊCH

    const [transactions, setTransactions] = useState([]);
    const [walletAddress, setWalletAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                if (!window.ethereum) throw new Error(t('errNoMetamaskHistory') || 'Không tìm thấy MetaMask. Hãy kết nối ví để xem lịch sử.');
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (!accounts.length) throw new Error(t('errConnectWalletHistory') || 'Hãy kết nối ví MetaMask để xem lịch sử giao dịch.');
                const address = accounts[0];
                setWalletAddress(address);
                setTransactions(await txService.getHistory(address));
            } catch (requestError) {
                console.error('Lỗi khi tải lịch sử:', requestError);
                setError(requestError.response?.data?.message || requestError.message || t('errLoadHistory') || 'Không thể tải lịch sử giao dịch.');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showDetail = async (transactionId) => {
        setDetailLoading(true);
        try {
            setSelectedTransaction(await txService.getDetail(transactionId));
        } catch (detailError) {
            setError(detailError.response?.data?.message || t('errLoadDetail') || 'Không thể tải chi tiết giao dịch.');
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <div className="history-wrapper">
            <div className="history-container">
                {/* Phần Tiêu đề */}
                <div className="history-header">
                    <div>
                        <h2 className="history-title">{t('transactionHistory') || 'Lịch sử giao dịch'}</h2>
                        <p className="history-subtitle">
                            {t('sepoliaTransactionsForWallet') || 'Các giao dịch SepoliaETH của ví'} <strong>{walletAddress ? shortAddress(walletAddress) : 'MetaMask'}</strong>.
                        </p>
                    </div>
                </div>

                {/* Phần Bộ lọc */}
                <div className="filter-section">
                    <div className="filter-group">
                        <span className="filter-label">{t('displayData') || 'Dữ liệu hiển thị'}</span>
                        <div className="filter-buttons">
                            <button className="btn-filter active" type="button">{t('allTransactions') || 'Tất cả giao dịch'}</button>
                            <button className="btn-filter with-icon" type="button">
                                {t('confirmed') || 'Đã xác nhận'} <Calendar size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Phần Danh sách */}
                <div className="transaction-list-container">
                    <div className="list-header">
                        <span className="month-title">{t('onChainTransactions') || 'Giao dịch on-chain'}</span>
                        <span className="month-total">{transactions.length} {t('transactionsCount') || 'giao dịch'}</span>
                    </div>

                    {loading ? (
                        <div className="state-container loading-state">
                            <div className="spinner"></div>
                            <span>{t('loadingData') || 'Đang tải dữ liệu...'}</span>
                        </div>
                    ) : error ? (
                        <div className="state-container error-state">{error}</div>
                    ) : transactions.length === 0 ? (
                        <div className="state-container empty-state">{t('noTransactions') || 'Chưa có giao dịch nào từ ví này.'}</div>
                    ) : (
                        <div className="transaction-list">
                            {transactions.map((tx) => {
                                const isIncoming = tx.receiverAccount?.toLowerCase() === walletAddress.toLowerCase();
                                const TxIcon = isIncoming ? ArrowDownLeft : ArrowUpRight;
                                const counterparty = isIncoming ? tx.senderAccount : tx.receiverAccount;
                                
                                return (
                                    <div className="tx-item" key={tx.transactionId}>
                                        <div className="tx-item-left">
                                            <div className={`tx-icon-wrapper ${isIncoming ? 'icon-deposit' : 'icon-transfer'}`}>
                                                <TxIcon size={22} strokeWidth={2.5} />
                                            </div>
                                            <div className="tx-info">
                                                <span className="tx-name">
                                                    {tx.description || (isIncoming ? (t('receiveSepoliaETH') || 'Nhận SepoliaETH') : (t('sendSepoliaETH') || 'Chuyển SepoliaETH'))}
                                                </span>
                                                <span className="tx-meta">{formatDate(tx.timestamp)} • {shortAddress(counterparty)}</span>
                                            </div>
                                        </div>
                                        <div className="tx-item-right">
                                            <div className="tx-amount-group">
                                                <span className={`tx-amount ${isIncoming ? 'positive' : 'negative'}`}>
                                                    {isIncoming ? '+' : '-'}{Number(tx.amount).toFixed(4)} SepoliaETH
                                                </span>
                                                <span className={`tx-status ${tx.status === 'SUCCESS' ? 'success' : 'pending'}`}>
                                                    {tx.status === 'SUCCESS' ? (t('success') || 'Thành công') : tx.status}
                                                </span>
                                            </div>
                                            <button className="btn-tx-detail" type="button" onClick={() => showDetail(tx.transactionId)}>
                                                {t('viewDetails') || 'Xem chi tiết'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Chi Tiết Giao Dịch */}
            {(selectedTransaction || detailLoading) && (
                <div className="tx-modal-backdrop" role="presentation" onMouseDown={() => !detailLoading && setSelectedTransaction(null)}>
                    <div className="tx-modal" role="dialog" aria-modal="true" aria-label="Chi tiết giao dịch" onMouseDown={(event) => event.stopPropagation()}>
                        <button type="button" className="tx-modal-close" onClick={() => setSelectedTransaction(null)} disabled={detailLoading} aria-label="Đóng">
                            <X size={20} />
                        </button>
                        
                        {detailLoading ? (
                            <div className="state-container loading-state" style={{ height: '300px' }}>
                                <div className="spinner"></div>
                                <span>{t('loadingDetails') || 'Đang tải chi tiết...'}</span>
                            </div>
                        ) : (
                            <>
                                {/* Modal Header (Biên lai) */}
                                <div className="tx-modal-header">
                                    <div className="tx-modal-icon">
                                        <CheckCircle2 color="#059669" size={48} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="tx-modal-title">{t('transactionSuccess') || 'Giao dịch thành công'}</h3>
                                    <div className="tx-modal-amount">
                                        {Number(selectedTransaction.amount).toFixed(4)} <span className="currency">SepoliaETH</span>
                                    </div>
                                    <span className="tx-modal-time">{formatDate(selectedTransaction.timestamp)}</span>
                                </div>

                                {/* Modal Body (Bảng thông tin chi tiết) */}
                                <div className="tx-modal-body">
                                    <div className="tx-detail-row">
                                        <span className="detail-label">{t('internalTxId') || 'Mã giao dịch nội bộ'}</span>
                                        <strong className="detail-value">#{selectedTransaction.transactionId}</strong>
                                    </div>
                                    <div className="tx-detail-row">
                                        <span className="detail-label">{t('sender') || 'Người gửi'}</span>
                                        <strong className="detail-value copyable" title={selectedTransaction.senderAccount}>{shortAddress(selectedTransaction.senderAccount)}</strong>
                                    </div>
                                    <div className="tx-detail-row">
                                        <span className="detail-label">{t('receiver') || 'Người nhận'}</span>
                                        <strong className="detail-value copyable" title={selectedTransaction.receiverAccount}>{shortAddress(selectedTransaction.receiverAccount)}</strong>
                                    </div>
                                    <div className="tx-detail-row">
                                        <span className="detail-label">{t('transferMemo') || 'Nội dung chuyển khoản'}</span>
                                        <strong className="detail-value">{selectedTransaction.description || t('noMemo') || 'Không có nội dung'}</strong>
                                    </div>
                                    
                                    <div className="tx-modal-divider"></div>

                                    <div className="tx-detail-row">
                                        <span className="detail-label">{t('txHash') || 'Tx Hash (On-chain)'}</span>
                                        <a href={`https://sepolia.etherscan.io/tx/${selectedTransaction.onChainTxHash}`} target="_blank" rel="noopener noreferrer" className="detail-value link">
                                            {shortAddress(selectedTransaction.onChainTxHash) || (t('notAvailable') || 'Chưa có')} <ExternalLink size={14} />
                                        </a>
                                    </div>
                                    <div className="tx-detail-row">
                                        <span className="detail-label">{t('blockHash') || 'Block Hash'}</span>
                                        <strong className="detail-value">{shortAddress(selectedTransaction.blockHash)}</strong>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;