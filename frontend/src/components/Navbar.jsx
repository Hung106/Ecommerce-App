import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  InputBase,
  Menu,
  MenuItem,
  Divider,
  Badge, // Thêm Badge cho giỏ hàng
  ListItemIcon, // Cho icon trong MenuItem
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Icon mặc định nếu không có avatar
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { styled, alpha } from '@mui/material/styles'; // For styling search bar

// Styled components cho search bar (ví dụ từ tài liệu MUI)
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  flexGrow: 1, // Cho phép search bar mở rộng
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%', // Đảm bảo InputBase chiếm toàn bộ Search component
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%', // Mở rộng mặc định
    [theme.breakpoints.up('md')]: {
      // width: '20ch', // Có thể đặt width cố định nếu muốn
    },
  },
}));

const Navbar = ({ setActiveNavItem }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [anchorElAccount, setAnchorElAccount] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [active, setActive] = useState('Sản phẩm'); // Mục active mặc định

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserName(parsedData.name || parsedData.username);
      setUserAvatar(parsedData.avatar);
    }
    const storedCartItems = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItemCount(storedCartItems.length);

  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAccountMenuOpen = (event) => {
    setAnchorElAccount(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAnchorElAccount(null);
  };

  const handleMenuItemClick = (newActiveState, path) => {
    setActive(newActiveState);
    if (setActiveNavItem) {
        setActiveNavItem(newActiveState);
    }
    if (path) {
      navigate(path);
    }
    handleAccountMenuClose();
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const Logout = async () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    handleAccountMenuClose();
    navigate('/');
  };

  const accountMenuItems = [
    { text: 'Trang tổng quan', path: '/customerdashboard', icon: <DashboardIcon fontSize="small"/> },
    { text: 'Đơn hàng', path: '/orders', icon: <ListAltIcon fontSize="small"/> },
    { text: 'Thông tin cá nhân', path: '/profile', icon: <PersonIcon fontSize="small"/> },
    { text: 'Sản phẩm yêu thích', path: '/wishlist', icon: <FavoriteIcon fontSize="small"/> },
  ];

  const drawerItems = [
    { text: "Sản phẩm", path: "/products", onClick: () => handleMenuItemClick("Sản phẩm", "/products")}, // Trang CustomerDashboard cũng có thể là trang sản phẩm chính
    { text: "Giỏ hàng", path: "/cart", onClick: () => handleMenuItemClick("Giỏ hàng", "/cart")},
    ...accountMenuItems.map(item => ({...item, onClick: () => handleMenuItemClick(item.text, item.path)})),
    { text: "Đăng xuất", onClick: Logout, icon: <ExitToAppIcon fontSize="small"/> }
  ];


  const handleSearch = (searchTerm) => {
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      console.log("Navbar is navigating to search with query:", trimmedSearchTerm);
      navigate(`/search?q=${encodeURIComponent(trimmedSearchTerm)}`);
    }
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: "#000", boxShadow: "none" }}>
        <Toolbar>
          {/* Mobile Menu Icon */}
          <IconButton
            color="inherit"
            edge="start"
            sx={{ display: { xs: "block", md: "none" }, mr: 1 }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="https://hcmut.edu.vn/img/nhanDienThuongHieu/01_logobachkhoatoi.png"
              alt="Logo"
              style={{ height: "40px", marginRight: "10px" }}
            />
          </Box>
           {/* Nút Sản phẩm (Desktop) */}
           <Button
            component={Link}
            to="/customerdashboard" // Hoặc /products, tùy thuộc vào trang chính hiển thị sản phẩm
            color="inherit"
            sx={{
              display: { xs: "none", md: "inline-flex" },
              margin: "0 10px",
              color: active === "Sản phẩm" ? "#1E90FF" : "#ffffff",
              fontWeight: active === "Sản phẩm" ? "bold" : "normal",
            }}
            onClick={() => handleMenuItemClick("Sản phẩm", "/customerdashboard")} // Hoặc /products
          >
            Sản phẩm
          </Button>


          {/* Search Bar */}
          <Search sx={{ display: { xs: 'none', sm: 'block' } }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Tìm kiếm sản phẩm…"
              inputProps={{ 'aria-label': 'search' }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  handleSearch(event.target.value);
                }
              }}
            />
          </Search>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', sm: 'none' } }} />


          {/* Cart Icon */}
          <IconButton
            component={Link}
            to="/cart"
            size="large"
            aria-label="show cart items"
            color="inherit"
            sx={{ ml: 'auto' }}
            onClick={() => handleMenuItemClick("Giỏ hàng", "/cart")}
          >
            <Badge badgeContent={cartItemCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* Account Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="account-menu-appbar"
            aria-haspopup="true"
            onClick={handleAccountMenuOpen}
            color="inherit"
          >
            {userAvatar ? <Avatar src={userAvatar} sx={{ width: 32, height: 32 }} /> : <AccountCircleIcon />}
          </IconButton>
          <Menu
            id="account-menu-appbar"
            anchorEl={anchorElAccount}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElAccount)}
            onClose={handleAccountMenuClose}
            sx={{ '& .MuiPaper-root': { minWidth: 220 } }}
          >
            <Box sx={{ padding: '10px 16px'}}>
                <Typography variant="subtitle1" noWrap>
                    {userName || "Tài khoản"}
                </Typography>
            </Box>
            <Divider />
            {accountMenuItems.map((item) => (
              <MenuItem key={item.text} onClick={() => handleMenuItemClick(item.text, item.path)} component={Link} to={item.path}>
                {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                <ListItemText primary={item.text} />
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={Logout}>
              <ListItemIcon><ExitToAppIcon fontSize="small"/></ListItemIcon>
              <ListItemText primary="Đăng xuất" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: 'border-box', width: 240, backgroundColor: "#111", color: "#fff" },
        }}
      >
        <Box sx={{ textAlign: 'center', padding: 2, borderBottom: '1px solid #333'}}>
          <img
              src="https://hcmut.edu.vn/img/nhanDienThuongHieu/01_logobachkhoatoi.png"
              alt="Logo"
              style={{ height: "40px" }}
            />
        </Box>
        {/* Search bar for mobile drawer */}
        <Box sx={{ padding: '8px 16px' }}>
            <Search sx={{width: '100%', margin: 0, backgroundColor: alpha("#fff", 0.1)}}>
                <SearchIconWrapper>
                    <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                    placeholder="Tìm kiếm…"
                    inputProps={{ 'aria-label': 'search' }}
                    onKeyPress={(event) => {
                        if (event.key === 'Enter') {
                           handleSearch(event.target.value);
                           setMobileOpen(false); // Đóng drawer sau khi tìm kiếm
                        }
                    }}
                />
            </Search>
        </Box>
        <List>
          {drawerItems.map((item, index) => (
            <ListItem button key={item.text} onClick={item.onClick} component={item.path ? Link : 'div'} to={item.path || undefined}>
              {item.icon && <ListItemIcon sx={{color: '#fff'}}>{item.icon}</ListItemIcon>}
              <ListItemText
                primary={item.text}
                sx={{
                  color: active === item.text ? "#1E90FF" : "#fff",
                  fontWeight: active === item.text ? "bold" : "normal",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;