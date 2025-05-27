import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {
  Container, Typography, Box, CircularProgress, Alert, Paper, Grid,
  Button, Divider, TextField, Radio, RadioGroup,
  FormControlLabel, FormControl, TableContainer, Table, TableHead,
  TableBody, TableRow, TableCell, Select, MenuItem, InputLabel,
  Stack
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Voucher from '../components/Voucher';

const PaymentConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  paymentMethod,
  setPaymentMethod, // Cần truyền setPaymentMethod vào đây
  isConfirming,
  creditCardInfo,
  setCreditCardInfo,
  bankTransferInfo,
  setBankTransferInfo,
  countdown
}) => {
  const [modalValidationError, setModalValidationError] = useState(null);

  // Sử dụng useCallback để ổn định các hàm set
  const handleSetCreditCardInfo = useCallback((key, value) => {
    setCreditCardInfo(prev => ({ ...prev, [key]: value }));
  }, [setCreditCardInfo]);

  const handleSetBankTransferInfo = useCallback((key, value) => {
    setBankTransferInfo(prev => ({ ...prev, [key]: value }));
  }, [setBankTransferInfo]);

  // Hàm kiểm tra tính hợp lệ của các trường trong modal
  // Hàm này KHÔNG set state modalValidationError trực tiếp, mà sẽ trả về boolean
  const isModalInputsValid = useMemo(() => {
    if (paymentMethod === 'credit') {
      return (
        creditCardInfo.number &&
        creditCardInfo.name &&
        creditCardInfo.expiry &&
        creditCardInfo.cvv
      );
    }
    if (paymentMethod === 'cash') {
      return (
        bankTransferInfo.accountHolder &&
        bankTransferInfo.bankAccount &&
        bankTransferInfo.bankName &&
        bankTransferInfo.expiryDate
      );
    }
    return true; // COD luôn hợp lệ về mặt input
  }, [paymentMethod, creditCardInfo, bankTransferInfo]);

  // useEffect để reset lỗi khi modal đóng hoặc phương thức thanh toán thay đổi
  useEffect(() => {
    if (!open) {
      setModalValidationError(null);
    } else {
      // Khi mở modal hoặc đổi phương thức thanh toán, kiểm tra lại validity
      // và set lỗi nếu có để hiển thị ngay lập tức
      if (!isModalInputsValid) {
        if (paymentMethod === 'credit') {
          setModalValidationError('Vui lòng điền đầy đủ thông tin thẻ tín dụng');
        } else if (paymentMethod === 'cash') {
          setModalValidationError('Vui lòng điền đầy đủ thông tin chuyển khoản ngân hàng');
        }
      } else {
        setModalValidationError(null);
      }
    }
  }, [open, paymentMethod, isModalInputsValid]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Xác nhận thanh toán</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Vui lòng xác nhận thông tin thanh toán để hoàn tất đơn hàng.
        </Typography>
        <FormControl>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => {
              if (e.target.value !== paymentMethod) {
                setPaymentMethod(e.target.value);
              }
            }}
          >
            <FormControlLabel value="cod" control={<Radio />} label="Thanh toán khi nhận hàng" />
            <FormControlLabel value="credit" control={<Radio />} label="Thẻ tín dụng" />
            <FormControlLabel value="cash" control={<Radio />} label="Chuyển khoản ngân hàng" />
          </RadioGroup>
        </FormControl>

        {paymentMethod === 'credit' && (
          <Box sx={{ mt: 2 }}>
            <TextField fullWidth label="Số thẻ" value={creditCardInfo.number} onChange={(e) => handleSetCreditCardInfo('number', e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Tên chủ thẻ" value={creditCardInfo.name} onChange={(e) => handleSetCreditCardInfo('name', e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Ngày hết hạn (MM/YY)" value={creditCardInfo.expiry} onChange={(e) => handleSetCreditCardInfo('expiry', e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="CVV" value={creditCardInfo.cvv} onChange={(e) => handleSetCreditCardInfo('cvv', e.target.value)} />
          </Box>
        )}

        {paymentMethod === 'cash' && (
          <Box sx={{ mt: 2 }}>
            <TextField fullWidth label="Chủ tài khoản" value={bankTransferInfo.accountHolder} onChange={(e) => handleSetBankTransferInfo('accountHolder', e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Số tài khoản" value={bankTransferInfo.bankAccount} onChange={(e) => handleSetBankTransferInfo('bankAccount', e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Ngân hàng" value={bankTransferInfo.bankName} onChange={(e) => handleSetBankTransferInfo('bankName', e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Ngày giao dịch (DD/MM/YYYY)" value={bankTransferInfo.expiryDate} onChange={(e) => handleSetBankTransferInfo('expiryDate', e.target.value)} />
          </Box>
        )}
        {modalValidationError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {modalValidationError}
          </Alert>
        )}

        <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
          Đơn hàng sẽ bị hủy sau {countdown} giây nếu không xác nhận.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isConfirming}>Hủy</Button>
        <Button
          onClick={() => {
            if (isModalInputsValid) {
              onConfirm();
            } else {
              if (paymentMethod === 'credit') {
                setModalValidationError('Vui lòng điền đầy đủ thông tin thẻ tín dụng');
              } else if (paymentMethod === 'cash') {
                setModalValidationError('Vui lòng điền đầy đủ thông tin chuyển khoản ngân hàng');
              }
            }
          }}
          color="primary"
          variant="contained"
          disabled={isConfirming || !isModalInputsValid}
        >
          {isConfirming ? <CircularProgress size={24} /> : 'Xác nhận thanh toán'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const NAVBAR_HEIGHT = '88px';

const PayMoney = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState('ship_002');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderId, setOrderId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [rtotalPrice, setRTotalPrice] = useState(0);
  const [creditCardInfo, setCreditCardInfo] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [bankTransferInfo, setBankTransferInfo] = useState({
    accountHolder: '',
    bankAccount: '',
    bankName: '',
    expiryDate: ''
  });
  const [countdown, setCountdown] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  // Voucher Pop up
  const [isPopupOpen, setIsPopup] = useState(false);
  function generateRandomString(id) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result + id;
  }
  const parseCode = (code) => {
    return parseInt(code.slice(-1))
  }
  const openPopup = () => {
    setIsPopup(true);
  };

  const closePopup = () => {
    setIsPopup(false);
  };
  const [voucher, setVoucher] = useState(null)
  const [promotion_id, setPromotionId] = useState(null)
  // Get cart data from location state
  const { selectedItems = [], totalPrice = 0 } = location.state || {};

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      navigate('/login');
      return;
    }

    const parsedData = JSON.parse(userDataString);
    setUserData(parsedData);

    if (!location.state?.selectedItems || location.state.selectedItems.length === 0) {
      alert('Vui lòng chọn sản phẩm từ giỏ hàng trước khi thanh toán');
      navigate('/cart');
    }
  }, [navigate, location.state]);

  const validateInputs = () => {
    // if (!promotion_id)
    // {
    //   setError("Vui lòng chọn voucher")
    //   return false;
    // }
    if (!phone || !address) {
      setError('Vui lòng điền đầy đủ số điện thoại và địa chỉ giao hàng');
      return false;
    }

    // Bổ sung phần này để kiểm tra thông tin thanh toán
    if (paymentMethod === 'credit' && (
      !creditCardInfo.number ||
      !creditCardInfo.name ||
      !creditCardInfo.expiry ||
      !creditCardInfo.cvv
    )) {
      setError('Vui lòng điền đầy đủ thông tin thẻ tín dụng');
      return false;
    }

    if (paymentMethod === 'cash' && (
      !bankTransferInfo.accountHolder ||
      !bankTransferInfo.bankAccount ||
      !bankTransferInfo.bankName ||
      !bankTransferInfo.expiryDate
    )) {
      setError('Vui lòng điền đầy đủ thông tin chuyển khoản ngân hàng');
      return false;
    }

    setError(null); // Xóa lỗi nếu tất cả thông tin hợp lệ
    return true;
  };

  const handleCreateOrder = async (e) => {
    // if (!voucher){
    //   setIsProcessing(false);
    //   return;
    // }
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    if (!validateInputs()) {
      setIsProcessing(false);
      return;
    }

    try {
      //alert(`${promotion_id}`)
      const orderData = {
        customer_id: userData.user_id,
        shipment_id: '194ff764-7cb2-4f1b-aa6a-509e932d96aa',
        payment_method: paymentMethod,
        promotion_id: promotion_id,
        lstItems: selectedItems.map(item => ({
          product_id: item.product_id,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          paid_price: item.paid_price
        })),
        phone: phone,
        address: address
      };
      console.log('Order Data:', orderData);
      const response = await fetch('http://localhost:8080/api/orders/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }
      console.log('Order created successfully:', data);
      setRTotalPrice(data.total_price);
      setDiscount(data.discount || 0);
      setOrderId(data.order_id);
      setShowPaymentModal(true);

    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    // Thêm kiểm tra validation trước khi xác nhận
    if (!validateInputs()) {
      return; // Dừng nếu thông tin không hợp lệ
    }

    setIsConfirming(true);
    try {
      const response = await fetch(`http://localhost:8080/api/orders/confirm/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Xác nhận thanh toán thất bại');
      }
      console.log("State: ",{
        orderId: orderId,
          customerId: userData.user_id,
          selectedItems: selectedItems,
          orderDetails: {
            shippingMethod,
            paymentMethod,
            totalPrice: rtotalPrice - discount,
            address,
            phone
          }
      })
      navigate('/orderstatus', {
        state: {
          orderId: orderId,
          customerId: userData.user_id,
          selectedItems: selectedItems,
          orderDetails: {
            shippingMethod,
            paymentMethod,
            totalPrice: rtotalPrice - discount,
            address,
            phone
          }
        }
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsConfirming(false);
      setShowPaymentModal(false);
    }
  };

  const shippingOptions = [
    { value: 'ship_001', label: 'Giao Hàng Nhanh (GHN)' },
    { value: 'ship_002', label: 'Giao Hàng Tiết Kiệm (GHTK)' },
    { value: 'ship_003', label: 'Viettel Post' },
    { value: 'ship_004', label: 'VNPost' },
    { value: 'ship_005', label: 'J&T Express' },
    { value: 'ship_006', label: 'Ninja Van' },
    { value: 'ship_007', label: 'BEST Express' },
    { value: 'ship_008', label: 'FedEx' },
    { value: 'ship_009', label: 'DHL Express' },
    { value: 'ship_010', label: 'UPS' },
    { value: 'ship_011', label: 'Kerry Express' },
    { value: 'ship_012', label: 'Zalo Express' },
    { value: 'ship_013', label: 'GrabExpress' },
    { value: 'ship_014', label: 'AhaMove' },
    { value: 'ship_015', label: 'Lalamove' }
  ];

  useEffect(() => {
    let interval = null;

    if (showPaymentModal) {
      setCountdown(30);
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setShowPaymentModal(false);
            setOrderId(null); // xóa đơn hàng đang chờ
            setError('Đã hết thời gian xác nhận thanh toán. Vui lòng thực hiện lại.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [showPaymentModal]);
  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: `calc(${NAVBAR_HEIGHT} + 24px)`, mb: 4, pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ShoppingCartIcon />}
            onClick={() => navigate('/cart')}
          >
            Quay lại giỏ hàng
          </Button>
        </Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Thanh Toán
        </Typography>
                <style>{`
                    .btn-css{
                        padding: 5px;
                        border: 1px solid #C0C0C0;
                        background-color: #F7FFF7;
                        border-radius: 8px;
                        cursor: pointer;
                    }
                    .btn-css:hover{
                        background-color: #D32F2F;
                        color: #F7FFF7;
                    }
                    .openPopup {
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    }

                    .openPopup:hover {
                        background-color: #0056b3;
                    }

                    .popup {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                    }

                    .popupContent {
                        background: #fff;
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        width: 300px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }

                    .closePopup {
                        padding: 10px 20px;
                        background-color: #ff4d4d;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        margin-top: -10px;
                    }

                    .closePopup:hover {
                        background-color: #cc0000;
                    }
                `}
                </style>
        {isPopupOpen && (
          <Dialog open={isPopupOpen} onClose={closePopup} maxWidth="sm" fullWidth>
            <DialogTitle
              sx={{
                fontWeight: 'bold',
                color: 'red',
                fontSize: '20px',
                backgroundColor: '#F3F6F8',
                borderRadius: '8px 8px 0px 0px',
                boxShadow: '0 5px 10px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
              }}
            >
              Chọn Voucher
            </DialogTitle>

            <DialogContent sx={{ height: 500, overflowY: 'auto' }}>
              <Voucher
                buyList={selectedItems.map(item => ({
                  product_id: item.product_id,
                  color: item.color,
                  size: item.size,
                  quantity: item.quantity,
                  paid_price: item.paid_price,
                }))}
                setVoucher={setVoucher}
                setIsPopupOpen={setIsPopup}
                setPromotionId={setPromotionId}
              />
            </DialogContent>

            <Box textAlign="center" sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={closePopup}
              >
                Đóng
              </Button>
            </Box>
          </Dialog>
        )}        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Chọn mã giảm giá
            </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h8"
            gutterBottom
            sx={{
              border: '1px solid #ccc',
              px: 2,
              py: 1,
              borderRadius: '8px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
            }}
          >
            {voucher ? generateRandomString(voucher.promotion_id) : "Chọn mã giảm giá"}
          </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={openPopup}
              sx={{ cursor: 'pointer', ml: 2 }}
            >
              Áp dụng
            </Button>
          </Stack>
        </Paper>
        
        <form onSubmit={handleCreateOrder}>
          <Grid container spacing={4} columns={12}>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin khách hàng
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Tên: {userData.name}</Typography>
                  <Typography variant="subtitle1">Email: {userData.email}</Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Địa chỉ giao hàng"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                
              </Paper>

              <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Đơn vị vận chuyển
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="shipping-method-label">Chọn đơn vị vận chuyển</InputLabel>
                  <Select
                    labelId="shipping-method-label"
                    value={shippingMethod}
                    label="Chọn đơn vị vận chuyển"
                    onChange={(e) => setShippingMethod(e.target.value)}
                  >
                    {shippingOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Đơn hàng của bạn
                </Typography>

                <TableContainer>
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
                      {selectedItems.map((item) => (
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
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />
                                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Tổng cộng:</Typography>
                  <Typography variant="h6" color="primary">
                    {totalPrice.toLocaleString('vi-VN')} ₫
                  </Typography>
                </Box>
              </Paper>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                startIcon={<ShoppingCartIcon />}
                disabled={isProcessing}
              >
                {isProcessing ? 'Đang tạo đơn hàng...' : 'Tiến hành thanh toán'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
      <PaymentConfirmationModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmPayment}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isConfirming={isConfirming}
        creditCardInfo={creditCardInfo}
        setCreditCardInfo={setCreditCardInfo}
        bankTransferInfo={bankTransferInfo}
        setBankTransferInfo={setBankTransferInfo}
        countdown={countdown}
      />
      <Footer />
    </>
  );
};

export default PayMoney;