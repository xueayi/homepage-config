# Homepage Docker 配置

基于 [gethomepage/homepage](https://github.com/gethomepage/homepage) v2.4 的个人 NAS 仪表盘完整配置，
运行于飞牛 fnOS（192.168.6.27）Docker。主题为「樱夜 · Sakura」，与
[gitea-sakura-theme](https://github.com/xueayi/gitea-sakura-theme) 同构：
预模糊壁纸层 + 无卡片毛玻璃 + 可拖动浮窗切换器。

![homepage](https://img.shields.io/badge/gethomepage-v2.4-2f6feb)

## ✨ 功能亮点

- **樱夜主题**：樱花粉强调色、夜紫底阶、暗角遮罩，视觉与 gitea-sakura-theme 一致
- **高性能背景**：壁纸走 `body::before` 单层 `filter: blur()` 预模糊，
  卡片**不使用 backdrop-filter**（23 张卡片仅 2 个轻模糊元素，对比旧版 26 个重模糊层）
- **浮窗切换器（可拖动）**：右下角 🌸 按钮，位置记忆，面板含
  壁纸（9 张缩略图直选）/ 飘落特效（无/🌸樱花/❄雪花）/ 背景模糊（关/轻/中/强）/ 点击迸溅
- **飘落特效**：樱花为 CSS 动画花瓣（零 JS 帧循环），雪花为 canvas 六角晶簇三层视差，
  页面隐藏时自动暂停渲染
- **CPU 圆环仪表**：设备卡片的 glances 占用以 conic-gradient 圆环显示（custom.js 动态驱动）
- **自制双页签**：主页 / 资讯 分组切换（绕过 homepage v2.4.0 原生 tab 渲染 bug）
- **顶栏磁盘监控**：宿主机各存储卷（vol1~vol5）实时空闲容量
- **下载器面板**：双 qBittorrent（PT/BT）做种/速率 + 容器资源占用
- **服务状态**：全部容器绑定状态点与 CPU/内存/网络实时数据（`showStats: true`）

## 📁 目录结构

```
.
├── docker-compose.yml      # homepage + glances（含磁盘/壁纸只读挂载）
├── config/                 # 挂载到容器 /app/config
│   ├── services.yaml       # 服务卡片与 widget
│   ├── settings.yaml       # 主题、布局、showStats
│   ├── widgets.yaml        # 顶栏信息组件（时钟/天气/CPU/内存/磁盘）
│   ├── bookmarks.yaml      # 书签（当前停用）
│   ├── custom.css          # 樱夜主题（15 个编号段落）
│   └── custom.js           # 浮窗切换器 + 壁纸/特效引擎 + 圆环驱动
├── backgrounds/            # 壁纸（挂载到 /app/public/bg）
│   └── sakura-night.svg    # 自绘默认壁纸（其余 .webp 见下方说明）
├── tools/
│   └── build-backgrounds.py  # 壁纸库 → WebP + 缩略图 生成脚本
└── icons/                  # 本地图标（优先于 CDN 加载）
```

## 🖼 壁纸说明（版权）

个人收藏的动漫壁纸**因版权原因不入库**（`.gitignore` 已排除 `backgrounds/*.webp`），
仓库只包含自绘的 `sakura-night.svg`。使用自己的壁纸：

```bash
# 把原图放进某个目录（文件名见脚本内 MAP 表，可自行修改）
python3 tools/build-backgrounds.py <壁纸目录> backgrounds/
```

生成后，在 `config/custom.js` 的 `WALLS` 数组中登记 slug / 名称 /
暗化 `dim`（0~1）/ 基础模糊 `blur`（px）即可进入浮窗选择。

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
3. 壁纸挂载：`./backgrounds:/app/public/bg:ro`（仓库默认已含），
   按「壁纸说明」生成 webp 后即可使用

## 🔧 常用调整

| 想改什么 | 位置 |
|---|---|
| 强调色 / 圆环 / 状态点 | `config/settings.yaml` 的 `color`（樱粉配 `custom.css` 段落 1） |
| 壁纸暗化/模糊参数 | `config/custom.js` 的 `WALLS` 数组 |
| 遮罩浓度 / 暗角 | `config/custom.css` 段落 2 的 `body::after` |
| 玻璃卡片质感 | `config/custom.css` 段落 3（刻意无 backdrop-filter，勿加回） |
| 分组顺序与列数 | `config/settings.yaml` 的 `layout` 块（顺序即显示顺序） |
| 粒子数量 | `custom.js` 中 `startPetals`（樱花）/ `startSnow`（雪花） |

## 🔐 密钥占位符

仓库中所有密钥均已替换为占位符，**克隆后请直接在 `config/services.yaml` 中填入真实值**：

| 位置 | 占位符 | 替换为真实值 |
|---|---|---|
| Emby widget `key` | `your-emby-api-key` | Emby 设置 → 高级 → API 密钥 |
| Komga widget `key` | `your-komga-api-key` | Komga 管理员生成 |
| DeepSeek `Authorization` | `sk-your-deepseek-api-key` | DeepSeek 开放平台 API Key |
| 阿里云 glances `url` | `198.51.100.10` / `198.51.100.20` | 你的服务器公网 IP |

> 仓库带有 pre-commit 钩子：一旦提交内容包含真实密钥/密码/公网 IP 会直接被拦截，
> 确保真实配置永远不会被推送到 GitHub。

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
- 樱夜主题与 [gitea-sakura-theme](https://github.com/xueayi/gitea-sakura-theme) 同源同构
