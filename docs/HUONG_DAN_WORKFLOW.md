# Hướng Dẫn Sử Dụng Hệ Thống Quản Lý Công Việc (Task Workflow)

## 🎉 Trạng Thái: HOÀN THÀNH VÀ ĐÃ KIỂM TRA

### Tổng Quan

Hệ thống quản lý công việc phân cấp đã hoàn thành:
**Admin → Phòng Ban → Nhân Viên** với đầy đủ tính năng theo dõi, báo cáo và cảnh báo.

---

## ✅ Các Tính Năng Đã Hoàn Thành

### 1. Luồng Công Việc Phòng Ban (Department Tasks)

- ✅ Admin giao nhiệm vụ cho phòng ban
- ✅ Trưởng phòng xác nhận nhận việc
- ✅ Theo dõi tiến độ công việc
- ✅ Trưởng phòng nộp công việc lên Admin
- ✅ Admin phê duyệt hoặc từ chối

### 2. Luồng Công Việc Nhân Viên (Member Tasks)

- ✅ Trưởng phòng phân công cho nhân viên
- ✅ Nhân viên bắt đầu làm việc
- ✅ Cập nhật tiến độ và giờ làm
- ✅ Nhân viên nộp bài lên Trưởng phòng
- ✅ Trưởng phòng phê duyệt hoặc yêu cầu sửa

### 3. Hệ Thống Báo Cáo (Task Reports)

- ✅ Báo cáo hàng ngày, tuần, tháng
- ✅ Báo cáo hoàn thành công việc
- ✅ Báo cáo vấn đề/trở ngại
- ✅ Đính kèm tài liệu chứng minh

### 4. Hệ Thống Cảnh Báo (Warnings)

- ✅ Cảnh báo nộp muộn
- ✅ Cảnh báo chất lượng kém
- ✅ Cảnh báo bỏ lỡ deadline
- ✅ Phạt tiền (nếu có)
- ✅ Xác nhận đã đọc cảnh báo

---

## 🔑 Phân Quyền Chi Tiết

### Admin (Quản Trị Viên Hệ Thống)

**Có thể làm gì:**

- ✅ Giao nhiệm vụ cho phòng ban
- ✅ Phê duyệt công việc phòng ban đã hoàn thành
- ✅ Xem tất cả báo cáo
- ✅ Phát hành cảnh báo
- ✅ Xem thống kê toàn hệ thống

**Không thể làm:**

- ❌ Phê duyệt công việc nhân viên (do Trưởng phòng phụ trách)

### Trưởng Phòng (Department Manager)

**Có thể làm gì:**

- ✅ Nhận hoặc từ chối nhiệm vụ từ Admin
- ✅ Phân công công việc cho nhân viên
- ✅ Phê duyệt công việc nhân viên
- ✅ Nộp công việc phòng ban lên Admin
- ✅ Cập nhật tiến độ phòng ban
- ✅ Phát hành cảnh báo cho nhân viên
- ✅ Xem báo cáo phòng ban

**Không thể làm:**

- ❌ Phê duyệt công việc của phòng mình (do Admin phê duyệt)

### Nhân Viên (Employee)

**Có thể làm gì:**

- ✅ Bắt đầu làm việc khi được giao
- ✅ Cập nhật tiến độ công việc
- ✅ Nộp công việc lên Trưởng phòng
- ✅ Tạo báo cáo tiến độ
- ✅ Xem cảnh báo của mình
- ✅ Xác nhận đã đọc cảnh báo

**Không thể làm:**

- ❌ Phê duyệt công việc
- ❌ Giao việc cho người khác
- ❌ Phát hành cảnh báo

---

## 📋 Quy Trình Làm Việc Chuẩn

### Bước 1: Admin Giao Việc Cho Phòng Ban

```
1. Admin đăng nhập vào hệ thống
2. Chọn dự án (Project)
3. Nhấn "Giao Nhiệm Vụ Cho Phòng Ban"
4. Điền thông tin:
   - Chọn phòng ban
   - Tiêu đề công việc
   - Mô tả chi tiết
   - Ưu tiên: Thấp/Trung bình/Cao/Khẩn cấp
   - Deadline
   - Giờ dự kiến
5. Nhấn "Giao Việc"
```

