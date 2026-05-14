# Qmby

基于 Caddy 的 115 网盘视频流播放解决方案，支持 Emby/Jellyfin 集成、strm 文件生成、网盘文件自动整理、本地文件上传至 115 及多账号负载均衡。

---

## 功能特性

- **115 网盘视频直连播放** — 通过 Caddy + redir302 插件代理 Emby 播放请求，直连 115 CDN，支持视频拖动
- **Strm 文件生成** — 多任务独立输出，skip/overwrite 模式，定时执行或手动触发
- **转存整理** — 按 TMDB 元数据自动匹配识别媒体，在 115 云端完成重命名与移动
- **本地文件上传** — 多上传任务，SHA1 秒传校验，冲突策略，本地目录结构保留
- **文件监控自动上传** — 监控本地目录，新文件自动上传至 115
- **多账号负载均衡** — 支持 115 Cookie 登录 + 115 开放平台 OAuth 双驱动，IP 粘性自动分配
- **扫码登录** — 支持 115 App 扫码获取 Cookie 及开放平台 Token
- **Web 管理面板** — 完整的 React 管理界面，无需编辑配置文件
- **Docker 多架构** — 支持 linux/amd64 和 linux/arm64 一键部署

---

## 快速开始

### 前置要求

- 安装 [Docker](https://docs.docker.com/engine/install/) 和 [Docker Compose](https://docs.docker.com/compose/install/)
- 一个有效的 **115 网盘账号**
- （可选）一台 **Emby 服务器**

### Docker 部署

创建 `docker-compose.yml`：

```yaml
services:
  qmby:
    image: pdzhou/qmby:latest
    container_name: qmby
    restart: unless-stopped
    ports:
      - "2083:2083"  # Caddy 代理端口
      - "2084:2084"  # 管理面板端口
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - ./data:/data
```

启动服务：

```bash
docker compose up -d
```

首次启动会自动创建配置文件模板，然后访问管理面板进行配置。

### 访问管理面板

打开浏览器访问 `http://你的IP:2084`

| 项目 | 说明 |
| --- | --- |
| 地址 | `http://你的IP:2084` |
| 默认账号 | `admin` |
| 默认密码 | `admin123` |

---

## 端口说明

| 端口 | 用途 |
| --- | --- |
| 2083 | Caddy 视频流服务端口（Emby 媒体源指向此端口） |
| 2084 | Web 管理面板 |
| 2019 | Caddy API 管理端口（仅容器内部使用） |

---

## 使用指南

### 1. 配置 115 账号

在管理面板 → **账号管理** 中配置 115 账号，支持两种登录方式：

**Cookie 登录：**
- 方式一（推荐）：点击「扫码获取」，使用 115 App 扫描二维码，自动填充 Cookie
- 方式二（手动）：登录 115 网页版，F12 → Network → 复制 Cookie，粘贴到输入框
- 支持自动签到，可配置多个 Cookie 实现请求负载均衡

**115 开放平台登录（推荐）：**
- 用于上传、下载、用户信息查询等高频操作
- 通过 115 App 扫码完成 OAuth 授权
- Token 自动刷新与持久化，无需手动续期

两种方式可同时配置，系统会根据操作类型自动选择最优驱动。

### 2. 配置 Emby 服务器

在管理面板 → **系统配置** 中填写：
- **主机地址**：本机 IP（用于生成播放地址）
- **Emby 地址**：如 `http://192.168.1.50:8096`
- **API 密钥**：Emby 控制台 → 高级 → API 密钥

### 3. Emby 媒体库配置

在 Emby 中添加媒体库，文件夹选择 strm 输出目录（如 `/data/strm/每日更新`），内容类型选择对应类型。

Caddy 视频流服务运行在 2083 端口，strm 文件中的播放地址会自动指向 `http://你的IP:2083`。

### 4. 配置转存整理

在管理面板 → **转存整理** 中配置任务：
- 设置 115 网盘来源目录与目标目录（电影/剧集分目录）
- 填写 TMDB API Key 以获取媒体元数据
- 选择演练模式可先预览匹配结果，确认无误后再关闭
- 支持定时执行

### 5. 文件监控上传

在管理面板 → **文件监控** 中配置：
- 添加上传任务，指定本地路径与 115 远程路径
- 开启自动监控后，本地新文件自动上传至 115
- 支持秒传校验，避免重复上传

### 6. 生成 Strm 文件

在管理面板 → **Strm 任务** 中：
- 配置 115 网盘路径与输出目录
- 点击「执行」立即生成
- 开启「定时执行」按计划自动更新

---

## 目录挂载说明

容器内数据目录结构：

| 容器路径 | 用途 | 说明 |
| --- | --- | --- |
| `/data/config/` | 配置文件 | config.yaml、Caddyfile、数据库 |
| `/data/strm/` | Strm 文件输出 | 每个任务一个子目录 |
| `/data/log/` | 访问日志 | Caddy 访问日志 |
| `/data/upload/` | 本地上传目录 | 文件监控的上传源目录 |

默认一个 `./data:/data` 统一挂载所有目录。若需要将 strm 或 upload 单独映射到其他位置：

```yaml
volumes:
  - ./data:/data
  - /自定义路径/strm:/data/strm
  - /自定义路径/upload:/data/upload
```

---

## 配置文件参考

`data/config/config.yaml`（首次启动自动从模板创建）：

```yaml
cookies:
  cache_ttl: 1800
  sticky_ttl: 14400
  qps: 0.8
  download_qps: 1
  sign_in_enabled: true
  main_cookies:
    - name: "主号"
      enabled: true
      cookie: ""
  guest_cookies: []

open_platform:
  client_id: ""
  client_secret: ""
  redirect_uri: ""
  accounts:
    - name: ""
      enabled: true
      role: admin
      refresh_token: ""
      access_token: ""

system:
  host: ""

emby:
  url: ""
  api_key: ""

strm:
  tasks:
    - name: "每日更新"
      enabled: true
      path: "video/每日更新"
      output_dir: "/data/strm/每日更新"
      mode: "skip"
      scan_method: "http_tree"
      download_metadata: false
      schedule: false
      cron_expr: "0 */6 * * *"
  api_delay_ms: 2000
  cache_file: "/data/config/.strm_cache.json"

organizer:
  tmdb_api_key: ""
  language: "zh-CN"
  region: "CN"
  tasks:
    - name: "整理电影"
      enabled: true
      source_path: "video/待整理"
      movie_dest_path: "video/电影"
      tv_dest_path: "video/剧集"
      driver_name: ""
      schedule: false
      dry_run: true

upload:
  tasks:
    - name: "上传视频"
      enabled: true
      local_path: "/data/upload"
      remote_path: "video/上传"
      conflict_mode: "skip"
      cookie_name: ""

admin:
  user: "admin"
  password: "admin123"
```

---

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `TZ` | `Asia/Shanghai` | 时区 |
| `AUTO_GEN_CADDYFILE` | `true`（默认启用） | 设为 `false` 禁用自动生成 Caddyfile |

---

## 常见问题

### 如何获取 Emby API 密钥？

Emby 管理面板 → 高级 → API 密钥 → 添加新密钥。

### Cookie 到期怎么办？

在管理面板 → 账号管理 中点击「扫码获取」重新扫码。配置保存后自动热加载，无需重启服务。

### 开放平台 Token 到期怎么办？

系统会自动使用 refresh_token 刷新 access_token，无需手动操作。若 refresh_token 也已失效，管理面板会提示扫码重新登录。

### 如何更新？

```bash
docker compose pull
docker compose up -d
```

### 为什么播放不了视频？

检查以下几点：
1. `system.host` 是否配置正确（需为 Emby 能访问到的 IP）
2. 115 Cookie 是否有效
3. Emby 地址和 API 密钥是否正确
4. Caddy 服务是否正常运行（端口 2083）

### 访客账号有什么用？

访客账号用于 302 重定向播放时提供额外的下载带宽，系统会根据请求 IP 自动分配，实现多账号负载分担。

---

## 技术栈

- **后端**: Go 1.24 + Caddy 2 + Gin + GORM + SQLite
- **前端**: React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Radix UI
- **容器化**: Docker + Docker Compose + 多架构构建（amd64 / arm64）

---

## 许可证

本项目仅供学习交流使用。
