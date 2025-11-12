# 📊 PHÂN TÍCH CHỨC NĂNG EVENTS CHO ADMIN

## 🗂️ TỔNG QUAN DATABASE

Hệ thống có **2 loại chức năng** tương tự nhau:

### 1️⃣ **EVENTS** (Sự kiện công ty)

**Bảng: `events` + `event_attendees`**

**Cấu trúc `events`:**

- `id`, `title`, `description`, `location`
- `start_time`, `end_time` (datetime)
- `created_by` (người tạo)
- `max_attendees` (số người tối đa)
- `is_public` (public/private)
- `is_deleted` (soft delete)

**Cấu trúc `event_attendees`:**

- `event_id`, `user_id`
- `status`: enum('going', 'maybe', 'not_going')
- `joined_at`

**Đặc điểm:**

- Sự kiện công ty chung (team building, hội thảo, sinh nhật, v.v.)
- Có thể public hoặc private
- Giới hạn số người tham gia
- Người dùng tự đăng ký tham gia (going/maybe/not_going)

**Dữ liệu hiện tại:**

- **77 events** đã tạo
- **0 attendees** (chưa có ai đăng ký)
- Tất cả events đều là public

---

### 2️⃣ **MEETINGS** (Lịch họp nội bộ)

**Bảng: `meetings` + `meeting_attendees` + `meeting_attachments`**

**Cấu trúc `meetings`:**

- `id`, `title`, `description`
- `organizer_id` (người tổ chức)
- `department_id` (phòng ban liên quan)
- `start_time`, `end_time`
- `location` (địa điểm)
- `meeting_link` (link online meeting)
- `recurrence` (JSON - lịch họp định kỳ)
- `is_cancelled`, `cancelled_at`

**Cấu trúc `meeting_attendees`:**

- `meeting_id`, `user_id`
- `status`: enum('invited', 'accepted', 'declined', 'tentative')
- `notified` (đã thông báo chưa)
- `reminder_sent` (đã gửi nhắc nhở chưa)
- `responded_at` (thời gian phản hồi)

**Cấu trúc `meeting_attachments`:**

- `meeting_id`, `file_id`
- `description`

**Đặc điểm:**

- Lịch họp nội bộ theo phòng ban
- Có người tổ chức (organizer)
- Có thể đính kèm file
- Hỗ trợ lịch định kỳ (recurrence)
- Hỗ trợ link online meeting
- Có hệ thống thông báo & nhắc nhở
- Người dùng được mời (invited) và phản hồi (accepted/declined/tentative)

**Dữ liệu hiện tại:**

- **75 meetings** đã tạo
- **0 attendees** (chưa mời ai)
- **0 attachments**

---

## 🔌 API ENDPOINTS ĐÃ CÓ

### ✅ **Events API** (`/api/events`)

- ✅ `GET /api/events` - Lấy danh sách events (có filter, search, pagination)
- ✅ `GET /api/events/:id` - Xem chi tiết event
- ✅ `GET /api/events/:id/attendees` - Xem danh sách người tham gia
- ✅ `POST /api/events` - Tạo event mới
- ✅ `PUT /api/events/:id` - Cập nhật event
- ✅ `DELETE /api/events/:id` - Xóa event
- ✅ `POST /api/events/:id/attendees` - Thêm người tham gia
- ✅ `DELETE /api/events/:id/attendees/:userId` - Xóa người tham gia

### ❌ **Meetings API** - CHƯA CÓ

Không tìm thấy routes và controller cho Meetings!

---

## 💡 ĐỀ XUẤT CHỨC NĂNG PHÁT TRIỂN

### 📌 **OPTION 1: Phát triển Events (Đơn giản hơn)**

Vì đã có sẵn API, chỉ cần làm giao diện admin:

**Chức năng:**

1. ✅ **Quản lý Events**
   - Danh sách events (table với search, filter, pagination)
   - Tạo/sửa/xóa event
   - Set public/private
   - Giới hạn số người tham gia
2. ✅ **Quản lý Attendees**
   - Xem danh sách người đăng ký
   - Thống kê: Going/Maybe/Not Going
   - Thêm/xóa người tham gia thủ công
3. ✅ **Calendar View**
   - Hiển thị events trên lịch
   - Filter theo tháng/tuần/ngày
   - Click vào ngày để tạo event mới

4. ✅ **Thống kê**
   - Tổng số events
   - Số người tham gia
   - Events sắp diễn ra
   - Events phổ biến nhất

**Ưu điểm:**

