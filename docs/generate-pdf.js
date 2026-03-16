/**
 * 根据 HTML 入口生成 PDF（支持中/英文简历）。
 * 使用：
 *   node pdf/generate-pdf.js cn   # 生成中文 Adam Resume.pdf
 *   node pdf/generate-pdf.js en   # 生成英文 Adam Resume EN.pdf
 */
const path = require('path');
const fs = require('fs');

async function main() {
  const lang = (process.argv[2] || 'cn').toLowerCase();

  let entryFile;
  let outputName;

  if (lang === 'en') {
    entryFile = 'index-en.html';
    outputName = 'Adam Resume EN.pdf';
  } else {
    entryFile = 'index.html';
    outputName = 'Adam Resume.pdf';
  }

  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (_) {
    console.error('请先安装 Puppeteer：npm install puppeteer --save-dev');
    process.exit(1);
  }

  const projectRoot = path.resolve(__dirname, '..');
  const indexPath = path.join(projectRoot, entryFile);
  const outputPath = path.join(projectRoot, 'pdf', outputName);

  if (!fs.existsSync(indexPath)) {
    console.error('未找到入口 HTML，路径：', indexPath);
    process.exit(1);
  }

  const fileUrl = 'file:///' + indexPath.replace(/\\/g, '/');
  console.log('正在打开:', fileUrl);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // 固定 1440px 桌面视口；deviceScaleFactor 用 1 避免 PDF 缩放导致文字发虚
  await page.setViewport({ width: 1440, height: 2000, deviceScaleFactor: 1 });

  await page.goto(fileUrl, {
    waitUntil: ['networkidle0', 'domcontentloaded'],
    timeout: 30000,
  });

  await new Promise((r) => setTimeout(r, 2500));

  // 等待网页字体（如 Google Fonts）加载完成，避免卡片正文用回退字体发虚
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await new Promise((r) => setTimeout(r, 500));

  // 强制首屏与动画区块在 PDF 中可见
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      .reveal, .reveal-delay-1 { opacity: 1 !important; transform: none !important; transition: none !important; }
    `;
    document.head.appendChild(style);
  });
  await new Promise((r) => setTimeout(r, 300));

  // PDF 专用 DOM 微调：
  // 1）将站内相对链接替换为线上完整 URL（保留 mailto / tel）；
  // 2）仅在「中文简历」中，把 header 右侧菜单替换为「在网页上查看」外链；
  // 3）移除 footer，在联系方式结束处收尾；
  // 4）仅对「工作履历」中的项目卡片在打印时强制两列排列。
  await page.evaluate((langInPage) => {
    const origin = 'https://www.adamshi.me/';

    // 1）修正所有站内跳转链接为线上域名（但保留锚点为页内跳转）
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (!href) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
      // 保留页内锚点，方便在 PDF 内部做 Y 轴跳转
      if (href.startsWith('#')) return;
      if (href.startsWith('http://') || href.startsWith('https://')) return;

      let newHref;
      // 非锚点且为相对路径（作品页等），拼成线上完整 URL
      // 去掉开头的 "./" 以拼接为标准路径
      newHref = origin + href.replace(/^\.\//, '');
      a.setAttribute('href', newHref);
    });

    // 2）仅在中文简历中，把 header 右侧菜单替换为「在网页上查看」
    if (langInPage === 'cn') {
      const nav = document.getElementById('navbar');
      if (nav) {
        const container = nav.querySelector('div.max-w-7xl.mx-auto');
        if (container) {
          const right = container.querySelector('div.hidden.md\\:flex.items-center.gap-10.font-semibold.text-slate-400');
          if (right) {
            // 查找原有的「联系我」按钮
            const contactBtn = right.querySelector('a[href="#contact"]');
            // 清空文字导航
            right.innerHTML = '';

            // 新增「在网页上查看」链接
            const viewLink = document.createElement('a');
            viewLink.href = 'https://www.adamshi.me/index.html';
            viewLink.target = '_blank';
            viewLink.rel = 'noopener';
            viewLink.textContent = '在网页上查看';
            viewLink.className =
              'text-slate-400 hover:text-white transition-all font-semibold';

            right.appendChild(viewLink);

            // 重新挂回「联系我」按钮（如果存在），保持原样式
            if (contactBtn) {
              right.appendChild(contactBtn);
            }
          }
        }
      }
    }

    // 3）移除 footer，仅保留联系方式为结尾
    const footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
      footer.parentNode.removeChild(footer);
    }

    // 4）仅对「工作履历」里的项目卡片在打印时强制两列排列；并提升打印文字锐度
    // 英文版：卡片改为纯色背景，避免渐变导致文字发虚
    const cardSolidCss = langInPage === 'en' ? `
        .glass-card {
          background: rgba(38, 42, 52, 0.98) !important;
          backdrop-filter: none !important;
          box-shadow: inset 0 0 0 1px rgba(78, 78, 94, 0.5) !important;
        }
        .glass-card::before {
          display: none !important;
        }
      ` : '';
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        /* 打印时提升文字锐度，减轻卡片正文发虚 */
        body, .glass-card, .glass-card * {
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          text-rendering: geometricPrecision !important;
        }
        ${cardSolidCss}
        /* Intelfinity / 丽晶 下的项目卡片网格：两列布局 */
        #experience .grid {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 1.5rem !important;
        }
        #experience .grid > .glass-card {
          grid-column: auto !important;
        }
        /* 带有 lg:col-span-2 的卡片在打印时仍占满整行 */
        #experience .grid > .lg\\:col-span-2 {
          grid-column: 1 / -1 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }, lang);

  // 以「联系方式」区域为结束点，计算单页高度，避免在该区域中途截断
  const totalHeightPx = await page.evaluate(() => {
    const contact = document.querySelector('#contact');
    if (!contact) {
      const h = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
      );
      return h;
    }
    const rect = contact.getBoundingClientRect();
    const bottom = rect.bottom + window.scrollY;
    return Math.ceil(bottom + 80); // 联系方式下方预留一点缓冲
  });

  // 注入 @page：单页、宽度 1440px、高度为整页、无边距
  await page.evaluate((heightPx) => {
    const style = document.createElement('style');
    style.textContent = `
      @page {
        size: 1440px ${heightPx}px;
        margin: 0;
      }
      html, body {
        margin: 0;
        padding: 0;
      }
    `;
    document.head.appendChild(style);
  }, totalHeightPx);

  await new Promise((r) => setTimeout(r, 100));

  // 单页长 PDF、无白边、保留背景与链接
  await page.pdf({
    path: outputPath,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  console.log('已生成:', outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

