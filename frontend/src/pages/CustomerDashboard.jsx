// src/pages/CustomerDashboard.jsx

// --- ĐỊNH NGHĨA KÍCH THƯỚC CỐ ĐỊNH NHỎ HƠN CHO CARD ---
const FIXED_CARD_WIDTH = '215px';
const FIXED_CARD_HEIGHT = '300px';
const FIXED_IMAGE_HEIGHT = '150px';
// ----------------------------------------------------
const DEFAULT_CATEGORY_ICON = 'https://via.placeholder.com/32?text=Icon'; // Icon mặc định cho danh mục
const NAVBAR_HEIGHT = '88px'; // Giả sử chiều cao Navbar, điều chỉnh nếu cần


import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography, Box, Container, Grid, Paper, Card, CardMedia,
  CardContent, CardActions, Button, CircularProgress, Alert,
  Tooltip, Rating
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categoryIconMap = {
    "100001": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBEgeV7WUJuBclqMalqZHQqPKph70mmSGFug&s", // Sức Khỏe
    "100009": "https://media.istockphoto.com/id/1217641408/vi/vec-to/%C4%91i%E1%BB%87n-tho%E1%BA%A1i-v%C3%A0-ph%E1%BB%A5-ki%E1%BB%87n-glyph-icon-%C4%91i%E1%BB%87n-tho%E1%BA%A1i-th%C3%B4ng-minh-v%C3%A0-tai-nghe-thi%E1%BA%BFt-b%E1%BB%8B-%C4%91i%E1%BB%87n-t%E1%BB%AD-b%E1%BB%99-ph%E1%BA%ADn.jpg?s=612x612&w=0&k=20&c=PSElCIJOAdp8TYHVSDtKwFYsZlBD5NzkeQT5DQ-WvuI=", // Phụ Kiện & Trang Sức Nữ
    "100010": "https://khosisusa.com/images/icon_5.png", // Thiết Bị Điện Gia Dụng
    "100011": "https://img.lovepik.com/free-png/20220108/lovepik-mens-dress-icon-free-vector-illustration-material-png-image_401273978_wh860.png", // Thời Trang Nam
    "100012": "https://www.pedroshoes.com/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-pd_vn-products/default/dw63298ef9/images/hi-res/2023-L7-PM1-86380164-04-1.jpg?sw=1152&sh=1536",   // Giày Dép Nam
    "100013": "https://png.pngtree.com/png-vector/20201028/ourmid/pngtree-phone-icon-in-solid-circle-png-image_2380227.jpg",   // Điện Thoại & Phụ Kiện
    "100015": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRQAGG2UfWfzJT6ZOZcTfVL0k4NSz_ipso4Q&s",   // Thể Thao & Du Lịch
    "100016": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTExdblreVxRevqABCteb9OVNrRYYAKzo_hFw&s", // Túi Ví Nữ
    "100017": "https://thietke6d.com/wp-content/uploads/2021/07/mau-logo-thoi-trang.webp", // Thời Trang Nữ
    "100532": "https://media.istockphoto.com/id/1207402993/vi/vec-to/n%E1%BB%AF-gi%C3%A0y-logo-vector-minh-h%E1%BB%8Da-bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-logo-c%E1%BB%ADa-h%C3%A0ng-gi%C3%A0y-d%C3%A9p.jpg?s=1024x1024&w=is&k=20&c=yUVkflPPDOI2AtKuV4HZWSQlkJmWP-r9ajzSe5vDy-s=", // Giày Dép Nữ
    "100533": "https://png.pngtree.com/png-vector/20190302/ourmid/pngtree-backpack-icon-design-template-vector-isolated-png-image_746869.jpg",   // Balo & Túi Ví Nam
    "100534": "https://cdn-icons-png.flaticon.com/512/2838/2838540.png", // Đồng Hồ
    "100535": "https://media.istockphoto.com/id/1219875238/vi/vec-to/thi%E1%BA%BFt-b%E1%BB%8B-%C4%91i%E1%BB%87n-t%E1%BB%AD-v%C3%A0-ph%E1%BB%A5-ki%E1%BB%87n-glyph-icon-%C4%91i%E1%BB%87n-tho%E1%BA%A1i-th%C3%B4ng-minh-v%C3%A0-m%C3%A1y-t%C3%ADnh-x%C3%A1ch-tay-m%C3%A1y-t%C3%ADnh.jpg?s=1024x1024&w=is&k=20&c=cM0STLnphoMIXDyBFMiB7xyWO5tWPqftJfqXOln-S7k=", // Thiết Bị Điện Tử (chung)
    "100629": "https://cdn-icons-png.flaticon.com/512/2203/2203197.png", // Bách Hóa Online
    "100630": "https://png.pngtree.com/template/20191127/ourmid/pngtree-beauty-logo-with-white-background-beauty-salon-cosmetics-spa-hair-logotype-image_336336.jpg", // Sắc Đẹp
    "100632": "https://png.pngtree.com/png-clipart/20200224/original/pngtree-car-toy-line-icon-vector-png-image_5215811.jpg", // Đồ Chơi
    "100633": "https://media.istockphoto.com/id/1067561432/vi/vec-to/bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-d%C3%B2ng-qu%E1%BA%A7n-%C3%A1o-tr%E1%BA%BB-em-tr%E1%BA%BB-em-v%C3%A0-qu%E1%BA%A7n-%C3%A1o-d%E1%BA%A5u-hi%E1%BB%87u-v%C3%A1y-c%C6%A1-th%E1%BB%83-%C4%91%E1%BB%93-h%E1%BB%8Da-vector-m%E1%BB%99t-m%C3%B4.jpg?s=1024x1024&w=is&k=20&c=JfdhYP0B3ST6c-R5SqW3oO-qZMGYIpnKhqksoMO6td4=", // Thời Trang Trẻ Em
    "100634": "https://cdn-icons-png.flaticon.com/512/1295/1295979.png", // Thiết Bị Điện Tử (icon khác cho ID lặp lại)
    "100635": "https://cdn-icons-png.flaticon.com/512/685/685655.png",   // Máy Ảnh & Máy Quay Phim
    "100636": "https://cdn-icons-png.flaticon.com/512/2646/2646896.png", // Nhà Cửa & Đời Sống
    "100637": "https://www.shutterstock.com/image-vector/motorcycle-scooter-matic-icon-vector-600w-1763301074.jpg", // Ô Tô & Xe Máy & Xe Đạp
    "100640": "https://www.shutterstock.com/image-vector/motorcycle-scooter-matic-icon-vector-600w-1763301074.jpg", // Ô Tô & Xe Máy & Xe Đạp (icon khác)
    "100641": "https://www.shutterstock.com/image-vector/motorcycle-scooter-matic-icon-vector-600w-1763301074.jpg", // Ô Tô & Xe Máy & Xe Đạp (icon khác)
    "100644": "https://png.pngtree.com/png-vector/20190909/ourlarge/pngtree-desktop-computer-icon-in-line-style-png-image_1728122.jpg", // Máy Tính & Laptop
};