- API đã có sẵn 100%
- Không cần tạo thêm backend
- Phù hợp với events công ty chung
- Dễ làm, nhanh hoàn thành

**Nhược điểm:**

- Không có chức năng họp online
- Không có lịch định kỳ
- Không có đính kèm file

---

### 📌 **OPTION 2: Phát triển Meetings (Phức tạp hơn)**

Cần tạo đầy đủ API backend + frontend:

**Chức năng:**

1. ✅ **Quản lý Meetings**
   - Danh sách meetings
   - Tạo/sửa/xóa meeting
   - Chọn phòng ban
   - Thêm link online (Zoom, Teams, Meet)
2. ✅ **Quản lý Attendees**
   - Mời người tham gia
   - Xem trạng thái phản hồi (invited/accepted/declined/tentative)
   - Gửi thông báo nhắc nhở
3. ✅ **Recurring Meetings**
   - Lịch họp định kỳ (hàng ngày/tuần/tháng)
   - Cấu hình recurrence pattern
4. ✅ **Attachments**
   - Đính kèm tài liệu họp
   - Upload file, xem file
5. ✅ **Calendar View**
   - Hiển thị meetings trên lịch
   - Phân biệt theo phòng ban
   - Conflict detection (trùng lịch)

6. ✅ **Notifications**
   - Gửi email/thông báo khi được mời
   - Nhắc nhở trước giờ họp
   - Thông báo khi có thay đổi/hủy

**Ưu điểm:**

- Chức năng chuyên nghiệp hơn
- Phù hợp với lịch họp nội bộ
- Có tính năng nâng cao (recurring, attachments, notifications)

**Nhược điểm:**

- **Cần tạo toàn bộ API backend** (routes, controllers, use cases)
- Mất nhiều thời gian hơn
- Phức tạp hơn nhiều

---

### 📌 **OPTION 3: Kết hợp cả 2 (Tốt nhất)**

Có **2 module riêng biệt** trong admin:

1. **Events** - Sự kiện công ty (dùng API có sẵn)
2. **Meetings** - Lịch họp nội bộ (cần tạo API mới)

**Ưu điểm:**

- Phân biệt rõ ràng giữa event và meeting
- Events làm nhanh (API có sẵn)
- Meetings làm sau hoặc làm dần

---

## 🎯 KHUYẾN NGHỊ

### ⭐ **BẮT ĐẦU VỚI OPTION 1: EVENTS**

**Lý do:**

1. ✅ API đã có sẵn 100% → Không cần làm backend
2. ✅ Nhanh chóng có sản phẩm hoàn chỉnh
3. ✅ Phù hợp với mục đích quản lý events công ty
4. ✅ Dễ test và demo

**Roadmap đề xuất:**

1. **Phase 1**: Events Management (3-4 tiếng)
   - Table danh sách events với CRUD
   - Dialog tạo/sửa event
   - Dialog xem attendees
   - Theme xanh dương nhạt, trắng, vàng kim (giống Users)

2. **Phase 2**: Calendar View (2-3 tiếng)
   - Dùng thư viện FullCalendar hoặc tương tự
   - Hiển thị events trên lịch
   - Click để xem chi tiết
   - Drag & drop để đổi ngày

3. **Phase 3**: Statistics Dashboard (1-2 tiếng)
   - Cards thống kê
   - Charts (biểu đồ events theo tháng)
   - Top events nhiều người tham gia nhất

**Sau khi hoàn thành Events, có thể:**

- Nâng cấp thêm tính năng cho Events
- Hoặc chuyển sang làm Meetings module (cần tạo API)

---

## 📋 CHECKLIST TRƯỚC KHI BẮT ĐẦU

- [x] Đã phân tích database structure
- [x] Đã kiểm tra API endpoints
- [x] Đã đề xuất 3 options
- [ ] **CHỜ BẠN ĐỒNG Ý OPTION NÀO** 👈
- [ ] Bắt đầu code frontend

---

## ❓ CÂU HỎI CHO BẠN

1. **Bạn muốn làm option nào?**
   - Option 1: Events only (nhanh)
   - Option 2: Meetings only (cần làm API)
   - Option 3: Cả 2 (Events trước, Meetings sau)

2. **Ưu tiên gì nhất?**
   - Nhanh hoàn thành ✅
   - Đầy đủ tính năng 🎯
   - Dễ sử dụng 👥

3. **Có cần calendar view không?**
   - Có (đẹp hơn nhưng mất thời gian)
   - Không (chỉ table list)

**Hãy cho tôi biết quyết định của bạn, tôi sẽ bắt đầu code ngay! 🚀**