### Bước 2: Trưởng Phòng Nhận Việc

```
1. Trưởng phòng nhận thông báo
2. Xem chi tiết công việc
3. Đánh giá khả năng thực hiện
4. Nhấn "Chấp Nhận" hoặc "Từ Chối"
5. Nếu chấp nhận, ghi chú kế hoạch thực hiện
```

### Bước 3: Trưởng Phòng Phân Công Cho Nhân Viên

```
1. Vào chi tiết công việc phòng ban
2. Nhấn "Phân Công Cho Nhân Viên"
3. Chọn nhân viên
4. Chia nhỏ công việc thành các task cụ thể
5. Đặt deadline cho từng task
6. Nhấn "Phân Công"
```

### Bước 4: Nhân Viên Làm Việc

```
1. Nhân viên nhận thông báo
2. Vào "Công Việc Của Tôi"
3. Nhấn "Bắt Đầu Làm Việc"
4. Làm việc và cập nhật tiến độ định kỳ:
   - Cập nhật % hoàn thành
   - Ghi số giờ đã làm
   - Tạo báo cáo tiến độ (hàng tuần)
5. Khi hoàn thành, nhấn "Nộp Bài"
```

### Bước 5: Trưởng Phòng Duyệt Bài Nhân Viên

```
1. Trưởng phòng nhận thông báo
2. Xem công việc nhân viên đã nộp
3. Kiểm tra chất lượng
4. Quyết định:
   - "Phê Duyệt" nếu đạt yêu cầu
   - "Yêu Cầu Sửa" nếu chưa đạt (ghi rõ lý do)
```

### Bước 6: Trưởng Phòng Nộp Lên Admin

```
1. Khi tất cả task nhân viên đã hoàn thành
2. Cập nhật tiến độ tổng thể lên 100%
3. Tạo báo cáo tổng kết
4. Nhấn "Nộp Bài Lên Admin"
5. Ghi chú kết quả đạt được
```

### Bước 7: Admin Phê Duyệt Cuối Cùng

```
1. Admin nhận thông báo
2. Xem báo cáo tổng kết
3. Kiểm tra các task đã hoàn thành
4. Quyết định:
   - "Phê Duyệt" nếu hoàn thành tốt
   - "Từ Chối" nếu chưa đạt yêu cầu
5. Ghi nhận xét và đánh giá
```

---

## ⏱️ Trạng Thái Công Việc

### Công Việc Phòng Ban

```
assigned      → Mới được giao, chờ Trưởng phòng xác nhận
in_progress   → Đang thực hiện
submitted     → Đã nộp lên Admin, chờ phê duyệt
approved      → Admin đã phê duyệt
rejected      → Admin từ chối, cần làm lại
completed     → Hoàn thành và đóng
```

### Công Việc Nhân Viên

```
assigned      → Mới được giao
in_progress   → Đang làm việc
submitted     → Đã nộp bài, chờ Trưởng phòng duyệt
approved      → Trưởng phòng đã duyệt
rejected      → Trưởng phòng yêu cầu sửa
completed     → Hoàn thành
```

---

## 📊 Hệ Thống Báo Cáo

### Loại Báo Cáo

1. **Báo Cáo Hàng Ngày** (`daily`)
   - Công việc làm được trong ngày
   - Vấn đề gặp phải
   - Kế hoạch ngày mai

2. **Báo Cáo Hàng Tuần** (`weekly`)
   - Tổng kết tuần
   - Tiến độ hoàn thành
   - Khó khăn và giải pháp

3. **Báo Cáo Hàng Tháng** (`monthly`)
   - Tổng quan cả tháng
   - Đánh giá hiệu suất
   - Đề xuất cải tiến

4. **Báo Cáo Hoàn Thành** (`completion`)
   - Khi hoàn thành công việc
   - Kết quả đạt được
   - Bài học kinh nghiệm

