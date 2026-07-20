import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // THÊM IMPORT NÀY
import { ethers } from 'ethers';
import { Wallet, AlertCircle, CheckCircle2, ArrowRight, MessageSquare } from 'lucide-react';
import './Transfer.css';

const Transfer = () => {
    const navigate = useNavigate(); // KHỞI TẠO ĐIỀU HƯỚNG

    const [currentAccount, setCurrentAccount] = useState('');
    const [balance, setBalance] = useState('0.0000');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [notification, setNotification] = useState({ message: '', status: '' });

    const fetchBalance = async (account) => {
        try {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const balanceWei = await provider.getBalance(account);
                const balanceEth = ethers.formatEther(balanceWei);
                setBalance(Number(balanceEth).toFixed(4));
            }
        } catch (error) {
            console.error("Lỗi lấy số dư:", error);
        }
    };

    const handleAccountChange = (account) => {
        setCurrentAccount(account);
        fetchBalance(account);
        setMemo(`Chuyển tiền từ ${account.slice(0, 6)}...${account.slice(-4)}`);
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                setNotification({ message: 'Vui lòng cài đặt MetaMask!', status: 'error' });
                return;
            }
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            handleAccountChange(accounts[0]);
            
            setNotification({ message: 'Kết nối ví thành công!', status: 'success' });
            setTimeout(() => setNotification({ message: '', status: '' }), 3000);
        } catch (error) {
            setNotification({ message: 'Lỗi kết nối ví. Vui lòng thử lại.', status: 'error' });
        }
    };

    useEffect(() => {
        const checkConnection = async () => {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    handleAccountChange(accounts[0]);
                }
            }
        };
        checkConnection();
        
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    handleAccountChange(accounts[0]);
                } else {
                    setCurrentAccount('');
                    setBalance('0.0000');
                    setMemo('');
                }
            });
        }
    }, []);

    // HÀM CHUYỂN TRANG
    const handleContinue = (e) => {
        e.preventDefault();
        setNotification({ message: '', status: '' });
        
        if (!currentAccount) {
            setNotification({ message: 'Vui lòng kết nối ví trước khi chuyển!', status: 'error' });
            return;
        }
        if (!ethers.isAddress(recipient)) {
            setNotification({ message: 'Địa chỉ ví người nhận không hợp lệ!', status: 'error' });
            return;
        }
        if (parseFloat(amount) <= 0 || isNaN(amount)) {
            setNotification({ message: 'Số lượng phải lớn hơn 0!', status: 'error' });
            return;
        }
        if (parseFloat(amount) > parseFloat(balance)) {
             setNotification({ message: 'Số dư không đủ để thực hiện giao dịch!', status: 'error' });
             return;
        }

        // CHUYỂN HƯỚNG VÀ TRUYỀN DỮ LIỆU SANG TRANG XÁC NHẬN
        navigate('/transfer-confirm', { 
            state: { 
                sender: currentAccount,
                recipient: recipient, 
                amount: amount, 
                memo: memo 
            } 
        });
    };

    return (
        <div className="transfer-page-wrapper">
            <div className="transfer-container">
                <div className="transfer-header-text">
                    <h1>Chuyển Tiền</h1>
                    <p>Gửi SepoliaETH an toàn qua mạng lưới Web3</p>
                </div>

                <div className="transfer-card-modern">
                    <div className="wallet-status-box">
                        <div className="wallet-icon-bg">
                            <Wallet size={24} className="text-blue" />
                        </div>
                        <div className="wallet-details">
                            <p className="wallet-label">Tài khoản kết nối (Sepolia)</p>
                            {currentAccount ? (
                                <>
                                    <p className="wallet-address">{currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</p>
                                    <p className="wallet-balance">Số dư: <strong>{balance} SepoliaETH</strong></p>
                                </>
                            ) : (
                                <p className="wallet-disconnected">Chưa kết nối</p>
                            )}
                        </div>
                        {!currentAccount && (
                            <button type="button" className="btn-connect-sm" onClick={connectWallet}>
                                Kết nối ngay
                            </button>
                        )}
                    </div>

                    <hr className="divider" />

                    {notification.message && (
                        <div className={`notification-alert ${notification.status}`}>
                            {notification.status === 'success' && <CheckCircle2 size={20} />}
                            {notification.status === 'error' && <AlertCircle size={20} />}
                            <span>{notification.message}</span>
                        </div>
                    )}

                    <form onSubmit={handleContinue} className="transfer-form-modern">
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Đến địa chỉ ví</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Nhập địa chỉ ví 0x..."
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="input-group">
                                <label>Số lượng (SepoliaETH)</label>
                                <div className="input-wrapper amount-wrapper">
                                    <input
                                        type="number"
                                        step="0.0001"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                    <span className="currency-suffix">SepoliaETH</span>
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Nội dung chuyển khoản (Tùy chọn)</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <MessageSquare size={18} color="#94a3b8" />
                                </div>
                                <input
                                    type="text"
                                    className="input-with-icon"
                                    placeholder="Nhập nội dung chuyển tiền..."
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    maxLength={100}
                                />
                            </div>
                            <p className="help-text">Nội dung sẽ được mã hóa và lưu trên Blockchain.</p>
                        </div>

                        <button type="submit" className="btn-transfer-modern" disabled={!currentAccount}>
                            <span>Tiếp tục chuyển tiền</span>
                            <ArrowRight size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Transfer;