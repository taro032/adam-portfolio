/**
 * 从 index.html 生成 JPG 简历长图（去掉 header 与精选作品）。
 * 使用：
 *   node pdf/generate-image-cn.js
 */
const path = require('path');
const fs = require('fs');

async function main() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (_) {
    console.error('请先安装 Puppeteer：npm install puppeteer --save-dev');
    process.exit(1);
  }

  const projectRoot = path.resolve(__dirname, '..');
  const indexPath = path.join(projectRoot, 'index.html');
  const outputPath = path.join(projectRoot, 'pdf', 'Adam Resume CN.jpg');

  if (!fs.existsSync(indexPath)) {
    console.error('未找到 index.html，路径：', indexPath);
    process.exit(1);
  }

  const fileUrl = 'file:///' + indexPath.replace(/\\/g, '/');
  console.log('正在打开:', fileUrl);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // 固定 1440px 桌面视口，保持与 PDF 一致；deviceScaleFactor=1 避免缩放模糊
  await page.setViewport({ width: 1440, height: 2000, deviceScaleFactor: 1 });

  await page.goto(fileUrl, {
    waitUntil: ['networkidle0', 'domcontentloaded'],
    timeout: 30000,
  });

  await new Promise((r) => setTimeout(r, 2500));

  // 等待字体加载完成，保证截图文字清晰
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await new Promise((r) => setTimeout(r, 500));

  // 针对 JPG 导出做 DOM 与样式调整：
  // 1）移除 header（导航 + 移动端菜单）；
  // 2）移除「精选作品」区域；
  // 3）设置统一背景色，避免 JPEG 压缩产生异常块。
  await page.evaluate(() => {
    // 移除导航
    const navbar = document.getElementById('navbar');
    if (navbar && navbar.parentNode) {
      navbar.parentNode.removeChild(navbar);
    }
    // 移除移动端菜单
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
    if (mobileMenu && mobileMenu.parentNode) {
      mobileMenu.parentNode.removeChild(mobileMenu);
    }
    if (mobileBackdrop && mobileBackdrop.parentNode) {
      mobileBackdrop.parentNode.removeChild(mobileBackdrop);
    }
    // 移除精选作品 Section
    const portfolio = document.getElementById('portfolio');
    if (portfolio && portfolio.parentNode) {
      portfolio.parentNode.removeChild(portfolio);
    }
    // 确保背景为纯色
    document.body.style.backgroundColor = '#000212';
  });

  // 重新计算整页高度，便于 fullPage 截图
  const fullHeight = await page.evaluate(() => {
    return Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
  });

  // 调整视口高度到整页，用于 JPG 长图
  await page.setViewport({ width: 1440, height: fullHeight, deviceScaleFactor: 1 });

  // 生成 JPG 长图
  await page.screenshot({
    path: outputPath,
    type: 'jpeg',
    quality: 90,
    fullPage: true,
  });

  await browser.close();
  console.log('已生成 JPG:', outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

