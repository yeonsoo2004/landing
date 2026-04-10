document.addEventListener("DOMContentLoaded", () => {
    // ------------------------------
    // Section 01 슬라이더(기존)
    // ------------------------------
    const track = document.querySelector(".slider-track");
    const slides = document.querySelectorAll(".slide");
    const prevBtn = document.querySelector(".arrow-prev");
    const nextBtn = document.querySelector(".arrow-next");
    const dots = document.querySelectorAll(".dot");

    if (track && slides.length && prevBtn && nextBtn && dots.length) {
        let currentIndex = 0;
        const totalSlides = slides.length;

        function updateSlider() {
            const slideWidth = slides[0].clientWidth;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === currentIndex);
            });
        }

        prevBtn.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });

        nextBtn.addEventListener("click", () => {
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
                updateSlider();
            }
        });

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                currentIndex = index;
                updateSlider();
            });
        });

        window.addEventListener("resize", () => {
            track.style.transition = "none";
            updateSlider();
            setTimeout(() => {
                track.style.transition = "transform 0.5s ease-in-out";
            }, 50);
        });

        updateSlider();
    }

    // ------------------------------
    // Section 04 실시간 신청자 현황
    // ------------------------------
    const tbody = document.getElementById("sec04-tbody");
    if (tbody) {

    const lastNames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권"];
    const givenNames = ["민", "서", "지", "하", "윤", "현", "주", "유", "정", "수", "연", "진", "은", "아", "호", "준"];
    const statusTexts = ["입금완료", "입금대기"];

    function pad2(n) {
        return String(n).padStart(2, "0");
    }

    function formatYYMMDD(d) {
        const yy = String(d.getFullYear()).slice(-2);
        return `${yy}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
    }

    function randomNameMasked() {
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        const g1 = givenNames[Math.floor(Math.random() * givenNames.length)];
        const g2 = givenNames[Math.floor(Math.random() * givenNames.length)];
        return `${ln}*${g2}`; // 시안처럼 3글자 느낌(김*연)
    }

    function pickStatus() {
        // 완료가 조금 더 많게(신뢰감) 설정
        return Math.random() < 0.78 ? statusTexts[0] : statusTexts[1];
    }

    function badgeClass(status) {
        return status === "입금완료" ? "complete" : "pending";
    }

    function makeRow({ dateText, nameText, progressText, statusText }, { isNew } = { isNew: false }) {
        const tr = document.createElement("tr");
        if (isNew) tr.classList.add("sec04-row-new");

        tr.innerHTML = `
          <td>${dateText}</td>
          <td>${nameText}</td>
          <td>${progressText}</td>
          <td><span class="status-badge ${badgeClass(statusText)}">${statusText}</span></td>
        `.trim();

        return tr;
    }

    const maxRows = 6;

    function seedInitialRows() {
        const now = new Date();
        const base = new Date(now);
        base.setDate(now.getDate() - 1);

        for (let i = 0; i < maxRows; i++) {
            const d = new Date(base);
            d.setDate(base.getDate() + (i % 2));

            tbody.appendChild(
                makeRow(
                    {
                        dateText: formatYYMMDD(d),
                        nameText: randomNameMasked(),
                        progressText: "신청완료",
                        statusText: pickStatus(),
                    },
                    { isNew: false }
                )
            );
        }
    }

    function pushRealtimeRow() {
        const now = new Date();
        const row = makeRow(
            {
                dateText: formatYYMMDD(now),
                nameText: randomNameMasked(),
                progressText: "신청완료",
                statusText: pickStatus(),
            },
            { isNew: true }
        );

        tbody.insertBefore(row, tbody.firstChild);

        while (tbody.children.length > maxRows) {
            tbody.removeChild(tbody.lastElementChild);
        }
    }

    seedInitialRows();

    const minDelay = 1600;
    const maxDelay = 3200;

    function scheduleNext() {
        const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
        window.setTimeout(() => {
            pushRealtimeRow();
            scheduleNext();
        }, delay);
    }

    scheduleNext();
    }

    // ------------------------------
    // Section 06 FAQ — CSS Grid(0fr/1fr) 패널 + 클래스 토글만 (WAAPI/높이 픽셀 계산 제거)
    // ------------------------------
    const FAQ_DEFAULT_ANSWER =
        "A. 전혀 다르지 않습니다! 인터넷 품질, A/S, 매월 납부하는 요금은 통신 3사(SK, KT, LG) 본사와 100% 동일합니다. 정직한 인터넷은 본사와 똑같은 상품에 '최대 현금 사은품'이라는 추가 혜택만 더 챙겨드리는 것입니다.";

    function ensureFaqPanelStructure(item) {
        let panel = item.querySelector(":scope > .faq-panel");
        let content = item.querySelector(".faq-content");

        if (!panel && content) {
            panel = document.createElement("div");
            panel.className = "faq-panel";
            content.replaceWith(panel);
            panel.appendChild(content);
        } else if (!panel && !content) {
            panel = document.createElement("div");
            panel.className = "faq-panel";
            content = document.createElement("div");
            content.className = "faq-content";
            content.innerHTML = '<p class="body-font-2 mg-left-100 main-color"></p>';
            panel.appendChild(content);
            item.appendChild(panel);
        } else if (panel && !content) {
            content = document.createElement("div");
            content.className = "faq-content";
            content.innerHTML = '<p class="body-font-2 mg-left-100 main-color"></p>';
            panel.appendChild(content);
        }

        return { panel: item.querySelector(":scope > .faq-panel"), content: item.querySelector(".faq-content") };
    }

    function syncFaqItemAccessibility(item, isOpen) {
        const title = item.querySelector(".faq-title");
        const panel = item.querySelector(":scope > .faq-panel");
        if (title) title.setAttribute("aria-expanded", isOpen ? "true" : "false");
        if (panel) panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
    }

    document.querySelectorAll(".faq-item").forEach((item) => {
        const title = item.querySelector(".faq-title");
        if (!title) return;

        const { content } = ensureFaqPanelStructure(item);
        const p = content?.querySelector("p");
        if (p && !p.innerHTML.trim()) {
            p.textContent = FAQ_DEFAULT_ANSWER;
        }

        if (!title.hasAttribute("role")) title.setAttribute("role", "button");
        if (!title.hasAttribute("tabindex")) title.setAttribute("tabindex", "0");

        syncFaqItemAccessibility(item, item.classList.contains("active"));

        function toggle() {
            const next = !item.classList.contains("active");
            item.classList.toggle("active", next);
            syncFaqItemAccessibility(item, next);
        }

        title.addEventListener("click", toggle);
        title.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle();
            }
        });
    });

    // ------------------------------
    // CTA 섹션: 전체 동의 ↔ 필수 약관 양방향 연동
    // ------------------------------
    const ctaForm = document.getElementById("cta-benefit-form");
    if (ctaForm) {
        const agreeAll = ctaForm.querySelector("#cta-agree-all");
        const requiredAgrees = [...ctaForm.querySelectorAll("[data-cta-required-agree]")];

        function syncAgreeAllFromRequired() {
            if (!agreeAll || requiredAgrees.length === 0) return;
            agreeAll.checked = requiredAgrees.every((cb) => cb.checked);
        }

        if (agreeAll && requiredAgrees.length) {
            agreeAll.addEventListener("change", () => {
                const on = agreeAll.checked;
                requiredAgrees.forEach((cb) => {
                    cb.checked = on;
                });
            });
            requiredAgrees.forEach((cb) => {
                cb.addEventListener("change", syncAgreeAllFromRequired);
            });
            syncAgreeAllFromRequired();
        }

        ctaForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // 백엔드 연동 전까지 기본 제출만 막음. 검증은 HTML5 required + 체크박스 required로 처리됨.
        });
    }
});




