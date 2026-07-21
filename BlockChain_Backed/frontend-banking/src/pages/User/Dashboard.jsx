import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../store/AuthContext";
import { 
    Eye, EyeOff, ArrowUpRight, ArrowDownLeft, FileText,
    TrendingUp, TrendingDown, Wifi, Cpu, Copy, Check
} from 'lucide-react';
import txService from '../../services/tx.service';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [showBalance, setShowBalance] = useState(true);
    const [walletAddress, setWalletAddress] = useState("Chưa kết nối");
    const [walletBalance, setWalletBalance] = useState("0.000"); // Đổi mặc định thành 3 số 0
    const [isConnecting, setIsConnecting] = useState(false);
    
    // State cho Lịch sử giao dịch thật & Thống kê
    const [transactions, setTransactions] = useState([]);
    const [isLoadingTx, setIsLoadingTx] = useState(false);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpense, setMonthlyExpense] = useState(0);

    // State quản lý trạng thái nút copy
    const [isCopied, setIsCopied] = useState(false);

    // Hàm xử lý sao chép địa chỉ ví
    const handleCopyAddress = () => {
        if (walletAddress !== "Chưa kết nối") {
            navigator.clipboard.writeText(walletAddress);
            setIsCopied(true);
            
            // Tự động quay lại icon Copy sau 2 giây
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        }
    };

    // Lấy ngày tháng hiện tại bằng tiếng Việt
    const currentDate = new Intl.DateTimeFormat('vi-VN', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }).format(new Date());

    // --- CÁC HÀM XỬ LÝ METAMASK ---
    const fetchBalance = async (account) => {
        try {
            const balanceHex = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [account, 'latest']
            });
            const balanceInWei = BigInt(balanceHex);
            // Cập nhật thành toFixed(3) để đồng bộ với ví MetaMask (ví dụ: 0.100)
            const balanceInEth = (Number(balanceInWei) / 1e18).toFixed(3);
            setWalletBalance(balanceInEth);
        } catch (error) {
            console.error("Lỗi lấy số dư:", error);
        }
    };

    const checkWalletConnection = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    const account = accounts[0];
                    setWalletAddress(account);
                    fetchBalance(account); 
                    fetchDashboardTransactions(account); // Lấy giao dịch & tính thống kê
                } else {
                    setWalletAddress("Chưa kết nối");
                    setWalletBalance("0.000");
                    setTransactions([]);
                    setMonthlyIncome(0);
                    setMonthlyExpense(0);
                }
            } catch (error) {
                console.error("Lỗi kiểm tra ví:", error);
            }
        }
    };

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                setIsConnecting(true);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                setWalletAddress(account);
                fetchBalance(account);
                fetchDashboardTransactions(account); 
            } catch (error) {
                console.error("Lỗi kết nối:", error);
            } finally {
                setIsConnecting(false);
            }
        } else {
            alert("Vui lòng cài đặt MetaMask!");
        }
    };

    // --- LẤY DỮ LIỆU LỊCH SỬ TỪ BACKEND & TÍNH TOÁN THỐNG KÊ ---
    const fetchDashboardTransactions = async (address) => {
        setIsLoadingTx(true);
        try {
            const historyData = await txService.getHistory(address);
            
            // Lấy thời gian tháng hiện tại
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            let income = 0;
            let expense = 0;

            // Tính toán thu nhập và chi tiêu của tháng này
            historyData.forEach(tx => {
                const txDate = new Date(tx.timestamp);
                
                // Chỉ tính các giao dịch trong tháng hiện tại và có trạng thái SUCCESS
                if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear && tx.status === 'SUCCESS') {
                    const isIncoming = tx.receiverAccount?.toLowerCase() === address.toLowerCase();
                    if (isIncoming) {
                        income += Number(tx.amount);
                    } else {
                        expense += Number(tx.amount);
                    }
                }
            });

            setMonthlyIncome(income);
            setMonthlyExpense(expense);
            
            // Chỉ lấy 5 giao dịch gần nhất để hiển thị
            const recentTxs = historyData.slice(0, 5);
            setTransactions(recentTxs);
        } catch (error) {
            console.error("Lỗi tải giao dịch từ backend:", error);
            setTransactions([]);
        } finally {
            setIsLoadingTx(false);
        }
    };

    // --- EFFECT KHỞI TẠO ---
    useEffect(() => {
        checkWalletConnection();

        if (typeof window.ethereum !== 'undefined') {
            const handleAccountsChanged = () => checkWalletConnection();
            window.ethereum.on('accountsChanged', handleAccountsChanged)
            return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header flex-header">
                <div>
                    <h1 className="welcome-text">Chào mừng trở lại, {user?.fullName || user?.username }!</h1>
                    <p className="subtitle">Cập nhật tổng quan tài chính của bạn hôm nay.</p>
                </div>
                
                <div className="header-actions">
                    <div className="date-badge">{currentDate}</div>
                    <button className="connect-wallet-btn" onClick={connectWallet} disabled={isConnecting}>
                        {isConnecting ? 'Đang xử lý...' : (walletAddress === "Chưa kết nối" ? '🦊 Kết nối Ví' : '🔄 Đồng bộ')}
                    </button>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* --- CỘT TRÁI (MAIN) --- */}
                <div className="main-column">
                    
                    {/* Thẻ Ngân Hàng Mô Phỏng */}
                    <div className="balance-card">
                        <div className="card-top-row">
                            {/* Đã sửa đổi nhãn ở đây */}
                            <span className="card-type">SỐ TÀI KHOẢN</span>
                            <Wifi size={24} className="wifi-icon" />
                        </div>
                        
                        <div className="card-chip-row">
                            <div className="chip-icon">
                                <Cpu size={32} />
                            </div>
                        </div>

                       <div className="card-number-row">
                            <p className="card-number">
                                {walletAddress !== "Chưa kết nối" ? `${walletAddress.substring(0,6)} •••• •••• ${walletAddress.substring(walletAddress.length - 4)}` : "**** **** **** ****"}
                            </p>
                            
                            {walletAddress !== "Chưa kết nối" && (
                                <button 
                                    className="copy-btn" 
                                    onClick={handleCopyAddress} 
                                    title="Sao chép địa chỉ ví"
                                >
                                    {isCopied ? <Check size={20} color="#10B981" /> : <Copy size={20} />}
                                </button>
                            )}
                        </div>
                        
                        <div className="card-bottom-row">
                            <div>
                                <p className="card-label">SỐ DƯ HIỆN TẠI</p>
                                <div className="balance-display">
                                    <h2 className="balance-amount">
                                        {showBalance ? `${walletBalance} SepoliaETH` : '****** SepoliaETH'}
                                    </h2>
                                    <button className="eye-btn" onClick={() => setShowBalance(!showBalance)}>
                                        {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="mastercard-logo">
                                <div className="circle red-circle"></div>
                                <div className="circle orange-circle"></div>
                            </div>
                        </div>
                    </div>

                    {/* Thanh Nút Hành Động */}
                    <div className="action-bar">
                        <button className="action-btn active" onClick={() => navigate('/transfer')}>
                            <div className="action-icon-wrapper"><ArrowUpRight size={18} /></div>
                            <span>Chuyển tiền</span>
                        </button>
                        
                        <button className="action-btn" onClick={() => alert("Chức năng nạp tiền đang phát triển")}>
                            <div className="action-icon-wrapper"><ArrowDownLeft size={18} /></div>
                            <span>Nạp tiền</span>
                        </button>
                        
                        <button className="action-btn" onClick={() => navigate('/bill-pay')}>
                            <div className="action-icon-wrapper"><FileText size={18} /></div>
                            <span>Thanh toán</span>
                        </button>
                    </div>

                    {/* Thống kê thu chi - Áp dụng dữ liệu thật */}
                    <div className="stats-row">
                        <div className="stat-box">
                            <div className="stat-icon-wrapper green-bg">
                                <TrendingUp size={20} className="text-green" />
                            </div>
                            <div className="stat-info">
                                <p className="stat-label">Thu nhập tháng này</p>
                                {/* Hiển thị thu nhập với 4 số thập phân */}
                                <h3 className="stat-amount text-green">+{monthlyIncome.toFixed(4)} ETH</h3> 
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-icon-wrapper red-bg">
                                <TrendingDown size={20} className="text-red" />
                            </div>
                            <div className="stat-info">
                                <p className="stat-label">Chi tiêu tháng này</p>
                                {/* Hiển thị chi tiêu với 4 số thập phân */}
                                <h3 className="stat-amount text-red">-{monthlyExpense.toFixed(4)} ETH</h3>
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- CỘT PHẢI (SIDEBAR) --- */}
                <div className="side-column">
                    
                    {/* Lịch sử giao dịch */}
                    <div className="recent-tx-container">
                        <div className="tx-header">
                            <h3>Giao dịch gần đây</h3>
                            <span className="view-all" onClick={() => navigate('/history')}>Xem tất cả</span>
                        </div>
                        
                        <div className="tx-list">
                            {isLoadingTx ? (
                                <p style={{textAlign: 'center', color: '#64748b', fontSize: '14px', margin: '20px 0'}}>Đang tải dữ liệu...</p>
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => {
                                    const isIncoming = tx.receiverAccount?.toLowerCase() === walletAddress.toLowerCase();
                                    
                                    const dateObj = new Date(tx.timestamp);
                                    const timeString = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                                    const dateString = dateObj.toLocaleDateString('vi-VN');
                                    
                                    const txTitle = tx.description || (isIncoming ? 'Nhận SepoliaETH' : 'Chuyển SepoliaETH');

                                    return (
                                        <div className="tx-item" key={tx.transactionId}>
                                            <div className={`tx-icon ${isIncoming ? 'bg-green-light' : 'bg-red-light'}`}>
                                                {isIncoming ? (
                                                    <ArrowDownLeft size={18} className="text-green" />
                                                ) : (
                                                    <ArrowUpRight size={18} className="text-red" />
                                                )}
                                            </div>
                                            <div className="tx-info">
                                                <p className="tx-title">{txTitle}</p>
                                                <p className="tx-time">{dateString}, {timeString}</p>
                                            </div>
                                            <div className={`tx-amount ${isIncoming ? 'text-green' : 'text-dark'}`}>
                                                {isIncoming ? '+' : '-'}{Number(tx.amount).toFixed(4)} ETH
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{textAlign: 'center', color: '#64748b', fontSize: '14px', margin: '20px 0'}}>Chưa có giao dịch nào.</p>
                            )}
                        </div>
                    </div>

                    {/* Banner Premium */}
                    <div className="premium-banner">
                        <div className="premium-badge">PREMIUM</div>
                        <h3>Nâng cấp tài khoản</h3>
                        <p>Tận hưởng hạn mức chuyển tiền lên đến 2 tỷ/ngày và miễn phí mọi giao dịch.</p>
                        <button className="premium-btn">Tìm hiểu thêm</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;