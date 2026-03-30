const mysql = require('mysql2');
require('dotenv').config();

// Tạo connection pool để tối ưu hiệu suất kết nối
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối khi khởi động
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Lỗi kết nối MySQL:', err.message);
    } else {
        console.log('Đã kết nối thành công với database: ' + process.env.DB_NAME);
        connection.release();
    }
});

module.exports = pool;