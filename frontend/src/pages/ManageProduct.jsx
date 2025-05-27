import React, { useState, useEffect } from 'react';
// Ensure these paths are correct for your project structure
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/seller'; 
import Navbar from '../components/Navbar';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Button, 
    TextField, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle,
    CircularProgress,
    Box,
    Typography // Added Typography for better text handling
} from '@mui/material';

const ManageProduct = () => {
    const menuItems = ['Trang chủ', 'Quản lí sản phẩm'];
    const routes = ['/sellerdashboard', '/manageproduct']; // Adjust if your routes are different

    const [products, setProducts] = useState([]);
    // Updated state for adding a new product to match the new JSON structure
    const [newProduct, setNewProduct] = useState({
        title: '',
        brand: '',
        description: '',
        seller_id: '',
        category_id: '',
        lstImage_url_string: '', // Comma-separated image URLs
        lstLayer_json_string: '', // JSON string for the array of variants
    });
    // State for editing main product information (remains as is for editing main details)
    const [editProduct, setEditProduct] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedDescription, setExpandedDescription] = useState({});

    const [filters, setFilters] = useState({
        title: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        maxRate: '',
        minRate: ''
    });

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await getProducts(filters);
                const productData = response && Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
                console.log('Fetched products:', productData); // Crucial for debugging data structure
                setProducts(productData);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Lỗi khi tải danh sách sản phẩm. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const getDisplayName = (key) => {
        const names = {
            title: 'Tên sản phẩm', 
            brand: 'Thương hiệu',
            description: 'Mô tả', 
            seller_id: 'ID Người bán', 
            category_id: 'ID Danh mục',
            lstImage_url_string: 'URLs Hình ảnh (cách nhau bởi dấu phẩy)',
            lstLayer_json_string: 'Danh sách Biến thể (JSON Array)',
            // Display names for edit dialog (main product info)
            img_urls: 'URLs Hình ảnh (cách nhau bởi dấu phẩy)', // Used in edit dialog
            review_nums: 'Lượt đánh giá', 
            rating: 'Đánh giá', 
            favorite: 'Yêu thích'
        };
        return names[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
    };

    const numericFieldsForFilter = ['minPrice', 'maxPrice', 'maxRate', 'minRate'];


    const handleOpenAddDialog = () => {
        setError('');
        setNewProduct({ 
            title: '',
            brand: '',
            description: '',
            seller_id: '',
            category_id: '',
            lstImage_url_string: '',
            // Provide a more accurate example for lstLayer_json_string based on the user's data
            lstLayer_json_string: '[\n  {\n    "color": "Tên màu (vd: Xanh)",\n    "size": [\n      {\n        "size": "Tên kích thước (vd: 128GB)",\n        "sold": 0,\n        "stock": 10,\n        "initial_price": 10000000,\n        "final_price": 9000000\n      }\n    ]\n  }\n]', 
        });
    };
    
    const handleOpenEditDialog = (productToEdit) => {
        setError(''); 
        // Determine which image array to use: 'img' or 'lstImage_url'
        const imageArray = productToEdit.img || productToEdit.lstImage_url;

        setEditProduct({
            product_id: productToEdit.product_id,
            title: productToEdit.title || '',
            brand: productToEdit.brand || '',
            description: productToEdit.description || '',
            seller_id: productToEdit.seller_id || '',
            category_id: productToEdit.category_id || '',
            img_urls: Array.isArray(imageArray) ? imageArray.join(', ') : '', 
            review_nums: productToEdit.review_nums !== undefined ? productToEdit.review_nums : '',
            rating: productToEdit.rating !== undefined ? productToEdit.rating : '',
            favorite: productToEdit.favorite !== undefined ? productToEdit.favorite : '',
        });
    };

    const handleAddProduct = async () => {
        const requiredFields = ['title', 'brand', 'description', 'seller_id', 'category_id', 'lstImage_url_string', 'lstLayer_json_string'];
        for (const field of requiredFields) {
            if (!newProduct[field]) {
                 setError(`Vui lòng điền đầy đủ thông tin cho trường: ${getDisplayName(field)}.`);
                return;
            }
        }

        let parsedLstLayer; // This should now be parsed as an array of color groups
        try {
            parsedLstLayer = JSON.parse(newProduct.lstLayer_json_string);
            if (!Array.isArray(parsedLstLayer) || parsedLstLayer.some(item => typeof item !== 'object' || item === null)) {
                throw new Error("Định dạng JSON cho Danh sách Biến thể không hợp lệ (cần là một mảng các đối tượng nhóm màu).");
            }
            // Validate structure of each color group and its size variants
            parsedLstLayer.forEach(colorGroup => {
                if (!colorGroup.color || !Array.isArray(colorGroup.size) || colorGroup.size.length === 0) {
                    throw new Error("Mỗi nhóm màu phải có 'color' và một mảng 'size' không rỗng.");
                }
                colorGroup.size.forEach(variant => {
                    if (typeof variant.stock !== 'number' || 
                        typeof variant.initial_price !== 'number' || // Corrected key based on user's JSON
                        typeof variant.final_price !== 'number' || // Corrected key
                        !variant.size) {
                        throw new Error("Các trường stock, initial_price, final_price trong mỗi biến thể kích thước phải là số và phải có 'size'.");
                    }
                });
            });

        } catch (e) {
            setError(`Lỗi phân tích JSON cho Danh sách Biến thể: ${e.message}`);
            return;
        }

        const productDataToSend = {
            title: newProduct.title,
            brand: newProduct.brand,
            description: newProduct.description,
            seller_id: newProduct.seller_id,
            category_id: newProduct.category_id,
            // Use lstImage_url to match the user's latest JSON structure
            lstImage_url: newProduct.lstImage_url_string ? newProduct.lstImage_url_string.split(',').map(url => url.trim()).filter(url => url) : [],
            // Use 'color' as the top-level array for variants, matching user's console output
            color: parsedLstLayer, 
        };
        // The field 'lstLayer' is what user inputs in JSON string, but API might expect it as 'color'
        // If API strictly expects 'lstLayer', then: productDataToSend.lstLayer = parsedLstLayer;

        setLoading(true);
        setError('');
        try {
            await createProduct(productDataToSend); 
            alert('Sản phẩm đã được thêm thành công!');
            handleOpenAddDialog(); 

            const response = await getProducts(filters); 
            const updatedProductData = response && Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
            setProducts(updatedProductData);

        } catch (err) {
            console.error('Error adding product:', err);
            const apiError = err?.response?.data?.message || err.message || 'Lỗi không xác định';
            setError(`Lỗi khi thêm sản phẩm: ${apiError}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleUpdateProduct = async () => {
        if (!editProduct || !editProduct.product_id) {
            setError('Không có sản phẩm nào được chọn để cập nhật.');
            return;
        }
        
        const productDataToUpdate = {
            product_id: editProduct.product_id,
            title: editProduct.title,
            brand: editProduct.brand,
            description: editProduct.description,
            seller_id: editProduct.seller_id, 
            category_id: editProduct.category_id, 
            // Use 'lstImage_url' if your API expects that for updates, or 'img'
            lstImage_url: editProduct.img_urls ? editProduct.img_urls.split(',').map(url => url.trim()).filter(url => url) : [],
            review_nums: editProduct.review_nums, 
            rating: editProduct.rating, 
            favorite: editProduct.favorite, 
        };

        setLoading(true);
        setError('');
        try {
            await updateProduct(productDataToUpdate); 
            alert('Thông tin sản phẩm đã được cập nhật thành công!');
            setEditProduct(null); 

            const response = await getProducts(filters);
            const updatedProductData = response && Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
            setProducts(updatedProductData);

        } catch (err) {
            console.error('Error updating product:', err);
            const apiError = err?.response?.data?.message || err.message || 'Lỗi không xác định';
            setError(`Lỗi khi cập nhật sản phẩm: ${apiError}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? (Thao tác này sẽ xóa sản phẩm và tất cả các biến thể của nó)')) return;
        setLoading(true);
        setError('');
        try {
            await deleteProduct(productId);
            alert('Sản phẩm đã được xóa thành công!');
            setProducts((prevProducts) => prevProducts.filter((product) => product.product_id !== productId));
        } catch (err) {
            console.error('Error deleting product:', err);
            const apiError = err?.response?.data?.message || err.message || 'Lỗi không xác định';
            setError(`Lỗi khi xóa sản phẩm: ${apiError}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleDescription = (productId) => {
        setExpandedDescription((prevState) => ({
            ...prevState,
            [productId]: !prevState[productId]
        }));
    };

    useEffect(() => {
        handleOpenAddDialog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <Box sx={{pb: 4}}>
            <Navbar
                title="Seller"
                menuItems={menuItems}
                routes={routes}
                active={"Quản lí sản phẩm"}
            />
            <Box sx={{ margin: '20px', padding: { xs: '0 8px', sm: '0 16px' } }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3, textAlign: 'center', mt: {xs: '70px', sm: '80px'} }}>
                    Quản Lý Sản Phẩm
                </Typography>

                {error && <Paper elevation={3} sx={{ padding: '10px 16px', mb: 2, backgroundColor: 'error.light', color: 'error.contrastText' }}>{error}</Paper>}

                <Paper sx={{ padding: '16px', mb: 3 }} elevation={2}>
                    <Typography variant="h6" component="h3" gutterBottom>Thêm sản phẩm mới</Typography>
                    {Object.keys(newProduct).map((key) => (
                        <TextField
                            key={key}
                            label={getDisplayName(key)}
                            name={key}
                            value={newProduct[key]}
                            onChange={(e) => setNewProduct({ ...newProduct, [key]: e.target.value })}
                            fullWidth
                            margin="dense"
                            variant="outlined"
                            multiline={key === 'lstLayer_json_string' || key === 'description'}
                            rows={key === 'lstLayer_json_string' ? 8 : (key === 'description' ? 3 : 1)}
                            helperText={key === 'lstLayer_json_string' ? 'Nhập JSON array cho các nhóm màu và biến thể kích thước.' : (key === 'lstImage_url_string' ? 'Các URL cách nhau bằng dấu phẩy (,)' : '')}
                            InputLabelProps={{ shrink: true }}
                        />
                    ))}
                    <Button onClick={handleAddProduct} disabled={loading} color="primary" variant="contained" sx={{ mt: 2 }}>
                        {loading ? <CircularProgress size={24} color="inherit"/> : 'Thêm Sản Phẩm'}
                    </Button>
                </Paper>

                <Paper sx={{ padding: '16px', mb: 3 }} elevation={2}>
                    <Typography variant="h6" component="h3" gutterBottom>Lọc Sản Phẩm</Typography>
                    <TextField label="Tên sản phẩm" name="title" value={filters.title} onChange={handleFilterChange} sx={{ mr: 1, mb: 1 }} margin="dense" variant="outlined" InputLabelProps={{ shrink: true }}/>
                    <TextField label="ID Danh mục" name="category" value={filters.category} onChange={handleFilterChange} sx={{ mr: 1, mb: 1 }} margin="dense" variant="outlined" InputLabelProps={{ shrink: true }}/>
                    <TextField label="Giá thấp nhất" type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} sx={{ mr: 1, mb: 1 }} margin="dense" variant="outlined" InputLabelProps={{ shrink: true }} inputProps={{ min: 0 }}/>
                    <TextField label="Giá cao nhất" type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} sx={{ mr: 1, mb: 1 }} margin="dense" variant="outlined" InputLabelProps={{ shrink: true }} inputProps={{ min: 0 }}/>
                    <TextField label="Đánh giá thấp nhất" type="number" name="minRate" value={filters.minRate} onChange={handleFilterChange} sx={{ mr: 1, mb: 1 }} margin="dense" variant="outlined" InputLabelProps={{ shrink: true }} inputProps={{ min: 0, max:5, step: 0.1 }}/>
                    <TextField label="Đánh giá cao nhất" type="number" name="maxRate" value={filters.maxRate} onChange={handleFilterChange} sx={{ mr: 1, mb: 1 }} margin="dense" variant="outlined" InputLabelProps={{ shrink: true }} inputProps={{ min: 0, max:5, step: 0.1 }}/>
                    <Button onClick={() => setFilters({ title: '', category: '', minPrice: '', maxPrice: '', minRate: '', maxRate: ''})} sx={{ mt: 1 }} variant="outlined">
                        Xóa Bộ Lọc
                    </Button>
                </Paper>

                <Typography variant="h5" component="h3" gutterBottom>Danh Sách Sản Phẩm</Typography>
                {loading && !products.length ? <Box sx={{textAlign: 'center', padding: '20px'}}><CircularProgress /> <Typography>Đang tải sản phẩm...</Typography></Box> : 
                 !loading && products.length === 0 ? <Typography sx={{mt: 2, textAlign: 'center'}}>Không tìm thấy sản phẩm nào.</Typography> : (
                    <TableContainer component={Paper} elevation={2}>
                        <Table size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                                    <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Tên sản phẩm</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', minWidth: '150px' }}>Mô tả</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Lượt ĐG</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>ĐTB</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Giá gốc (BT1)</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Giá bán (BT1)</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Tồn (BT1)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Màu - Size (BT1)</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd', minWidth: '120px' }}>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => {
                                    // Adapt to the product structure where 'color' is the array of color groups,
                                    // and each color group has a 'size' array of actual variants.
                                    const firstColorGroup = product.color?.[0];
                                    const firstVariant = firstColorGroup?.size?.[0];
                                    
                                    let colorDisplay = 'N/A';
                                    let sizeDisplay = 'N/A';
                                    let colorSizeCombined = 'N/A';

                                    if (firstColorGroup) {
                                        colorDisplay = firstColorGroup.color || 'N/A';
                                    }
                                    if (firstVariant) {
                                        sizeDisplay = firstVariant.size || 'N/A';
                                    }

                                    if (colorDisplay !== 'N/A' && sizeDisplay !== 'N/A') {
                                        colorSizeCombined = `${colorDisplay} - ${sizeDisplay}`;
                                    } else if (colorDisplay !== 'N/A') {
                                        colorSizeCombined = colorDisplay;
                                    } else if (sizeDisplay !== 'N/A') {
                                        colorSizeCombined = sizeDisplay;
                                    }
                                    // If firstColorGroup or firstVariant is missing, colorSizeCombined remains 'N/A'

                                    return (
                                        <TableRow hover key={product.product_id || product.title} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}> 
                                            <TableCell sx={{ border: '1px solid #ddd', verticalAlign: 'top' }}>{product.title || 'N/A'}</TableCell>
                                            <TableCell sx={{ border: '1px solid #ddd', verticalAlign: 'top', maxWidth: '250px' }}>
                                                <Button size="small" variant="text" onClick={() => toggleDescription(product.product_id || product.title)} sx={{ mb: 0.5, p:0.5, textTransform: 'none' }}>
                                                    {expandedDescription[product.product_id || product.title] ? 'Ẩn bớt' : 'Xem thêm'}
                                                </Button>
                                                {expandedDescription[product.product_id || product.title] && (
                                                    <Box sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '0.875rem', color: 'text.secondary', maxHeight: '120px', overflowY: 'auto', pt: '4px' }}>
                                                        {product.description || 'Không có mô tả.'}
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd', verticalAlign: 'top' }}>{product.review_nums !== undefined ? product.review_nums : 'N/A'}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd', verticalAlign: 'top' }}>{product.rating !== undefined ? product.rating : 'N/A'}</TableCell>
                                            
                                            {/* Use 'initial_price' and 'final_price' from the variant object */}
                                            <TableCell align="right" sx={{ border: '1px solid #ddd', verticalAlign: 'top' }}>
                                                {firstVariant?.initial_price !== undefined ? firstVariant.initial_price.toLocaleString() : 'N/A'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd', verticalAlign: 'top' }}>
                                                {firstVariant?.final_price !== undefined ? firstVariant.final_price.toLocaleString() : 'N/A'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd', verticalAlign: 'top' }}>
                                                {firstVariant?.stock !== undefined ? firstVariant.stock : 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ border: '1px solid #ddd', verticalAlign: 'top' }}>
                                                {colorSizeCombined}
                                            </TableCell>
                                            
                                            <TableCell align="center" sx={{ border: '1px solid #ddd', verticalAlign: 'top' }}>
                                                <Button sx={{mr: 0.5, mb: {xs: 0.5, sm: 0}}} variant="outlined" size="small" onClick={() => handleOpenEditDialog(product)} disabled={loading}>Sửa</Button>
                                                <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteProduct(product.product_id)} disabled={loading}>Xóa</Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Dialog open={Boolean(editProduct)} onClose={() => setEditProduct(null)} fullWidth maxWidth="md">
                    <DialogTitle>Chỉnh Sửa Thông Tin Gốc Của Sản Phẩm</DialogTitle>
                    <DialogContent>
                        <TextField label={getDisplayName('title')} value={editProduct?.title || ''} onChange={(e) => setEditProduct({ ...editProduct, title: e.target.value })} fullWidth margin="dense" variant="outlined" InputLabelProps={{ shrink: true }}/>
                        <TextField label={getDisplayName('brand')} value={editProduct?.brand || ''} onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })} fullWidth margin="dense" variant="outlined" InputLabelProps={{ shrink: true }}/>
                        <TextField label={getDisplayName('description')} value={editProduct?.description || ''} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} fullWidth margin="dense" variant="outlined" multiline rows={4} InputLabelProps={{ shrink: true }}/>
                        <TextField 
                            label={getDisplayName('img_urls')} 
                            value={editProduct?.img_urls || ''} 
                            onChange={(e) => setEditProduct({ ...editProduct, img_urls: e.target.value })} 
                            fullWidth 
                            margin="dense" 
                            variant="outlined" 
                            multiline 
                            rows={3}
                            helperText="Nhập các URL hình ảnh, cách nhau bằng dấu phẩy."
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField label={getDisplayName('seller_id')} value={editProduct?.seller_id || ''} fullWidth margin="dense" variant="outlined" InputLabelProps={{ shrink: true }} disabled sx={{backgroundColor: '#f0f0f0'}}/>
                        <TextField label={getDisplayName('category_id')} value={editProduct?.category_id || ''} fullWidth margin="dense" variant="outlined" InputLabelProps={{ shrink: true }} disabled sx={{backgroundColor: '#f0f0f0'}}/>
                        <TextField label={getDisplayName('review_nums')} type="number" value={editProduct?.review_nums || ''} fullWidth margin="dense" variant="outlined" InputLabelProps={{ shrink: true }} disabled sx={{backgroundColor: '#f0f0f0'}}/>
                        <TextField label={getDisplayName('rating')} type="number" value={editProduct?.rating || ''} fullWidth margin="dense" variant="outlined" InputLabelProps={{ shrink: true }} disabled sx={{backgroundColor: '#f0f0f0'}}/>
                        <TextField label={getDisplayName('favorite')} type="number" value={editProduct?.favorite || ''} fullWidth margin="dense" variant="outlined" InputLabelProps={{ shrink: true }} disabled sx={{backgroundColor: '#f0f0f0'}}/>
                    </DialogContent>
                    <DialogActions sx={{padding: '16px 24px'}}>
                        <Button onClick={() => setEditProduct(null)} color="inherit"> Hủy </Button>
                        <Button onClick={handleUpdateProduct} color="primary" variant="contained" disabled={loading}> {loading ? <CircularProgress size={24} color="inherit"/> : 'Lưu Thay Đổi'} </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default ManageProduct;
