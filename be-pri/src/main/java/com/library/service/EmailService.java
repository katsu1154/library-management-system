package com.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetToken(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Đặt lại mật khẩu - Hệ thống Thư Viện");
        message.setText("Chào bạn,\n\nBạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhập mã OTP sau để tạo mật khẩu mới:\n\n" 
                + token + "\n\nMã OTP này sẽ hết hạn sau 1 giờ.\n\nTrân trọng,\nBan Quản Trị Thư Viện");
        mailSender.send(message);
    }

    public void sendOverdueReminder(String toEmail, String fullName, String bookTitle, long daysLate) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Thông báo: Sách mượn quá hạn - Hệ thống Thư Viện");
        message.setText("Chào " + fullName + ",\n\n"
                + "Cuốn sách '" + bookTitle + "' mà bạn mượn đã quá hạn " + daysLate + " ngày.\n"
                + "Vui lòng mang sách đến thư viện hoàn trả hoặc gia hạn trong thời gian sớm nhất.\n\n"
                + "Trân trọng,\nBan Quản Trị Thư Viện");
        mailSender.send(message);
    }

    public void sendViolationReminder(String toEmail, String fullName, String violationType, java.math.BigDecimal fineAmount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Nhắc nhở: Vi phạm chưa thanh toán - Hệ thống Thư Viện");
        message.setText("Chào " + fullName + ",\n\n"
                + "Bạn có một khoản phạt chưa được thanh toán:\n"
                + "  - Loại vi phạm: " + violationType + "\n"
                + "  - Số tiền phạt: " + String.format("%,.0f", fineAmount) + " VNĐ\n\n"
                + "Vui lòng đăng nhập vào hệ thống và thanh toán khoản phạt này trong thời gian sớm nhất.\n"
                + "Nếu không thanh toán, tài khoản của bạn có thể bị hạn chế.\n\n"
                + "Trân trọng,\nBan Quản Trị Thư Viện");
        mailSender.send(message);
    }

    public void sendOtpVerification(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Mã xác nhận đăng ký - Hệ thống Thư Viện");
        message.setText("Chào bạn,\n\nCảm ơn bạn đã đăng ký tài khoản tại Hệ thống Thư Viện.\n"
                + "Mã OTP xác nhận của bạn là: " + otpCode + "\n\n"
                + "Mã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nBan Quản Trị Thư Viện");
        mailSender.send(message);
    }
}
