// src/pages/SearchResultsPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate }
from 'react-router-dom';
import {
  Typography, Box, Container, Grid, Paper, Card, CardMedia,
  CardContent, CardActions, Button, CircularProgress, Alert,
  Tooltip, Rating
} from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// --- CÁC HẰNG SỐ VÀ TIỆN ÍCH TÁI SỬ DỤNG TỪ CustomerDashboard ---
const FIXED_CARD_WIDTH = '215px';
const FIXED_CARD_HEIGHT = '300px';
const FIXED_IMAGE_HEIGHT = '150px';
const NAVBAR_HEIGHT = '88px';

const SearchResultsPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Hàm fetchData được điều chỉnh một chút để phù hợp (có thể tách ra thành utility nếu dùng ở nhiều nơi)
  const fetchData = useCallback(async (url, setDataFunction, setLoadingFunction, setErrorFunction, fetchOptions = {}) => {
    const fetchType = 'SEARCH_RESULTS';
    console.log(`%c[FETCH_START][${fetchType}] Gọi API tìm kiếm. URL: ${url}`, 'color: purple; font-weight: bold;', 'Options:', fetchOptions);

    setLoadingFunction(true);
    setErrorFunction(null);
    setDataFunction([]); // Xóa kết quả cũ trước khi fetch mới

    try {
      let finalUrl = url;
      if (fetchOptions.params) {
        const queryParams = new URLSearchParams(fetchOptions.params).toString();
        if (queryParams) {
          finalUrl = `${url}?${queryParams}`;
        }
      }
      const { params, ...restOfFetchOptions } = fetchOptions;

      const response = await fetch(finalUrl, restOfFetchOptions);
      if (!response.ok) {
          let errorData = { message: `HTTP error! status: ${response.status}` };
          try {
            errorData = await response.json();
          } catch (e) { /* Bỏ qua nếu response không phải JSON */ }
          console.error(`%c[FETCH_ERROR][${fetchType}] Response NOT OK. Status: ${response.status}`, 'color: red; font-weight: bold;', 'Error Data:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status} fetching from ${finalUrl}`);
      }
      const responseJson = await response.json();
      console.log(`%c[FETCH_SUCCESS][${fetchType}] Response OK. JSON Response:`, 'color: green;', responseJson);

      const dataArray = Array.isArray(responseJson) ? responseJson :
                        (responseJson && Array.isArray(responseJson.data)) ? responseJson.data : [];

      console.log(`%c[FETCH_DATA_PROCESSED][${fetchType}] dataArray sau khi xử lý:`, 'color: teal;', dataArray);
      setDataFunction(dataArray);

    } catch (err) {
      console.error(`%c[FETCH_CATCH][${fetchType}] Lỗi trong fetchData: ${err.message}`, 'color: red; font-weight: bold;', 'URL:', url);
      setErrorFunction(err.message);
      setDataFunction([]);
    } finally {
      console.log(`%c[FETCH_END][${fetchType}] Kết thúc fetchData. URL: ${url}`, 'color: purple;');
      setLoadingFunction(false);
    }
  }, []);


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q');
    if (query) {
      setSearchTerm(query);
      console.log(`Search term from URL: ${query}`);
      const apiUrl = `http://localhost:8080/api/products/get`;
      fetchData(
        apiUrl,
        setSearchResults,
        setLoading,
        setError,
        {
          method: 'GET',
          params: { // fetch API không tự xử lý params, fetchData đã được sửa để làm điều này
            filtered: query,
            page: '1', // Gửi dưới dạng string nếu API backend mong đợi string
            offset: '0'  // Gửi dưới dạng string nếu API backend mong đợi string
          }
        }
      );
    } else {
      setSearchResults([]);
      setLoading(false);
      // Có thể hiển thị thông báo "Vui lòng nhập từ khóa tìm kiếm" hoặc điều hướng về trang chủ
    }
  }, [location.search, fetchData]);

  // Hàm getDisplayPrice tái sử dụng từ CustomerDashboard
  const getDisplayPrice = (product) => {
    if (!product) return null;
    if (product.color && Array.isArray(product.color) && product.color.length > 0) {
      const firstColor = product.color[0];
      if (firstColor && firstColor.size && Array.isArray(firstColor.size) && firstColor.size.length > 0) {
        const firstSize = firstColor.size[0];
        if (firstSize && typeof firstSize.final_price === 'number') {
          return firstSize.final_price;
        }
      }
    }
    if (typeof product.final_price === 'number') return product.final_price;
    if (typeof product.price === 'number') return product.price;
    if (typeof product.initial_price === 'number') return product.initial_price; // Chú ý tên trường có thể khác (intitial_price)
    return null;
  };

  return (
    <>
      <style>{`
        html, body { 
          margin: 0; padding: 0; width: 100%; min-height: 100vh; overflow-x: hidden;
        }
        .main-layout-container {
          background-image: url('/background.jpg'); /* Đảm bảo có file background.jpg trong public folder */
          background-size: cover; 
          background-position: center;
          background-repeat: no-repeat; 
          background-attachment: fixed; 
          min-height: 100vh; 
          padding-top: ${NAVBAR_HEIGHT};
        }
        .product-card-title {
          font-size: 0.75rem; 
          font-weight: 500;
          line-height: 1.3; 
          height: calc(0.75rem * 1.3 * 2); 
          min-height: calc(0.75rem * 1.3 * 2); 
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          cursor: pointer;
          margin-bottom: 1px; 
        }
        .product-card-price {
          font-size: 0.85rem; 
          font-weight: bold;
          margin-top: 1px; 
        }
      `}</style>

      <Navbar />
      
      <Box className="main-layout-container">
        <Container maxWidth="lg" sx={{ paddingBottom: '24px', paddingTop: '24px' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, color: '#fff', textShadow: '0px 0px 8px rgba(0,0,0,0.7)' }}>
            Kết quả tìm kiếm cho: "{searchTerm}"
          </Typography>

          {loading && ( 
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px', p: 2 }}> 
              <CircularProgress size={60} /> 
              <Typography variant="h6" sx={{ ml: 2, color: '#000' }}>Đang tìm kiếm sản phẩm...</Typography> 
            </Box> 
          )}
          {error && !loading && ( 
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>Lỗi khi tìm kiếm: {error}. Vui lòng thử lại.</Alert> 
          )}

          {!loading && !error && searchResults.length > 0 && (
            <Grid container spacing={{xs: 1, sm: 1.5}}> 
              {searchResults.map((product) => {
                const displayPrice = getDisplayPrice(product);
                const imageUrl = (product.img && Array.isArray(product.img) && product.img.length > 0) 
                                 ? product.img[0] 
                                 : (product.image_url || product.url || `https://via.placeholder.com/${FIXED_CARD_WIDTH.replace('px','')}x${FIXED_IMAGE_HEIGHT.replace('px','')}/?text=No+Image`);
                
                const productRatingValue = typeof product.rating === 'number' 
                                         ? product.rating 
                                         : (typeof product.rating_average === 'number' ? product.rating_average : -1);
                const reviewCount = product.review_nums || 0;

                return (
                  <Grid item key={product.product_id || product.id} xs={6} sm={4} md={3} > 
                    <Card sx={{ 
                      width: FIXED_CARD_WIDTH,   
                      height: FIXED_CARD_HEIGHT, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      backgroundColor: '#fff', 
                      borderRadius: '4px', 
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      transition: 'box-shadow 0.2s ease-in-out',
                      m: 'auto', 
                      '&:hover': { boxShadow: '0 2px 5px rgba(0,0,0,0.15)' } 
                    }}>
                      <CardMedia
                        component="img" image={imageUrl} alt={product.title || "Sản phẩm"}
                        onClick={() => navigate(`/product/${product.product_id || product.id}`)}
                        sx={{ height: FIXED_IMAGE_HEIGHT, width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 0.75, pt: 0.25, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}> 
                        <Tooltip title={product.title || "Chưa có tên"} placement="top" arrow>
                          <Typography variant="caption" component="div" className="product-card-title"
                            onClick={() => navigate(`/product/${product.product_id || product.id}`)}
                          >
                            {product.title || "Chưa có tên sản phẩm"}
                          </Typography>
                        </Tooltip>
                        <Box sx={{ mt: 'auto' }}>
                          {(productRatingValue >= 0) && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.1, mt: 0.1 }}>
                              <Rating name="read-only" value={productRatingValue} precision={0.5} readOnly size="small" sx={{fontSize: '0.7rem'}} />
                              <Typography variant="caption" sx={{ ml: 0.25, color: 'text.secondary', fontSize: '0.55rem' }}>
                                ({reviewCount})
                              </Typography>
                            </Box>
                          )}
                          <Typography color="error.main" className="product-card-price">
                            {displayPrice !== null ? `${displayPrice.toLocaleString('vi-VN')} ₫` : 'Giá liên hệ'}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 0, borderTop: '1px solid #f0f0f0', flexShrink: 0, minHeight: 'auto' }}>
                        <Button fullWidth variant="text" color="primary" onClick={() => navigate(`/product/${product.product_id || product.id}`)}
                          sx={{ py: 0.5, textTransform: 'none', fontSize: '0.7rem', fontWeight: '500', minWidth: 'auto' }}
                        >
                          Xem chi tiết
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
          
          {!loading && !error && searchResults.length === 0 && searchTerm && (
            <Paper sx={{p:3, textAlign: 'center', fontStyle: 'italic', backgroundColor: 'rgba(255, 255, 255, 0.92)', mt: 2}}>
              <Typography variant="subtitle1">
                Không tìm thấy sản phẩm nào phù hợp với từ khóa "{searchTerm}".
              </Typography>
            </Paper>
          )}
           {!loading && !error && !searchTerm && (
            <Paper sx={{p:3, textAlign: 'center', fontStyle: 'italic', backgroundColor: 'rgba(255, 255, 255, 0.92)', mt: 2}}>
              <Typography variant="subtitle1">
                Vui lòng nhập từ khóa để tìm kiếm.
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default SearchResultsPage;