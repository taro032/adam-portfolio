# 手动更新到 GitHub 与生产环境

在项目根目录（如 `M:\My Projects\adam-portfolio`）打开终端，按下列步骤操作。

---

## 一、更新到 GitHub

### 1. 查看当前有哪些改动

```bash
git status
```

**示例输出：**

```
 M index-en.html
 M index.html
 M style.css
```

---

### 2. 将改动加入暂存区

```bash
# 提交所有改动
git add -A
```

或只提交部分文件：

```bash
git add index.html index-en.html style.css
```

**示例输出：**

```
warning: in the working copy of 'index-en.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'index.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'style.css', LF will be replaced by CRLF the next time Git touches it
```

（无报错即表示已暂存）

---

### 3. 提交并写说明

```bash
git commit -m "这里写本次改动的简短说明"
```

**示例：**

```bash
git commit -m "update: index, index-en, style.css"
```

**示例输出：**

```
[main e70af8b] update: index, index-en, style.css
 3 files changed, 229 insertions(+), 159 deletions(-)
```

---

### 4. 推送到 GitHub

```bash
git push origin main
```

**示例输出：**

```
To https://github.com/taro032/adam-portfolio.git
   a2134bf..e70af8b  main -> main
```

或若本地已与远程一致：

```
Everything up-to-date
```

---

## 二、更新到生产环境（服务器）

在**同一台电脑**的终端执行（会 SSH 到服务器并拉取最新代码）：

```bash
ssh root@8.138.86.135 "cd /var/www/adam-portfolio && git pull origin main && chown -R nginx:nginx . && echo Deploy OK"
```

- 首次连接会提示确认主机指纹，输入 `yes` 回车。
- 随后输入服务器 **root 密码**（输入时不显示，输完回车即可）。
- 看到 **Deploy OK** 即表示生产环境已更新完成。

**示例输出：**

```
From https://github.com/taro032/adam-portfolio
 * branch            main       -> FETCH_HEAD
   a2134bf..e70af8b  main -> origin/main
Updating a2134bf..e70af8b
Fast-forward
 index-en.html | 127 +++++++++++++++++++++++---------------------------
 index.html    | 116 +++++++++++++++++++++-------------------------
 style.css     | 145 ++++++++++++++++++++++++++++++++++++++++++++++++----------
 3 files changed, 229 insertions(+), 159 deletions(-)
Deploy OK
```

---

## 快速对照

| 步骤       | 命令 |
|------------|------|
| 看状态     | `git status` |
| 暂存       | `git add -A` |
| 提交       | `git commit -m "说明"` |
| 推 GitHub  | `git push origin main` |
| 更新服务器 | `ssh root@8.138.86.135 "cd /var/www/adam-portfolio && git pull origin main && chown -R nginx:nginx . && echo Deploy OK"` |

---

## 环境信息（供参考）

- **仓库**: https://github.com/taro032/adam-portfolio.git  
- **分支**: main  
- **服务器**: 8.138.86.135（阿里云 ECS）  
- **站点目录**: /var/www/adam-portfolio  
- **线上地址**: https://adamshi.me  
