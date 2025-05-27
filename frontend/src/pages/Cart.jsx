// src/pages/Cart.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container, Typography, Box, CircularProgress, Alert, Paper, Grid,
    Button, IconButton, Checkbox, TextField, Divider, Link as MuiLink,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NAVBAR_HEIGHT = '88px';

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [rawCartData, setRawCartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [customerId, setCustomerId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            const parsedData = JSON.parse(userDataString);
            if (parsedData && parsedData.user_id) {
                setCustomerId(parsedData.user_id);
            } else {
                setLoading(false);
                setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
                // navigate('/login');
            }
        } else {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem giỏ hàng.");
            // navigate('/login');
        }
    }, [navigate]);

    const fetchCartDetails = useCallback(async () => {
        if (!customerId) return;
        setLoading(true);
        setError(null);
        try {
            const cartResponse = await fetch(`http://localhost:8080/api/cart/get/${customerId}`);
            if (!cartResponse.ok) {
                const errorData = await cartResponse.json().catch(() => ({}));
                throw new Error(errorData.message || "Không thể tải giỏ hàng.");
            }
            const cartData = await cartResponse.json();

            const rawItems = cartData.data || [];
            setRawCartData(rawItems);

            if (rawItems.length === 0) {
                setCartItems([]);
                setLoading(false);
                return;
            }

            const detailedItems = await Promise.all(
                rawItems.map(async (item) => {
                    try {
                        const productDetailsResponse = await fetch(`http://localhost:8080/api/products/get/${item.product_id}`);
                        if (!productDetailsResponse.ok) {
                            console.error(`Không thể lấy chi tiết sản phẩm ID: ${item.product_id}`);
                            return {
                                ...item,
                                title: `Sản phẩm ${item.product_id}`,
                                // Sử dụng placeholder cố định khi có lỗi fetch chi tiết sản phẩm
                                imageUrl: `https://via.placeholder.com/100?text=Error+L%C3%A1%BA%C2%A5y+SP`,
                                product_brand: 'N/A'
                            };
                        }
                        const productDetailsData = await productDetailsResponse.json();
                        const details = productDetailsData.data || productDetailsData;
                        return {
                            ...item,
                            title: details.title || `Sản phẩm ${item.product_id}`,
                            // Bỏ qua details.img, luôn dùng placeholder hoặc placeholder với tên sản phẩm
                            // Sử dụng tên sản phẩm trong placeholder nếu có, nếu không thì "No Image"
                            imageUrl: `https://via.placeholder.com/100?text=${encodeURIComponent(details.title || 'No Image')}`,
                            product_brand: details.brand,
                        };
                    } catch (e) {
                        console.error(`Lỗi fetch chi tiết cho sản phẩm ${item.product_id}:`, e);
                        return {
                            ...item,
                            title: `Sản phẩm ${item.product_id}`,
                            imageUrl: 'https://via.placeholder.com/100?text=Error',
                            product_brand: 'N/A'
                        };
                    }
                })
            );
            setCartItems(detailedItems);

        } catch (err) {
            setError(err.message);
            console.error("Lỗi khi tải giỏ hàng:", err);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        if (customerId) {
            fetchCartDetails();
        }
    }, [customerId, fetchCartDetails]);


    const handleSelectItem = (itemIdentifier) => {
        setSelectedItems(prevSelected =>
            prevSelected.some(s => s.product_id === itemIdentifier.product_id && s.color === itemIdentifier.color && s.size === itemIdentifier.size)
                ? prevSelected.filter(s => !(s.product_id === itemIdentifier.product_id && s.color === itemIdentifier.color && s.size === itemIdentifier.size))
                : [...prevSelected, itemIdentifier]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allItemIdentifiers = cartItems.map(item => ({ product_id: item.product_id, color: item.color, size: item.size }));
            setSelectedItems(allItemIdentifiers);
        } else {
            setSelectedItems([]);
        }
    };

    const performRemove = async (payload) => {
        if (!customerId) {
            alert("Lỗi: Không tìm thấy thông tin khách hàng.");
            return;
        }
        setIsProcessing(true);
        try {
            const response = await fetch(`http://localhost:8080/api/cart/rm/${customerId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || "Lỗi khi xóa sản phẩm.");
            }
            alert(responseData.message || "Đã xóa sản phẩm thành công.");
            setSelectedItems([]);
            fetchCartDetails();
        } catch (err) {
            console.error("Lỗi khi xóa khỏi giỏ hàng:", err);
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveSelectedItems = () => {
        if (selectedItems.length === 0) {
            alert("Vui lòng chọn sản phẩm để xóa.");
            return;
        }
        performRemove({ lstP: selectedItems, all: false });
    };

    const handleRemoveAllItems = () => {
        if (cartItems.length === 0) {
            alert("Giỏ hàng trống.");
            return;
        }
        if (window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
            performRemove({ all: true });
        }
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.paid_price * item.quantity), 0);
    };

    if (loading) {
        return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: `calc(100vh - ${NAVBAR_HEIGHT})`, mt: NAVBAR_HEIGHT }}><CircularProgress /></Box>);
    }

    if (error && !customerId) {
        return (<><Navbar /><Container sx={{ mt: `calc(${NAVBAR_HEIGHT} + 24px)`, mb: 3 }}><Alert severity="error">{error} <MuiLink component={RouterLink} to="/login">Đăng nhập ngay</MuiLink></Alert></Container><Footer /></>);
    }

    if (error) {
        return (<><Navbar /><Container sx={{ mt: `calc(${NAVBAR_HEIGHT} + 24px)`, mb: 3 }}><Alert severity="error">{error}</Alert></Container><Footer /></>);
    }
    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert("Giỏ hàng trống, vui lòng thêm sản phẩm trước khi thanh toán.");
            return;
        }

        navigate('/paymoney', {
            state: {
                selectedItems: cartItems,
                totalPrice: calculateTotalPrice()
            },
            replace: true
        });
    };
    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: `calc(${NAVBAR_HEIGHT} + 24px)`, mb: 4, pt: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
                    Giỏ Hàng Của Bạn
                </Typography>

                {cartItems.length === 0 ? (
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                        <RemoveShoppingCartIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>Giỏ hàng của bạn đang trống</Typography>
                        <Button variant="contained" component={RouterLink} to="/customerdashboard" startIcon={<AddShoppingCartIcon />}>
                            Tiếp tục mua sắm
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <TableContainer component={Paper} elevation={3}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead sx={{ backgroundColor: 'grey.100' }}>
                                        <TableRow>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    indeterminate={selectedItems.length > 0 && selectedItems.length < cartItems.length}
                                                    checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                                                    onChange={handleSelectAll}
                                                    disabled={isProcessing}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Đơn giá</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Số lượng</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thành tiền</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Xóa</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cartItems.map((item) => {
                                            const itemIdentifier = { product_id: item.product_id, color: item.color, size: item.size };
                                            const isItemSelected = selectedItems.some(s =>
                                                s.product_id === itemIdentifier.product_id &&
                                                s.color === itemIdentifier.color &&
                                                s.size === itemIdentifier.size
                                            );
                                            return (
                                                <TableRow
                                                    key={item.id}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    selected={isItemSelected}
                                                >
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={isItemSelected}
                                                            onChange={() => handleSelectItem(itemIdentifier)}
                                                            disabled={isProcessing}
                                                        />
                                                    </TableCell>
                                                    <TableCell component="th" scope="row">
                                                        <Box>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>{item.title || 'N/A'}</Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {item.product_brand && `Thương hiệu: ${item.product_brand}<br/>`}
                                                                    Màu: {item.color}, Size: {item.size}
                                                                </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">{item.paid_price.toLocaleString('vi-VN')} ₫</TableCell>
                                                    <TableCell align="center">{item.quantity}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{(item.paid_price * item.quantity).toLocaleString('vi-VN')} ₫</TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="Xóa sản phẩm này">
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => performRemove({ lstP: [itemIdentifier], all: false })}
                                                                disabled={isProcessing}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleRemoveSelectedItems}
                                    disabled={selectedItems.length === 0 || isProcessing}
                                    startIcon={<DeleteIcon />}
                                >
                                    Xóa mục đã chọn ({selectedItems.length})
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleRemoveAllItems}
                                    disabled={isProcessing}
                                >
                                    Xóa tất cả
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>Tổng cộng</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography>Tạm tính:</Typography>
                                    <Typography sx={{ fontWeight: 'bold' }}>{calculateTotalPrice().toLocaleString('vi-VN')} ₫</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Thành tiền:</Typography>
                                    <Typography variant="h5" color="error.main" sx={{ fontWeight: 'bold' }}>{calculateTotalPrice().toLocaleString('vi-VN')} ₫</Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    disabled={isProcessing}
                                    onClick={handleCheckout}
                                >
                                    Tiến hành Thanh Toán
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>
            <Footer />
        </>
    );
};

export default CartPage;