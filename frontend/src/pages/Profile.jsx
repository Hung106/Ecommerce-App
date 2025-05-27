// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Profile = () => {
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    email: '',
    password: '',
    user_type: '',
  });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const backgroundImageUrl = '/background.jpg';

  useEffect(() => {
    const storedUserDataString = localStorage.getItem('userData');
    if (storedUserDataString) {
      try {
        const storedUserData = JSON.parse(storedUserDataString);
        if (storedUserData && storedUserData.user_id) { // Chính xác: lấy user_id từ localStorage
          setUserId(storedUserData.user_id);
          setFormData({
            last_name: storedUserData.last_name || '',
            first_name: storedUserData.first_name || '',
            email: storedUserData.email || '',
            password: '',
            user_type: storedUserData.user_type || '',
          });
        } else {
          setError('User ID không tìm thấy trong local storage.');
        }
      } catch (e) {
        setError('Dữ liệu người dùng trong local storage không hợp lệ.');
      }
    } else {
      setError('Chưa đăng nhập hoặc không tìm thấy dữ liệu người dùng.');
    }
    setInitialLoading(false);
  }, []);

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('User ID không tồn tại.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const dataToUpdate = { ...formData };

    try {
      const response = await axios.put(`http://localhost:8080/api/users/${userId}`, dataToUpdate); 
      setSuccessMessage(response.data.message || 'Cập nhật hồ sơ thành công!');
      setFormData(prev => ({ ...prev, password: '' })); // Xóa mật khẩu khỏi form

      // Cập nhật localStorage nếu cần
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      localStorage.setItem('userData', JSON.stringify({
        ...storedUserData,
        first_name: dataToUpdate.first_name,
        last_name: dataToUpdate.last_name,
        email: dataToUpdate.email,
        user_type: dataToUpdate.user_type,
      }));

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Lỗi cập nhật hồ sơ.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (!userId && error) { // Hiển thị lỗi nếu không có userId và có thông báo lỗi
    return <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>{error}</div>;
  }
  
  // Nếu có lỗi nhưng vẫn có userId (ví dụ lỗi submit form), form vẫn nên hiển thị
  // Nếu !userId và không có lỗi (initialLoading = false), cũng có thể là trường hợp chưa đăng nhập
  if (!userId && !error && !initialLoading) {
      return <div style={{ padding: '20px', textAlign: 'center' }}>Vui lòng đăng nhập để xem hồ sơ.</div>;
  }


  return (
      <>
      <style>{/* CSS nền */`
          html, body { margin: 0; padding: 0; width: 100%; min-height: 100vh; overflow-x: hidden;
            background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center;
            background-repeat: no-repeat; background-attachment: fixed; }
        `}</style>

      <Navbar />
    <div style={{ 
        maxWidth: '600px', 
        margin: '100px auto 40px auto', // Tăng margin top để không bị Navbar che
        padding: '30px', 
        border: '1px solid #ccc', 
        borderRadius: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Thêm nền mờ cho form để dễ đọc hơn
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>Cập Nhật Hồ Sơ</h2>

      {error && <p style={{ color: 'red', backgroundColor: '#ffebee', border: '1px solid #ef9a9a', padding: '10px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green', backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', padding: '10px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px' }}>{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="first_name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Tên:</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="last_name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Họ:</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
            Mật khẩu mới (Để trống nếu không đổi):
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu mới hoặc để trống"
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <p style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
            Lưu ý: Để trống sẽ không thay đổi mật khẩu nếu backend xử lý đúng.
          </p>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label htmlFor="user_type" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Loại người dùng:</label>
          <input
            type="text"
            id="user_type"
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            required
            // readOnly={true} // Bỏ comment nếu người dùng không được tự thay đổi
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !userId}
          style={{
            width: '100%',
            padding: '12px 15px',
            backgroundColor: loading || !userId ? '#bdc3c7' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !userId ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </form>
    </div>
    </>
  );
};

export default Profile;