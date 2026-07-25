import React, { createContext, useState, useContext } from 'react';

export const translations = {
    vi: {
        // --- Giao diện chung (Layout, Menu, Header, Footer) ---
        menuHome: "Trang Chủ",
        menuTransfer: "Chuyển Tiền",
        menuPayment: "Thanh Toán",
        menuHistory: "Lịch Sử Giao Dịch",
        menuSettings: "Cài đặt",
        logout: "Đăng Xuất",
        searchPlaceholder: "Tìm kiếm tính năng, giao dịch...",
        memberTier: "Thành viên Bạc",
        footerRights: "© 2026 ABC Bank. All rights reserved.",
        terms: "Điều khoản sử dụng",
        guideService: "Hướng dẫn sử dụng dịch vụ",
        guideTransaction: "Hướng dẫn giao dịch",

        // --- Cài đặt trang Settings ---
        settingsTitle: "Cài đặt",
        settingsSubtitle: "Quản lý tài khoản, bảo mật và tùy chọn hệ thống của bạn.",
        personalInfo: "Thông tin cá nhân",
        edit: "Chỉnh sửa",
        changePhoto: "Thay đổi ảnh",
        fullName: "Họ và tên",
        email: "Email",
        phone: "Số điện thoại",
        notUpdated: "Chưa cập nhật",
        langAndRegion: "Ngôn ngữ & Vùng",
        language: "Ngôn ngữ",
        security: "Bảo mật",
        changePassword: "Đổi mật khẩu",
        lastChanged30Days: "Cập nhật lần cuối: 30 ngày trước",
        smartOtp: "Cài đặt mã PIN SmartOTP",
        smartOtpDesc: "Dùng cho xác thực giao dịch",
        biometric: "Xác thực sinh trắc học",
        biometricDesc: "Face ID / Vân tay",
        notifications: "Thông báo",
        appNotifications: "Thông báo ứng dụng",
        appNotifDesc: "Nhận tin báo số dư & hệ thống qua Push",
        promotions: "Ưu đãi & Khuyến mãi",
        promotionsDesc: "Tin tức từ Ngân hàng",
        vietnamese: "Tiếng Việt",
        english: "English",

        // --- Trang Chủ (Dashboard) ---
        welcomeBack: "Chào mừng trở lại",
        financialOverview: "Cập nhật tổng quan tài chính của bạn hôm nay.",
        sync: "Đồng bộ",
        accountNumber: "SỐ TÀI KHOẢN",
        currentBalance: "SỐ DƯ HIỆN TẠI",
        transferBtn: "Chuyển tiền",
        depositBtn: "Nạp tiền",
        paymentBtn: "Thanh toán",
        incomeThisMonth: "Thu nhập tháng này",
        expenseThisMonth: "Chi tiêu tháng này",
        recentTransactions: "Giao dịch gần đây",
        viewAll: "Xem tất cả",
        noTransactions: "Chưa có giao dịch nào.",
        upgradeAccount: "Nâng cấp tài khoản",
        upgradeDesc: "Tận hưởng hạn mức chuyển tiền lên đến 2 tỷ/ngày và miễn phí mọi giao dịch.",
        learnMore: "Tìm hiểu thêm",

        // --- Chuyển Tiền (Transfer) ---
        transferTitle: "Chuyển tiền",
        transferDesc: "Thực hiện giao dịch an toàn và nhanh chóng trên mạng lưới Sepolia.",
        transferMethod: "Phương thức chuyển",
        standardWallet: "Ví thông thường",
        normalWallet: "Ví thông thường", // Bổ sung key từ UI
        freeTransaction: "Miễn phí giao dịch",
        smartContract: "Smart Contract",
        fast247: "24/7 Nhanh chóng",
        viaENS: "Qua tên miền ENS",
        ensDomain: "Qua tên miền ENS", // Bổ sung key từ UI
        convenientContacts: "Danh bạ tiện lợi",
        transactionDetails: "Thông tin giao dịch",
        transactionInfo: "Thông tin giao dịch", // Bổ sung key từ UI
        sourceAccount: "Tài khoản nguồn",
        walletPrefix: "Ví:",
        wallet: "Ví:", // Bổ sung key từ UI
        balancePrefix: "Số dư:",
        balance: "Số dư:", // Bổ sung key từ UI
        recipientAddress: "Địa chỉ ví nhận",
        enterAddressPlaceholder: "Nhập địa chỉ ví 0x...",
        enterAddress: "Nhập địa chỉ ví 0x...", // Bổ sung key từ UI
        amountLabel: "Số tiền (SepoliaETH)",
        transferMemo: "Nội dung chuyển tiền", // Bổ sung key từ UI
        memoExample: "Vd: Chuyển tiền ăn trưa", // Bổ sung key từ UI
        recentRecipients: "Người nhận gần đây",
        searchRecipient: "Tìm theo tên, địa chỉ ví...",
        noTransferHistory: "Chưa có lịch sử chuyển tiền nào.",
        noRecentTransfers: "Chưa có danh bạ chuyển tiền nào.", // Bổ sung key từ UI

        // --- Thanh Toán (Payment) ---
        paymentTitle: "Thanh Toán Dịch Vụ",
        billPayTitle: "Thanh Toán Dịch Vụ", // Bổ sung key từ UI
        paymentDesc: "Lựa chọn dịch vụ và nhập thông tin để thanh toán nhanh chóng.",
        billPaySubtitle: "Lựa chọn dịch vụ và nhập thông tin để thanh toán nhanh chóng.", // Bổ sung key từ UI
        selectServiceType: "Chọn loại dịch vụ",
        electricity: "Tiền Điện",
        billElectric: "Tiền Điện", // Bổ sung key từ UI
        water: "Tiền Nước",
        billWater: "Tiền Nước", // Bổ sung key từ UI
        internet: "Internet / 4G",
        billInternet: "Internet / 4G", // Bổ sung key từ UI
        customerId: "Mã khách hàng / Số hợp đồng",
        customerCode: "Mã khách hàng / Số hợp đồng", // Bổ sung key từ UI
        customerIdExample: "Vd: PE0123456789",
        customerCodePlaceholder: "Vd: PE0123456789", // Bổ sung key từ UI
        amountToPay: "Số tiền cần thanh toán (VNĐ)",
        paymentAmountVND: "Số tiền cần thanh toán (VNĐ)", // Bổ sung key từ UI
        payNow: "Thanh Toán Ngay",
        billPaySuccess: "Thanh toán hóa đơn thành công!",
        billPayError: "Không thể thanh toán, vui lòng thử lại sau.",
        processingTx: "Đang xử lý giao dịch...",

        // --- Lịch Sử Giao Dịch (History) ---
        historyTitle: "Lịch sử giao dịch",
        transactionHistory: "Lịch sử giao dịch", // Bổ sung key từ UI
        historyDescPrefix: "Các giao dịch SepoliaETH của ví",
        sepoliaTransactionsForWallet: "Các giao dịch SepoliaETH của ví", // Bổ sung key từ UI
        displayData: "DỮ LIỆU HIỂN THỊ",
        allTransactions: "Tất cả giao dịch",
        confirmed: "Đã xác nhận",
        onChainTransactions: "Giao dịch on-chain",
        transactionCount: "giao dịch",
        transactionsCount: "giao dịch", // Bổ sung key từ UI
        noTransactionsFromWallet: "Chưa có giao dịch nào từ ví này."
    },
    en: {
        // --- General Interface ---
        menuHome: "Home",
        menuTransfer: "Transfer",
        menuPayment: "Payment",
        menuHistory: "Transaction History",
        menuSettings: "Settings",
        logout: "Logout",
        searchPlaceholder: "Search features, transactions...",
        memberTier: "Silver Member",
        footerRights: "© 2026 ABC Bank. All rights reserved.",
        terms: "Terms of Use",
        guideService: "Service Guide",
        guideTransaction: "Transaction Guide",

        // --- Settings Page ---
        settingsTitle: "Settings",
        settingsSubtitle: "Manage your account, security, and system preferences.",
        personalInfo: "Personal Information",
        edit: "Edit",
        changePhoto: "Change photo",
        fullName: "Full Name",
        email: "Email",
        phone: "Phone Number",
        notUpdated: "Not updated",
        langAndRegion: "Language & Region",
        language: "Language",
        security: "Security",
        changePassword: "Change Password",
        lastChanged30Days: "Last updated: 30 days ago",
        smartOtp: "SmartOTP PIN Settings",
        smartOtpDesc: "Used for transaction verification",
        biometric: "Biometric Authentication",
        biometricDesc: "Face ID / Fingerprint",
        notifications: "Notifications",
        appNotifications: "App Notifications",
        appNotifDesc: "Receive balance & system alerts via Push",
        promotions: "Offers & Promotions",
        promotionsDesc: "Bank news and offers",
        vietnamese: "Tiếng Việt",
        english: "English",

        // --- Dashboard ---
        welcomeBack: "Welcome back",
        financialOverview: "Today's financial overview update.",
        sync: "Sync",
        accountNumber: "ACCOUNT NUMBER",
        currentBalance: "CURRENT BALANCE",
        transferBtn: "Transfer",
        depositBtn: "Deposit",
        paymentBtn: "Payment",
        incomeThisMonth: "This month's income",
        expenseThisMonth: "This month's expenses",
        recentTransactions: "Recent transactions",
        viewAll: "View all",
        noTransactions: "No transactions yet.",
        upgradeAccount: "Upgrade account",
        upgradeDesc: "Enjoy transfer limits up to 2 billion/day and free transactions.",
        learnMore: "Learn more",

        // --- Transfer ---
        transferTitle: "Transfer",
        transferDesc: "Perform secure and fast transactions on the Sepolia network.",
        transferMethod: "Transfer method",
        standardWallet: "Standard Wallet",
        normalWallet: "Standard Wallet",
        freeTransaction: "Free transactions",
        smartContract: "Smart Contract",
        fast247: "24/7 Fast",
        viaENS: "Via ENS domain",
        ensDomain: "Via ENS domain",
        convenientContacts: "Convenient contacts",
        transactionDetails: "Transaction details",
        transactionInfo: "Transaction details",
        sourceAccount: "Source account",
        walletPrefix: "Wallet:",
        wallet: "Wallet:",
        balancePrefix: "Balance:",
        balance: "Balance:",
        recipientAddress: "Recipient wallet address",
        enterAddressPlaceholder: "Enter wallet address 0x...",
        enterAddress: "Enter wallet address 0x...",
        amountLabel: "Amount (SepoliaETH)",
        transferMemo: "Transfer memo",
        memoExample: "Ex: Lunch money",
        recentRecipients: "Recent recipients",
        searchRecipient: "Search by name, wallet address...",
        noTransferHistory: "No transfer history yet.",
        noRecentTransfers: "No recent recipients found.",

        // --- Payment ---
        paymentTitle: "Service Payment",
        billPayTitle: "Service Payment",
        paymentDesc: "Select a service and enter details for quick payment.",
        billPaySubtitle: "Select a service and enter details for quick payment.",
        selectServiceType: "Select service type",
        electricity: "Electricity",
        billElectric: "Electricity",
        water: "Water",
        billWater: "Water",
        internet: "Internet / 4G",
        billInternet: "Internet / 4G",
        customerId: "Customer ID / Contract number",
        customerCode: "Customer ID / Contract number",
        customerIdExample: "Ex: PE0123456789",
        customerCodePlaceholder: "Ex: PE0123456789",
        amountToPay: "Amount to pay (VND)",
        paymentAmountVND: "Amount to pay (VND)",
        payNow: "Pay Now",
        billPaySuccess: "Bill paid successfully!",
        billPayError: "Unable to process payment, please try again later.",
        processingTx: "Processing transaction...",

        // --- History ---
        historyTitle: "Transaction History",
        transactionHistory: "Transaction History",
        historyDescPrefix: "SepoliaETH transactions of wallet",
        sepoliaTransactionsForWallet: "SepoliaETH transactions of wallet",
        displayData: "DISPLAY DATA",
        allTransactions: "All transactions",
        confirmed: "Confirmed",
        onChainTransactions: "On-chain transactions",
        transactionCount: "transactions",
        transactionsCount: "transactions",
        noTransactionsFromWallet: "No transactions from this wallet yet."
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'vi');

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('appLanguage', lang);
    };

    const t = (key) => {
        // Nếu không tìm thấy key, hiển thị lại key đó để dễ dàng debug (phát hiện lỗi thiếu dịch)
        return translations[language]?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);