# Giải Pháp Cho Vấn Đề Jitsi Authentication

## ❌ Vấn Đề Hiện Tại

Khi test Jitsi Meeting trên `meet.jit.si`, bạn gặp lỗi:

- **conference.connectionError.membersOnly** - Phòng họp yêu cầu xác thực
- **Yêu cầu đăng nhập Google** - Server bắt buộc authentication
- **Stuck ở lobby/waiting room** - Chờ moderator approve

## 🔍 Nguyên Nhân

Server Jitsi Meet công cộng (`meet.jit.si`) đã **bật authentication requirement** từ phía server. Điều này **KHÔNG THỂ** override từ client config (frontend hoặc URL parameters).

## ✅ Giải Pháp (Chọn 1 Trong 3)

### **Giải Pháp 1: Self-Host Jitsi Server** ⭐ KHUYẾN NGHỊ

Tự host Jitsi server của riêng bạn với full control.

#### Bước 1: Cài đặt Jitsi Meet trên Ubuntu Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y apt-transport-https curl gnupg

# Add Jitsi repository
curl https://download.jitsi.org/jitsi-key.gpg.key | sudo sh -c 'gpg --dearmor > /usr/share/keyrings/jitsi-keyring.gpg'
echo 'deb [signed-by=/usr/share/keyrings/jitsi-keyring.gpg] https://download.jitsi.org stable/' | sudo tee /etc/apt/sources.list.d/jitsi-stable.list > /dev/null

# Install Jitsi Meet
sudo apt update
sudo apt install -y jitsi-meet

# Setup SSL certificate (Let's Encrypt)
sudo /usr/share/jitsi-meet/scripts/install-letsencrypt-cert.sh
```

#### Bước 2: Cấu hình Jitsi không yêu cầu authentication

Chỉnh sửa `/etc/prosody/conf.avail/[YOUR_DOMAIN].cfg.lua`:

```lua
VirtualHost "YOUR_DOMAIN"
    authentication = "anonymous"  -- Cho phép guest access
    ssl = {
        key = "/etc/prosody/certs/YOUR_DOMAIN.key";
        certificate = "/etc/prosody/certs/YOUR_DOMAIN.crt";
    }
    modules_enabled = {
        "bosh";
        "pubsub";
        "ping";
        "speakerstats";
        "turncredentials";
        "conference_duration";
        "lobby_rooms";  -- Có thể disable nếu không dùng lobby
    }
    lobby_muc = "lobby.YOUR_DOMAIN"
    main_muc = "conference.YOUR_DOMAIN"
```

Restart Prosody:

```bash
sudo systemctl restart prosody
sudo systemctl restart jicofo
sudo systemctl restart jitsi-videobridge2
```

#### Bước 3: Update backend .env

```env
JITSI_DOMAIN=your-jitsi-domain.com
JITSI_ROOM_PREFIX=dacn-forum
```

---

### **Giải Pháp 2: Sử dụng Docker Compose** 🐳

Chạy Jitsi server local bằng Docker.

#### Bước 1: Tạo docker-compose.yml

```yaml
version: "3.8"

services:
  # Jitsi Web (Frontend)
  web:
    image: jitsi/web:stable-8719
    restart: unless-stopped
    ports:
      - "8443:443"
      - "8000:80"
    environment:
      - ENABLE_AUTH=0
      - ENABLE_GUESTS=1
      - ENABLE_LETSENCRYPT=0
      - ENABLE_HTTP_REDIRECT=0
      - DISABLE_HTTPS=0
      - JICOFO_COMPONENT_SECRET=${JICOFO_COMPONENT_SECRET}
      - JICOFO_AUTH_USER=${JICOFO_AUTH_USER}
      - JICOFO_AUTH_PASSWORD=${JICOFO_AUTH_PASSWORD}
      - JVB_AUTH_USER=${JVB_AUTH_USER}
      - JVB_AUTH_PASSWORD=${JVB_AUTH_PASSWORD}
      - JIBRI_RECORDER_USER=${JIBRI_RECORDER_USER}
      - JIBRI_RECORDER_PASSWORD=${JIBRI_RECORDER_PASSWORD}
      - ENABLE_RECORDING=0
      - TZ=Asia/Ho_Chi_Minh
    networks:
      jitsi:
        aliases:
          - meet.jitsi

  # Jitsi Prosody (XMPP Server)
  prosody:
    image: jitsi/prosody:stable-8719
    restart: unless-stopped
    environment:
      - AUTH_TYPE=none
      - ENABLE_AUTH=0
      - ENABLE_GUESTS=1
      - JICOFO_COMPONENT_SECRET=${JICOFO_COMPONENT_SECRET}
      - JICOFO_AUTH_USER=${JICOFO_AUTH_USER}
      - JICOFO_AUTH_PASSWORD=${JICOFO_AUTH_PASSWORD}
      - JVB_AUTH_USER=${JVB_AUTH_USER}
      - JVB_AUTH_PASSWORD=${JVB_AUTH_PASSWORD}
      - JIBRI_RECORDER_USER=${JIBRI_RECORDER_USER}
      - JIBRI_RECORDER_PASSWORD=${JIBRI_RECORDER_PASSWORD}
      - TZ=Asia/Ho_Chi_Minh
    networks:
      jitsi:
        aliases:
          - xmpp.meet.jitsi

  # Jitsi Jicofo (Conference Focus)
  jicofo:
    image: jitsi/jicofo:stable-8719
    restart: unless-stopped
    environment:
      - AUTH_TYPE=none
      - ENABLE_AUTH=0
      - JICOFO_COMPONENT_SECRET=${JICOFO_COMPONENT_SECRET}
      - JICOFO_AUTH_USER=${JICOFO_AUTH_USER}
      - JICOFO_AUTH_PASSWORD=${JICOFO_AUTH_PASSWORD}
      - JVB_BREWERY_MUC=jvbbrewery
      - JIGASI_BREWERY_MUC=jigasibrewery
      - JIBRI_BREWERY_MUC=jibribrewery
      - TZ=Asia/Ho_Chi_Minh
    depends_on:
      - prosody
    networks:
      jitsi:

  # Jitsi Video Bridge
  jvb:
    image: jitsi/jvb:stable-8719
    restart: unless-stopped
    ports:
      - "10000:10000/udp"
      - "4443:4443"
    environment:
      - JVB_AUTH_USER=${JVB_AUTH_USER}
      - JVB_AUTH_PASSWORD=${JVB_AUTH_PASSWORD}
      - JVB_BREWERY_MUC=jvbbrewery
      - JVB_PORT=10000
      - JVB_STUN_SERVERS=stun.l.google.com:19302,stun1.l.google.com:19302
      - JVB_ENABLE_APIS=rest
      - TZ=Asia/Ho_Chi_Minh
    depends_on:
      - prosody
    networks:
      jitsi:

