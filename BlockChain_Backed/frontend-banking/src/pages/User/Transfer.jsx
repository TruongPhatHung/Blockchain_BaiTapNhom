import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Wallet, CheckCircle2, AlertCircle, Search, Building2, Smartphone, Landmark, ArrowRight, UserX } from 'lucide-react';
import './Transfer.css';

const Transfer = () => {
    const navigate = useNavigate();

    // States quản lý Form
    const [currentAccount, setCurrentAccount] = useState('');
    const [balance, setBalance] = useState('0.000');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [notification, setNotification] = useState({ message: '', status: '' });
    const [transferMethod, setTransferMethod] = useState('internal');

    // States quản lý dữ liệu người nhận THẬT
    const [recentRecipients, setRecentRecipients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const quickAmounts = ['0.01', '0.05', '0.1'];

    // 1. Tải danh sách người nhận THẬT từ localStorage
    useEffect(() => {
        const savedRecipients = localStorage.getItem('web3_recent_recipients');
        if (savedRecipients) {
            try {
                setRecentRecipients(JSON.parse(savedRecipients));
            } catch (e) {
                console.error("Lỗi tải danh sách người nhận:", e);
            }
        }
    }, []);

    // 2. Hàm lưu địa chỉ ví THẬT vào localStorage
    const saveRecipientToStorage = (address) => {
        const saved = localStorage.getItem('web3_recent_recipients');
        let list = saved ? JSON.parse(saved) : [];
        
        // Kiểm tra xem địa chỉ ví đã tồn tại trong danh sách chưa
        const exists = list.some(item => item.fullAddress.toLowerCase() === address.toLowerCase());
        
        if (!exists) {
            const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
            const newItem = {
                id: Date.now(),
                name: `Ví ${address.slice(2, 6)}`,
                address: shortAddr,
                fullAddress: address,
                initials: address.slice(2, 4).toUpperCase(),
                color: '#dbeafe',
                textColor: '#2563eb'
            };
            const updatedList = [newItem, ...list].slice(0, 10); // Giữ tối đa 10 ví gần nhất
            localStorage.setItem('web3_recent_recipients', JSON.stringify(updatedList));
            setRecentRecipients(updatedList);
        }
    };

    const fetchBalance = async (account) => {
        try {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const balanceWei = await provider.getBalance(account);
                const balanceEth = ethers.formatEther(balanceWei);
                setBalance(Number(balanceEth).toFixed(3));
            }
        } catch (error) {
            console.error("Lỗi lấy số dư:", error);
        }
    };

    const handleAccountChange = (account) => {
        setCurrentAccount(account);
        fetchBalance(account);
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                setNotification({ message: 'Vui lòng cài đặt MetaMask!', status: 'error' });
                return;
            }
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            handleAccountChange(accounts[0]);
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
                    setBalance('0.000');
                }
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            setNotification({ message: 'Số tiền phải lớn hơn 0!', status: 'error' });
            return;
        }
        if (parseFloat(amount) > parseFloat(balance)) {
             setNotification({ message: 'Số dư không đủ để thực hiện giao dịch!', status: 'error' });
             return;
        }

        // Lưu địa chỉ ví hợp lệ vào dữ liệu thật
        saveRecipientToStorage(recipient);

        navigate('/transfer-confirm', { 
            state: { sender: currentAccount, recipient, amount, memo } 
        });
    };

    const handleSelectRecipient = (fullAddress) => {
        setRecipient(fullAddress);
    };

    // Lọc danh sách người nhận theo ô tìm kiếm
    const filteredRecipients = recentRecipients.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.fullAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="layout-wrapper">
            <div className="page-header">
                <h1>Chuyển tiền</h1>
                <p>Thực hiện giao dịch an toàn và nhanh chóng trên mạng lưới Sepolia.</p>
            </div>

            <div className="main-content-grid">
                {/* CỘT TRÁI: Form chuyển tiền */}
                <div className="left-column">
                    
                    {/* Block 1: Phương thức chuyển */}
                    <div className="content-card">
                        <h2 className="card-title">Phương thức chuyển</h2>
                        <div className="transfer-methods">
                            <div 
                                className={`method-box ${transferMethod === 'internal' ? 'active' : ''}`}
                                onClick={() => setTransferMethod('internal')}
                            >
                                <Landmark className="method-icon" size={24} />
                                <h3>Ví thông thường</h3>
                                <p>Miễn phí giao dịch</p>
                            </div>
                            <div 
                                className={`method-box ${transferMethod === 'contract' ? 'active' : ''}`}
                                onClick={() => setTransferMethod('contract')}
                            >
                                <Building2 className="method-icon" size={24} />
                                <h3>Smart Contract</h3>
                                <p>24/7 Nhanh chóng</p>
                            </div>
                            <div 
                                className={`method-box ${transferMethod === 'ens' ? 'active' : ''}`}
                                onClick={() => setTransferMethod('ens')}
                            >
                                <Smartphone className="method-icon" size={24} />
                                <h3>Qua tên miền ENS</h3>
                                <p>Danh bạ tiện lợi</p>
                            </div>
                        </div>
                    </div>

                    {/* Block 2: Thông tin giao dịch */}
                    <div className="content-card">
                        <h2 className="card-title">Thông tin giao dịch</h2>

                        {notification.message && (
                            <div className={`alert-box ${notification.status}`}>
                                {notification.status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                <span>{notification.message}</span>
                            </div>
                        )}

                        <form onSubmit={handleContinue} className="transaction-form">
                            {/* Tài khoản nguồn */}
                            <div className="form-group">
                                <label>Tài khoản nguồn</label>
                                <div className="source-account-box">
                                    {currentAccount ? (
                                        <div className="account-info">
                                            <div className="account-address">
                                                <Wallet size={16} className="icon-gray" />
                                                <span>Ví: {currentAccount.slice(0, 8)}...{currentAccount.slice(-6)}</span>
                                            </div>
                                            <div className="account-balance text-green">
                                                Số dư: {balance} SepoliaETH
                                            </div>
                                        </div>
                                    ) : (
                                        <button type="button" className="btn-connect" onClick={connectWallet}>
                                            Kết nối ví MetaMask
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Địa chỉ người nhận */}
                            <div className="form-group">
                                <label>Địa chỉ ví nhận</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập địa chỉ ví 0x..."
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Số tiền */}
                            <div className="form-group">
                                <label>Số tiền (SepoliaETH)</label>
                                <div className="amount-input-wrapper">
                                    <span className="currency-symbol">ETH</span>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        className="form-control pl-45"
                                        placeholder="0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="quick-amounts">
                                    {quickAmounts.map((amt) => (
                                        <button 
                                            key={amt} 
                                            type="button" 
                                            className="btn-quick-amount"
                                            onClick={() => setAmount(amt)}
                                        >
                                            {amt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Nội dung */}
                            <div className="form-group">
                                <label>Nội dung chuyển tiền</label>
                                <textarea
                                    className="form-control text-area-fix"
                                    rows="2"
                                    placeholder="Ví dụ: Thanh toan tien cafe..."
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit" disabled={!currentAccount}>
                                    Tiếp tục <ArrowRight size={16} />
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                {/* CỘT PHẢI: Người nhận gần đây (Dữ liệu thật) */}
                <div className="right-column">
                    <div className="content-card">
                        <div className="card-header-flex">
                            <h2 className="card-title mb-0">Người nhận gần đây</h2>
                        </div>
                        
                        <div className="search-box">
                            <Search size={15} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Tìm theo tên, địa chỉ ví..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="recent-list">
                            {filteredRecipients.length > 0 ? (
                                filteredRecipients.map((user) => (
                                    <div 
                                        key={user.id} 
                                        className="recent-item" 
                                        onClick={() => handleSelectRecipient(user.fullAddress)}
                                    >
                                        <div 
                                            className="avatar" 
                                            style={{ backgroundColor: user.color, color: user.textColor }}
                                        >
                                            {user.initials}
                                        </div>
                                        <div className="user-info">
                                            <h4>{user.name}</h4>
                                            <p>Sepolia • {user.address}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-recipients">
                                    <UserX size={32} className="empty-icon" />
                                    <p>Chưa có lịch sử chuyển tiền nào.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Transfer;