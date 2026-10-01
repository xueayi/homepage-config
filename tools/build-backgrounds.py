#!/usr/bin/env python3
"""壁纸库 → WebP 优化 + 16:9 缩略图，供 Homepage 樱夜主题使用。

用法:
    python3 tools/build-backgrounds.py <壁纸目录> <输出目录>

个人壁纸因版权原因不入 git 库（见 .gitignore），
在 NAS/本地准备好原图后跑一次本脚本即可:
    backgrounds/<slug>.webp        2560px 全尺寸
    backgrounds/thumbs/<slug>.webp 480px 16:9 缩略图
文件名 slug 需与 config/custom.js 的 WALLS 清单一致。
"""
import os
import sys
from PIL import Image

FULL_W, THUMB_W = 2560, 480
# 源文件名 -> (输出 slug, 显示名)；按需修改，与 custom.js WALLS 对齐
MAP = {
    "星见雅.png": ("xingjianya", "星见雅·夜城"),
    "星见雅ox.jpeg": ("xingjianya-ox", "星见雅·OX"),
    "艾莲.png": ("ailian", "艾莲·街头"),
    "艾莲2.png": ("ailian-2", "艾莲·雨巷"),
    "艾莲3.png": ("ailian-3", "艾莲·特写"),
    "蕾米.jpg": ("leimi", "蕾米·蓝天"),
    "Wallpaper Alchemy - Remielle Dan 绝区零 4K 壁纸.jpg": ("remielle-1", "绝区零·粉"),
    "Wallpaper Alchemy - Remielle Dan 绝区零 4K 壁纸 (1).jpg": ("remielle-2", "绝区零·霓虹"),
}


def main(src, out):
    os.makedirs(out, exist_ok=True)
    os.makedirs(os.path.join(out, "thumbs"), exist_ok=True)
    t_src = t_full = t_thumb = 0
    for name, (slug, label) in MAP.items():
        path = os.path.join(src, name)
        if not os.path.exists(path):
            print("!! 缺失:", name)
            continue
        im = Image.open(path).convert("RGB")
        sw, sh = im.size
        t_src += os.path.getsize(path)

        full = im if sw <= FULL_W else im.resize((FULL_W, round(sh * FULL_W / sw)), Image.LANCZOS)
        fp = os.path.join(out, slug + ".webp")
        full.save(fp, "WEBP", quality=82, method=6)

        tr = 16 / 9
        if sw / sh > tr:
            nw = round(sh * tr)
            box = ((sw - nw) // 2, 0, (sw - nw) // 2 + nw, sh)
        else:
            nh = round(sw / tr)
            box = (0, (sh - nh) // 2, sw, (sh - nh) // 2 + nh)
        thumb = im.crop(box).resize((THUMB_W, round(THUMB_W / tr)), Image.LANCZOS)
        thumb.save(os.path.join(out, "thumbs", slug + ".webp"), "WEBP", quality=78, method=6)

        fb = os.path.getsize(fp)
        t_full += fb
        t_thumb += os.path.getsize(os.path.join(out, "thumbs", slug + ".webp"))
        print(f"{label:<14} {sw}x{sh}  {os.path.getsize(path)/1e6:6.2f}MB -> {fb/1024:7.1f}KB")
    print(f"\n合计: 源 {t_src/1e6:.1f}MB -> 全尺寸 {t_full/1e6:.2f}MB + 缩略图 {t_thumb/1024:.0f}KB")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