networks:
  jitsi:
    driver: bridge
```

#### Bước 2: Tạo .env file cho Docker Compose

```bash
# Generate random secrets
cat > .env.jitsi << EOF
JICOFO_COMPONENT_SECRET=$(openssl rand -hex 16)
JICOFO_AUTH_USER=focus
JICOFO_AUTH_PASSWORD=$(openssl rand -hex 16)
JVB_AUTH_USER=jvb
JVB_AUTH_PASSWORD=$(openssl rand -hex 16)
JIBRI_RECORDER_USER=recorder
JIBRI_RECORDER_PASSWORD=$(openssl rand -hex 16)
EOF
```

#### Bước 3: Start Jitsi

```bash
docker-compose up -d
```

#### Bước 4: Update backend .env

```env
JITSI_DOMAIN=localhost:8000
JITSI_ROOM_PREFIX=dacn-forum
```

---

### **Giải Pháp 3: Sử dụng Jitsi Instance Khác** 🌐

Sử dụng một Jitsi server công cộng khác **KHÔNG yêu cầu authentication**.

#### Option A: 8x8.vc (Official Jitsi alternative)

```env
JITSI_DOMAIN=8x8.vc
```

#### Option B: Jitsi Community Servers

Một số server không yêu cầu auth:

- `jitsi.riot.im` (Matrix.org)
- `beta.meet.jit.si` (Beta server)

**⚠️ Lưu ý:** Các server công cộng có thể thay đổi policy bất cứ lúc nào.

---

## 🚀 Quick Test (Temporary Solution)

Trong khi chờ setup self-hosted server, bạn có thể:

1. **Thử sử dụng room name khác:**

Chỉnh sửa `frontend/src/pages/TestJitsi.jsx`:

```javascript
const testMeeting = {
  jitsi_room_name: "dacn-forum-test-" + Math.random().toString(36).substring(7),
  title: "Test Meeting",
  id: 999,
};
```

2. **Thử truy cập trực tiếp vào Jitsi:**

Mở browser và truy cập:

```
https://meet.jit.si/dacn-forum-test-abc123
```

Nếu vẫn yêu cầu đăng nhập → **BẮT BUỘC phải self-host hoặc dùng server khác**

---

## 📋 Checklist Implementation

- [ ] **Option 1: Self-Host Jitsi**

  - [ ] Setup Ubuntu server
  - [ ] Install Jitsi Meet
  - [ ] Configure no authentication
  - [ ] Update backend JITSI_DOMAIN

- [ ] **Option 2: Docker Compose**

  - [ ] Create docker-compose.yml
  - [ ] Generate secrets
  - [ ] Start containers
  - [ ] Update backend JITSI_DOMAIN

- [ ] **Option 3: Alternative Server**
  - [ ] Test 8x8.vc
  - [ ] Test other public servers
  - [ ] Update backend JITSI_DOMAIN

---

## 🔧 Debugging

Nếu vẫn gặp lỗi authentication:

1. **Check Jitsi server config:**

```bash
# SSH vào server
sudo cat /etc/prosody/conf.avail/[domain].cfg.lua | grep authentication
```

2. **Verify no JWT requirement:**

```bash
# Check jicofo config
sudo cat /etc/jitsi/jicofo/jicofo.conf | grep auth
```

3. **Test with curl:**

```bash
curl -v https://your-jitsi-domain.com/conference-request/v1?room=test
```

---

## 💡 Khuyến Nghị Cuối Cùng

**Để production deployment**, nên sử dụng **Giải Pháp 1 (Self-Host)** vì:

- ✅ Full control over authentication
- ✅ Privacy & security
- ✅ No dependency on third-party servers
- ✅ Better performance (dedicated resources)
- ✅ Customizable branding

**Để development/testing nhanh**, có thể dùng **Giải Pháp 2 (Docker)** vì:

- ✅ Quick setup
- ✅ Easy to reset/rebuild
- ✅ No need for public server

---

## 📞 Support

Nếu cần hỗ trợ thêm về:

- Self-hosting Jitsi
- Docker setup
- SSL certificate configuration
- Network/firewall rules

Hãy cho tôi biết! 🚀
