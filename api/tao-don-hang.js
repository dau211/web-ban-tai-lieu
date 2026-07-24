// Gọi công cụ PayOS mà chúng ta đã khai báo ở Bước 3
const PayOS = require('@payos/node');

// 3 mã bảo mật này chúng ta sẽ điền vào Vercel sau để bảo mật tuyệt đối, bây giờ cứ để dạng biến đại diện
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

export default async function handler(request, response) {
  // Bộ não này chỉ hoạt động khi có khách bấm nút gửi yêu cầu mua hàng (POST)
  if (request.method !== 'POST') {
    return response.status(200).json({ message: 'Hệ thống tạo đơn hàng đã sẵn sàng' });
  }

  try {
    // 1. Lấy thông tin khách hàng và sản phẩm từ trang web gửi lên
    const { tenKhach, email, maSanPham, tenSanPham, giaTien } = request.body;
    
    // 2. Tạo mã đơn hàng ngẫu nhiên bằng 6 chữ số
    const maDonHang = Number(String(Date.now()).slice(-6)); 

    // 3. Yêu cầu PayOS tạo mã QR động
    const thongTinThanhToan = {
      orderCode: maDonHang,
      amount: giaTien,
      description: `Mua ${maSanPham}`,
      cancelUrl: 'https://trang-web-cua-ban.com/huy', 
      returnUrl: 'https://trang-web-cua-ban.com/thanh-cong',
    };

    const linkThanhToan = await payos.createPaymentLink(thongTinThanhToan);

    // LƯU Ý: Phần mã lệnh ghi chữ "Chưa thanh toán" vào Google Sheets sẽ được ghép vào đây ở phần sau để bạn dễ kiểm tra lỗi từng phần.

    // 4. Trả mã QR về cho trang web hiển thị cho khách
    return response.status(200).json({
      thanhCong: true,
      linkQR: linkThanhToan.checkoutUrl
    });

  } catch (error) {
    return response.status(500).json({ loi: 'Có lỗi xảy ra khi tạo mã QR' });
  }
}