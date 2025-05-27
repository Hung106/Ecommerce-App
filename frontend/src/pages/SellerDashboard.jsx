import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  CircularProgress,
  TablePagination,
  useMediaQuery,
  useTheme,
  Button, // Import Button
} from '@mui/material';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const SellerDashboard = () => {
  const menuItems = ['Trang chủ', 'Quản lí sản phẩm'];
  const routes = ['/spsodashboard', '/manageproduct'];

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', err);
    }
    setLoading(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (newStatus.toLowerCase() === 'failed') {
        // Check current status before allowing cancellation to 'Failed'
        const currentOrder = orders.find((order) => order.order_id === orderId);
        if (currentOrder && (currentOrder.status.toLowerCase() === 'shipping' || currentOrder.status.toLowerCase() === 'received')) {
            alert('Không thể hủy đơn hàng đang được giao hoặc đã nhận.');
            setUpdatingId(null);
            return;
        }

        const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?');
        if (!confirmCancel) {
            setUpdatingId(null);
            // Reset select to current order status if cancel is aborted
            const selectElement = document.querySelector(`[data-order-id="${orderId}"] select`); // You might need a more robust selector
            if (selectElement && currentOrder) {
              selectElement.value = currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1);
            }
            return;
        }
        await axios.put(
          `http://localhost:8080/api/orders/reject/${orderId}`,
          null,
          config
        );
      } else {
        const currentOrder = orders.find((order) => order.order_id === orderId);
        const payload = {
          status: newStatus.toLowerCase(),
          payment_method: currentOrder?.payment_method ?? '',
          shipment_id: currentOrder?.shipment_id ?? '',
        };

        await axios.put(
          `http://localhost:8080/api/orders/${orderId}`,
          payload,
          config
        );
      }

      await fetchOrders(); // Refresh danh sách đơn hàng
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      const errorMessage = err.response?.data?.message || 'Cập nhật thất bại';
      alert(`Lỗi: ${errorMessage}`);
      // If update failed, refresh to show the original status
      await fetchOrders();
    }
    setUpdatingId(null);
  };

  const statusOptions = ['Pending', 'Shipping', 'Received', 'Failed'];

  const handleNavigateToManageProduct = () => {
    navigate('/manageproduct');
  };

  return (
    <>
      <style>
        {`
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow-x: hidden;
          }
        `}
      </style>

      <Navbar title="Seller" menuItems={menuItems} routes={routes} active={'Trang chủ'} />

      <Box sx={{ marginTop: '80px', padding: '20px' }}>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              Danh sách đơn hàng
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNavigateToManageProduct}
            >
              Quản lí sản phẩm
            </Button>
          </Box>

          {loading ? (
            <Box textAlign="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table stickyHeader size={isSmallScreen ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã đơn hàng</TableCell>
                    <TableCell>Ngày đặt</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    {!isSmallScreen && <TableCell>Số lượng sản phẩm</TableCell>}
                    {!isSmallScreen && <TableCell>Phí vận chuyển</TableCell>}
                    <TableCell>Tổng tiền</TableCell>
                    <TableCell>Giá cuối cùng</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Cập nhật trạng thái</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {orders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => (
                      <TableRow key={order.order_id}>
                        <TableCell>{order.order_id}</TableCell>
                        <TableCell>
                          {order.date_ordered
                            ? new Date(order.date_ordered).toLocaleDateString('vi-VN') // Added 'vi-VN' for consistency
                            : ''}
                        </TableCell>
                        <TableCell>{order.customer_id}</TableCell>
                        {!isSmallScreen && <TableCell>{order.product_numbers}</TableCell>}
                        {!isSmallScreen && <TableCell>{order.shipment_id}</TableCell>}
                        <TableCell>
                          {order.total_cost?.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          })}
                        </TableCell>
                        <TableCell>
                          {order.final_price?.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          })}
                        </TableCell>
                        <TableCell>
                          {order.status
                            ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                            : ''}
                        </TableCell>
                        <TableCell data-order-id={order.order_id}> {/* Added data-order-id for potential selector in handleStatusChange */}
                          <Select
                            value={order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : ''}
                            onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                            disabled={updatingId === order.order_id || order.status?.toLowerCase() === 'received' || order.status?.toLowerCase() === 'failed'} // Disable if received or failed
                            size="small"
                            sx={{ minWidth: 120 }} // Added minWidth for better appearance
                          >
                            {statusOptions.map((status) => (
                              <MenuItem
                                key={status}
                                value={status}
                                // Disable 'Failed' if current status is 'Received' or 'Shipping'
                                // Disable other options if current status is 'Received' or 'Failed'
                                disabled={
                                  (status === 'Failed' && (order.status?.toLowerCase() === 'received' || order.status?.toLowerCase() === 'shipping')) ||
                                  (order.status?.toLowerCase() === 'received' && status !== 'Received') ||
                                  (order.status?.toLowerCase() === 'failed' && status !== 'Failed')
                                }
                              >
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                          {updatingId === order.order_id && (
                            <CircularProgress size={20} sx={{ ml: 1, verticalAlign: 'middle' }} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={orders.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[rowsPerPage]}
                // Props for Vietnamese localization (optional, but good practice)
                labelRowsPerPage="Số dòng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`}
              />
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default SellerDashboard;