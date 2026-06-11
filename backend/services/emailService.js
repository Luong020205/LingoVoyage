const nodemailer = require('nodemailer');

// Khởi tạo transporter từ các biến môi trường .env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465', // true cho port 465, false cho các port khác
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Gửi email chứa mã OTP khôi phục mật khẩu
 * @param {string} toEmail Email người nhận
 * @param {string} otp Mã OTP 6 chữ số
 */
const sendOtpEmail = async (toEmail, otp) => {
    // Chỉ gửi email thật nếu đã cấu hình tài khoản gửi
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'YOUR_GMAIL_ACCOUNT@gmail.com') {
        console.warn(`⚠️ SMTP Credentials not configured or using default placeholders. Skipping real email sending. OTP is: ${otp}`);
        return false;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || `"LingoVoyage Support" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `🔑 [LingoVoyage] Mã xác nhận khôi phục mật khẩu: ${otp}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LingoVoyage - Khôi phục mật khẩu</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #f8fafc;
                    color: #334155;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }
                .header {
                    background: linear-gradient(135deg, #FF6B35 0%, #FF8F66 100%);
                    padding: 40px 20px;
                    text-align: center;
                }
                .logo {
                    font-size: 32px;
                    font-weight: 800;
                    color: #ffffff;
                    letter-spacing: 1px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    margin-bottom: 5px;
                }
                .subtitle {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 14px;
                    font-weight: 500;
                }
                .content {
                    padding: 40px 30px;
                    line-height: 1.6;
                }
                h2 {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-top: 0;
                }
                p {
                    font-size: 15px;
                    color: #475569;
                    margin-bottom: 25px;
                }
                .otp-box {
                    background-color: #fff7ed;
                    border: 2px dashed #ffedd5;
                    border-radius: 16px;
                    padding: 24px;
                    text-align: center;
                    margin: 30px 0;
                }
                .otp-code {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 42px;
                    font-weight: 800;
                    color: #ea580c;
                    letter-spacing: 8px;
                    margin: 0;
                    line-height: 1;
                }
                .otp-label {
                    font-size: 12px;
                    color: #9a3412;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-top: 8px;
                }
                .warning-text {
                    font-size: 13px;
                    color: #94a3b8;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 20px;
                    margin-top: 30px;
                }
                .footer {
                    background-color: #f1f5f9;
                    padding: 24px;
                    text-align: center;
                    font-size: 12px;
                    color: #64748b;
                    border-top: 1px solid #e2e8f0;
                }
                .footer a {
                    color: #FF6B35;
                    text-decoration: none;
                    font-weight: 500;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🌍 LingoVoyage</div>
                    <div class="subtitle">Khám phá văn hóa - Chinh phục ngôn ngữ</div>
                </div>
                <div class="content">
                    <h2>Yêu cầu khôi phục mật khẩu</h2>
                    <p>Chào bạn,</p>
                    <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản LingoVoyage của bạn. Vui lòng sử dụng mã xác minh OTP bên dưới để tiến hành đặt lại mật khẩu mới:</p>
                    
                    <div class="otp-box">
                        <div class="otp-code">${otp}</div>
                        <div class="otp-label">Mã OTP xác thực</div>
                    </div>
                    
                    <p>Mã xác minh này có hiệu lực trong vòng <strong>15 phút</strong>. Vì lý do bảo mật, <strong>tuyệt đối không chia sẻ mã này cho bất kỳ ai</strong>.</p>
                    <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này, mật khẩu của bạn sẽ được giữ an toàn.</p>
                    
                    <div class="warning-text">
                        ⚠️ Đây là email tự động từ hệ thống LingoVoyage, vui lòng không trả lời trực tiếp email này.
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2026 LingoVoyage. Bảo lưu mọi quyền.</p>
                    <p>Hỗ trợ kỹ thuật: <a href="mailto:support@lingovoyage.com">support@lingovoyage.com</a></p>
                </div>
            </div>
        </body>
        </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`❌ Error sending email to ${toEmail}:`, err);
        throw new Error('Không thể gửi email OTP, vui lòng kiểm tra lại cấu hình SMTP hoặc thử lại sau');
    }
};

module.exports = {
    sendOtpEmail
};
