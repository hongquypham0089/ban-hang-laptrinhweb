-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: laptrinhweb
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chitiet_donhang`
--

DROP TABLE IF EXISTS `chitiet_donhang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chitiet_donhang` (
  `MaChiTietDon` int NOT NULL AUTO_INCREMENT,
  `MaDonHang` int DEFAULT NULL,
  `MaSanPham` int DEFAULT NULL,
  `SoLuong` int DEFAULT NULL,
  `Gia` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`MaChiTietDon`),
  KEY `MaDonHang` (`MaDonHang`),
  KEY `MaSanPham` (`MaSanPham`),
  CONSTRAINT `chitiet_donhang_ibfk_1` FOREIGN KEY (`MaDonHang`) REFERENCES `donhang` (`MaDonHang`),
  CONSTRAINT `chitiet_donhang_ibfk_2` FOREIGN KEY (`MaSanPham`) REFERENCES `sanpham` (`MaSanPham`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chitiet_donhang`
--

LOCK TABLES `chitiet_donhang` WRITE;
/*!40000 ALTER TABLE `chitiet_donhang` DISABLE KEYS */;
/*!40000 ALTER TABLE `chitiet_donhang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chitiet_giohang`
--

DROP TABLE IF EXISTS `chitiet_giohang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chitiet_giohang` (
  `MaChiTiet` int NOT NULL AUTO_INCREMENT,
  `MaGioHang` int DEFAULT NULL,
  `MaSanPham` int DEFAULT NULL,
  `SoLuong` int DEFAULT '1',
  PRIMARY KEY (`MaChiTiet`),
  KEY `MaGioHang` (`MaGioHang`),
  KEY `MaSanPham` (`MaSanPham`),
  CONSTRAINT `chitiet_giohang_ibfk_1` FOREIGN KEY (`MaGioHang`) REFERENCES `giohang` (`MaGioHang`),
  CONSTRAINT `chitiet_giohang_ibfk_2` FOREIGN KEY (`MaSanPham`) REFERENCES `sanpham` (`MaSanPham`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chitiet_giohang`
--

LOCK TABLES `chitiet_giohang` WRITE;
/*!40000 ALTER TABLE `chitiet_giohang` DISABLE KEYS */;
INSERT INTO `chitiet_giohang` VALUES (1,1,2,1),(2,1,8,2),(3,1,9,1),(4,2,5,1),(5,2,10,1),(6,3,4,1),(7,3,11,1),(8,4,13,1),(9,5,15,1),(10,5,16,2),(12,7,19,1),(13,8,19,1),(14,9,20,1),(15,10,20,1),(16,11,16,1),(17,12,6,1),(18,13,2,1),(19,14,8,1),(20,15,16,1),(21,16,19,1),(22,17,16,1),(23,18,2,1),(24,19,20,1),(25,20,19,1),(26,21,4,1),(27,22,20,1),(28,23,19,1),(29,24,2,6),(30,25,19,1),(31,26,13,1),(32,27,13,1),(33,28,20,1);
/*!40000 ALTER TABLE `chitiet_giohang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donhang`
--

DROP TABLE IF EXISTS `donhang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donhang` (
  `MaDonHang` int NOT NULL AUTO_INCREMENT,
  `MaTaiKhoan` int DEFAULT NULL,
  `NgayDat` datetime DEFAULT CURRENT_TIMESTAMP,
  `TongTien` decimal(12,2) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`MaDonHang`),
  KEY `MaTaiKhoan` (`MaTaiKhoan`),
  CONSTRAINT `donhang_ibfk_1` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `taikhoan` (`MaTaiKhoan`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donhang`
--

LOCK TABLES `donhang` WRITE;
/*!40000 ALTER TABLE `donhang` DISABLE KEYS */;
INSERT INTO `donhang` VALUES (1,2,'2024-01-15 10:30:00',89990000.00,'Đã giao'),(2,2,'2024-02-20 14:45:00',3890000.00,'Đã giao'),(3,2,'2024-03-10 09:15:00',59990000.00,'Đang giao'),(4,2,'2024-03-25 16:20:00',14990000.00,'Chờ xác nhận'),(5,3,'2024-01-05 11:00:00',39990000.00,'Đã giao'),(6,3,'2024-02-28 13:30:00',1990000.00,'Đã giao'),(7,3,'2024-03-20 10:45:00',28990000.00,'Đang giao'),(8,4,'2024-01-25 08:20:00',45990000.00,'Đã giao'),(9,4,'2024-03-01 15:10:00',5990000.00,'Đã hủy'),(10,4,'2024-03-22 09:30:00',12990000.00,'Đang giao'),(11,5,'2024-02-10 12:00:00',13990000.00,'Đã giao'),(12,5,'2024-03-18 14:15:00',3590000.00,'Chờ xác nhận'),(13,6,'2024-03-05 09:45:00',12990000.00,'Đã giao'),(14,6,'2024-03-24 11:30:00',4290000.00,'Chờ xác nhận'),(15,7,'2026-04-07 03:30:55',89990000.00,'Đã giao'),(16,7,'2026-04-07 03:30:55',3890000.00,'Đang giao'),(17,7,'2026-04-07 03:30:55',12990000.00,'Chờ xác nhận'),(18,8,'2026-04-07 03:30:55',45990000.00,'Đã giao'),(19,8,'2026-04-07 03:30:55',1990000.00,'Đang giao'),(20,8,'2026-04-07 03:30:55',5990000.00,'Đã hủy');
/*!40000 ALTER TABLE `donhang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `giohang`
--

DROP TABLE IF EXISTS `giohang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giohang` (
  `MaGioHang` int NOT NULL AUTO_INCREMENT,
  `MaTaiKhoan` int DEFAULT NULL,
  `NgayTao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaGioHang`),
  KEY `MaTaiKhoan` (`MaTaiKhoan`),
  CONSTRAINT `giohang_ibfk_1` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `taikhoan` (`MaTaiKhoan`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giohang`
--

LOCK TABLES `giohang` WRITE;
/*!40000 ALTER TABLE `giohang` DISABLE KEYS */;
INSERT INTO `giohang` VALUES (1,2,'2026-04-06 19:57:24'),(2,3,'2026-04-06 19:57:24'),(3,4,'2026-04-06 19:57:24'),(4,5,'2026-04-06 19:57:24'),(5,6,'2026-04-06 19:57:24'),(6,7,'2026-04-27 23:29:20'),(7,NULL,'2026-05-03 23:31:52'),(8,NULL,'2026-05-03 23:32:00'),(9,NULL,'2026-05-03 23:32:28'),(10,NULL,'2026-05-03 23:35:36'),(11,NULL,'2026-05-03 23:35:43'),(12,NULL,'2026-05-03 23:38:26'),(13,NULL,'2026-05-03 23:38:28'),(14,NULL,'2026-05-03 23:39:37'),(15,NULL,'2026-05-03 23:45:32'),(16,NULL,'2026-05-03 23:46:47'),(17,NULL,'2026-05-03 23:46:58'),(18,NULL,'2026-05-04 00:08:09'),(19,NULL,'2026-05-04 01:51:47'),(20,NULL,'2026-05-04 01:51:49'),(21,NULL,'2026-05-04 02:29:57'),(22,NULL,'2026-05-04 02:35:43'),(23,NULL,'2026-05-04 03:12:19'),(24,NULL,'2026-05-04 03:15:08'),(25,NULL,'2026-05-04 03:43:01'),(26,NULL,'2026-05-04 15:16:45'),(27,NULL,'2026-05-04 15:16:48'),(28,NULL,'2026-05-04 15:25:47');
/*!40000 ALTER TABLE `giohang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loaisanpham`
--

DROP TABLE IF EXISTS `loaisanpham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loaisanpham` (
  `MaLoai` int NOT NULL AUTO_INCREMENT,
  `TenLoai` varchar(100) NOT NULL,
  `MoTa` text,
  PRIMARY KEY (`MaLoai`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loaisanpham`
--

LOCK TABLES `loaisanpham` WRITE;
/*!40000 ALTER TABLE `loaisanpham` DISABLE KEYS */;
INSERT INTO `loaisanpham` VALUES (1,'PC Gaming','Các dòng máy tính chơi chuyên nghiệp'),(2,'PC Gaming','Máy tính chơi game hiệu năng cao'),(3,'Laptop','Laptop văn phòng và gaming'),(4,'Phụ kiện','Bàn phím, chuột, tai nghe'),(5,'Màn hình','Màn hình các loại'),(6,'Linh kiện','CPU, RAM, VGA, Mainboard');
/*!40000 ALTER TABLE `loaisanpham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nguoidung`
--

DROP TABLE IF EXISTS `nguoidung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoidung` (
  `MaNguoiDung` int NOT NULL AUTO_INCREMENT,
  `TenNguoiDung` varchar(100) DEFAULT NULL,
  `NgaySinh` date DEFAULT NULL,
  `GioiTinh` varchar(10) DEFAULT NULL,
  `SoDienThoai` varchar(20) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaNguoiDung`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoidung`
--

LOCK TABLES `nguoidung` WRITE;
/*!40000 ALTER TABLE `nguoidung` DISABLE KEYS */;
INSERT INTO `nguoidung` VALUES (1,'Admin System','2000-01-01','Nam','032555553365','Viet Nam'),(2,'Khach Hang 01','2002-05-10','Nam','0900000002','Viet Nam'),(3,'QUÝ PHẠM HỒNG','2026-03-10',NULL,'0371234567',NULL),(4,'hongquy','2026-03-08',NULL,'0123456789',NULL),(5,'Trần Thị Tuyết Mai','2007-07-25','Nữ','0111111111','thuận giao 15'),(6,'quanghuy','2024-06-12',NULL,'0132654897',NULL),(7,'Nguyễn Văn An','1995-03-15','Nam','0912345678','123 Đường Lê Lợi, Quận 1, TP.HCM'),(8,'Trần Thị Bình','1998-07-22','Nữ','0923456789','456 Đường Nguyễn Huệ, Quận 2, TP.HCM'),(10,'Phạm Thị Dung','1997-05-18','Nữ','0945678901','321 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM'),(11,'Hoàng Văn Em','2001-09-25','Nam','0956789012','654 Đường Trường Chinh, Quận Tân Bình, TP.HCM'),(12,'truong van hoang','2003-07-18','Nam','0987654321',NULL),(13,'nguyen thi le my','2004-01-01',NULL,'012345678',NULL);
/*!40000 ALTER TABLE `nguoidung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sanpham`
--

DROP TABLE IF EXISTS `sanpham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sanpham` (
  `MaSanPham` int NOT NULL AUTO_INCREMENT,
  `TenSanPham` varchar(200) NOT NULL,
  `Gia` decimal(12,2) NOT NULL,
  `SoLuong` int DEFAULT '0',
  `MoTa` text,
  `HinhAnh` varchar(255) DEFAULT NULL,
  `MaLoai` int DEFAULT NULL,
  PRIMARY KEY (`MaSanPham`),
  KEY `MaLoai` (`MaLoai`),
  CONSTRAINT `sanpham_ibfk_1` FOREIGN KEY (`MaLoai`) REFERENCES `loaisanpham` (`MaLoai`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sanpham`
--

LOCK TABLES `sanpham` WRITE;
/*!40000 ALTER TABLE `sanpham` DISABLE KEYS */;
INSERT INTO `sanpham` VALUES (2,'sửa sản phẩm test pai',500000.00,10,'sửa','/uploads/1773697073362.jpg',1),(4,'màn hình HQ202',999000.00,99,'Switch','/uploads/1773697040100.jpg',1),(5,'ádfghj',54465465.00,47,'sxdcfvgbhunjsdfghjkasdfghjsdf','/uploads/1773694876543.jpg',1),(6,'PC Gaming RTX 4090 Intel i9',89990000.00,10,'CPU Intel Core i9-13900K, RAM 32GB DDR5, SSD 1TB, RTX 4090 24GB','/uploads/1775505586705.jpg',1),(7,'PC Gaming RTX 4080 Intel i7',59990000.00,15,'CPU Intel Core i7-13700K, RAM 32GB DDR5, SSD 1TB, RTX 4080 16GB','/uploads/1775505585096.jpg',1),(8,'PC Gaming RX 7900 XTX',49990000.00,8,'CPU AMD Ryzen 9 7900X, RAM 32GB DDR5, SSD 1TB, RX 7900 XTX 24GB','/uploads/1775505582312.jpg',1),(9,'Laptop ASUS ROG Strix G18',45990000.00,20,'Intel Core i9-13980HX, RAM 32GB, SSD 1TB, RTX 4080','/uploads/1775505717325.avif',2),(10,'Vortex GX Performance PC',50000000.00,3636,'Chiếc máy tính này là sự kết hợp hoàn hảo giữa hiệu năng mạnh mẽ và thiết kế hiện đại, phù hợp cho cả học tập, làm việc và giải trí. Với bộ vi xử lý thế hệ mới, máy mang lại tốc độ xử lý nhanh chóng, giúp bạn dễ dàng thực hiện các tác vụ từ cơ bản như lướt web, soạn thảo văn bản đến các công việc nặng hơn như lập trình, thiết kế đồ họa hay chơi game.\n\nMáy được trang bị dung lượng RAM lớn, hỗ trợ đa nhiệm mượt mà, cho phép mở nhiều ứng dụng cùng lúc mà không bị giật lag. Ổ cứng SSD tốc độ cao giúp khởi động máy chỉ trong vài giây và truy xuất dữ liệu cực nhanh, nâng cao đáng kể trải nghiệm người dùng.\n\nBên cạnh đó, màn hình sắc nét với độ phân giải cao mang đến hình ảnh chân thực, màu sắc sống động, rất thích hợp cho việc xem phim, chỉnh sửa ảnh hoặc làm việc trong thời gian dài mà không bị mỏi mắt. Thiết kế gọn nhẹ, tinh tế giúp bạn dễ dàng mang theo bên mình mọi lúc mọi nơi.\n\nNgoài ra, máy còn được tích hợp nhiều cổng kết nối hiện đại, đảm bảo khả năng tương thích với các thiết bị ngoại vi như chuột, bàn phím, màn hình ngoài và các thiết bị lưu trữ. Hệ thống tản nhiệt hiệu quả giúp máy luôn hoạt động ổn định, ngay cả khi sử dụng trong thời gian dài.\n\nĐây chắc chắn là một lựa chọn lý tưởng dành cho những ai đang tìm kiếm một chiếc máy tính bền bỉ, hiệu năng cao và đáp ứng tốt mọi nhu cầu trong cuộc sống hàng ngày.','/uploads/1775505736480.jpg',1),(11,'Laptop MacBook Pro M3',52990000.00,25,'Apple M3 Pro, RAM 18GB, SSD 512GB, Màu Space Black','/uploads/1775505728787.jpg',2),(12,'Laptop Lenovo Legion 5',28990000.00,18,'AMD Ryzen 7 7840H, RAM 16GB, SSD 512GB, RTX 4060','/uploads/1775505714236.avif',2),(13,'Bàn phím cơ Razer Huntsman V2',3890000.00,50,'Switch quang học, đèn RGB, khung nhôm','/uploads/1775505709319.avif',3),(14,'Chuột gaming Logitech G Pro X',2490000.00,40,'Sensor HERO 25K, Wireless, 63g','/uploads/1775505710778.avif',3),(15,'Tai nghe HyperX Cloud Alpha',1990000.00,35,'Driver 50mm, khung nhôm, microphone rời','/uploads/1775505707764.avif',3),(16,'Ghế gaming DXRacer Formula',5990000.00,15,'Chất liệu da PU, tựa lưng 180 độ','/uploads/1775505705036.avif',3),(17,'Màn hình Samsung Odyssey G7',14990000.00,12,'32 inch, 4K UHD, 144Hz, 1ms, G-Sync','/uploads/1775505702294.avif',4),(19,'Màn hình Dell UltraSharp U2723QE',12990000.00,8,'27 inch, 4K, IPS Black, USB-C Hub','/uploads/1775505697563.avif',4),(20,'CPU Intel Core i9-14900K',12990000.00,30,'24 nhân, 32 luồng, 6.0GHz Turbo','/uploads/1775505695921.avif',5),(21,'RAM Corsair Vengeance 32GB',3590000.00,45,'DDR5 6000MHz, CL30, RGB','/uploads/1775505694069.avif',5);
/*!40000 ALTER TABLE `sanpham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taikhoan`
--

DROP TABLE IF EXISTS `taikhoan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taikhoan` (
  `MaTaiKhoan` int NOT NULL AUTO_INCREMENT,
  `TenTaiKhoan` varchar(50) NOT NULL,
  `MatKhau` varchar(255) NOT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `MaNguoiDung` int DEFAULT NULL,
  `MaVaiTro` int DEFAULT NULL,
  `TinhTrang` varchar(20) DEFAULT NULL,
  `NgayTao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaTaiKhoan`),
  KEY `MaNguoiDung` (`MaNguoiDung`),
  KEY `MaVaiTro` (`MaVaiTro`),
  CONSTRAINT `taikhoan_ibfk_1` FOREIGN KEY (`MaNguoiDung`) REFERENCES `nguoidung` (`MaNguoiDung`),
  CONSTRAINT `taikhoan_ibfk_2` FOREIGN KEY (`MaVaiTro`) REFERENCES `vaitro` (`MaVaiTro`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taikhoan`
--

LOCK TABLES `taikhoan` WRITE;
/*!40000 ALTER TABLE `taikhoan` DISABLE KEYS */;
INSERT INTO `taikhoan` VALUES (1,'admin','admin123','admin@gmail.com',1,1,'Active','2026-03-16 19:14:17',NULL),(2,'khach01','khach123','khach01@gmail.com',2,2,'Active','2026-03-16 19:14:17',NULL),(3,'admin@gmail.com','123123','admin@gmail.com',1,1,'Active','2026-03-16 19:14:17',NULL),(4,'khach01','khach123','khach01@gmail.com',2,2,'Active','2026-03-16 19:14:17',NULL),(5,'22050089@student.bdu.edu.vn','quy123','22050089@student.bdu.edu.vn',3,2,'Active','2026-03-30 18:59:19',NULL),(6,'hognquy@gmail.com','quy123','hognquy@gmail.com',4,2,'Active','2026-03-30 19:08:09',NULL),(7,'hongquy@gmail.com','123123','hongquy@gmail.com',5,1,'Active','2026-04-06 18:41:08','/uploads/avatars/avatar_7_1776083901869.jpg'),(8,'quanghuy@gmail.com','123456','quanghuy@gmail.com',6,2,'Active','2026-04-06 18:55:51','/uploads/avatars/avatar_8_1775504589125.jpg'),(9,'admin','admin123','admin@gmail.com',1,1,'Active','2026-04-06 19:57:24',NULL),(10,'nguyenvana','123456','nguyenvana@gmail.com',2,2,'Active','2026-04-06 19:57:24',NULL),(11,'tranthibinh','123456','tranthibinh@gmail.com',3,2,'Active','2026-04-06 19:57:24',NULL),(12,'levancuong','123456','levancuong@gmail.com',4,2,'Active','2026-04-06 19:57:24',NULL),(13,'phamthidung','123456','phamthidung@gmail.com',5,2,'Active','2026-04-06 19:57:24',NULL),(14,'hoangvanem','123456','hoangvanem@gmail.com',6,2,'Active','2026-04-06 19:57:24',NULL),(15,'truongvanhoang@gmail.com','123456','truongvanhoang@gmail.com',12,2,'Active','2026-04-07 07:38:58',NULL),(16,'my123@gmail.com','123123','my123@gmail.com',13,2,'Active','2026-04-10 19:09:22',NULL);
/*!40000 ALTER TABLE `taikhoan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vaitro`
--

DROP TABLE IF EXISTS `vaitro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaitro` (
  `MaVaiTro` int NOT NULL AUTO_INCREMENT,
  `TenVaiTro` varchar(50) NOT NULL,
  PRIMARY KEY (`MaVaiTro`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaitro`
--

LOCK TABLES `vaitro` WRITE;
/*!40000 ALTER TABLE `vaitro` DISABLE KEYS */;
INSERT INTO `vaitro` VALUES (1,'Admin'),(2,'Khach');
/*!40000 ALTER TABLE `vaitro` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-11  0:09:37



USE laptrinhweb;

-- =====================================
-- 1. CẬP NHẬT BẢNG DONHANG
-- =====================================

ALTER TABLE DONHANG
ADD COLUMN DiaChiGiaoHang VARCHAR(255) NULL,
ADD COLUMN SoDienThoai VARCHAR(20) NULL,
ADD COLUMN GhiChu TEXT NULL,
ADD COLUMN PhuongThucThanhToan VARCHAR(50) DEFAULT 'COD',
ADD COLUMN MaGiamGia INT NULL,
ADD COLUMN PhiVanChuyen DECIMAL(12,2) DEFAULT 0,
ADD COLUMN GiamGia DECIMAL(12,2) DEFAULT 0,
ADD COLUMN NgayGiao DATETIME NULL;


-- =====================================
-- 2. TẠO BẢNG MÃ GIẢM GIÁ
-- =====================================

CREATE TABLE IF NOT EXISTS MAGIAMGIA (
    MaGiamGia INT AUTO_INCREMENT PRIMARY KEY,
    MaCode VARCHAR(50) UNIQUE NOT NULL,
    GiaTri DECIMAL(12,2) NOT NULL,
    SoLuong INT DEFAULT 0,
    NgayBatDau DATETIME NULL,
    NgayKetThuc DATETIME NULL,
    TrangThai VARCHAR(20) DEFAULT 'Hoạt động'
);


-- =====================================
-- 3. TẠO FOREIGN KEY CHO DONHANG -> MAGIAMGIA
-- =====================================

ALTER TABLE DONHANG
ADD CONSTRAINT fk_donhang_magiamgia
FOREIGN KEY (MaGiamGia) REFERENCES MAGIAMGIA(MaGiamGia);


-- =====================================
-- 4. DỌN GIỎ HÀNG RÁC (NULL USER)
-- =====================================

DELETE ct
FROM CHITIET_GIOHANG ct
JOIN GIOHANG gh ON ct.MaGioHang = gh.MaGioHang
WHERE gh.MaTaiKhoan IS NULL;

DELETE FROM GIOHANG
WHERE MaTaiKhoan IS NULL;


-- =====================================
-- 5. THÊM INDEX TĂNG TỐC
-- =====================================

CREATE INDEX idx_donhang_user ON DONHANG(MaTaiKhoan);
CREATE INDEX idx_giohang_user ON GIOHANG(MaTaiKhoan);
CREATE INDEX idx_ctdh_order ON CHITIET_DONHANG(MaDonHang);


-- =====================================
-- 6. (TUỲ CHỌN) THÊM UNIQUE TÀI KHOẢN
-- CHẠY NẾU KHÔNG CÒN DATA TRÙNG
-- =====================================

-- ALTER TABLE TAIKHOAN ADD UNIQUE (TenTaiKhoan);
-- ALTER TABLE TAIKHOAN ADD UNIQUE (Email);


-- =====================================
-- DONE
-- =====================================