5. **Báo Cáo Vấn Đề** (`issue`)
   - Khi gặp trở ngại
   - Mô tả vấn đề
   - Đề xuất hỗ trợ

---

## ⚠️ Hệ Thống Cảnh Báo

### Loại Cảnh Báo

- **Nộp Muộn** (`late_submission`) - Nộp bài sau deadline
- **Chất Lượng Kém** (`poor_quality`) - Công việc không đạt chuẩn
- **Bỏ Lỡ Deadline** (`missed_deadline`) - Quá hạn mà chưa nộp
- **Làm Dở Dang** (`incomplete_work`) - Công việc chưa hoàn thành đủ
- **Khác** (`other`) - Các vi phạm khác

### Mức Độ Nghiêm Trọng

- **Thấp** (`low`) - Lỗi nhẹ, nhắc nhở
- **Trung Bình** (`medium`) - Cần chú ý và cải thiện
- **Cao** (`high`) - Vi phạm nghiêm trọng
- **Nghiêm Trọng** (`critical`) - Rất nghiêm trọng, có thể phạt

### Quy Trình Cảnh Báo

```
1. Trưởng phòng/Admin phát hiện vi phạm
2. Nhấn "Phát Hành Cảnh Báo"
3. Điền thông tin:
   - Người bị cảnh báo
   - Loại vi phạm
   - Mức độ nghiêm trọng
   - Lý do cụ thể
   - Số tiền phạt (nếu có)
4. Người bị cảnh báo nhận thông báo
5. Nhân viên phải xác nhận đã đọc
6. Ghi chú cam kết khắc phục
```

---

## 🧪 Kết Quả Kiểm Tra

### ✅ Đã Kiểm Tra Toàn Bộ Workflow

```
✅ Bước 1: Admin đăng nhập
✅ Bước 2: Lấy dữ liệu dự án và phòng ban
✅ Bước 3: Admin giao việc cho phòng ban
✅ Bước 4: Trưởng phòng nhận việc
✅ Bước 5: Trưởng phòng giao cho nhân viên
✅ Bước 6: Nhân viên bắt đầu làm việc
✅ Bước 7: Nhân viên cập nhật tiến độ
✅ Bước 8: Nhân viên nộp bài
✅ Bước 9: Trưởng phòng duyệt bài nhân viên
✅ Bước 10: Trưởng phòng nộp lên Admin
✅ Bước 11: Admin phê duyệt cuối cùng
✅ Bước 12: Hệ thống cảnh báo hoạt động
✅ Bước 13: Xác minh toàn bộ dữ liệu

🎊 TẤT CẢ 13 BƯỚC ĐỀU HOẠT ĐỘNG HOÀN HẢO!
```

---

## 🚀 Sẵn Sàng Sử Dụng

### Backend (Hoàn Thành 100%)

- ✅ 5 bảng database đã tạo
- ✅ 4 models với 50+ phương thức
- ✅ 4 controllers với 40+ API endpoints
- ✅ Phân quyền chặt chẽ theo vai trò
- ✅ Đã test toàn bộ workflow

### Frontend (Chưa Làm)

- ⏳ Chưa có giao diện người dùng
- ⏳ Cần tạo các component React
- ⏳ Cần tích hợp với Redux
- ⏳ Cần thiết kế UI/UX

### Thông Báo (Chưa Làm)

- ⏳ Chưa có thông báo thời gian thực
- ⏳ Chưa có email thông báo
- ⏳ Chưa có nhắc nhở tự động

---

## 📱 API Đã Có Sẵn

### Địa Chỉ API

```
http://localhost:3000/api
```

### Ví Dụ Sử Dụng

