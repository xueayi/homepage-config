# Homepage Docker 配置

基于 [gethomepage/homepage](https://github.com/gethomepage/homepage) v2.4 的个人 NAS 仪表盘完整配置，
运行于飞牛 fnOS（192.168.6.27）Docker，包含自定义 iOS 毛玻璃主题、CPU 圆环仪表、
主题/壁纸切换、全屋设备监控与下载器面板。

![homepage](https://img.shields.io/badge/gethomepage-v2.4-2f6feb)

## ✨ 功能亮点

- **iOS 毛玻璃材质卡片**：18px 外圆角 / 12px 内圆角、blur+saturate 玻璃层、发丝高光、环境阴影
- **CPU 圆环仪表**：设备卡片的 glances 占用以 conic-gradient 圆环显示（custom.js 动态驱动）
- **一键换配色**：右下角按钮循环 琥珀/翡翠/晴空/紫罗兰/玫瑰 五套强调色（localStorage 记忆）
- **一键换壁纸**：右下角按钮循环 NAS 壁纸目录中的横版壁纸，自动叠加渐变遮罩保证文字可读
- **顶栏磁盘监控**：宿主机各存储卷（vol1~vol5）实时空闲容量，盘名标注
- **下载器面板**：双 qBittorrent（PT/BT）做种/速率 + 容器资源占用
- **服务状态**：全部容器绑定状态点与 CPU/内存/网络实时数据（`showStats: true`）
- **Emby / Komga / Uptime Kuma** 数据面板，DeepSeek API 余额显示

## 📁 目录结构

```
.
├── docker-compose.yml      # homepage + glances（含磁盘/壁纸只读挂载）
├── config/                 # 挂载到容器 /app/config
│   ├── services.yaml       # 服务卡片与 widget
│   ├── settings.yaml       # 主题、布局、showStats
│   ├── widgets.yaml        # 顶栏信息组件（时钟/天气/CPU/内存/磁盘）
│   ├── bookmarks.yaml      # 书签（当前停用）
│   ├── custom.css          # iOS 材质主题（13 个编号段落）
│   └── custom.js           # 配色/壁纸切换按钮 + 圆环驱动
└── icons/                  # 本地图标（优先于 CDN 加载）
```

## 🚀 部署

```bash
git clone git@github.com:xueayi/homepage-config.git
cd homepage-config
docker compose up -d
```

首次部署需要：
1. `config/docker.yaml`（未入库）配置 docker socket：
   ```yaml
   fnos-local:
     socket: /var/run/docker.sock
   ```
2. compose 中按需修改磁盘挂载路径（`/fs`、`/vol1`~`/vol5` 为 fnOS 存储卷）
3. 壁纸目录挂载（`/app/public/backgrounds:ro`）放入横版壁纸，并在
   `config/custom.js` 的 `BGS` 数组里登记文件名即可进入轮换

## 🔧 常用调整

| 想改什么 | 位置 |
|---|---|
| 强调色 / 圆环 / 状态点 | `config/settings.yaml` 的 `color` |
| 毛玻璃浓度 / 圆角 / 遮罩 | `config/custom.css` 对应编号段落 |
| 分组顺序与列数 | `config/settings.yaml` 的 `layout` 块（顺序即显示顺序） |
| 等高卡片 | `useEqualHeights: true` |
| 背景遮罩浓度 | `custom.css` 段落 3 的 rgba 透明度 |

## 🔐 密钥与占位符

仓库中所有密钥均已脱敏为 `${HOMEPAGE_VAR_*}` 占位符（homepage 原生支持环境变量替换）。
部署时在 `docker-compose.yml` 的 homepage 服务 `environment` 中填入真实值即可：

```yaml
environment:
  HOMEPAGE_VAR_EMBY_KEY: your-emby-api-key       # Emby 设置 → 高级 → API 密钥
  HOMEPAGE_VAR_KOMGA_KEY: your-komga-api-key     # Komga 管理员生成
  HOMEPAGE_VAR_DEEPSEEK_KEY: sk-xxxx             # DeepSeek 开放平台 API Key
```

两台阿里云服务器的 glances 地址为占位（`lightsail.example.com` / `ecs.example.com`），
请替换为你的实际地址，或在 `config/services.yaml` 的设备分组中删除这两张卡片。

## ⚠️ 注意

- 更新镜像只需 `docker compose pull && docker compose up -d`，
  全部配置在宿主机 bind mount 中，不会丢失
- custom.css/custom.js 的选择器依赖 homepage 前端 DOM 结构，
  大版本升级后如样式失效需按新版结构微调

## 🙏 致谢

- [gethomepage/homepage](https://github.com/gethomepage/homepage)
- [walkxcode/dashboard-icons](https://github.com/walkxcode/dashboard-icons)
- 配置思路参考：[Mikusa 的 Homepage 教程](https://www.himiku.com/archives/homepage.html)
