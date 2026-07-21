import React, { createContext, useState, useContext } from 'react';

// 1. Từ điển chứa tất cả các đoạn văn bản trong hệ thống
export const translations = {
    vi: {
        // Cài đặt trang Settings
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
        english: "English"
    },
    en: {
        // Settings page translation
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
        english: "English"
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Đọc ngôn ngữ từ localStorage (mặc định là 'vi' nếu chưa chọn lần nào)
    const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'vi');

    // Hàm đổi ngôn ngữ và lưu lại vào bộ nhớ trình duyệt
    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('appLanguage', lang);
    };

    // Hàm tra cứu từ điển bằng từ khóa (Key)
    const t = (key) => {
        return translations[language]?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook tùy chỉnh giúp lấy dữ liệu ngôn ngữ dễ dàng hơn
export const useLanguage = () => useContext(LanguageContext);