/**
 * Portfolio-Copy Trading 页面交互逻辑
 * 处理 [sections] 三个卡片的点击切换及其对 [detail] 内容的联动控制
 */

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.strategy-card');
    const details = document.querySelectorAll('.detail-content');

    // 映射卡片 data-id 到对应的 detail 容器 ID
    const detailMap = {
        'strategies': 'detail-strategies',
        'legos': 'detail-legos',
        'execution': 'detail-execution'
    };

    let currentIdx = 0; // 记录当前激活的卡片索引 (0, 1, 2)
    const cardArray = Array.from(cards);
    const wrapper = document.getElementById('detail-wrapper');

    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (index === currentIdx) return; // 点击当前已激活的卡片不做动作

            const sectionId = card.getAttribute('data-id');

            // 1. 更新卡片激活状态
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            // 2. 通过轨道平移实现 Banner 级滑动并更新高度
            if (wrapper) {
                const offset = index * (100 / 3); // 计算平移百分比
                wrapper.style.transform = `translateX(-${offset}%)`;

                // 更新高度以贴合当前激活的内容
                const activeDetail = details[index];
                if (activeDetail) {
                    const height = activeDetail.offsetHeight;
                    wrapper.style.height = `${height}px`;
                }
            }

            // 3. 更新内容激活状态 (用于处理 opacity 和 scale 动画)
            details.forEach((d, i) => {
                d.classList.remove('active');
                if (i === index) {
                    d.classList.add('active');
                }
            });

            currentIdx = index; // 更新当前索引
        });
    });

    // 初始化高度
    setTimeout(() => {
        if (wrapper && details[0]) {
            wrapper.style.height = `${details[0].offsetHeight}px`;
        }
    }, 100);

    // 模拟联系我按钮
    const contactBtn = document.querySelector('.btn-primary');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            alert('正在连接联系方式...');
        });
    }

    // --- 上链执行页面 Tab 切换逻辑 ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const flowViews = document.querySelectorAll('.flow-view');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // 1. 更新按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. 切换视图显隐
            flowViews.forEach(view => {
                view.classList.add('hidden');
                view.classList.remove('active');
                view.classList.add('opacity-0');
                view.classList.add('translate-y-4');
            });

            const activeView = document.getElementById(`view-${targetTab}`);
            if (activeView) {
                activeView.classList.remove('hidden');
                // 稍微延迟以触发 CSS 过渡
                setTimeout(() => {
                    activeView.classList.add('active');
                    activeView.classList.remove('opacity-0');
                    activeView.classList.remove('translate-y-4');
                }, 10);
            }
        });
    });

    // --- 高级平滑滚动逻辑 (Custom Cubic-Bezier Easing) ---
    const smoothScroll = (targetElement) => {
        const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        const duration = 1000; // 增加时长使过程更优雅 (1秒)

        // Easing Function: Ease-in-out Cubic
        const ease = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        };

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                smoothScroll(targetElement);
            }
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
    if (mobileMenuBtn && mobileMenu && mobileMenuBackdrop) {
        const openMenu = () => {
            mobileMenu.classList.remove('hidden');
            mobileMenuBackdrop.classList.remove('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
            document.body.classList.add('overflow-hidden');
        };
        const closeMenu = () => {
            mobileMenu.classList.add('hidden');
            mobileMenuBackdrop.classList.add('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('overflow-hidden');
        };
        mobileMenuBtn.addEventListener('click', () => (mobileMenu.classList.contains('hidden') ? openMenu() : closeMenu()));
        mobileMenuBackdrop.addEventListener('click', closeMenu);
        document.querySelectorAll('.mobile-menu-link').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                closeMenu();
                const id = link.getAttribute('href').slice(1);
                const el = document.getElementById(id);
                if (el) smoothScroll(el);
            });
        });
    }
});
