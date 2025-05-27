// src/pages/OrderCustomerPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Paper,
    Grid,
    Chip,
    Button,
    Divider,
    Icon, // For icons next to text
    Stack // For easier layout of status and date
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Icon for date
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; // Icon for shipment
import PaymentIcon from '@mui/icons-material/Payment'; // Icon for payment
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket'; // Icon for product numbers
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Icon for error
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout'; // Icon for empty orders


import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NAVBAR_HEIGHT = '88px';

const OrderCustomerPage = () => {
    const [customerOrders, setCustomerOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerId, setCustomerId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            try {
                const parsedData = JSON.parse(userDataString);
                if (parsedData && parsedData.user_id) {
                    setCustomerId(parsedData.user_id);
                    setCustomerName(parsedData.full_name || parsedData.username || 'Khách hàng');
                } else {
                    setError("Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại.");
                    setLoading(false);
                }
            } catch (parseError) {
                console.error("Lỗi phân tích dữ liệu người dùng:", parseError);
                setError("Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại.");
                setLoading(false);
            }
        } else {
            setError("Vui lòng đăng nhập để xem lịch sử đơn hàng.");
            setLoading(false);
        }
    }, []);

    const fetchCustomerOrders = useCallback(async () => {
        if (!customerId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/api/orders/customer/${customerId}`);
            
            if (!response.ok) {
                let errorMsg = `Lỗi ${response.status}: Không thể tải lịch sử đơn hàng.`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorData.error || errorMsg;
                } catch (e) { /* Do nothing if response is not JSON */ }
                throw new Error(errorMsg);
            }
            
            const responseData = await response.json();
            const fetchedOrders = responseData.data || (Array.isArray(responseData) ? responseData : []);
            
            if (Array.isArray(fetchedOrders)) {
                setCustomerOrders(fetchedOrders.sort((a, b) => new Date(b.date_ordered) - new Date(a.date_ordered))); // Sort by newest first
            } else {
                console.error("Dữ liệu đơn hàng nhận được không phải là một mảng:", responseData);
                setCustomerOrders([]);
                setError("Định dạng dữ liệu đơn hàng không đúng từ API.");
            }

        } catch (err) {
            console.error("Lỗi khi tải lịch sử đơn hàng:", err);
            setError(err.message || "Đã xảy ra lỗi khi tải lịch sử đơn hàng của bạn.");
            setCustomerOrders([]);
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        if (customerId) {
            fetchCustomerOrders();
        }
    }, [customerId, fetchCustomerOrders]);

    const formatPrice = (price) => {
        if (typeof price !== 'number') return 'N/A';
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const getStatusChipStyle = (status) => {
        const lowerStatus = status?.toLowerCase() || '';
        if (lowerStatus.includes('delivered') || lowerStatus.includes('hoàn thành')) return { chip: 'success', iconColor: 'success.main' };
        if (lowerStatus.includes('shipping') || lowerStatus.includes('đang giao')) return { chip: 'info', iconColor: 'info.main' };
        if (lowerStatus.includes('processing') || lowerStatus.includes('đang xử lý')) return { chip: 'warning', iconColor: 'warning.main' };
        if (lowerStatus.includes('pending') || lowerStatus.includes('chờ xử lý')) return { chip: 'secondary', iconColor: 'secondary.main' };
        if (lowerStatus.includes('cancelled') || lowerStatus.includes('đã hủy')) return { chip: 'error', iconColor: 'error.main' };
        return { chip: 'default', iconColor: 'action.active' };
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: `calc(100vh - ${NAVBAR_HEIGHT} - 70px)`, mt: NAVBAR_HEIGHT }}>
                    <CircularProgress size={60} />
                </Box>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <Container sx={{ mt: `calc(${NAVBAR_HEIGHT} + 32px)`, mb: 5, pt: 3, minHeight: `calc(100vh - ${NAVBAR_HEIGHT} - 70px - 58px)` }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark', textAlign: 'center', mb: 4 }}>
                    Lịch sử đơn hàng
                </Typography>
                <Typography variant="h6" component="p" gutterBottom sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
                    Xin chào {customerName}, đây là các đơn hàng của bạn:
                </Typography>


                {error && (
                    <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, backgroundColor: 'error.lightest' }}>
                         <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                        <Typography variant="h6" color="error.dark" gutterBottom>Lỗi tải đơn hàng</Typography>
                        <Alert severity="error" sx={{ mb: 2, width: '100%', justifyContent: 'center' }}>
                            {error}
                        </Alert>
                        {!localStorage.getItem('userData') && (
                             <Button component={RouterLink} to="/login" variant="contained" color="primary" sx={{ mt: 1 }}>
                                Đăng nhập ngay
                            </Button>
                        )}
                         <Button component={RouterLink} to="/" variant="outlined" sx={{ mt: 2 }}>
                                Về trang chủ
                         </Button>
                    </Paper>
                )}

                {!error && customerOrders.length === 0 && (
                    <Paper elevation={3} sx={{ p: {xs: 2, md: 4}, textAlign: 'center', mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ShoppingCartCheckoutIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h5" gutterBottom sx={{fontWeight: 'medium'}}>
                            Bạn chưa có đơn hàng nào.
                        </Typography>
                        <Typography color="text.secondary" sx={{mb: 3}}>
                            Hãy bắt đầu khám phá và mua sắm những sản phẩm tuyệt vời!
                        </Typography>
                        <Button component={RouterLink} to="/" variant="contained" size="large" color="primary">
                            Bắt đầu mua sắm
                        </Button>
                    </Paper>
                )}

                {!error && customerOrders.length > 0 && (
                    <Grid container spacing={3}>
                        {customerOrders.map((order) => {
                            const statusStyle = getStatusChipStyle(order.status);
                            return (
                            <Grid item xs={12} key={order.order_id}>
                                <Paper elevation={3} sx={{ 
                                    p: {xs: 2, sm: 3}, 
                                    borderRadius: '12px', 
                                    borderLeft: `5px solid ${theme => theme.palette[statusStyle.chip]?.main || theme.palette.grey[400]}` ,
                                    transition: 'box-shadow 0.3s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0px 8px 25px -8px rgba(0,0,0,0.2)'
                                    }
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}>
                                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', flexGrow: 1, mb: {xs: 1, sm: 0} }}>
                                            Đơn hàng: #{order.order_id.substring(0, 8)}
                                        </Typography>
                                        <Chip
                                            label={order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Không rõ'}
                                            color={statusStyle.chip}
                                            size="medium"
                                            sx={{ fontWeight: 'bold', minWidth: '100px' }}
                                        />
                                    </Box>
                                    
                                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={{xs: 0.5, sm: 2}} sx={{ color: 'text.secondary', mb: 2, fontSize: '0.9rem' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarTodayIcon fontSize="inherit" sx={{ mr: 0.5, color: statusStyle.iconColor }} /> 
                                            Ngày đặt: {order.date_ordered ? new Date(order.date_ordered).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PaymentIcon fontSize="inherit" sx={{ mr: 0.5, color: statusStyle.iconColor }} /> 
                                            Thanh toán: {order.payment_method}
                                        </Box>
                                    </Stack>
                                    
                                    <Divider sx={{ my: 2.5, borderColor: 'grey.300' }} />

                                    <Grid container spacing={2} alignItems="flex-end">
                                        <Grid item xs={12} sm={7} md={8}>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                <ShoppingBasketIcon fontSize="inherit" sx={{ mr: 1, color: 'text.secondary' }} />
                                                Số lượng sản phẩm: <Typography component="span" sx={{ fontWeight: 'bold', ml: 0.5 }}>{order.product_numbers}</Typography>
                                            </Typography>
                                            {order.shipment_id && 
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <LocalShippingIcon fontSize="inherit" sx={{ mr: 1, color: 'text.secondary' }} />
                                                    Mã vận chuyển: <Typography component="span" sx={{ fontWeight: 'bold', ml: 0.5 }}>{order.shipment_id}</Typography>
                                                </Typography>
                                            }
                                        </Grid>
                                        <Grid item xs={12} sm={5} md={4} sx={{ textAlign: { sm: 'right' } }}>
                                            {typeof order.total_cost === 'number' && order.total_cost !== order.final_price && (
                                                <Typography variant="body2" color="text.secondary">
                                                    Tạm tính: {formatPrice(order.total_cost)}
                                                </Typography>
                                            )}
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.dark' }}>
                                                Tổng cộng: {formatPrice(order.final_price)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    {/* Ghi chú: Nếu có API trả về chi tiết items, bạn có thể hiển thị ở đây. */}
                                    {/* Ví dụ: Button xem chi tiết hoặc expand section */}
                                </Paper>
                            </Grid>
                        )})}
                    </Grid>
                )}
            </Container>
            <Footer />
        </>
    );
};

export default OrderCustomerPage;