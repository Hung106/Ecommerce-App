import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, CircularProgress, Alert, Paper, Grid,
    Button, Divider, TableContainer, Table, TableHead,
    TableBody, TableRow, TableCell, Chip, Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderStatus = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCanceling, setIsCanceling] = useState(false);

    const { orderId, customerId, selectedItems, orderDetails } = location.state || {};

    console.log('orderId:', orderId);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/orders/${orderId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('order data:', data);
            // Xử lý response theo cả 2 định dạng
            if (data.order_id || data.status) {
                // Định dạng đơn giản từ API
                console.log('orderIdetals: ', data.orderDetails);
                setOrder({
                    order_id: orderId,
                    status: data.status || 'pending',
                    payment_method: data.payment_method,
                    shipment_id: data.shipment_id,
                    date_ordered: data.date_ordered || new Date().toISOString(),
                    final_price: orderDetails.totalPrice || 0,
                    customer_id: customerId
                });

                // Nếu không có items từ API, sử dụng selectedItems từ state
                if (data.items) {
                    setItems(data.items);
                } else if (selectedItems) {
                    setItems(selectedItems.map(item => ({
                        ...item,
                        title: item.title || `Product ${item.product_id}` // Fallback title
                    })));
                }
            } else if (data.order && data.items) {
                // Định dạng đầy đủ từ API
                setOrder(data.order);
                setItems(data.items);
            } else {
                throw new Error('Invalid order data format');
            }
        } catch (err) {
            console.error('Fetch order error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    console.log('customer >>>:', customerId);

    const removeCartItems = async () => {
        if (!selectedItems || selectedItems.length === 0) return;

        try {
            const response = await fetch(`http://localhost:8080/api/cart/rm/${customerId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    lstP: selectedItems.map(item => ({
                        product_id: item.product_id,
                        color: item.color,
                        size: item.size
                    })),
                    all: false
                })
            });

            if (!response.ok) {
                throw new Error('Failed to remove items from cart');
            }
        } catch (err) {
            console.error('Remove cart items error:', err);
        }
    };

    useEffect(() => {
        if (!orderId || !customerId) {
            navigate('/');
            return;
        }

        fetchOrder();
        removeCartItems();
        const intervalId = setInterval(fetchOrder, 10000);

        return () => clearInterval(intervalId);
    }, [orderId, customerId, navigate]);



    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Về trang chủ
                </Button>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Không tìm thấy thông tin đơn hàng
                </Alert>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Về trang chủ
                </Button>
            </Container>
        );
    }

    // Hàm hiển thị trạng thái đơn hàng
    const renderStatus = (status) => {
        const statusMap = {
            'pending': { label: 'Đang xử lý', color: 'warning' },
            'shipping': { label: 'Đang giao hàng', color: 'primary' },
            'received': { label: 'Đã nhận', color: 'success' },
            'failed': { label: 'Đã hủy', color: 'error' }
        };

        const statusInfo = statusMap[status.toLowerCase()] || { label: status, color: 'default' };

        return (
            <Chip
                label={statusInfo.label}
                color={statusInfo.color}
                sx={{ fontSize: '1rem', p: 2, my: 2 }}
            />
        );
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

        setIsCanceling(true);
        try {
            const response = await fetch(`http://localhost:8080/api/orders/cancel/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(await response.text() || 'Hủy đơn hàng thất bại');
            }

            // Cập nhật trạng thái đơn hàng
            setOrder(prev => ({ ...prev, status: 'failed' }));
            setError(null);
            await fetchOrder(); // Fetch lại thông tin mới nhất
        } catch (err) {
            console.error('Cancel order error:', err);
            setError(err.message);
        } finally {
            setIsCanceling(false);
        }
    };

    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ my: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                        <Typography variant="h4">Đơn hàng của bạn</Typography>
                    </Stack>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={2} sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Thông tin đơn hàng
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography><strong>Mã khách hàng:</strong> {order.customer_id}</Typography>
                                    <Typography><strong>Mã đơn hàng:</strong> {order.order_id}</Typography>
                                    <Typography>
                                        <strong>Ngày đặt:</strong>{" "}
                                        {new Date(order.date_ordered).toLocaleDateString('vi-VN')}
                                    </Typography>

                                    {renderStatus(order.status)}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="h6" gutterBottom>
                                    Phương thức
                                </Typography>
                                <Box>
                                    <Typography><strong>Vận chuyển:</strong> {order.shipment_id}</Typography>
                                    {/* <Typography><strong>Thanh toán:</strong> {order.payment_method}</Typography> */}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin giao hàng
                </Typography>
                
                <Box>
                  <Typography><strong>Địa chỉ:</strong> {order.address}</Typography>
                  <Typography><strong>Số điện thoại:</strong> {order.phone}</Typography>
                </Box>
              </Paper>
            </Grid> */}
                    </Grid>

                    <TableContainer component={Paper} sx={{ mt: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Sản phẩm</TableCell>
                                    <TableCell align="right">Số lượng</TableCell>
                                    <TableCell align="right">Đơn giá</TableCell>
                                    <TableCell align="right">Thành tiền</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={`${item.product_id}-${item.color}-${item.size}`}>
                                        <TableCell>
                                            {item.title}
                                            <br />
                                            <Typography variant="body2" color="text.secondary">
                                                Màu: {item.color}, Size: {item.size}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">{item.quantity}</TableCell>
                                        <TableCell align="right">{item.paid_price.toLocaleString('vi-VN')} ₫</TableCell>
                                        <TableCell align="right">{(item.paid_price * item.quantity).toLocaleString('vi-VN')} ₫</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={3} align="right">
                                        <Typography variant="subtitle1">
                                            <strong>Tổng tiền:</strong>
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="subtitle1">
                                            <strong>{orderDetails.totalPrice.toLocaleString('vi-VN')} ₫</strong>
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/customerdashboard')}
                            sx={{ px: 4 }}
                        >
                            Về trang chủ
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/cart')}
                            sx={{ px: 4 }}
                        >
                            Xem giỏ hàng
                        </Button>
                        {order.status === 'pending' && (
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleCancelOrder}
                                disabled={isCanceling}
                                startIcon={<CancelIcon />}
                                sx={{ px: 4 }}
                            >
                                {isCanceling ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    'Hủy đơn hàng'
                                )}
                            </Button>
                        )}
                    </Box>
                </Paper>
            </Container>
            <Footer />
        </>
    );
};

export default OrderStatus;