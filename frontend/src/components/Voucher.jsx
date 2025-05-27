import React, { useEffect, useState } from 'react'
import axios from 'axios'
import vouchersx from '../assets/vouchersx.png'
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {
  Container, Typography, Box, CircularProgress, Alert, Paper, Grid,
  Button, Divider, TextField, Radio, RadioGroup,
  FormControlLabel, FormControl, TableContainer, Table, TableHead,
  TableBody, TableRow, TableCell, Select, MenuItem, InputLabel,
  Stack
} from '@mui/material';

export default function Voucher({ buyList, setVoucher, setIsPopupOpen, setPromotionId }) {
    const [vouchers, setList] = useState([])
    const fixPrice = (price) => {
        const format = String(price);
        let token = " đ";
        let checkpoint = 0;
        for (let i = format.length - 1; i >= 0; i--) {
            token = format[i] + token;
            checkpoint++;
            if (checkpoint === 3 && i !== 0) {
                token = "." + token;
                checkpoint = 0;
            }
        }
        return token;
    }

    function formatToDDMMYYYY(isoString) {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    useEffect(() => {
        const fetchVoucher = async () => {
            try {
                const res = await axios.post(`http://localhost:8080/api/voucher`,{
                    lstItems: JSON.stringify(buyList)
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log(res.data.data)
                setList(res.data.data)
            } catch (error) {
                console.error("Error fetching vouchers:", error);
            }
        }

        fetchVoucher()
    }, [])

    return (
    <Box width={450} height={500}>
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Bạn có thể chọn 1 voucher</Typography>
      <Divider sx={{ backgroundColor: "#F3F6F8", height: 8 }} />
      <Typography sx={{ mt: 2, pl: 1, fontWeight: "bold" }}>Mã giảm giá</Typography>

      <Box
        sx={{
          height: 450,
          overflowY: "auto",
          mt: 2,
          pr: 1,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {vouchers?.length > 0 ? vouchers.map((item, index) => (
          <Box key={index} sx={{ position: "relative", mb: 3 }}>
            {index === 0 && (
              <Box
                sx={{
                  borderRadius: "10px 10px 0 10px",
                  backgroundColor: "#F7D9E1",
                  height: 25,
                  width: 120,
                  position: "absolute",
                  top: -12,
                  right: 10,
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "red",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                }}
              >
                Lựa chọn tốt nhất
              </Box>
            )}

            <Paper
              elevation={4}
              sx={{
                display: "flex",
                border: "2px solid #f2b647",
                borderRadius: 2,
                backgroundColor: "#fffacd",
                cursor: "pointer",
                height: 120,
                width: 380,
                mx: "auto",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                position: "relative",
              }}
              onClick={() => {
                setVoucher(item);
                setPromotionId(item.promotion_id);
                setIsPopupOpen(false);
              }}
            >
              {/* Left Section */}
              <Box sx={{ p: 2, width: 140, textAlign: "center" }}>
                <img src={vouchersx} alt="voucher" style={{ width: 60, height: 60 }} />
                <Typography sx={{ mt: 1, fontWeight: "bold", color: "red" }}>
                  {item.promotion_id}
                </Typography>
              </Box>

              {/* Vertical Divider */}
              <Divider orientation="vertical" flexItem sx={{ borderStyle: "dashed", borderColor: "white", mx: 1 }} />

              {/* Right Section */}
              <Box sx={{ p: 2, width: 240 }}>
                {item.discount_type === 'price' ? (
                  <Typography sx={{ fontWeight: "bold" }}>Giảm {item.discount_rate}</Typography>
                ) : (
                  <>
                    <Typography sx={{ fontWeight: "bold" }}>Giảm {item.discount_rate}%</Typography>
                    <Typography sx={{ fontWeight: "bold" }}>Giảm tối đa: {fixPrice(item.max_discount)}</Typography>
                  </>
                )}
                <Typography sx={{ fontSize: 14 }}>Đơn tối thiểu: {fixPrice(item.min_spend)}</Typography>
                <Typography sx={{ fontSize: 12, color: "gray" }}>
                  Ngày hết hạn: <span style={{ color: "red" }}>{formatToDDMMYYYY(item.valid_end)}</span>
                </Typography>
              </Box>
            </Paper>
          </Box>
        )) : (
          <Typography textAlign="center">Không có voucher phù hợp</Typography>
        )}
      </Box>
    </Box>
    )
}
