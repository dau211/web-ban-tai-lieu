// Gọi công cụ gửi email mà chúng ta đã khai báo ở Bước 3
const nodemailer = require('nodemailer');

export default async function handler(request, response) {
  // Chỉ nhận lệnh giao hàng (POST)
  if (request.method !== 'POST') {
    return response.status(200).json({ message: 'Hệ thống giao hàng đã sẵn sàng' });
  }

  try {
    // 1. Lấy thông tin khách hàng và link file Word gốc từ hệ thống gửi tới
    const { emailKhach, tenSanPham, linkWord } = request.body;

    // 2. Cấu hình "Người bưu tá" (Dùng Gmail và 16 chữ cái bảo mật của bạn)
    // Lưu ý: Các biến process.env... chúng ta sẽ điền ở Bước 7 trên Vercel để bảo mật tuyệt đối
    const nguoiBuuTa = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_CUA_BAN, 
        pass: process.env.MAT_KHAU_UNG_DUNG 
      }
    });

    // 3. Soạn nội dung bức thư
    const bucThu = {
      from: process.env.EMAIL_CUA_BAN,
      to: emailKhach,
      subject: `[Tự động giao hàng] Tài liệu: ${tenSanPham}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
            <h2 style="color: #2563eb;">Cảm ơn bạn đã mua tài liệu!</h2>
            <p>Hệ thống đã nhận được thanh toán thành công cho sản phẩm: <b>${tenSanPham}</b>.</p>
            <p>Dưới đây là link tải file Word gốc của bạn. Vui lòng bấm vào nút bên dưới để tải về máy:</p>
            <a href="${linkWord}" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
                📥 TẢI FILE WORD TẠI ĐÂY
            </a>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                <i>Đây là email tự động. Chúc bạn một ngày học tập và làm việc hiệu quả!</i>
            </p>
        </div>
      `
    };

    // 4. Bấm nút Gửi thư đi
    await nguoiBuuTa.sendMail(bucThu);

    // 5. Báo cáo lại là đã gửi xong
    return response.status(200).json({ thanhCong: true, thongBao: 'Đã gửi file Word qua email!' });

  } catch (error) {
    return response.status(500).json({ loi: 'Có lỗi xảy ra, không thể gửi email.' });
  }
}