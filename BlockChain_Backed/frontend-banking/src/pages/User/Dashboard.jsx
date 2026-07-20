import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../store/AuthContext";
import { 
    Eye, EyeOff, Send, PlusCircle, CreditCard, 
    TrendingUp, TrendingDown, Music, ShoppingBag, Briefcase 
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate(); // Hook để chuyển trang
    
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [showBalance, setShowBalance] = useState(true);
    const [walletAddress, setWalletAddress] = useState("Đang tải...");
    const [walletBalance, setWalletBalance] = useState("0.0000");
    const [isConnecting, setIsConnecting] = useState(false);
    
    // State cho Lịch sử giao dịch (Dữ liệu thật/giả lập)
    const [transactions, setTransactions] = useState([]);

    // --- CÁC HÀM XỬ LÝ METAMASK ---
    const fetchBalance = async (account) => {
        try {
            const balanceHex = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [account, 'latest']
            });
            const balanceInWei = BigInt(balanceHex);
            const balanceInEth = (Number(balanceInWei) / 1e18).toFixed(4);
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
                    // BỎ cắt chuỗi, lưu trực tiếp toàn bộ địa chỉ ví
                    setWalletAddress(account);
                    fetchBalance(account); 
                } else {
                    setWalletAddress("Chưa kết nối");
                    setWalletBalance("0.0000");
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
                // BỎ cắt chuỗi, lưu trực tiếp toàn bộ địa chỉ ví
                setWalletAddress(account);
                fetchBalance(account);
            } catch (error) {
                console.error("Lỗi kết nối:", error);
            } finally {
                setIsConnecting(false);
            }
        } else {
            alert("Vui lòng cài đặt MetaMask!");
        }
    };
    // --- HÀM XỬ LÝ ĐỒNG BỘ NÚT BẤM ---
    const handleSync = async () => {
        // Kiểm tra xem đã có địa chỉ ví chưa
        if (walletAddress !== "Chưa kết nối" && walletAddress !== "Đang tải...") {
            setIsConnecting(true); // Đổi trạng thái nút thành "Đang xử lý..."
            await fetchBalance(walletAddress); // Gọi trực tiếp hàm lấy số dư
            setIsConnecting(false); // Trả lại trạng thái bình thường
        } else {
            // Nếu chưa kết nối thì tiến hành kết nối
            connectWallet();
        }
    };

    // --- CƠ CHẾ NẠP TIỀN THÔNG MINH ---
    const handleDeposit = () => {
        if (walletAddress === "Chưa kết nối" || walletAddress === "Đang tải...") {
            connectWallet();
        } else {
            // Sau này bạn có thể mở một Modal chứa QR Code ở đây
            alert(`Để nạp tiền, vui lòng chuyển SepoliaETH mạng Web3 vào ví: \n${walletAddress}`);
        }
    };

    // --- LẤY DỮ LIỆU LỊCH SỬ GIAO DỊCH TỪ BACKEND ---
    const fetchTransactions = async () => {
        try {
            // TODO: Thay thế bằng API thật của bạn
            // const response = await axios.get('/api/transactions');
            // setTransactions(response.data);
            
            // Giả lập dữ liệu trả về từ API để làm UI
            const mockData = [
                { id: 1, title: 'Apple Music', time: 'Hôm nay, 10:42 AM', amount: -9.99, type: 'expense', icon: 'music' },
                { id: 2, title: 'Tạp hóa', time: 'Hôm nay, 08:15 AM', amount: -45.20, type: 'expense', icon: 'shopping' },
                { id: 3, title: 'Lương', time: 'Hôm qua, 05:00 PM', amount: 3200.00, type: 'income', icon: 'work' },
            ];
            setTransactions(mockData);
        } catch (error) {
            console.error("Lỗi tải giao dịch:", error);
        }
    };

    // Hàm phụ trợ để render Icon động dựa trên loại giao dịch
    const renderTxIcon = (type) => {
        switch(type) {
            case 'music': return <Music size={18} className="text-blue-500" />;
            case 'shopping': return <ShoppingBag size={18} className="text-blue-500" />;
            case 'work': return <Briefcase size={18} className="text-green-500" />;
            default: return <CreditCard size={18} />;
        }
    };

    // --- EFFECT KHỞI TẠO ---
    useEffect(() => {
        checkWalletConnection();
        fetchTransactions();

        if (typeof window.ethereum !== 'undefined') {
            const handleAccountsChanged = (accounts) => checkWalletConnection();
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    }, []);

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header flex-header">
                <div>
                    <h1 className="welcome-text">Chào mừng trở lại, {user?.username || 'hungsayhi'}!</h1>
                    <p className="subtitle">Đây là tổng quan tài chính của bạn hôm nay.</p>
                </div>
                
                {/* --- NÚT KẾT NỐI / ĐỒNG BỘ METAMASK --- */}
                {/* Đã bỏ điều kiện ẩn nút, nút sẽ luôn luôn hiển thị */}
                <button 
                    className="connect-wallet-btn" 
                    onClick={handleSync}
                    disabled={isConnecting}
                >
                    {isConnecting ? 'Đang xử lý...' : (
                        (walletAddress === "Chưa kết nối" || walletAddress === "Đang tải...") 
                        ? '🦊 Kết nối MetaMask' 
                        : '🔄 Đồng bộ ví'
                    )}
                </button>
            </div>

            <div className="dashboard-grid">
                {/* --- CỘT TRÁI (MAIN) --- */}
                <div className="main-column">
                    
                    {/* Thẻ số dư (Balance Card) */}
                    <div className="balance-card">
                        <div className="card-top-info">
                            <p className="card-label">SỐ TÀI KHOẢN (VÍ)</p>
                           <p className="card-number" style={{ fontSize: '15px', wordBreak: 'break-all' }}>
                                {walletAddress !== "Chưa kết nối" && walletAddress !== "Đang tải..." 
                                    ? walletAddress 
                                    : "----"}
                            </p>
                        </div>
                        
                        <div className="card-bottom-info">
                            <div>
                                <p className="card-label">SỐ DƯ HIỆN TẠI</p>
                                {/* Khu vực hiển thị số dư */}
                                <div className="balance-display">
                                    <h2 className="balance-amount">
                                        {/* Đổi chữ ETH thành SepoliaETH ở cả hai trạng thái hiện/ẩn */}
                                        {showBalance ? `${walletBalance} SepoliaETH` : '****** SepoliaETH'}
                                    </h2>
                                    <button className="eye-btn" onClick={() => setShowBalance(!showBalance)}>
                                        {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="wallet-icon-wrapper">
                                <CreditCard size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Nút hành động (Action Buttons) */}
                    <div className="action-buttons-grid">
                        {/* Note: Điều hướng sang trang Transfer.jsx */}
                        <button className="action-btn active" onClick={() => navigate('/transfer')}>
                            <Send size={20} />
                            <span>Chuyển tiền</span>
                        </button>
                        
                        <button className="action-btn" onClick={handleDeposit}>
                            <PlusCircle size={20} />
                            <span>Nạp tiền</span>
                        </button>
                        
                        {/* Note: Điều hướng sang trang BillPay.jsx */}
                        <button className="action-btn" onClick={() => navigate('/bill-pay')}>
                            <CreditCard size={20} />
                            <span>Thanh toán</span>
                        </button>
                    </div>

                    {/* Thống kê thu chi (Stats) */}
                    <div className="stats-row">
                        <div className="stat-box">
                            <p className="stat-label">Tổng thu nhập tháng này</p>
                            <div className="stat-value-row">
                                <h3 className="stat-amount">$5,240.00</h3>
                                <span className="stat-badge positive">
                                    <TrendingUp size={14} /> +12%
                                </span>
                            </div>
                        </div>
                        <div className="stat-box">
                            <p className="stat-label">Tổng chi tiêu tháng này</p>
                            <div className="stat-value-row">
                                <h3 className="stat-amount">$3,120.00</h3>
                                <span className="stat-badge negative">
                                    <TrendingDown size={14} /> -5%
                                </span>
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
                            {transactions.map((tx) => (
                                <div className="tx-item" key={tx.id}>
                                    <div className={`tx-icon ${tx.icon === 'work' ? 'bg-green-light' : 'bg-blue-light'}`}>
                                        {renderTxIcon(tx.icon)}
                                    </div>
                                    <div className="tx-info">
                                        <p className="tx-title">{tx.title}</p>
                                        <p className="tx-time">{tx.time}</p>
                                    </div>
                                    <div className={`tx-amount ${tx.type === 'income' ? 'text-green' : 'text-dark'}`}>
                                        {tx.type === 'income' ? '+' : ''}{tx.type !== 'income' && tx.amount > 0 ? '-' : ''}{tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Banner Premium */}
                    <div className="premium-banner">
                        <div className="premium-content">
                            <h3>⭐ Nâng cấp Premium</h3>
                            <p>Hạn mức cao hơn & phí thấp hơn</p>
                            <button className="premium-btn">Tìm hiểu thêm</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;