```javascript
// Đăng nhập
POST /api/auth/login
Body: { email: "admin@example.com", password: "Admin123!" }

// Giao việc cho phòng ban
POST /api/projects/30/department-tasks
Headers: { Authorization: "Bearer <token>" }
Body: {
  department_id: 4,
  title: "Phát triển module xác thực",
  description: "Làm hệ thống đăng nhập với JWT",
  priority: "high",
  deadline: "2025-02-15",
  estimated_hours: 120
}

// Trưởng phòng nhận việc
POST /api/department-tasks/8/accept
Headers: { Authorization: "Bearer <token>" }
Body: { notes: "Team đã sẵn sàng. Bắt đầu ngay." }

// Giao việc cho nhân viên
POST /api/department-tasks/8/member-tasks
Headers: { Authorization: "Bearer <token>" }
Body: {
  user_id: 2,
  title: "Làm JWT token generation",
  description: "Tạo và validate JWT tokens",
  priority: "high",
  deadline: "2025-02-10",
  estimated_hours: 40
}
```

---

## 📖 Tài Liệu Chi Tiết

### Đã Tạo Các File Tài Liệu:

1. **TASK_WORKFLOW_IMPLEMENTATION.md** - Tổng quan toàn bộ hệ thống
2. **TASK_WORKFLOW_API_EXAMPLES.md** - Ví dụ sử dụng API chi tiết
3. **HUONG_DAN_WORKFLOW.md** - Hướng dẫn này (tiếng Việt)

### File Code Quan Trọng:

```
backend/
├── database/
│   └── create-task-workflow-tables.sql    # Schema database
├── src/
│   ├── models/
│   │   ├── DepartmentTask.js              # Model công việc phòng ban
│   │   ├── MemberTask.js                  # Model công việc nhân viên
│   │   ├── TaskReport.js                  # Model báo cáo
│   │   └── ProjectWarning.js              # Model cảnh báo
│   ├── presentation/
│   │   ├── controllers/
│   │   │   ├── departmentTaskController.js
│   │   │   ├── memberTaskController.js
│   │   │   ├── taskReportController.js
│   │   │   └── projectWarningController.js
│   │   └── routes/
│   │       ├── departmentTasks.js
│   │       ├── memberTasks.js
│   │       ├── taskReports.js
│   │       └── projectWarnings.js
└── tests/
    └── test-complete-workflow.js           # Script test workflow
```

---

## 🎯 Việc Cần Làm Tiếp Theo

### Để Hoàn Thiện Frontend:

1. Tạo các component React:
   - DepartmentTasksTab.jsx
   - MemberTasksTab.jsx
   - TaskReportsTab.jsx
   - WarningsTab.jsx

2. Tích hợp Redux:
   - Tạo taskWorkflowSlice
   - Thêm vào store

3. Kết nối API:
   - Tạo taskService.js
   - Gọi các API đã có sẵn

4. Thiết kế UI/UX:
   - Dashboard tổng quan
   - Form giao việc
   - Bảng theo dõi tiến độ
   - Thông báo realtime

---

## ❓ Câu Hỏi Thường Gặp

**Q: Làm sao để chạy test?**

```bash
cd backend
node tests/test-complete-workflow.js
```

**Q: Làm sao để xem API endpoints?**

```bash
# Xem file:
backend/TASK_WORKFLOW_API_EXAMPLES.md
```

**Q: Database đã có sẵn chưa?**

```
✅ Đã có! 5 bảng đã được tạo và migration thành công.
```

**Q: Có cần cài đặt thêm gì không?**

```
❌ Không! Backend đã hoàn thiện 100%.
Chỉ cần chạy server như bình thường.
```

**Q: Frontend đã có chưa?**

```
❌ Chưa có giao diện. Backend API đã sẵn sàng,
chờ frontend tích hợp.
```

---

## 🎊 Kết Luận

### Đã Hoàn Thành:

✅ Hệ thống backend hoàn chỉnh  
✅ 40+ API endpoints sẵn sàng sử dụng  
✅ Phân quyền theo vai trò chặt chẽ  
✅ Workflow đã test toàn bộ  
✅ Database đã migration  
✅ Tài liệu đầy đủ

### Sẵn Sàng:

🚀 **Backend đã sẵn sàng cho production!**  
🎯 **Chỉ cần làm frontend và hệ thống hoàn thiện!**

---

**Cập Nhật Lần Cuối**: Tháng 1/2025  
**Phiên Bản**: 1.0.0  
**Trạng Thái**: ✅ Backend Hoàn Thành - Đợi Frontend
