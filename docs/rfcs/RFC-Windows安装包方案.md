# RFC: Windows 安装包方案

Date: 2026-05-21

## Status

RFC only. 本阶段不实现 Tauri、Electron、安装器、代码签名、自动更新通道或应用商店发布。

## Final Architecture

EduOS 的最终形态是：

- 本地客户端、PWA 或可选桌面壳
- 云端后端/API，运行在阿里云 ECS
- 云端 PostgreSQL，运行在阿里云 RDS
- 云端对象存储，运行在阿里云 OSS
- 本地只做轻量缓存、离线草稿和已授权资源下载

这不是三套校长/老师/学生程序。Windows 安装包也必须是同一个入口，多角色账号登录后由云端 RBAC 决定进入的工作台。

## Packaging Rules

- 同一个安装包支持多角色登录。
- 本地不包含数据库。
- 本地不包含 `node_modules`。
- 本地不包含完整资源库、题库、视频、单词书、作业图片库、错题图片库或上传文件。
- 本地只包含客户端入口、版本检查、本地缓存和更新逻辑。
- 云端后端/API 仍然负责业务逻辑、账号、权限、同步、资源鉴权和版本更新。
- 本地客户端不能直连 RDS。
- 本地客户端不能持有 OSS 主密钥或 RAM AccessKey。

## Recommended First Step

优先使用 PWA 安装。Windows 桌面壳后续只作为轻量入口包装同一个云端 EduOS 地址，不内置后端、不内置数据库、不内置资源库。

## Human Approval Required

- 代码签名证书和发布主体。
- 自动更新通道。
- 桌面壳权限边界。
- Windows 安装、卸载、更新、回滚 QA。
