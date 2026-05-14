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
  KEY `MaSanPham` (`MaSanPham`),
  KEY `idx_ctdh_order` (`MaDonHang`),
  CONSTRAINT `chitiet_donhang_ibfk_1` FOREIGN KEY (`MaDonHang`) REFERENCES `donhang` (`MaDonHang`),
  CONSTRAINT `chitiet_donhang_ibfk_2` FOREIGN KEY (`MaSanPham`) REFERENCES `sanpham` (`MaSanPham`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chitiet_donhang`
--

LOCK TABLES `chitiet_donhang` WRITE;
/*!40000 ALTER TABLE `chitiet_donhang` DISABLE KEYS */;
INSERT INTO `chitiet_donhang` VALUES (16,21,11,1,52990000.00),(17,21,10,1,50000000.00),(18,21,4,1,999000.00),(19,21,2,1,500000.00),(20,22,19,1,12990000.00),(21,23,11,1,52990000.00),(22,23,2,1,500000.00),(23,23,4,1,999000.00),(24,23,9,1,45990000.00),(25,23,10,1,50000000.00),(26,24,4,1,999000.00),(27,25,12,1,28990000.00),(28,25,5,1,54465465.00),(29,25,8,1,49990000.00),(30,26,11,5,52990000.00),(31,27,4,6,999000.00),(32,28,17,1,14990000.00),(33,29,2,3,500000.00),(34,30,11,8,52990000.00),(35,31,2,5,500000.00),(36,32,20,1,12990000.00),(37,32,19,1,12990000.00),(38,32,17,1,14990000.00),(39,32,16,1,5990000.00),(40,32,15,1,1990000.00),(41,32,14,1,2490000.00),(42,32,13,1,3890000.00),(43,32,12,1,28990000.00),(44,32,11,1,52990000.00),(45,32,10,1,50000000.00),(46,32,9,1,45990000.00),(47,32,8,1,49990000.00),(48,32,7,1,59990000.00),(49,32,6,1,89990000.00),(50,32,5,1,54465465.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chitiet_giohang`
--

LOCK TABLES `chitiet_giohang` WRITE;
/*!40000 ALTER TABLE `chitiet_giohang` DISABLE KEYS */;
INSERT INTO `chitiet_giohang` VALUES (1,1,2,1),(2,1,8,2),(3,1,9,1),(4,2,5,1),(5,2,10,1),(6,3,4,1),(7,3,11,1),(8,4,13,1),(9,5,15,1),(10,5,16,2),(75,6,17,2),(76,6,11,1),(77,6,30,1),(78,6,37,1);
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
  `DiaChiGiaoHang` varchar(255) DEFAULT NULL,
  `SoDienThoai` varchar(20) DEFAULT NULL,
  `GhiChu` text,
  `PhuongThucThanhToan` varchar(50) DEFAULT 'COD',
  `MaGiamGia` int DEFAULT NULL,
  `PhiVanChuyen` decimal(12,2) DEFAULT '0.00',
  `GiamGia` decimal(12,2) DEFAULT '0.00',
  `NgayGiao` datetime DEFAULT NULL,
  PRIMARY KEY (`MaDonHang`),
  KEY `fk_donhang_magiamgia` (`MaGiamGia`),
  KEY `idx_donhang_user` (`MaTaiKhoan`),
  CONSTRAINT `donhang_ibfk_1` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `taikhoan` (`MaTaiKhoan`),
  CONSTRAINT `fk_donhang_magiamgia` FOREIGN KEY (`MaGiamGia`) REFERENCES `magiamgia` (`MaGiamGia`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donhang`
--

LOCK TABLES `donhang` WRITE;
/*!40000 ALTER TABLE `donhang` DISABLE KEYS */;
INSERT INTO `donhang` VALUES (21,7,'2026-05-11 16:11:55',104489000.00,'Hoàn thành','đâs12313468','0123456','ádasdasd','COD',NULL,30000.00,0.00,'2026-05-11 19:21:43'),(22,7,'2026-05-11 16:25:45',12990000.00,'Hoàn thành','thuận giao 15','0111111111',NULL,'BANKING',NULL,30000.00,0.00,'2026-05-11 19:21:41'),(23,7,'2026-05-11 19:23:29',150479000.00,'Hoàn thành','thuận giao 15','0111111111',NULL,'COD',NULL,30000.00,0.00,'2026-05-11 19:23:48'),(24,8,'2026-05-12 11:43:41',1029000.00,'Hoàn thành','bình dương','0123456789','note','MOMO',NULL,30000.00,0.00,'2026-05-12 11:43:55'),(25,8,'2026-05-12 12:00:30',83455465.00,'Đã hủy','bến cát','0123456123','giao hàng sau lễ','COD',NULL,30000.00,0.00,NULL),(26,8,'2026-05-12 12:01:30',264950000.00,'Hoàn thành','thủ dầu 1','0132654897',NULL,'BANKING',NULL,30000.00,0.00,'2026-05-12 12:02:46'),(27,8,'2026-05-12 13:54:16',5994000.00,'Hoàn thành','thủ dầu 1','0132654897',NULL,'COD',NULL,30000.00,0.00,'2026-05-12 13:54:28'),(28,7,'2026-05-12 14:17:02',14990000.00,'Hoàn thành','thuận giao 15 binhf duongw','0123456789',NULL,'COD',NULL,30000.00,0.00,'2026-05-12 14:24:28'),(29,7,'2026-05-12 14:24:02',1500000.00,'Hoàn thành','thuận giao 15 binhf duongw','0123456789',NULL,'COD',NULL,30000.00,0.00,'2026-05-12 14:24:27'),(30,7,'2026-05-12 14:26:06',423920000.00,'Hoàn thành','thuận giao 15 binhf duongw','0123456789',NULL,'COD',NULL,30000.00,0.00,'2026-05-12 14:26:35'),(31,7,'2026-05-12 14:42:54',2500000.00,'Hoàn thành','thuận giao 15 binhf duongw','0123456789',NULL,'COD',NULL,30000.00,0.00,'2026-05-12 14:43:07'),(32,7,'2026-05-12 14:47:50',12990000.00,'Hoàn thành','thuận giao 15 binhf duongw','0123456789',NULL,'COD',NULL,30000.00,0.00,NULL);
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
  KEY `idx_giohang_user` (`MaTaiKhoan`),
  CONSTRAINT `giohang_ibfk_1` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `taikhoan` (`MaTaiKhoan`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giohang`
--

LOCK TABLES `giohang` WRITE;
/*!40000 ALTER TABLE `giohang` DISABLE KEYS */;
INSERT INTO `giohang` VALUES (1,2,'2026-04-06 19:57:24'),(2,3,'2026-04-06 19:57:24'),(3,4,'2026-04-06 19:57:24'),(4,5,'2026-04-06 19:57:24'),(5,6,'2026-04-06 19:57:24'),(6,7,'2026-04-27 23:29:20'),(30,8,'2026-05-10 20:01:29'),(31,19,'2026-05-14 16:47:44');
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loaisanpham`
--

LOCK TABLES `loaisanpham` WRITE;
/*!40000 ALTER TABLE `loaisanpham` DISABLE KEYS */;
INSERT INTO `loaisanpham` VALUES (1,'ASUS','Thương hiệu máy tính nổi tiếng với các dòng gaming, đồ họa và văn phòng chất lượng cao.'),(2,'Acer','Các dòng laptop gaming và văn phòng có cấu hình mạnh, giá thành hợp lý.'),(3,'Dell','Các sản phẩm máy tính và laptop hiệu năng ổn định, phù hợp học tập, văn phòng và gaming.'),(4,'Lenovo','Laptop và PC bền bỉ, hiệu năng tốt dành cho học sinh, sinh viên và doanh nghiệp.'),(5,'HP','Laptop và máy tính với thiết kế hiện đại, đáp ứng tốt nhu cầu học tập và làm việc.'),(9,'Màn hình','Màn hình máy tính chất lượng cao với nhiều kích thước và tần số quét khác nhau.'),(10,'Chuột','Chuột máy tính có dây và không dây dành cho học tập, văn phòng và gaming.\n'),(11,'Bàn phím','Bàn phím cơ và bàn phím văn phòng với thiết kế hiện đại, trải nghiệm gõ tốt.'),(12,'Tai nghe','Tai nghe gaming và nghe nhạc với âm thanh chất lượng cao.');
/*!40000 ALTER TABLE `loaisanpham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `magiamgia`
--

DROP TABLE IF EXISTS `magiamgia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `magiamgia` (
  `MaGiamGia` int NOT NULL AUTO_INCREMENT,
  `MaCode` varchar(50) NOT NULL,
  `GiaTri` decimal(12,2) NOT NULL,
  `SoLuong` int DEFAULT '0',
  `NgayBatDau` datetime DEFAULT NULL,
  `NgayKetThuc` datetime DEFAULT NULL,
  `TrangThai` varchar(20) DEFAULT 'Hoạt động',
  PRIMARY KEY (`MaGiamGia`),
  UNIQUE KEY `MaCode` (`MaCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `magiamgia`
--

LOCK TABLES `magiamgia` WRITE;
/*!40000 ALTER TABLE `magiamgia` DISABLE KEYS */;
/*!40000 ALTER TABLE `magiamgia` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoidung`
--

LOCK TABLES `nguoidung` WRITE;
/*!40000 ALTER TABLE `nguoidung` DISABLE KEYS */;
INSERT INTO `nguoidung` VALUES (1,'Admin Huy','2000-01-01','Nam','032555553365','Viet Nam'),(2,'Khach Hang 01','2002-05-10','Nam','0900000002','Viet Nam'),(3,'QUÝ PHẠM HỒNG','2026-03-10',NULL,'0371234567',NULL),(4,'hongquy','2026-03-08',NULL,'0123456789',NULL),(5,'Admin hongquy','2003-07-18','Nam','0123456789','thuận giao 15 binhf duongw'),(6,'quanghuy','2004-12-25',NULL,'0132654897','thủ dầu 1'),(7,'Nguyễn Văn An','1995-03-15','Nam','0912345678','123 Đường Lê Lợi, Quận 1, TP.HCM'),(8,'Trần Thị Bình','1998-07-22','Nữ','0923456789','456 Đường Nguyễn Huệ, Quận 2, TP.HCM'),(10,'Phạm Thị Dung','1997-05-18','Nữ','0945678901','321 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM'),(11,'Hoàng Văn Em','2001-09-25','Nam','0956789012','654 Đường Trường Chinh, Quận Tân Bình, TP.HCM'),(13,'nguyen thi le my','2004-01-01',NULL,'012345678',NULL),(14,'sang','1996-11-11',NULL,'0123321321',NULL),(15,'zxc','2000-11-11',NULL,'0123546879',NULL),(16,'asd','2000-11-11',NULL,'0987654321','thủ dầu 1'),(17,'Amin My','2000-11-11',NULL,'0987654324',NULL),(18,'ADMIN',NULL,NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sanpham`
--

LOCK TABLES `sanpham` WRITE;
/*!40000 ALTER TABLE `sanpham` DISABLE KEYS */;
INSERT INTO `sanpham` VALUES (2,'Tai Nghe Sony WH-CH520 Bluetooth Wireless',500000.00,11,'Sony WH-CH520 là mẫu tai nghe không dây hướng đến người dùng yêu thích sự gọn nhẹ, tiện lợi và chất lượng âm thanh ổn định trong nhu cầu sử dụng hàng ngày. Tai nghe được trang bị kết nối Bluetooth hiện đại giúp kết nối nhanh chóng với điện thoại, laptop và các thiết bị khác mà không cần dây cáp rườm rà. Chất lượng âm thanh cân bằng với bass ổn định giúp mang lại trải nghiệm nghe nhạc, xem phim và học online tốt hơn. Thiết kế nhỏ gọn cùng đệm tai mềm mại giúp người dùng đeo thoải mái trong nhiều giờ liên tục. Thời lượng pin dài hỗ trợ sử dụng liên tục trong thời gian dài mà không cần sạc thường xuyên. Ngoài ra, micro tích hợp giúp thực hiện cuộc gọi trực tuyến dễ dàng và tiện lợi hơn. Đây là lựa chọn phù hợp cho học sinh, sinh viên và người dùng cần một chiếc tai nghe không dây tiện lợi với mức giá hợp lý.','/uploads/1778781565999.jpg',12),(4,'Tai Nghe HyperX Cloud II Gaming Headset',250000.00,90,'HyperX Cloud II là dòng tai nghe gaming nổi tiếng với thiết kế bền bỉ, chất lượng âm thanh ổn định và cảm giác đeo cực kỳ thoải mái. Tai nghe được trang bị driver âm thanh lớn giúp tái hiện âm thanh rõ ràng, bass mạnh mẽ và mang lại trải nghiệm chân thực hơn khi chơi game hoặc xem phim giải trí. Đệm tai sử dụng chất liệu mềm mại giúp giảm áp lực lên tai và hỗ trợ sử dụng lâu dài mà không gây khó chịu. Micro chống ồn tháo rời hỗ trợ giao tiếp rõ ràng hơn trong quá trình chơi game hoặc làm việc trực tuyến. Thiết kế khung nhôm chắc chắn giúp tăng độ bền và mang lại vẻ ngoài hiện đại hơn cho sản phẩm. Ngoài ra, tai nghe còn hỗ trợ âm thanh giả lập sống động giúp nâng cao trải nghiệm chơi game và giải trí đa phương tiện. Đây là lựa chọn phù hợp cho game thủ, sinh viên và người dùng yêu thích tai nghe có độ bền cao cùng chất lượng âm thanh tốt.','/uploads/1778781534743.jpg',12),(5,'ASUS ROG Zephyrus G14 Ryzen 9 RTX 4070',41900000.00,10,'ASUS ROG Zephyrus G14 là mẫu laptop gaming cao cấp dành cho những người dùng yêu cầu hiệu năng cực mạnh nhưng vẫn muốn một thiết kế nhỏ gọn và tinh tế. Máy được trang bị bộ vi xử lý AMD Ryzen 9 kết hợp cùng card đồ họa RTX 4070 hiện đại, mang lại khả năng xử lý cực kỳ mạnh mẽ cho các tựa game AAA, công việc đồ họa chuyên nghiệp, dựng video 3D hay lập trình AI. Màn hình chất lượng cao với tần số quét lớn giúp hiển thị hình ảnh mượt mà, giảm hiện tượng xé hình và nâng cao trải nghiệm thị giác khi chơi game hoặc làm việc sáng tạo. Máy có dung lượng RAM lớn cùng SSD tốc độ cao giúp tăng hiệu suất đa nhiệm và giảm thời gian tải dữ liệu đáng kể. Thiết kế gọn nhẹ nhưng vẫn đậm chất gaming hiện đại giúp người dùng dễ dàng mang theo khi di chuyển. Hệ thống tản nhiệt thông minh hoạt động hiệu quả giúp duy trì hiệu suất ổn định ngay cả khi sử dụng với cường độ cao trong thời gian dài. Đây là dòng laptop cao cấp phù hợp cho game thủ, lập trình viên và nhà sáng tạo nội dung đang tìm kiếm một thiết bị mạnh mẽ và đẳng cấp.','/uploads/1778780177950.jpg',1),(6,'ASUS Zenbook 14 OLED Intel Evo',25432000.00,11,'ASUS Zenbook 14 OLED sở hữu thiết kế sang trọng, gọn nhẹ cùng hiệu năng ổn định, là lựa chọn lý tưởng cho dân văn phòng, sinh viên và người thường xuyên di chuyển. Máy được hoàn thiện với chất liệu cao cấp mang lại cảm giác chắc chắn và hiện đại ngay từ cái nhìn đầu tiên. Bộ vi xử lý Intel Evo thế hệ mới giúp máy hoạt động mượt mà, tối ưu điện năng và đảm bảo khả năng xử lý tốt các công việc hàng ngày như làm việc văn phòng, học online, chỉnh sửa hình ảnh hay giải trí đa phương tiện. Màn hình OLED sắc nét mang đến chất lượng hiển thị vượt trội với màu sắc chân thực và độ sáng cao, giúp trải nghiệm xem nội dung trở nên sống động hơn. Máy được trang bị SSD dung lượng lớn giúp lưu trữ dữ liệu thoải mái đồng thời tăng tốc độ xử lý tổng thể của hệ thống. Thời lượng pin dài giúp người dùng yên tâm sử dụng trong nhiều giờ liên tục mà không cần sạc thường xuyên. Ngoài ra, hệ thống âm thanh chất lượng cao cùng bàn phím thiết kế khoa học mang lại trải nghiệm sử dụng tiện lợi và thoải mái hơn trong công việc hàng ngày.','/uploads/1778780146412.jpg',1),(7,'ASUS Vivobook 15 OLED Ryzen 7',45621000.00,20,'ASUS Vivobook 15 OLED là chiếc laptop hướng đến người dùng yêu thích sự hiện đại, thanh lịch nhưng vẫn đảm bảo hiệu năng mạnh mẽ cho công việc và học tập hàng ngày. Máy được trang bị vi xử lý AMD Ryzen 7 cho khả năng xử lý nhanh và tiết kiệm điện năng hiệu quả, hỗ trợ tốt các tác vụ đa nhiệm cũng như làm việc trên nhiều ứng dụng cùng lúc. Điểm nổi bật của sản phẩm nằm ở màn hình OLED chất lượng cao với màu sắc rực rỡ, độ tương phản sâu và khả năng hiển thị hình ảnh cực kỳ chân thực, rất phù hợp cho nhu cầu xem phim, thiết kế đồ họa hoặc chỉnh sửa hình ảnh. Ổ SSD tốc độ cao giúp tăng tốc độ khởi động hệ điều hành và các ứng dụng, mang lại trải nghiệm sử dụng mượt mà hơn. Thiết kế mỏng nhẹ giúp người dùng dễ dàng mang theo khi đi học, đi làm hoặc di chuyển thường xuyên. Bàn phím rộng rãi cùng touchpad nhạy giúp thao tác thoải mái trong thời gian dài. Ngoài ra, máy còn hỗ trợ đầy đủ các cổng kết nối hiện đại giúp kết nối dễ dàng với các thiết bị ngoại vi khác nhau. Đây là lựa chọn phù hợp dành cho người dùng cần một chiếc laptop đẹp, mạnh và đa dụng.','/uploads/1778780105281.jpg',1),(8,'ASUS TUF Gaming F15 i5 12500H',24490000.00,62,'ASUS TUF Gaming F15 là dòng laptop sở hữu thiết kế mạnh mẽ, bền bỉ cùng hiệu năng ổn định, rất phù hợp cho học sinh, sinh viên và game thủ phổ thông. Máy được trang bị vi xử lý Intel Core i5 thế hệ mới giúp xử lý nhanh chóng các tác vụ học tập, làm việc văn phòng, lập trình hay giải trí đa phương tiện. Card đồ họa rời hỗ trợ chơi game mượt mà với mức thiết lập đồ họa cao, đồng thời đáp ứng tốt các phần mềm chỉnh sửa ảnh, dựng video và thiết kế cơ bản. Dung lượng RAM lớn giúp đa nhiệm hiệu quả, trong khi ổ SSD tốc độ cao giúp khởi động máy nhanh và truy xuất dữ liệu gần như tức thì. Màn hình viền mỏng sắc nét mang lại không gian hiển thị rộng rãi và trải nghiệm hình ảnh chân thực hơn khi xem phim hoặc chơi game. Máy còn được trang bị hệ thống tản nhiệt kép giúp duy trì nhiệt độ ổn định khi sử dụng liên tục trong thời gian dài. Thiết kế đạt tiêu chuẩn độ bền quân đội giúp tăng khả năng chống va đập và nâng cao tuổi thọ sản phẩm. Đây là mẫu laptop phù hợp cho những ai muốn sở hữu một chiếc máy tính hiệu năng tốt với mức giá hợp lý.','/uploads/1778780048783.jpg',1),(9,'Acer Predator Helios Neo 16 i9 RTX 4060',37990000.00,18,'Acer Predator Helios Neo 16 là dòng laptop gaming cao cấp sở hữu hiệu năng vượt trội cùng thiết kế đậm chất công nghệ hiện đại. Máy được trang bị vi xử lý Intel Core i9 mạnh mẽ kết hợp cùng card đồ họa RTX 4060 hiện đại, cho khả năng xử lý cực kỳ ấn tượng trong các tác vụ nặng như chơi game AAA, dựng video 4K, thiết kế 3D và lập trình AI. Dung lượng RAM lớn cùng SSD tốc độ cao giúp tăng tốc toàn bộ hệ thống, hỗ trợ mở nhiều ứng dụng cùng lúc mà vẫn đảm bảo độ mượt mà và ổn định. Màn hình kích thước lớn với tần số quét cao mang lại trải nghiệm hình ảnh mượt mà, sắc nét và màu sắc sống động, rất phù hợp cho cả chơi game lẫn làm việc sáng tạo nội dung. Thiết kế gaming mạnh mẽ kết hợp cùng hệ thống LED RGB tạo nên vẻ ngoài hiện đại và nổi bật. Hệ thống tản nhiệt tiên tiến với nhiều khe thoát nhiệt giúp máy luôn giữ được nhiệt độ ổn định kể cả khi hoạt động ở hiệu suất cao trong thời gian dài. Đây là lựa chọn lý tưởng cho game thủ, designer và những người dùng cần một chiếc laptop mạnh mẽ để phục vụ công việc chuyên sâu và giải trí cao cấp.','/uploads/1778780314173.jpg',2),(10,'ASUS ROG Strix G16 RTX 4060',32990000.00,56,'Chiếc laptop gaming này mang đến sự kết hợp hoàn hảo giữa hiệu năng mạnh mẽ và thiết kế đậm chất công nghệ hiện đại, phù hợp cho cả học tập, làm việc chuyên nghiệp lẫn giải trí cao cấp. Máy được trang bị bộ vi xử lý Intel Core i7 thế hệ mới kết hợp cùng card đồ họa RTX 4060 mạnh mẽ, cho khả năng xử lý mượt mà các tựa game phổ biến hiện nay cũng như các phần mềm đồ họa, dựng video và lập trình chuyên sâu. Với dung lượng RAM lớn và ổ cứng SSD tốc độ cao, người dùng có thể dễ dàng mở nhiều ứng dụng cùng lúc mà không gặp tình trạng giật lag hay chậm phản hồi. Màn hình tần số quét cao mang lại trải nghiệm hình ảnh cực kỳ mượt mà, màu sắc sống động và sắc nét, giúp nâng cao trải nghiệm chơi game và giải trí. Thiết kế của máy mang phong cách gaming hiện đại với hệ thống LED RGB nổi bật, bàn phím nhạy và hành trình phím tốt giúp thao tác chính xác hơn trong quá trình sử dụng. Ngoài ra, hệ thống tản nhiệt tiên tiến giúp máy luôn duy trì hiệu suất ổn định kể cả khi hoạt động trong thời gian dài. Đây là lựa chọn lý tưởng dành cho người dùng đang tìm kiếm một chiếc laptop gaming hiệu năng cao, thiết kế đẹp và đáp ứng tốt nhiều nhu cầu sử dụng khác nhau.\r\nMáy được trang bị dung lượng RAM lớn, hỗ trợ đa nhiệm mượt mà, cho phép mở nhiều ứng dụng cùng lúc mà không bị giật lag. Ổ cứng SSD tốc độ cao giúp khởi động máy chỉ trong vài giây và truy xuất dữ liệu cực nhanh, nâng cao đáng kể trải nghiệm người dùng.\r\n\r\nBên cạnh đó, màn hình sắc nét với độ phân giải cao mang đến hình ảnh chân thực, màu sắc sống động, rất thích hợp cho việc xem phim, chỉnh sửa ảnh hoặc làm việc trong thời gian dài mà không bị mỏi mắt. Thiết kế gọn nhẹ, tinh tế giúp bạn dễ dàng mang theo bên mình mọi lúc mọi nơi.\r\n\r\nNgoài ra, máy còn được tích hợp nhiều cổng kết nối hiện đại, đảm bảo khả năng tương thích với các thiết bị ngoại vi như chuột, bàn phím, màn hình ngoài và các thiết bị lưu trữ. Hệ thống tản nhiệt hiệu quả giúp máy luôn hoạt động ổn định, ngay cả khi sử dụng trong thời gian dài.\r\n\r\nĐây chắc chắn là một lựa chọn lý tưởng dành cho những ai đang tìm kiếm một chiếc máy tính bền bỉ, hiệu năng cao và đáp ứng tốt mọi nhu cầu trong cuộc sống hàng ngày.','/uploads/1778779961901.jpg',1),(11,'Acer Aspire 7 A715 Ryzen 5 RTX 3050',21450000.00,9,'Acer Aspire 7 là mẫu laptop hướng đến người dùng cần một thiết bị đa năng với hiệu năng ổn định và thiết kế hiện đại. Máy được trang bị bộ vi xử lý AMD Ryzen 5 mạnh mẽ giúp xử lý nhanh các tác vụ văn phòng, học tập, chỉnh sửa hình ảnh và giải trí đa phương tiện. Card đồ họa RTX 3050 hỗ trợ chơi game mượt mà và tăng tốc cho các phần mềm đồ họa, dựng video hoặc lập trình kỹ thuật. Với dung lượng RAM lớn cùng ổ SSD tốc độ cao, máy có khả năng đa nhiệm tốt và mang lại trải nghiệm sử dụng mượt mà trong hầu hết các nhu cầu hằng ngày. Màn hình Full HD sắc nét với viền mỏng giúp tối ưu không gian hiển thị, mang lại cảm giác hiện đại và chuyên nghiệp hơn khi sử dụng. Thiết kế tổng thể của máy đơn giản nhưng tinh tế, phù hợp với cả môi trường học tập và làm việc văn phòng. Ngoài ra, hệ thống tản nhiệt được tối ưu giúp máy hoạt động ổn định trong thời gian dài mà không quá nóng. Đây là lựa chọn phù hợp cho người dùng cần một chiếc laptop mạnh, bền và đa dụng trong tầm giá dễ tiếp cận.','/uploads/1778780288164.jpg',2),(12,'Acer Nitro V15 ANV15-51-75B7',28990000.00,16,'Chiếc laptop này được thiết kế dành cho người dùng yêu thích hiệu năng mạnh mẽ và khả năng xử lý ổn định trong nhiều nhu cầu khác nhau từ học tập, làm việc cho đến chơi game giải trí. Máy sở hữu bộ vi xử lý Intel Core i7 thế hệ mới kết hợp cùng card đồ họa RTX hiện đại, mang lại khả năng xử lý nhanh chóng các tác vụ nặng như thiết kế đồ họa, dựng video, lập trình hay chơi các tựa game phổ biến hiện nay. Dung lượng RAM lớn hỗ trợ đa nhiệm mượt mà, cho phép mở nhiều ứng dụng cùng lúc mà không gặp hiện tượng giật lag. Ổ cứng SSD tốc độ cao giúp tăng tốc khởi động hệ điều hành và truy xuất dữ liệu chỉ trong vài giây. Màn hình viền mỏng với độ phân giải cao mang lại chất lượng hình ảnh sắc nét, màu sắc sống động và trải nghiệm thị giác chân thực hơn khi làm việc hoặc giải trí. Hệ thống tản nhiệt kép hoạt động hiệu quả giúp duy trì hiệu năng ổn định trong suốt quá trình sử dụng lâu dài. Thiết kế gaming hiện đại cùng bàn phím LED tạo nên vẻ ngoài mạnh mẽ, phù hợp với học sinh, sinh viên và game thủ đang tìm kiếm một chiếc laptop có hiệu năng tốt và mức giá hợp lý.','/uploads/1778780263756.jpg',2),(13,'Dell XPS 13 Plus OLED',42990000.00,49,'Dell XPS 13 Plus OLED là dòng ultrabook cao cấp sở hữu thiết kế cực kỳ sang trọng, hiện đại cùng hiệu năng mạnh mẽ dành cho người dùng yêu thích sự tinh tế và cao cấp. Máy được trang bị vi xử lý Intel thế hệ mới giúp xử lý nhanh chóng các công việc văn phòng, lập trình, chỉnh sửa hình ảnh và giải trí đa phương tiện. Màn hình OLED chất lượng cao mang lại màu sắc rực rỡ, độ tương phản sâu và khả năng hiển thị hình ảnh chân thực vượt trội, rất phù hợp cho các công việc sáng tạo nội dung hoặc xem phim chất lượng cao. Thiết kế siêu mỏng nhẹ giúp người dùng dễ dàng mang theo khi di chuyển, đồng thời mang lại vẻ ngoài chuyên nghiệp và đẳng cấp. Ổ SSD tốc độ cao giúp tăng hiệu suất tổng thể của hệ thống và giảm thời gian truy xuất dữ liệu đáng kể. Hệ thống âm thanh chất lượng cao cùng bàn phím thiết kế tối giản tạo nên trải nghiệm sử dụng hiện đại và thoải mái hơn. Ngoài ra, thời lượng pin dài giúp người dùng yên tâm làm việc trong nhiều giờ liên tục mà không cần sạc thường xuyên. Đây là lựa chọn lý tưởng cho doanh nhân, designer và người dùng yêu thích các dòng laptop cao cấp.','/uploads/1778780461011.jpg',3),(14,'Dell G15 Gaming RTX 4060',33490000.00,39,'Dell G15 Gaming là dòng laptop gaming mạnh mẽ dành cho người dùng yêu thích hiệu năng cao và trải nghiệm giải trí mượt mà. Máy được trang bị bộ vi xử lý Intel Core i7 kết hợp cùng card đồ họa RTX 4060 hiện đại, mang lại khả năng xử lý cực kỳ ấn tượng trong các tựa game phổ biến hiện nay cũng như các công việc liên quan đến đồ họa, dựng video và lập trình chuyên sâu. RAM dung lượng lớn hỗ trợ đa nhiệm hiệu quả, cho phép chạy nhiều phần mềm cùng lúc mà vẫn giữ được sự ổn định. Ổ SSD tốc độ cao giúp giảm đáng kể thời gian tải game và khởi động hệ điều hành. Màn hình tần số quét cao giúp hiển thị hình ảnh mượt mà hơn khi chơi game hoặc xem video tốc độ cao. Thiết kế gaming hiện đại với hệ thống tản nhiệt hiệu quả giúp máy duy trì nhiệt độ ổn định trong suốt quá trình sử dụng. Bàn phím LED cùng chất lượng âm thanh sống động mang lại trải nghiệm giải trí hấp dẫn hơn cho người dùng. Đây là lựa chọn phù hợp cho game thủ, sinh viên IT và những người cần một chiếc laptop mạnh mẽ để phục vụ cả công việc lẫn giải trí.','/uploads/1778780434125.jpg',3),(15,'Dell Vostro 14 3430 Core i7',23950000.00,34,'Dell Vostro 14 3430 là chiếc laptop doanh nhân sở hữu thiết kế sang trọng cùng hiệu năng mạnh mẽ, phù hợp cho môi trường học tập và làm việc chuyên nghiệp. Máy được trang bị bộ vi xử lý Intel Core i7 hiện đại giúp xử lý nhanh các tác vụ văn phòng, lập trình, chỉnh sửa hình ảnh và làm việc đa nhiệm. Dung lượng RAM lớn hỗ trợ mở nhiều ứng dụng cùng lúc mà không gây chậm máy, trong khi ổ SSD tốc độ cao giúp tăng tốc độ khởi động và truy xuất dữ liệu. Màn hình viền mỏng với độ phân giải cao mang lại không gian hiển thị rộng rãi và chất lượng hình ảnh sắc nét hơn. Thiết kế nhỏ gọn nhưng chắc chắn giúp người dùng dễ dàng mang theo trong quá trình di chuyển. Bàn phím có hành trình phím tốt mang lại trải nghiệm gõ thoải mái trong thời gian dài. Ngoài ra, hệ thống tản nhiệt hoạt động ổn định giúp duy trì hiệu suất máy khi sử dụng liên tục nhiều giờ. Đây là lựa chọn phù hợp cho sinh viên ngành công nghệ, nhân viên văn phòng và người dùng cần một chiếc laptop ổn định cho công việc hàng ngày.','/uploads/1778780416250.jpg',3),(16,'Dell Inspiron 15 3530 Intel Core i5',18990000.00,14,'Dell Inspiron 15 3530 là mẫu laptop phù hợp cho học sinh, sinh viên và nhân viên văn phòng đang tìm kiếm một thiết bị ổn định để phục vụ nhu cầu học tập và làm việc hằng ngày. Máy được trang bị bộ vi xử lý Intel Core i5 thế hệ mới giúp xử lý nhanh chóng các tác vụ như soạn thảo văn bản, học online, lướt web và làm việc đa nhiệm. Dung lượng RAM lớn hỗ trợ mở nhiều ứng dụng cùng lúc mà vẫn đảm bảo độ mượt mà trong quá trình sử dụng. Ổ cứng SSD tốc độ cao giúp khởi động hệ điều hành nhanh hơn và tăng tốc độ truy xuất dữ liệu đáng kể. Màn hình Full HD sắc nét mang lại chất lượng hình ảnh chân thực, hỗ trợ tốt cho việc xem phim, học tập và làm việc trong thời gian dài. Thiết kế hiện đại với trọng lượng gọn nhẹ giúp dễ dàng mang theo khi đi học hoặc đi làm. Ngoài ra, máy còn được trang bị đầy đủ các cổng kết nối phổ biến giúp người dùng kết nối thuận tiện với các thiết bị ngoại vi khác nhau. Đây là lựa chọn phù hợp cho những ai cần một chiếc laptop bền bỉ, hiệu năng ổn định và giá thành hợp lý.','/uploads/1778780396351.jpg',3),(17,'Lenovo IdeaPad Slim 5 Intel Core i5',19490000.00,10,'Lenovo IdeaPad Slim 5 là dòng laptop mỏng nhẹ phù hợp cho học tập, làm việc văn phòng và giải trí hằng ngày với thiết kế hiện đại và hiệu năng ổn định. Máy được trang bị bộ vi xử lý Intel Core i5 thế hệ mới giúp xử lý nhanh các tác vụ như học online, soạn thảo văn bản, làm việc trên nhiều tab trình duyệt hoặc chỉnh sửa hình ảnh cơ bản. Dung lượng RAM lớn hỗ trợ đa nhiệm mượt mà, giúp người dùng sử dụng nhiều ứng dụng cùng lúc mà không gặp tình trạng chậm máy. Ổ SSD tốc độ cao giúp tăng tốc độ khởi động hệ thống và cải thiện khả năng truy xuất dữ liệu, mang lại trải nghiệm sử dụng nhanh và ổn định hơn. Màn hình Full HD sắc nét với viền mỏng tạo cảm giác hiện đại và giúp tối ưu không gian hiển thị. Thiết kế gọn nhẹ giúp người dùng dễ dàng mang theo khi đi học, đi làm hoặc di chuyển thường xuyên. Ngoài ra, máy còn được trang bị đầy đủ các cổng kết nối phổ biến cùng thời lượng pin tốt đáp ứng nhu cầu sử dụng trong nhiều giờ liên tục. Đây là lựa chọn phù hợp dành cho sinh viên và nhân viên văn phòng đang cần một chiếc laptop đẹp, bền và hiệu quả trong tầm giá hợp lý.','/uploads/1778780559084.jpg',4),(19,'Lenovo Legion 5 Pro Ryzen 7 RTX 4070',36990000.00,6,'Lenovo Legion 5 Pro là mẫu laptop gaming cao cấp được thiết kế dành cho người dùng cần hiệu năng mạnh mẽ để phục vụ cả công việc lẫn giải trí. Máy được trang bị bộ vi xử lý AMD Ryzen 7 kết hợp cùng card đồ họa RTX 4070 hiện đại, mang lại khả năng xử lý cực kỳ mượt mà trong các tựa game AAA, thiết kế đồ họa, dựng video và lập trình chuyên sâu. Dung lượng RAM lớn giúp đa nhiệm hiệu quả, cho phép mở nhiều ứng dụng cùng lúc mà không xảy ra hiện tượng giật lag. Ổ cứng SSD tốc độ cao hỗ trợ khởi động hệ điều hành nhanh chóng và truy xuất dữ liệu gần như tức thì, giúp tối ưu trải nghiệm sử dụng hàng ngày. Màn hình độ phân giải cao cùng tần số quét lớn mang lại hình ảnh sắc nét, chuyển động mượt mà và màu sắc chân thực hơn khi chơi game hoặc làm việc sáng tạo nội dung. Thiết kế của máy mang phong cách gaming hiện đại nhưng vẫn giữ được sự tinh tế, phù hợp với nhiều môi trường sử dụng khác nhau. Ngoài ra, hệ thống tản nhiệt hiệu quả giúp duy trì nhiệt độ ổn định khi hoạt động liên tục trong thời gian dài. Đây là lựa chọn lý tưởng cho game thủ, designer và người dùng chuyên nghiệp đang tìm kiếm một chiếc laptop hiệu năng cao và bền bỉ.','/uploads/1778780532418.jpg',4),(20,'HP Pavilion 15 Ryzen 7 RTX 3050',12990000.00,29,'HP Pavilion 15 là chiếc laptop sở hữu thiết kế hiện đại, thanh lịch cùng hiệu năng mạnh mẽ, phù hợp cho cả học tập, làm việc và giải trí đa phương tiện. Máy được trang bị bộ vi xử lý AMD Ryzen 7 hiệu năng cao kết hợp cùng card đồ họa RTX 3050 giúp xử lý mượt mà các tác vụ từ văn phòng cơ bản cho đến lập trình, thiết kế đồ họa và chơi game giải trí. Dung lượng RAM lớn hỗ trợ đa nhiệm hiệu quả, cho phép mở nhiều ứng dụng cùng lúc mà vẫn đảm bảo độ ổn định và tốc độ xử lý nhanh chóng. Ổ cứng SSD tốc độ cao giúp khởi động máy nhanh, truy xuất dữ liệu gần như tức thì và nâng cao đáng kể trải nghiệm sử dụng hàng ngày. Màn hình Full HD sắc nét với màu sắc chân thực mang lại trải nghiệm hình ảnh sống động hơn khi xem phim, chỉnh sửa ảnh hoặc làm việc trong thời gian dài. Thiết kế viền mỏng hiện đại kết hợp cùng trọng lượng gọn nhẹ giúp người dùng dễ dàng mang theo khi đi học hoặc đi làm. Ngoài ra, hệ thống âm thanh chất lượng cao cùng bàn phím có hành trình phím tốt mang lại cảm giác sử dụng thoải mái và tiện lợi hơn. Đây là lựa chọn phù hợp cho sinh viên, nhân viên văn phòng và người dùng cần một chiếc laptop bền bỉ, hiệu năng ổn định và thiết kế đẹp mắt.','/uploads/1778780611347.jpg',5),(25,'Màn Hình ASUS TUF Gaming VG27AQ 27 Inch 165Hz',2345000.00,44,'Chiếc màn hình gaming này được thiết kế dành cho game thủ và người dùng yêu thích trải nghiệm hình ảnh mượt mà, sắc nét trong quá trình chơi game cũng như làm việc giải trí hàng ngày. Màn hình sở hữu kích thước lớn 27 inch cùng độ phân giải cao mang lại không gian hiển thị rộng rãi và chất lượng hình ảnh chi tiết hơn. Tần số quét 165Hz giúp các chuyển động trở nên mượt mà, giảm hiện tượng giật hình và xé hình khi chơi các tựa game tốc độ cao. Công nghệ tấm nền hiện đại hỗ trợ hiển thị màu sắc chân thực, độ sáng tốt và góc nhìn rộng, phù hợp cho cả nhu cầu chơi game lẫn chỉnh sửa hình ảnh cơ bản. Thiết kế viền mỏng hiện đại giúp tăng tính thẩm mỹ và tối ưu trải nghiệm đa màn hình. Ngoài ra, màn hình còn được tích hợp nhiều cổng kết nối phổ biến giúp dễ dàng kết nối với máy tính, laptop và các thiết bị ngoại vi khác. Đây là lựa chọn phù hợp cho game thủ, sinh viên ngành thiết kế và người dùng cần một chiếc màn hình chất lượng cao để phục vụ nhiều nhu cầu sử dụng khác nhau.','/uploads/1778780712135.jpg',9),(26,'Màn Hình Dell UltraSharp U2424H Full HD IPS',3000000.00,11,'Dell UltraSharp U2424H là mẫu màn hình văn phòng cao cấp với thiết kế tối giản, hiện đại cùng khả năng hiển thị hình ảnh sắc nét và màu sắc chân thực. Màn hình sử dụng tấm nền IPS chất lượng cao giúp mang lại góc nhìn rộng và khả năng tái tạo màu sắc ổn định, rất phù hợp cho công việc văn phòng, học tập, chỉnh sửa hình ảnh và xem phim giải trí. Độ phân giải Full HD kết hợp với kích thước hiển thị hợp lý mang lại trải nghiệm hình ảnh rõ ràng, giúp làm việc trong thời gian dài mà không gây mỏi mắt. Thiết kế viền siêu mỏng tạo cảm giác sang trọng và giúp tối ưu không gian làm việc hiện đại hơn. Chân đế chắc chắn hỗ trợ điều chỉnh độ cao và góc nghiêng linh hoạt giúp người dùng có tư thế sử dụng thoải mái hơn. Ngoài ra, màn hình còn được trang bị nhiều cổng kết nối tiện lợi hỗ trợ kết nối nhanh với laptop, PC và các thiết bị khác. Đây là lựa chọn lý tưởng dành cho nhân viên văn phòng, sinh viên và người dùng cần một chiếc màn hình bền bỉ với chất lượng hiển thị tốt.','/uploads/1778780743493.jpg',9),(27,'Màn Hình Acer Nitro KG240Y 180Hz Gaming',1300000.00,13,'Acer Nitro KG240Y là chiếc màn hình gaming sở hữu thiết kế mạnh mẽ cùng hiệu năng hiển thị mượt mà, phù hợp cho nhu cầu chơi game và giải trí đa phương tiện. Màn hình được trang bị tần số quét cao lên đến 180Hz giúp giảm hiện tượng xé hình và tăng độ mượt trong các tựa game hành động tốc độ cao. Độ phân giải Full HD kết hợp cùng công nghệ hiển thị hiện đại mang lại hình ảnh sắc nét, màu sắc sống động và trải nghiệm thị giác chân thực hơn. Thiết kế viền mỏng hiện đại giúp tăng tính thẩm mỹ và tạo cảm giác không gian hiển thị rộng hơn khi sử dụng. Thời gian phản hồi thấp hỗ trợ thao tác nhanh và chính xác hơn trong quá trình chơi game cạnh tranh. Ngoài ra, màn hình còn được tích hợp công nghệ bảo vệ mắt giúp giảm ánh sáng xanh và hạn chế tình trạng mỏi mắt khi sử dụng trong thời gian dài. Hệ thống cổng kết nối đa dạng giúp dễ dàng kết nối với PC, laptop và các thiết bị chơi game khác. Đây là lựa chọn phù hợp cho game thủ, học sinh sinh viên và người dùng muốn sở hữu một chiếc màn hình gaming chất lượng với mức giá hợp lý.','/uploads/1778780768243.jpg',9),(28,'Chuột Logitech G102 Lightsync RGB Gaming',500000.00,75,'Logitech G102 Lightsync là mẫu chuột gaming được nhiều game thủ yêu thích nhờ thiết kế nhỏ gọn, cảm giác cầm thoải mái và hiệu năng ổn định trong quá trình sử dụng. Chuột được trang bị cảm biến quang học có độ chính xác cao giúp thao tác nhanh và mượt hơn trong các tựa game FPS, MOBA hay các công việc yêu cầu độ chính xác tốt. Hệ thống LED RGB hiện đại mang lại vẻ ngoài nổi bật và có thể tùy chỉnh theo sở thích cá nhân. Thiết kế đối xứng phù hợp với nhiều kiểu cầm chuột khác nhau, giúp sử dụng thoải mái trong thời gian dài mà không gây mỏi tay. Ngoài ra, các nút bấm có độ phản hồi tốt cùng độ bền cao giúp nâng cao trải nghiệm sử dụng hàng ngày. Đây là lựa chọn phù hợp cho học sinh, sinh viên, game thủ phổ thông và người dùng cần một mẫu chuột gaming chất lượng với mức giá dễ tiếp cận.','/uploads/1778780867646.jpg',10),(29,'Chuột Razer DeathAdder Essential Gaming',450000.00,42,'Razer DeathAdder Essential là dòng chuột gaming nổi bật với thiết kế công thái học hiện đại và khả năng thao tác chính xác trong nhiều nhu cầu sử dụng khác nhau. Chuột được trang bị cảm biến chất lượng cao giúp di chuyển mượt mà, phản hồi nhanh và hỗ trợ tốt cho các tựa game yêu cầu tốc độ xử lý cao. Thiết kế ôm tay mang lại cảm giác cầm chắc chắn và thoải mái ngay cả khi sử dụng trong nhiều giờ liên tục. Các nút bấm có độ nhạy tốt cùng tuổi thọ cao giúp tăng độ bền và mang lại trải nghiệm sử dụng ổn định lâu dài. Ngoài ra, dây kết nối chắc chắn giúp hạn chế tình trạng đứt gãy trong quá trình sử dụng. Đây là lựa chọn phù hợp cho game thủ, nhân viên văn phòng và người dùng cần một chiếc chuột có thiết kế đẹp, hiệu năng tốt và độ bền cao.','/uploads/1778780895531.jpg',10),(30,'Chuột ASUS TUF Gaming M3 RGB',650000.00,75,'ASUS TUF Gaming M3 là mẫu chuột gaming được thiết kế dành cho người dùng yêu thích phong cách mạnh mẽ và hiệu năng ổn định. Chuột sở hữu kiểu dáng gọn nhẹ giúp thao tác linh hoạt và phù hợp với nhiều kích thước tay khác nhau. Cảm biến quang học độ chính xác cao hỗ trợ di chuyển mượt mà và tăng khả năng kiểm soát trong quá trình chơi game hoặc làm việc. Hệ thống LED RGB hiện đại giúp tạo điểm nhấn nổi bật cho góc setup gaming. Ngoài ra, các nút bấm có độ phản hồi nhanh và tuổi thọ cao giúp đảm bảo trải nghiệm sử dụng lâu dài và ổn định hơn. Thiết kế bề mặt chống bám mồ hôi giúp cầm nắm chắc tay hơn khi sử dụng trong thời gian dài. Đây là mẫu chuột phù hợp cho game thủ phổ thông và người dùng cần một thiết bị có thiết kế gaming đẹp mắt với mức giá hợp lý.','/uploads/1778780916655.jpg',10),(31,'Chuột Corsair Harpoon RGB Pro',350000.00,42,'Corsair Harpoon RGB Pro là dòng chuột gaming mang phong cách hiện đại với thiết kế tối ưu cho trải nghiệm chơi game và làm việc hằng ngày. Chuột được trang bị cảm biến hiệu năng cao giúp tăng độ chính xác và phản hồi nhanh hơn trong các thao tác di chuyển. Thiết kế công thái học giúp người dùng cầm nắm thoải mái và hạn chế mỏi tay khi sử dụng liên tục trong nhiều giờ. Hệ thống LED RGB nổi bật hỗ trợ tùy chỉnh hiệu ứng ánh sáng theo phong cách cá nhân. Các nút bấm có độ nhạy tốt cùng tuổi thọ cao mang lại cảm giác bấm chắc chắn và ổn định hơn trong quá trình sử dụng. Ngoài ra, dây kết nối bền bỉ cùng trọng lượng nhẹ giúp thao tác linh hoạt và dễ kiểm soát hơn khi chơi game tốc độ cao. Đây là lựa chọn phù hợp cho game thủ và người dùng yêu thích các thiết bị gaming hiện đại.','/uploads/1778780943535.jpg',10),(32,'Chuột Logitech MX Master 3S Wireless',600000.00,0,'Logitech MX Master 3S Wireless là mẫu chuột không dây cao cấp được thiết kế dành cho dân văn phòng, designer và người dùng chuyên nghiệp cần sự thoải mái cùng hiệu suất làm việc cao. Chuột sở hữu thiết kế công thái học sang trọng giúp ôm trọn lòng bàn tay và mang lại cảm giác sử dụng cực kỳ thoải mái trong thời gian dài. Cảm biến chất lượng cao hỗ trợ di chuyển chính xác trên nhiều bề mặt khác nhau, kể cả mặt kính. Hệ thống nút chức năng thông minh cho phép tùy chỉnh linh hoạt để tăng tốc độ xử lý công việc và cải thiện hiệu suất làm việc hằng ngày. Kết nối không dây ổn định giúp bàn làm việc gọn gàng và tiện lợi hơn khi sử dụng. Thời lượng pin dài cùng khả năng sạc nhanh giúp người dùng yên tâm làm việc liên tục mà không lo gián đoạn. Đây là lựa chọn lý tưởng dành cho nhân viên văn phòng, lập trình viên, designer và những người dùng cần một chiếc chuột cao cấp phục vụ công việc chuyên nghiệp.','/uploads/1778780972163.jpg',10),(33,'Bàn Phím Cơ Logitech G Pro Mechanical Gaming',250000.00,34,'Logitech G Pro Mechanical là mẫu bàn phím cơ gaming được thiết kế dành cho game thủ yêu thích sự nhỏ gọn, hiện đại và hiệu năng ổn định trong quá trình sử dụng. Bàn phím sở hữu thiết kế tenkeyless giúp tiết kiệm không gian bàn làm việc và tăng sự linh hoạt khi di chuyển. Hệ thống switch cơ học mang lại cảm giác gõ chính xác, độ phản hồi nhanh và độ bền cao, phù hợp cho cả chơi game lẫn làm việc văn phòng. Đèn LED RGB hiện đại hỗ trợ tùy chỉnh nhiều hiệu ứng ánh sáng khác nhau giúp góc setup trở nên nổi bật hơn. Khung bàn phím chắc chắn cùng keycap chất lượng cao giúp nâng cao trải nghiệm sử dụng trong thời gian dài. Ngoài ra, dây kết nối có thể tháo rời giúp thuận tiện hơn khi mang theo hoặc bảo quản. Đây là lựa chọn phù hợp cho game thủ, lập trình viên và người dùng yêu thích các dòng bàn phím cơ cao cấp với thiết kế gọn gàng và hiện đại.','/uploads/1778781106856.jpg',11),(34,'Bàn Phím ASUS ROG Strix Scope RX RGB',2354000.00,112,'ASUS ROG Strix Scope RX là mẫu bàn phím gaming cao cấp sở hữu thiết kế mạnh mẽ cùng hiệu năng vượt trội dành cho game thủ chuyên nghiệp. Bàn phím được trang bị switch quang học hiện đại cho tốc độ phản hồi cực nhanh và cảm giác gõ mượt mà hơn trong quá trình sử dụng. Hệ thống LED RGB nổi bật hỗ trợ đồng bộ ánh sáng với các thiết bị gaming khác, giúp tạo nên góc setup hiện đại và cá tính hơn. Thiết kế fullsize mang lại đầy đủ các phím chức năng cần thiết cho công việc và chơi game hàng ngày. Khung bàn phím chắc chắn cùng chất liệu cao cấp giúp tăng độ bền và mang lại cảm giác sử dụng cao cấp hơn. Ngoài ra, keycap có độ hoàn thiện tốt cùng hành trình phím ổn định giúp thao tác chính xác và thoải mái hơn khi sử dụng trong thời gian dài. Đây là lựa chọn phù hợp cho game thủ, streamer và người dùng yêu thích các thiết bị gaming cao cấp với hiệu năng mạnh mẽ.','/uploads/1778781132449.jpg',11),(35,'Bàn Phím Cơ Akko 3087 World Tour Tokyo',32300.00,22,'Akko 3087 World Tour Tokyo là mẫu bàn phím cơ nổi bật với thiết kế đẹp mắt, phong cách trẻ trung và trải nghiệm gõ cực kỳ thú vị dành cho người dùng yêu thích setup hiện đại. Bàn phím sử dụng layout nhỏ gọn giúp tiết kiệm không gian và mang lại cảm giác gọn gàng hơn cho góc làm việc hoặc gaming. Switch cơ học chất lượng cao mang lại cảm giác gõ êm ái, độ phản hồi tốt và phù hợp cho cả học tập, làm việc lẫn chơi game giải trí. Keycap với họa tiết phong cách Nhật Bản tạo điểm nhấn độc đáo và tăng tính thẩm mỹ cho sản phẩm. Hệ thống LED hỗ trợ nhiều hiệu ứng ánh sáng khác nhau giúp setup trở nên nổi bật hơn trong môi trường thiếu sáng. Ngoài ra, khung bàn phím chắc chắn cùng độ hoàn thiện tốt giúp nâng cao độ bền trong quá trình sử dụng lâu dài. Đây là lựa chọn phù hợp cho học sinh, sinh viên, dân văn phòng và người dùng yêu thích các mẫu bàn phím cơ có thiết kế đẹp mắt.','/uploads/1778781159879.png',11),(36,'Bàn Phím Corsair K70 RGB PRO Mechanical',500000.00,11,'Akko 3087 World Tour Tokyo là mẫu bàn phím cơ nổi bật với thiết kế đẹp mắt, phong cách trẻ trung và trải nghiệm gõ cực kỳ thú vị dành cho người dùng yêu thích setup hiện đại. Bàn phím sử dụng layout nhỏ gọn giúp tiết kiệm không gian và mang lại cảm giác gọn gàng hơn cho góc làm việc hoặc gaming. Switch cơ học chất lượng cao mang lại cảm giác gõ êm ái, độ phản hồi tốt và phù hợp cho cả học tập, làm việc lẫn chơi game giải trí. Keycap với họa tiết phong cách Nhật Bản tạo điểm nhấn độc đáo và tăng tính thẩm mỹ cho sản phẩm. Hệ thống LED hỗ trợ nhiều hiệu ứng ánh sáng khác nhau giúp setup trở nên nổi bật hơn trong môi trường thiếu sáng. Ngoài ra, khung bàn phím chắc chắn cùng độ hoàn thiện tốt giúp nâng cao độ bền trong quá trình sử dụng lâu dài. Đây là lựa chọn phù hợp cho học sinh, sinh viên, dân văn phòng và người dùng yêu thích các mẫu bàn phím cơ có thiết kế đẹp mắt.','/uploads/1778781184006.jpg',11),(37,'Tai Nghe Logitech G435 Lightspeed Wireless',321000.00,321,'Logitech G435 Lightspeed là mẫu tai nghe không dây gaming sở hữu thiết kế gọn nhẹ, hiện đại và mang lại trải nghiệm âm thanh chất lượng cao cho cả chơi game lẫn giải trí hằng ngày. Tai nghe được trang bị công nghệ kết nối không dây ổn định giúp giảm độ trễ và mang lại trải nghiệm sử dụng mượt mà hơn khi chơi game hoặc xem phim. Hệ thống âm thanh sống động giúp tái hiện rõ ràng các chi tiết trong game, âm nhạc và video giải trí. Thiết kế đệm tai mềm mại cùng trọng lượng nhẹ giúp người dùng đeo thoải mái trong nhiều giờ liên tục mà không gây khó chịu. Ngoài ra, micro tích hợp chất lượng cao hỗ trợ giao tiếp rõ ràng hơn khi học online, làm việc hoặc chơi game cùng bạn bè. Đây là lựa chọn phù hợp cho học sinh, sinh viên và game thủ yêu thích các thiết bị không dây hiện đại với mức giá hợp lý.','/uploads/1778781389996.jpg',12),(38,'Tai Nghe Razer BlackShark V2 X Gaming',2230000.00,11,'Razer BlackShark V2 X là dòng tai nghe gaming nổi bật với thiết kế mạnh mẽ và chất lượng âm thanh ấn tượng dành cho game thủ yêu thích trải nghiệm chân thực khi chơi game. Tai nghe được trang bị driver âm thanh chất lượng cao giúp tái hiện rõ ràng tiếng bước chân, hiệu ứng và giọng nói trong game, hỗ trợ tăng khả năng phản xạ trong các tựa game FPS và MOBA. Thiết kế ôm tai cùng đệm tai mềm mại giúp giảm tiếng ồn xung quanh và mang lại cảm giác đeo thoải mái hơn trong thời gian dài. Micro chống ồn tích hợp giúp giọng nói rõ ràng hơn khi giao tiếp với đồng đội hoặc học online. Ngoài ra, khung tai nghe chắc chắn cùng trọng lượng nhẹ giúp nâng cao độ bền và tăng sự thoải mái khi sử dụng hàng ngày. Đây là lựa chọn phù hợp cho game thủ và người dùng cần một chiếc tai nghe gaming chất lượng với thiết kế hiện đại.','/uploads/1778781415944.jpg',12);
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taikhoan`
--

LOCK TABLES `taikhoan` WRITE;
/*!40000 ALTER TABLE `taikhoan` DISABLE KEYS */;
INSERT INTO `taikhoan` VALUES (1,'Admin Huy','admin123','huy@gmail.com',1,1,'Active','2026-03-16 19:14:17',NULL),(2,'khach01','khach123','khach01@gmail.com',2,2,'Active','2026-03-16 19:14:17',NULL),(3,'Admin My','123123','my@gmail.com',17,1,'Active','2026-03-16 19:14:17',NULL),(4,'khach01','khach123','khach01@gmail.com',2,2,'Active','2026-03-16 19:14:17',NULL),(5,'22050089@student.bdu.edu.vn','quy123','22050089@student.bdu.edu.vn',3,2,'Active','2026-03-30 18:59:19',NULL),(6,'hognquy@gmail.com','quy123','hognquy@gmail.com',4,2,'Active','2026-03-30 19:08:09',NULL),(7,'hongquy@gmail.com','123123','hongquy@gmail.com',5,1,'Active','2026-04-06 18:41:08','/uploads/avatars/avatar_7_1778551722690.png'),(8,'quanghuy@gmail.com','123123','quanghuy@gmail.com',6,2,'Active','2026-04-06 18:55:51','/uploads/avatars/avatar_8_1775504589125.jpg'),(9,'admin','admin123','admin@gmail.com',18,1,'Active','2026-04-06 19:57:24',NULL),(10,'nguyenvana','123456','nguyenvana@gmail.com',2,2,'Active','2026-04-06 19:57:24',NULL),(11,'tranthibinh','123456','tranthibinh@gmail.com',3,2,'Active','2026-04-06 19:57:24',NULL),(12,'levancuong','123456','levancuong@gmail.com',4,2,'Active','2026-04-06 19:57:24',NULL),(13,'phamthidung','123456','phamthidung@gmail.com',5,2,'Active','2026-04-06 19:57:24',NULL),(14,'hoangvanem','123456','hoangvanem@gmail.com',6,2,'Active','2026-04-06 19:57:24',NULL),(16,'my123@gmail.com','123123','my123@gmail.com',13,2,'Active','2026-04-10 19:09:22',NULL),(17,'sang@gmail.com','123123','sang@gmail.com',14,2,'Active','2026-05-14 16:25:18',NULL),(18,'zxc@gmail.com','123123','zxc@gmail.com',15,2,'Active','2026-05-14 16:32:34',NULL),(19,'asd@gmail.com','123123','asd@gmail.com',16,2,'Active','2026-05-14 16:47:44',NULL);
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

-- Dump completed on 2026-05-15  1:10:35
