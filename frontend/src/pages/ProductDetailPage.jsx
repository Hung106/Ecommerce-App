// src/pages/ProductDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, CircularProgress, Alert, Paper, Grid,
    Chip, Button, Breadcrumbs, Link as MuiLink, Divider, IconButton,
    TextField, CardMedia
} from '@mui/material';
import Rating from '@mui/material/Rating';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NAVBAR_HEIGHT = '88px';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentVariation, setCurrentVariation] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    useEffect(() => {
        if (!productId) {
            setLoading(false);
            setError("Product ID không hợp lệ.");
            return;
        }

        const fetchProductDetails = async () => {
            setLoading(true);
            setError(null);
            // Reset states
            setProduct(null);
            setSelectedColor(null);
            setSelectedSize(null);
            setCurrentVariation(null);
            setMainImage('');
            setQuantity(1);

            try {
                const response = await fetch(`http://localhost:8080/api/products/get/${productId}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                    throw new Error(errorData.message || `Không tìm thấy sản phẩm (ID: ${productId})`);
                }
                const responseData = await response.json();

                if (responseData && responseData.data) {
                    let productData = { ...responseData.data }; // Work with a copy

                    // --- FIX: De-duplicate colors AND their sizes ---
                    if (productData.color && Array.isArray(productData.color)) {
                        const seenColorNames = new Set();
                        
                        const processedColors = productData.color
                            .filter(colorObj => { // 1. Filter unique color objects by name
                                if (colorObj && typeof colorObj.color === 'string') {
                                    if (!seenColorNames.has(colorObj.color)) {
                                        seenColorNames.add(colorObj.color);
                                        return true;
                                    }
                                    return false;
                                }
                                return false; // Filter out malformed color objects
                            })
                            .map(colorObj => { // 2. For each unique color, de-duplicate its sizes
                                let uniqueSizesForThisColor = colorObj.size; // Default to original if no processing needed
                                if (colorObj.size && Array.isArray(colorObj.size)) {
                                    const seenSizeNames = new Set();
                                    uniqueSizesForThisColor = colorObj.size.filter(sizeObj => {
                                        if (sizeObj && typeof sizeObj.size === 'string') {
                                            if (!seenSizeNames.has(sizeObj.size)) {
                                                seenSizeNames.add(sizeObj.size);
                                                return true;
                                            }
                                            return false;
                                        }
                                        return false; // Filter out malformed size objects
                                    });
                                }
                                // Return the color object with its (potentially de-duplicated) sizes
                                return { ...colorObj, size: uniqueSizesForThisColor };
                            });
                        
                        productData = { ...productData, color: processedColors };
                    }
                    // --- End of FIX ---

                    setProduct(productData);
                    setIsFavorite(productData.favorite === true || Number(productData.favorite) > 0);

                    if (productData.img && productData.img.length > 0) {
                        setMainImage(productData.img[0]);
                    } else {
                        setMainImage('https://via.placeholder.com/400x400?text=' + encodeURIComponent(productData.title || "Sản phẩm"));
                    }

                    // Initial color/size selection logic (will now use de-duplicated productData.color and their sizes)
                    if (productData.color && Array.isArray(productData.color) && productData.color.length > 0) {
                        const firstColor = productData.color[0]; // firstColor now has de-duplicated sizes
                        setSelectedColor(firstColor);
                        if (firstColor.size && Array.isArray(firstColor.size) && firstColor.size.length > 0) {
                            const firstAvailableSize = firstColor.size.find(s => s.stock > 0) || firstColor.size[0];
                            setSelectedSize(firstAvailableSize);
                            setCurrentVariation(firstAvailableSize);
                        } else {
                            setCurrentVariation({ final_price: null, initial_price: null, stock: 0, note: "Màu này không có kích thước" });
                        }
                    } else { // Product has no color variations
                        setCurrentVariation({
                            final_price: productData.final_price || productData.price || null,
                            initial_price: productData.initial_price || null,
                            stock: typeof productData.stock === 'number' ? productData.stock : 0,
                            isBaseProductInfo: true
                        });
                    }
                } else {
                    throw new Error("Dữ liệu sản phẩm không hợp lệ từ API.");
                }
            } catch (err) {
                setError(err.message);
                console.error("Lỗi khi fetch chi tiết sản phẩm:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId]);

    const handleColorSelect = (colorObj) => { // colorObj now has de-duplicated sizes
        setSelectedColor(colorObj);
        setSelectedSize(null); 
        setCurrentVariation(null);
        setQuantity(1); 

        if (colorObj.size && colorObj.size.length > 0) { // Uses de-duplicated colorObj.size
            const firstAvailableSize = colorObj.size.find(s => s.stock > 0) || colorObj.size[0];
            setSelectedSize(firstAvailableSize);
            setCurrentVariation(firstAvailableSize);
        } else {
            setCurrentVariation({ final_price: null, initial_price: null, stock: 0, note: "Màu này không có kích thước" });
        }
    };

    const handleSizeSelect = (sizeObj) => { // sizeObj comes from a de-duplicated list
        setSelectedSize(sizeObj);
        setCurrentVariation(sizeObj);
        setQuantity(1); 
    };

    const handleThumbnailClick = (imgUrl) => {
        setMainImage(imgUrl);
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        // TODO: Gọi API để cập nhật trạng thái yêu thích ở backend
        console.log("Đã thay đổi trạng thái yêu thích cho sản phẩm:", productId, !isFavorite);
    };

    const parseBreadcrumb = (breadcrumbString) => {
        try {
            if (!breadcrumbString || typeof breadcrumbString !== 'string') return [];
            if (breadcrumbString.startsWith('[') && breadcrumbString.endsWith(']')) {
                try {
                    const parsed = JSON.parse(breadcrumbString);
                    if (Array.isArray(parsed)) return parsed.map(item => String(item));
                } catch (e) {
                    console.warn("Breadcrumb string appeared to be a JSON array but failed direct parsing:", e, "Input:", breadcrumbString);
                }
            }
            if (breadcrumbString.length < 2) {
                 if ( (breadcrumbString === "{}" || breadcrumbString === "[]") && breadcrumbString.slice(1, -1).trim() === "" ){
                    return [];
                 }
                 console.warn("Breadcrumb string too short for custom parsing or not a recognized empty structure:", breadcrumbString);
                 return [];
            }
            const contentPart = breadcrumbString.slice(1, -1)
                                         .replace(/""/g, '"')
                                         .replace(/;/g, ',');
            if (contentPart.trim() === "") {
                return [];
            }
            const jsonArrayString = `[${contentPart}]`;
            const parsed = JSON.parse(jsonArrayString);
            return Array.isArray(parsed) ? parsed.map(item => String(item)) : [];
        } catch (e) {
            console.error("Lỗi parse breadcrumb:", e, "Input string:", breadcrumbString);
            return [];
        }
    };

    const handleQuantityChange = (amount) => {
        setQuantity(prevQuantity => {
            const newQuantity = prevQuantity + amount;
            if (newQuantity < 1) return 1;
            if (currentVariation && typeof currentVariation.stock === 'number' && newQuantity > currentVariation.stock) {
                return currentVariation.stock > 0 ? currentVariation.stock : 1;
            }
            return newQuantity;
        });
    };
    
    const handleAddToCart = async () => {
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
            navigate('/login');
            return;
        }
        const userData = JSON.parse(userDataString);
        const customerId = userData.user_id;

        if (!customerId) {
            alert("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.");
            return;
        }
        if (!product) {
            alert("Sản phẩm không tồn tại.");
            return;
        }
        if (product.color && product.color.length > 0 && (!selectedColor || !selectedSize)) {
            alert("Vui lòng chọn màu sắc và kích thước.");
            return;
        }
        if (!currentVariation || typeof currentVariation.final_price !== 'number') {
            alert("Sản phẩm này hiện không có giá hoặc không có sẵn để chọn.");
            return;
        }
        if (quantity <= 0) {
            alert("Số lượng phải lớn hơn 0.");
            return;
        }
        if (currentVariation.stock < quantity) {
            alert(`Số lượng tồn kho không đủ (chỉ còn ${currentVariation.stock} sản phẩm).`);
            setQuantity(currentVariation.stock > 0 ? currentVariation.stock : 1);
            return;
        }

        const cartItemData = {
            product_id: productId,
            color: selectedColor ? selectedColor.color : 'default',
            size: selectedSize ? selectedSize.size : 'default',
            paid: currentVariation.final_price,
            quantity: quantity,
        };

        setIsAddingToCart(true);
        try {
            const response = await fetch(`http://localhost:8080/api/cart/add/${customerId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', /* 'Authorization': `Bearer ${userData.token}` */ },
                body: JSON.stringify(cartItemData),
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || "Không thể thêm vào giỏ hàng.");
            }
            alert(responseData.message || "Đã thêm sản phẩm vào giỏ hàng!");
        } catch (err) {
            console.error("Lỗi khi thêm vào giỏ hàng:", err);
            alert(err.message || "Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại.");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const breadcrumbItems = product ? parseBreadcrumb(product.breadcrumb) : [];

    if (loading) {
        return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: `calc(100vh - ${NAVBAR_HEIGHT})`, mt: NAVBAR_HEIGHT }}><CircularProgress /></Box>);
    }
    if (error) {
        return (<><Navbar /><Container sx={{ mt: `calc(${NAVBAR_HEIGHT} + 24px)`, mb: 3 }}><Alert severity="error">{error}</Alert></Container><Footer /></>);
    }
    if (!product) {
        return (<><Navbar /><Container sx={{ mt: `calc(${NAVBAR_HEIGHT} + 24px)`, mb: 3 }}><Alert severity="warning">Không tìm thấy thông tin sản phẩm.</Alert></Container><Footer /></>);
    }

    const displayPrice = currentVariation?.final_price;
    const originalPrice = currentVariation?.initial_price;
    const stock = currentVariation?.stock;
    const discountPercentage = (originalPrice && displayPrice && originalPrice > displayPrice)
        ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
        : 0;

    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: `calc(${NAVBAR_HEIGHT} + 24px)`, mb: 4, pt: 3 }}>
                {/* Breadcrumbs */}
                {breadcrumbItems.length > 0 && (
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, fontSize: '0.9rem' }}>
                        {breadcrumbItems.map((item, index) => (
                            index === breadcrumbItems.length - 1 ? (
                                <Typography key={index} color="text.primary" sx={{ fontSize: '0.9rem' }}>{item}</Typography>
                            ) : (
                                <MuiLink component={RouterLink} key={index} to={`/search?query=${encodeURIComponent(item)}`} color="inherit" sx={{ fontSize: '0.9rem', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                    {item}
                                </MuiLink>
                            )
                        ))}
                    </Breadcrumbs>
                )}

                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                    <Grid container spacing={{ xs: 2, md: 4 }}>
                        {/* Image and Thumbnails Column */}
                        <Grid xs={12} md={5}>
                            <Box sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden', p: 1, backgroundColor: '#f9f9f9' }}>
                                <CardMedia component="img" image={mainImage} alt={product.title}
                                    sx={{ width: '100%', height: { xs: 300, sm: 400, md: 450 }, objectFit: 'contain' }} />
                            </Box>
                            {product.img && product.img.length > 1 && (
                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    {product.img.slice(0, 5).map((imgUrl, index) => (
                                        <Grid xs={2.4} key={imgUrl || index}>
                                            <Box
                                                component="img" src={imgUrl} alt={`${product.title} thumbnail ${index + 1}`}
                                                onClick={() => handleThumbnailClick(imgUrl)}
                                                sx={{
                                                    width: '100%', height: 'auto', objectFit: 'cover',
                                                    aspectRatio: '1/1',
                                                    borderRadius: '4px', border: mainImage === imgUrl ? '2px solid' : '1px solid #ddd',
                                                    borderColor: mainImage === imgUrl ? 'primary.main' : '#ddd',
                                                    cursor: 'pointer', '&:hover': { borderColor: 'primary.light' }
                                                }} />
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                            {product.video && (
                                <Button variant="outlined" startIcon={<PlayCircleOutlineIcon />} href={product.video} target="_blank" rel="noopener noreferrer" fullWidth>
                                    Xem Video Sản Phẩm
                                </Button>
                            )}
                        </Grid>

                        {/* Product Details Column */}
                        <Grid xs={12} md={7}>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5, color: '#333', fontSize: { xs: '1.75rem', md: '2rem' } }}>
                                {product.title}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                                {typeof product.rating === 'number' && product.rating > 0 && (
                                    <Rating name="read-only" value={product.rating} precision={0.1} readOnly sx={{ color: '#faaf00' }} />
                                )}
                                <Typography variant="body2" color="text.secondary" sx={{ ml: product.rating > 0 ? 1 : 0, mr: 2 }}>
                                    ({product.review_nums || 0} đánh giá)
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                    Đã bán: {currentVariation?.sold ?? product.sold_count ?? 0}
                                </Typography>
                                <IconButton onClick={toggleFavorite} size="small" sx={{ color: isFavorite ? 'error.main' : 'action.active' }}>
                                    {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                </IconButton>
                            </Box>

                            {product.brand && (<Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}> Thương hiệu:
                                <MuiLink href="#" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: '500', ml: 0.5 }}>{product.brand}</MuiLink>
                            </Typography>)}

                            <Box sx={{ backgroundColor: '#fafafa', p: 2, borderRadius: '4px', mb: 2 }}>
                                {originalPrice && originalPrice > (displayPrice || 0) && (
                                    <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                        {originalPrice.toLocaleString('vi-VN')} ₫
                                    </Typography>
                                )}
                                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
                                    {displayPrice ? `${displayPrice.toLocaleString('vi-VN')} ₫` : 'Giá liên hệ'}
                                </Typography>
                                {discountPercentage > 0 && (
                                    <Chip label={`Giảm ${discountPercentage}%`} color="error" size="small" sx={{ fontWeight: 'bold' }} />
                                )}
                            </Box>

                            {/* Color Selection - product.color is now de-duplicated */}
                            {product.color && product.color.length > 0 ? (
                                <>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Màu sắc:</Typography>
                                        <Grid container spacing={1}>
                                            {product.color.map((colorObj) => (
                                                <Grid key={colorObj.color}>
                                                    <Chip
                                                        label={colorObj.color}
                                                        onClick={() => handleColorSelect(colorObj)}
                                                        variant={selectedColor?.color === colorObj.color ? "filled" : "outlined"}
                                                        color={selectedColor?.color === colorObj.color ? "primary" : "default"}
                                                        clickable
                                                        sx={{ fontWeight: selectedColor?.color === colorObj.color ? 'bold' : 'normal', mr: 1, mb: 1 }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>

                                    {/* Size Selection - selectedColor.size is now de-duplicated */}
                                    {selectedColor && selectedColor.size && selectedColor.size.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Kích thước ({selectedColor.color}):</Typography>
                                            <Grid container spacing={1}>
                                                {selectedColor.size.map((sizeObj) => (
                                                    <Grid key={sizeObj.size}> {/* Key is unique within this color's sizes */}
                                                        <Chip
                                                            label={sizeObj.size}
                                                            onClick={() => handleSizeSelect(sizeObj)}
                                                            disabled={sizeObj.stock === 0}
                                                            variant={(selectedSize?.size === sizeObj.size && selectedColor?.color === selectedColor.color) ? "filled" : "outlined"}
                                                            color={(selectedSize?.size === sizeObj.size && selectedColor?.color === selectedColor.color) ? "primary" : "default"}
                                                            clickable
                                                            sx={{ fontWeight: (selectedSize?.size === sizeObj.size && selectedColor?.color === selectedColor.color) ? 'bold' : 'normal', mr: 1, mb: 1 }}
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    )}
                                </>
                            ) : null}

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: (product.color && product.color.length > 0) ? 0 : 2 }}>
                                Kho: {typeof stock === 'number' ? stock : (product.stock_quantity || 'N/A')}
                            </Typography>

                            {/* Quantity Selector */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 2 }}>Số lượng:</Typography>
                                <IconButton size="small" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1 || isAddingToCart}>
                                    <RemoveIcon />
                                </IconButton>
                                <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>{quantity}</Typography>
                                <IconButton size="small" onClick={() => handleQuantityChange(1)} disabled={isAddingToCart || !currentVariation || typeof stock !== 'number' || quantity >= stock || stock === 0}>
                                    <AddIcon />
                                </IconButton>
                            </Box>

                            {/* Action Buttons */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid xs={12} sm={6}>
                                    <Button
                                        variant="contained" color="primary" size="large" startIcon={<ShoppingCartIcon />} fullWidth
                                        onClick={handleAddToCart}
                                        disabled={isAddingToCart || !currentVariation || typeof stock !== 'number' || stock === 0 || !displayPrice || (currentVariation && quantity > stock)}
                                    >
                                        {isAddingToCart ? <CircularProgress size={24} color="inherit" /> : "Thêm vào giỏ hàng"}
                                    </Button>
                                </Grid>
                                <Grid xs={12} sm={6}>
                                    <Button variant="contained" color="error" size="large" startIcon={<FlashOnIcon />} fullWidth
                                        disabled={!currentVariation || typeof stock !== 'number' || stock === 0 || !displayPrice || (currentVariation && quantity > stock)}
                                    // TODO: Implement Buy Now logic
                                    >
                                        Mua ngay
                                    </Button>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />
                            {/* Product Description */}
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Mô tả sản phẩm</Typography>
                                <Typography variant="body2" component="div" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                    {product.description}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
            <Footer />
        </>
    );
};

export default ProductDetailPage;