#!/usr/bin/env python3
"""
Flappy Bird 游戏启动脚本
"""

import uvicorn
import os
import webbrowser
import threading
import time


def open_browser():
    """等待服务器启动后打开浏览器"""
    time.sleep(2)
    webbrowser.open("http://localhost:8000")


if __name__ == "__main__":
    print("🐦 Flappy Bird 游戏启动中...")
    print("-" * 50)
    print("游戏地址: http://localhost:8000")
    print("按 Ctrl+C 关闭游戏")
    print("-" * 50)
    
    # 确保目录存在
    os.makedirs("backend", exist_ok=True)
    
    # 在新线程中打开浏览器
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # 启动服务器
    try:
        uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False, log_level="info")
    except KeyboardInterrupt:
        print("\n✅ 游戏已关闭")
