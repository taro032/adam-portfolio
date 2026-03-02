# 为作品集网站配置域名

当前站点已部署在服务器 `8.138.86.135`，按下面步骤即可用新域名访问。

---

## 一、在域名服务商处配置 DNS

在你购买域名的平台（阿里云、腾讯云、Cloudflare、GoDaddy 等）做 **解析**：

| 记录类型 | 主机记录 | 记录值 | 说明 |
|--------|----------|--------|------|
| **A**  | `@`      | `8.138.86.135` | 根域名，如 `yourdomain.com` |
| **A**  | `www`    | `8.138.86.135` | 如 `www.yourdomain.com` |

- **主机记录**：`@` 表示根域名，`www` 表示 `www.xxx.com`；若只想要 `portfolio.yourdomain.com`，可填 `portfolio`，记录值仍是 `8.138.86.135`。
- 解析生效一般 5 分钟～几小时，可用 `ping yourdomain.com` 检查是否已指向 `8.138.86.135`。

---

## 二、在服务器上配置 Nginx（绑定域名）

SSH 登录服务器后执行：

```bash
# 1. 编辑站点配置（将 yourdomain.com 换成你的真实域名）
sudo nano /etc/nginx/conf.d/adam-portfolio.conf
```

在 `server {` 下一行增加 `server_name`，例如：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;   # 改成你的域名，多个用空格隔开
    root /var/www/adam-portfolio;
    index index.html index-en.html;

    location / {
        try_files $uri $uri/ /index.html =404;
    }

    location ~* \.(css|js|html)$ {
        add_header Cache-Control "no-cache, must-revalidate";
        etag on;
    }

    location ~* \.(png|jpg|jpeg|gif|svg|ico|webp|woff2|woff|ttf)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

保存后测试并重载 Nginx：

```bash
sudo nginx -t && sudo nginx -s reload
```

配置完成后，用浏览器访问 `http://yourdomain.com` 和 `http://www.yourdomain.com` 即可。

---

## 三、（可选）配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 1. 安装 certbot（以 CentOS/RHEL 为例）
sudo dnf install -y certbot python3-certbot-nginx

# 2. 申请证书并自动写入 Nginx 配置（替换成你的域名和邮箱）
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --email your@email.com --agree-tos --non-interactive

# 3. 证书会自动续期，可测试续期命令
sudo certbot renew --dry-run
```

完成后即可使用 `https://yourdomain.com` 访问。

---

## 四、若你提供域名，可代为生成配置

把你的域名发给我（例如 `shizheng.dev`），我可以帮你生成完整的 `adam-portfolio.conf` 内容，你只需复制到服务器并执行 `nginx -t && nginx -s reload` 即可。