const CustomerDashboard = () => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const [initialSuggestions, setInitialSuggestions] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  // State duy nhất cho việc tải sản phẩm đang hiển thị (ngẫu nhiên hoặc theo danh mục)
  const [loadingDisplayedProducts, setLoadingDisplayedProducts] = useState(true);
  const [errorDisplayedProducts, setErrorDisplayedProducts] = useState(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const backgroundImageUrl = '/background.jpg';

  // Log mỗi khi displayedProducts thay đổi để debug
  useEffect(() => {
    console.log('%c[STATE_UPDATE] displayedProducts đã được cập nhật:', 'color: blue; font-weight: bold;', displayedProducts);
  }, [displayedProducts]);


  const fetchData = useCallback(async (url, setDataFunction, setLoadingFunction, setErrorFunction, processDataCallback, fetchOptions = {}) => {
    const fetchType = url.includes('random') ? 'RANDOM_PRODUCTS' : url.includes('cate') ? 'CATEGORIES' : url.includes('by-category') ? 'CATEGORY_PRODUCTS' : 'UNKNOWN_PRODUCTS';
    console.log(`%c[FETCH_START][${fetchType}] Gọi fetchData. URL: ${url}`, 'color: purple; font-weight: bold;', 'Options:', fetchOptions);

    setLoadingFunction(true);
    setErrorFunction(null);
    // Xóa dữ liệu cũ trước khi fetch (để tránh hiển thị lẫn lộn nếu fetch mới lâu)
    // Chỉ làm điều này nếu setDataFunction là setDisplayedProducts
    if (setDataFunction === setDisplayedProducts) {
        setDataFunction([]);
    }

    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
          let errorData = { message: `HTTP error! status: ${response.status}` };
          try {
            errorData = await response.json();
          } catch (e) {
            // Bỏ qua nếu response không phải JSON
          }
          console.error(`%c[FETCH_ERROR][${fetchType}] Response NOT OK. Status: ${response.status}`, 'color: red; font-weight: bold;', 'Error Data:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status} fetching from ${url}`);
      }
      const responseJson = await response.json();
      console.log(`%c[FETCH_SUCCESS][${fetchType}] Response OK. JSON Response:`, 'color: green;', responseJson);

      const dataArray = Array.isArray(responseJson) ? responseJson :
                        (responseJson && Array.isArray(responseJson.data)) ? responseJson.data : [];

      console.log(`%c[FETCH_DATA_PROCESSED][${fetchType}] dataArray sau khi xử lý:`, 'color: teal;', dataArray);

      if (processDataCallback) {
          console.log(`%c[FETCH_SET_STATE][${fetchType}] Sử dụng processDataCallback.`, 'color: orange;');
          processDataCallback(dataArray); // processDataCallback sẽ gọi hàm setter
      } else {
          console.log(`%c[FETCH_SET_STATE][${fetchType}] Sử dụng setDataFunction trực tiếp.`, 'color: orange;');
          setDataFunction(dataArray);
      }

    } catch (err) {
      console.error(`%c[FETCH_CATCH][${fetchType}] Lỗi trong fetchData: ${err.message}`, 'color: red; font-weight: bold;', 'URL:', url);
      setErrorFunction(err.message);
      // Chỉ set mảng rỗng cho products nếu có lỗi
       if (setDataFunction === setDisplayedProducts || setDataFunction === setInitialSuggestions) {
           setDataFunction([]);
       } else if (setDataFunction === setCategories) {
           setDataFunction([]);
       }
    } finally {
      console.log(`%c[FETCH_END][${fetchType}] Kết thúc fetchData. URL: ${url}`, 'color: purple;');
      setLoadingFunction(false);
    }
  }, [setDisplayedProducts]); // Thêm setDisplayedProducts vào dependency nếu nó được dùng trực tiếp bên trong


  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserName(parsedData.username || parsedData.first_name || 'Khách hàng');
    }

    // 1. Fetch categories
    fetchData(
      'http://localhost:8080/api/cate',
      setCategories, // Đây là setDataFunction
      setLoadingCategories,
      setErrorCategories,
      (apiCategoriesData) => { // Đây là processDataCallback
        if (apiCategoriesData && apiCategoriesData.length > 0) {
          const processedCategories = apiCategoriesData.map(cate => ({
            id: cate.category_id,
            name: cate.name,
            iconUrl: categoryIconMap[cate.category_id] || DEFAULT_CATEGORY_ICON
          })).filter(cate => cate.id && cate.name);
          console.log('%c[CATEGORIES_PROCESS] Đã xử lý danh mục:', 'color: brown;', processedCategories);
          setCategories(processedCategories); // Gọi hàm setter bên trong callback
        } else {
          console.log('%c[CATEGORIES_PROCESS] Không có dữ liệu danh mục hoặc danh mục rỗng.', 'color: brown;');
          setCategories([]);
        }
      }
    );

    // 2. Fetch random suggestions for initial display
    fetchData(
      'http://localhost:8080/api/products/random',
      null, // Không có setDataFunction trực tiếp, sẽ dùng processDataCallback
      setLoadingDisplayedProducts, // Dùng state chung cho sản phẩm hiển thị
      setErrorDisplayedProducts,   // Dùng state chung cho sản phẩm hiển thị
      (randomSuggestionsArray) => { // Đây là processDataCallback
        console.log('%c[RANDOM_PRODUCTS_SET] Đang gán initialSuggestions và displayedProducts với dữ liệu random.', 'color: #ff69b4;', randomSuggestionsArray);
        setInitialSuggestions(randomSuggestionsArray);
        setDisplayedProducts(randomSuggestionsArray);
      }
    );

  }, [fetchData]);

  const handleCategoryClick = useCallback((categoryId) => {
    console.log('%c[CATEGORY_CLICK] handleCategoryClick được gọi với categoryId:', 'color: #007bff; font-weight: bold;', categoryId);
    setSelectedCategoryId(categoryId);
    if (categoryId === null) {
      console.log('%c[CATEGORY_CLICK_ALL] Hiển thị initialSuggestions (sản phẩm random).', 'color: #17a2b8;');
      setDisplayedProducts(initialSuggestions);
      setErrorDisplayedProducts(null); // Xóa lỗi cũ nếu có
      setLoadingDisplayedProducts(false); // Không loading nếu chỉ lấy từ state
    } else {
      console.log('%c[CATEGORY_CLICK_SPECIFIC] Chuẩn bị fetch sản phẩm cho category:', 'color: #17a2b8;', categoryId);
      // API đã được sửa để dùng query parameter
      const apiUrl = `http://localhost:8080/api/products/get?category_id=${categoryId.toString()}`;
      fetchData(
        apiUrl,
        setDisplayedProducts, // setDataFunction trực tiếp
        setLoadingDisplayedProducts,
        setErrorDisplayedProducts,
        null, // không có processDataCallback riêng
        {
          method: 'GET',
          // Không cần headers và body cho GET với query params
        }
      );
    }
  }, [fetchData, initialSuggestions, setSelectedCategoryId, setDisplayedProducts, setLoadingDisplayedProducts, setErrorDisplayedProducts]);

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
    // Kiểm tra các trường giá khác nếu có, dựa trên cấu trúc dữ liệu thực tế
    // từ API /products/by-category
    if (typeof product.final_price === 'number') return product.final_price; // Giả sử API trả về final_price trực tiếp
    if (typeof product.price === 'number') return product.price;
    if (typeof product.initial_price === 'number') return product.initial_price; // Chú ý tên trường có thể khác
    return null;
  };

  // isLoading và fetchError chung cho toàn bộ các lần fetch ban đầu
  // Cần tinh chỉnh lại nếu muốn có loading/error riêng biệt rõ ràng hơn cho từng phần
  const isLoadingInitialData = loadingCategories || (loadingDisplayedProducts && initialSuggestions.length === 0);
  const fetchErrorInitialData = errorCategories || (errorDisplayedProducts && initialSuggestions.length === 0 && !loadingDisplayedProducts);


  return (
    <>
      <style>{`
        html, body { 
          margin: 0; padding: 0; width: 100%; min-height: 100vh; overflow-x: hidden;
        }
        .main-layout-container {
          background-image: url('${backgroundImageUrl}'); 
          background-size: cover; 
          background-position: center;
          background-repeat: no-repeat; 
          background-attachment: fixed; 
          min-height: 100vh; 
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
      
      <Box className="main-layout-container" sx={{paddingTop: NAVBAR_HEIGHT }}>
        <Container maxWidth="lg" sx={{ paddingBottom: '24px' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, color: '#fff', textShadow: '0px 0px 8px rgba(0,0,0,0.7)' }}>
            Chào mừng, {userName}!
          </Typography>

          {/* Loading cho lần tải dữ liệu ban đầu (categories và suggestions) */}
          {isLoadingInitialData && ( 
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px', p: 2 }}> 
              <CircularProgress size={60} /> 
              <Typography variant="h6" sx={{ ml: 2, color: '#000' }}>Đang tải dữ liệu...</Typography> 
            </Box> 
          )}
          {fetchErrorInitialData && !isLoadingInitialData && ( 
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>Lỗi tải dữ liệu ban đầu: {fetchErrorInitialData}. Vui lòng thử lại sau.</Alert> 
          )}

          {/* Categories Section - Hiển thị sau khi tải xong và không có lỗi categories */}
          {!loadingCategories && !errorCategories && categories.length > 0 && (
            <Paper elevation={3} sx={{ p: {xs: 1, sm: 1.5} , mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.92)' }}>
              <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', mb: 1, fontSize: {xs: '1rem', sm: '1.15rem'} }}>DANH MỤC</Typography>
              <Grid container spacing={0.5}>
                {categories.map((category) => (
                  <Grid item key={category.id} xs={3} sm={2} md={1.5} lg={1.2} sx={{ textAlign: 'center' }}>
                    <Tooltip title={category.name} placement="bottom" arrow>
                      <Button variant="text" onClick={() => handleCategoryClick(category.id)}
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p:0.5, textTransform: 'none',
                          border: selectedCategoryId === category.id ? '2px solid' : '1px solid #ddd',
                          borderColor: selectedCategoryId === category.id ? 'primary.main' : '#ddd',
                          borderRadius: '6px', width: '100%', height: '100%', '&:hover': { backgroundColor: 'action.hover', borderColor: 'primary.light' } }}>
                        <Box component="img" src={category.iconUrl} alt={category.name}
                          sx={{ width: {xs: 28, sm: 32}, height: {xs: 28, sm: 32}, objectFit: 'contain', mb: 0.25, borderRadius: '50%' }}/>
                        <Typography variant="caption" sx={{ display: 'block', lineHeight: '1.1', fontSize: {xs: '0.55rem', sm: '0.65rem'}, fontWeight: selectedCategoryId === category.id ? 'bold': 'normal', color: 'text.primary' }}>
                          {category.name}
                        </Typography>
                      </Button>
                    </Tooltip>
                  </Grid>
                ))}
                <Grid item xs={3} sm={2} md={1.5} lg={1.2} sx={{ textAlign: 'center' }}>
                  <Button variant="text" onClick={() => handleCategoryClick(null)}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p:0.5, textTransform: 'none',
                    border: selectedCategoryId === null ? '2px solid' : '1px solid #ddd',
                    borderColor: selectedCategoryId === null ? 'primary.main' : '#ddd',
                    borderRadius: '6px', width: '100%', height: '100%', '&:hover': { backgroundColor: 'action.hover', borderColor: 'primary.light' } }}>
                    <Box sx={{ width: {xs: 28, sm: 32}, height: {xs: 28, sm: 32}, display: 'flex', alignItems:'center', justifyContent:'center', borderRadius: '50%', backgroundColor: selectedCategoryId === null ? 'primary.light' : 'action.disabledBackground', color: selectedCategoryId === null ? 'primary.contrastText' : 'text.primary', mb: 0.25 }}>
                      <Typography variant="button" component="span" sx={{fontSize: {xs:'0.7rem',sm:'0.8rem'}}}>All</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', lineHeight: '1.1', fontSize: {xs: '0.55rem', sm: '0.65rem'}, fontWeight: selectedCategoryId === null ? 'bold': 'normal', color: 'text.primary'  }}>Tất cả</Typography>
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
          
          {/* Product Display Section Title - Hiển thị khi không còn loading ban đầu */}
          {!isLoadingInitialData && (
            <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#fff', textShadow: '0px 0px 8px rgba(0,0,0,0.7)', mt: 1, mb: 2, fontSize: {xs: '1.25rem', sm: '1.5rem'} }}>
              {selectedCategoryId && categories.find(c=>c.id === selectedCategoryId) ? (categories.find(c=>c.id === selectedCategoryId)?.name) : "Gợi ý hôm nay"}
            </Typography>
          )}

          {/* Loading cho sản phẩm khi đang fetch (cho cả random lần đầu và theo category) */}
          {/* Chỉ hiển thị nếu không phải loading ban đầu của categories */}
          {!loadingCategories && loadingDisplayedProducts && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '20vh', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', p: 2, mt: 2 }}> 
                <CircularProgress size={50} /> 
                <Typography variant="h6" sx={{ ml: 2, color: '#fff' }}>Đang tải sản phẩm...</Typography> 
            </Box>
          )}

          {/* Error state cho sản phẩm (cả random và theo category) */}
          {/* Chỉ hiển thị nếu không phải loading ban đầu của categories và không đang loading products */}
          {!loadingCategories && !loadingDisplayedProducts && errorDisplayedProducts && (
             <Alert severity="error" sx={{ mt: 2, mb: 2, backgroundColor: 'rgba(255,224,224,0.95)' }}>
                Lỗi tải sản phẩm: {errorDisplayedProducts}. Vui lòng thử lại sau hoặc chọn danh mục khác.
             </Alert>
          )}
          
          {/* Products Grid - Hiển thị khi không loading categories, không loading products, không lỗi products và có sản phẩm */}
          {!loadingCategories && !loadingDisplayedProducts && !errorDisplayedProducts && displayedProducts.length > 0 && (
            <Grid container spacing={{xs: 1, sm: 1.5}}> 
              {displayedProducts.map((product) => {
                const displayPrice = getDisplayPrice(product);
                const imageUrl = (product.img && Array.isArray(product.img) && product.img.length > 0) 
                                 ? product.img[0] 
                                 : (product.image_url || product.url || `https://via.placeholder.com/${FIXED_CARD_WIDTH.replace('px','')}x${FIXED_IMAGE_HEIGHT.replace('px','')}/?text=No+Image`);
                
                const productRatingValue = typeof product.rating === 'number' 
                                         ? product.rating 
                                         : (typeof product.rating_average === 'number' ? product.rating_average : -1); // Giả sử API có thể trả về rating_average
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

          {/* No Products Message */}
          {/* Chỉ hiển thị nếu không phải loading ban đầu của categories, không loading products, không lỗi products và không có sản phẩm */}
          {!loadingCategories && !loadingDisplayedProducts && !errorDisplayedProducts && displayedProducts.length === 0 && (
            <Paper sx={{p:3, textAlign: 'center', fontStyle: 'italic', backgroundColor: 'rgba(255, 255, 255, 0.92)', mt: 2}}>
              <Typography variant="subtitle1">
                {selectedCategoryId ? "Không tìm thấy sản phẩm nào trong danh mục này." : "Không có sản phẩm gợi ý nào hiện tại."}
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default CustomerDashboard;