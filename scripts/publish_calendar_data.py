#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
publish_calendar_data.py — 把当日热点 Excel 上传到公网，并更新日历数据文件

能力：
  1. 将本地 Excel 上传到公网（默认通过 FileBatchUpload 平台侧能力，脚本内预留
     HTTP 上传接口占位，可替换为你自己的对象存储 / 网盘上传实现）
  2. 更新 web/src/data/historicalevents.js，把当日最新 3 条热点写入日历数据，
     并绑定 Excel 下载链接，保证日历上点击当天即可下载。

用法：
  python3 publish_calendar_data.py --file /path/to/热点_股市联想_2026-08-27.xlsx \
      --date 2026-08-27 \
      --events "热点1标题" "热点2标题" "热点3标题"

可选：
  --data-file web/src/data/historicalevents.js   日历数据文件路径
  --url 手动指定已上传的公网 URL（跳过上传步骤）
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime


def parse_args():
    p = argparse.ArgumentParser(description="上传 Excel 并更新日历热点数据")
    p.add_argument("--file", help="本地 Excel 文件路径")
    p.add_argument("--date", help="日期 YYYY-MM-DD（默认今天）")
    p.add_argument("--events", nargs="+", help="当天热点标题（最多3条）")
    p.add_argument("--data-file", default="web/src/data/historicalevents.js", help="日历数据文件路径")
    p.add_argument("--url", help="已上传的公网 URL（跳过上传步骤）")
    return p.parse_args()


def upload_to_public(file_path: str) -> str:
    """
    将文件上传到公网并返回可下载 URL。

    说明：本仓库默认运行在豆包云电脑环境，上传请调用平台侧 FileBatchUpload 工具
    （由 AI 执行时调用工具完成，而非本脚本）。若在纯本地环境使用，请把此处替换为
    你自己的对象存储/网盘上传实现，例如：
        oss2 / boto3 / scp / 自建文件服务
    下方仅返回占位，实际使用时由调用方（AI）注入真实 URL。
    """
    print(f"⚠️  请使用平台侧 FileBatchUpload 工具上传: {os.path.abspath(file_path)}", file=sys.stderr)
    print(f"    上传成功后把返回 URL 作为 --url 传入本脚本。", file=sys.stderr)
    return ""


def upsert_event(data_file: str, date: str, url: str, events: list):
    """在 historicalevents.js 中新增/更新指定日期的热点与下载链接。"""
    if not url:
        print("错误：缺少公网 URL（--url 或上传返回）", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(data_file):
        print(f"错误：数据文件不存在 {data_file}", file=sys.stderr)
        sys.exit(1)

    with open(data_file, "r", encoding="utf-8") as f:
        content = f.read()

    hot_events = ", ".join(
        f'{{ index: {i + 1}, title: "{ev}", type: \'historical\' }}'
        for i, ev in enumerate(events[:3])
    )
    block = (
        "  {\n"
        f"    id: 'ev-{date}',\n"
        f"    date: '{date}',\n"
        f"    excelDownloadUrl: '{url}',\n"
        f"    hotEvents: [ {hot_events} ],\n"
        "  },\n"
    )

    # 若该日期已存在则替换，否则插入数组头部
    pattern = re.compile(r"\{\s*id:\s*'ev-" + re.escape(date) + r"',.*?\},", re.S)
    if pattern.search(content):
        content = pattern.sub(block, content, count=1)
    else:
        content = re.sub(
            r"(export const HISTORICAL_EVENTS\s*=\s*\[)", r"\1\n" + block,
            content, count=1,
        )

    with open(data_file, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ 已更新日历数据: {data_file} (date={date}, events={len(events[:3])})")


def main():
    args = parse_args()
    date = args.date or datetime.now().strftime("%Y-%m-%d")
    url = args.url or (upload_to_public(args.file) if args.file else "")

    if not args.file and not url:
        print("错误：请提供 --file 或 --url 至少一个", file=sys.stderr)
        sys.exit(1)

    if args.events:
        upsert_event(args.data_file, date, url, args.events)
    else:
        print(f"ℹ️  未提供 --events，跳过日历数据更新。文件URL: {url}")


if __name__ == "__main__":
    main()
