import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, SvgIcon } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn'; // Hoặc một icon phù hợp khác nếu LinkedIn không có sẵn

// SVG Icon cho AppGallery (ví dụ, bạn có thể thay thế bằng ảnh hoặc icon thật)
const AppGalleryIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    {/* Đây là một placeholder, bạn cần SVG path thật */}
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
  </SvgIcon>
);


const Footer = () => {
  const currentYear = new Date().getFullYear();

  const customerServiceLinks = [
    { name: 'Trung Tâm Trợ Giúp', href: '#' },
    { name: 'Shopee Blog', href: '#' },
    { name: 'Shopee Mall', href: '#' },
    { name: 'Hướng Dẫn Mua Hàng', href: '#' },
    { name: 'Hướng Dẫn Bán Hàng', href: '#' },
    { name: 'Thanh Toán', href: '#' }, // ShopeePay được liệt kê ở DVKH trong ảnh, không phải ở mục Thanh Toán riêng
    { name: 'Shopee Xu', href: '#' },
    { name: 'Vận Chuyển', href: '#' }, // "Đơn Hàng" và "Trả Hàng Hoàn Tiền" liên quan đến Vận Chuyển/Đơn hàng
    { name: 'Trả Hàng & Hoàn Tiền', href: '#' },
    { name: 'Chăm Sóc Khách Hàng', href: '#' }, // Liên Hệ Shopee -> CSKH
    { name: 'Chính Sách Bảo Hành', href: '#' },
  ];

  const aboutShopeeLinks = [
    { name: 'Giới Thiệu Về Shopee Việt Nam', href: '#' },
    { name: 'Tuyển Dụng', href: '#' },
    { name: 'Điều Khoản Shopee', href: '#' },
    { name: 'Chính Sách Bảo Mật', href: '#' },
    { name: 'Chính Hãng', href: '#' }, // Shopee Mall đã có, có thể là mục khác
    { name: 'Kênh Người Bán', href: '#' },
    { name: 'Flash Sales', href: '#' },
    { name: 'Chương Trình Tiếp Thị Liên Kết', href: '#' }, // Tiếp Thị Liên Kết
    { name: 'Liên Hệ Với Truyền Thông', href: '#' },
  ];

  const paymentIcons = [
    { alt: 'VISA', src: 'https://img.icons8.com/color/48/000000/visa.png', href: '#' },
    { alt: 'Mastercard', src: 'https://img.icons8.com/color/48/000000/mastercard-logo.png', href: '#' },
    { alt: 'JCB', src: 'https://img.icons8.com/color/48/000000/jcb.png', href: '#' }, // Placeholder, tìm icon JCB
    { alt: 'American Express', src: 'https://img.icons8.com/color/48/000000/amex.png', href: '#' },
    { alt: 'Trả Góp 0%', src: 'https://img.icons8.com/fluency/48/000000/cash-in-hand.png', href: '#' }, // Placeholder
    { alt: 'ShopeePay', src: 'https://img.icons8.com/color/48/shopee.png', href: '#' }, // Placeholder
     // S PayLater không có icon sẵn, có thể dùng text hoặc tự tạo
  ];

  const shippingIcons = [
    { alt: 'SPX Express', src: 'https://img.icons8.com/ios-filled/50/000000/delivery.png', href: '#' }, // Placeholder
    { alt: 'Giao Hàng Tiết Kiệm', src: 'https://img.icons8.com/ios-filled/50/000000/delivery-time.png', href: '#' }, // Placeholder
    { alt: 'Viettel Post', src: 'https://img.icons8.com/ios-filled/50/000000/truck.png', href: '#' }, // Placeholder
    { alt: 'Vietnam Post', src: 'https://img.icons8.com/ios-filled/50/000000/mailbox-closed-flag-down.png', href: '#' }, // Placeholder
    { alt: 'J&T Express', src: 'https://img.icons8.com/ios-filled/50/000000/product-documents.png', href: '#' }, // Placeholder
    { alt: 'GrabExpress', src: 'https://img.icons8.com/ios-filled/50/000000/motorcycle-delivery-single-box.png', href: '#' }, // Placeholder
    // Thêm các icon khác nếu cần
  ];
  
  const appDownload = {
    qrCode: 'https://img.icons8.com/ios/100/000000/qr-code.png', // Placeholder QR code
    stores: [
      { name: 'App Store', icon: 'https://img.icons8.com/ios-filled/50/000000/mac-os.png', href: '#' }, // Placeholder
      { name: 'Google Play', icon: 'https://img.icons8.com/color/48/000000/google-play.png', href: '#' },
      { name: 'AppGallery', iconComponent: AppGalleryIcon, href: '#' }, // Sử dụng SVG Icon hoặc ảnh
    ]
  };

  const countries = [
    { name: 'Singapore', href: '#' }, { name: 'Indonesia', href: '#' }, { name: 'Thái Lan', href: '#' },
    { name: 'Malaysia', href: '#' }, { name: 'Việt Nam', href: '#' }, { name: 'Philippines', href: '#' },
    { name: 'Brazil', href: '#' }, { name: 'México', href: '#' }, { name: 'Colombia', href: '#' },
    { name: 'Chile', href: '#' }, { name: 'Đài Loan', href: '#' },
  ];


  const LinkItem = ({ href, children }) => (
    <Link href={href} variant="body2" color="text.secondary" display="block"
      sx={{ 
        mb: 0.8, 
        textDecoration: 'none', 
        '&:hover': { color: 'primary.main', textDecoration: 'underline' } 
      }}>
      {children}
    </Link>
  );

  return (
    <Box sx={{ bgcolor: 'background.paper', py: 6, borderTop: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Cột 1: Dịch Vụ Khách Hàng */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              DỊCH VỤ KHÁCH HÀNG
            </Typography>
            {customerServiceLinks.map(link => <LinkItem key={link.name} href={link.href}>{link.name}</LinkItem>)}
          </Grid>

          {/* Cột 2: Về Shopee */}
          <Grid item xs={12} sm={6} md={2}> {/* Cột này có thể hẹp hơn */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              VỀ SHOPEE
            </Typography>
            {aboutShopeeLinks.map(link => <LinkItem key={link.name} href={link.href}>{link.name}</LinkItem>)}
          </Grid>
          
          {/* Cột 3: Thanh Toán & Vận Chuyển */}
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                THANH TOÁN
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {paymentIcons.map(icon => (
                  <Link href={icon.href} key={icon.alt} target="_blank" rel="noopener">
                    <img src={icon.src} alt={icon.alt} style={{ height: '28px', verticalAlign: 'middle' }} />
                  </Link>
                ))}
                 {/* S PayLater có thể thêm dưới dạng text hoặc ảnh nếu có */}
                 <Typography variant="caption" component="span" sx={{height: '28px', display: 'inline-flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '0 6px', backgroundColor: '#f5f5f5'}}>S PayLater</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                ĐƠN VỊ VẬN CHUYỂN
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {shippingIcons.map(icon => (
                  <Link href={icon.href} key={icon.alt} target="_blank" rel="noopener">
                    <img src={icon.src} alt={icon.alt} style={{ height: '28px', verticalAlign: 'middle' }}/>
                  </Link>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Cột 4: Theo dõi & Tải ứng dụng */}
          <Grid item xs={12} sm={6} md={4}> {/* Cột này có thể rộng hơn để chứa QR và app stores */}
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                THEO DÕI CHÚNG TÔI TRÊN
              </Typography>
              <Box>
                <Link href="#" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  <FacebookIcon sx={{ mr: 1 }} /> Facebook
                </Link>
                <Link href="#" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  <InstagramIcon sx={{ mr: 1 }} /> Instagram
                </Link>
                <Link href="#" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  <LinkedInIcon sx={{ mr: 1 }} /> LinkedIn
                </Link>
              </Box>
            </Box>

            <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    TẢI ỨNG DỤNG SHOPEE NGAY THÔI
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <img src={appDownload.qrCode} alt="QR Code Shopee App" style={{ height: '80px', width: '80px', border: '1px solid #e0e0e0', borderRadius: '4px' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        {appDownload.stores.map(store => (
                            <Link href={store.href} key={store.name} target="_blank" rel="noopener" sx={{display: 'inline-block'}}>
                                {store.iconComponent ? 
                                 <store.iconComponent sx={{ height: '28px', width: 'auto', verticalAlign: 'middle' }} /> :
                                 <img src={store.icon} alt={store.name} style={{ height: '28px', verticalAlign: 'middle' }} />
                                }
                            </Link>
                        ))}
                    </Box>
                </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Thanh dưới cùng */}
        <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 4, pt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb:1 }}>
            © {currentYear} Shopee. Tất cả các quyền được bảo lưu.
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            Quốc gia & Khu vực:
            {countries.map((country, index) => (
              <React.Fragment key={country.name}>
                <Link href={country.href} color="inherit" sx={{ mx: 0.5, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {country.name}
                </Link>
                {index < countries.length - 1 && <Box component="span" sx={{ mx: 0.5 }}>|</Box>}
              </React.Fragment>
            ))}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;