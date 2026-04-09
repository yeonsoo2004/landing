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
    // Section 06 FAQ 토글 (slide down/up)
    // ------------------------------
    const FAQ_ANSWER =
        "A. 전혀 다르지 않습니다! 인터넷 품질, A/S, 매월 납부하는 요금은 통신 3사(SK, KT, LG) 본사와 100% 동일합니다. 정직한 인터넷은 본사와 똑같은 상품에 '최대 현금 사은품'이라는 추가 혜택만 더 챙겨드리는 것입니다.";

    const faqItems = document.querySelectorAll(".faq-item");
    const runningFaqAnims = new WeakMap();
    faqItems.forEach((item) => {
        const title = item.querySelector(".faq-title");
        if (!title) return;

        // 답변 영역이 없으면 생성(HTML은 최대한 유지하되, 없는 항목은 JS로만 보강)
        let content = item.querySelector(".faq-content");
        if (!content) {
            content = document.createElement("div");
            content.className = "faq-content";
            content.innerHTML = `<p class="body-font-2 mg-left-100 main-color">${FAQ_ANSWER}</p>`;
            item.appendChild(content);
        } else {
            const p = content.querySelector("p");
            if (p) p.textContent = FAQ_ANSWER;
            else content.textContent = FAQ_ANSWER;
        }

        // 접근성 속성(필수는 아니지만 안전)
        title.setAttribute("role", "button");
        title.setAttribute("tabindex", "0");
        title.setAttribute("aria-expanded", item.classList.contains("active") ? "true" : "false");

        function getFaqVars() {
            const section = item.closest(".section06") || document.documentElement;
            const styles = getComputedStyle(section);
            const num = (name) => parseFloat(styles.getPropertyValue(name)) || 0;
            return {
                pt: num("--faq-answer-pt"),
                pr: num("--faq-answer-pr"),
                pb: num("--faq-answer-pb"),
                pl: num("--faq-answer-pl"),
            };
        }

        function cancelRunning() {
            const anim = runningFaqAnims.get(content);
            if (anim) anim.cancel();
            runningFaqAnims.delete(content);
        }

        function setClosedStyles() {
            content.style.height = "0px";
            content.style.paddingTop = "0px";
            content.style.paddingRight = "0px";
            content.style.paddingBottom = "0px";
            content.style.paddingLeft = "0px";
            content.style.opacity = "0";
        }

        function setOpenStyles() {
            const { pt, pr, pb, pl } = getFaqVars();
            content.style.height = "auto";
            content.style.paddingTop = `${pt}px`;
            content.style.paddingRight = `${pr}px`;
            content.style.paddingBottom = `${pb}px`;
            content.style.paddingLeft = `${pl}px`;
            content.style.opacity = "1";
        }

        function openItem() {
            if (item.classList.contains("active")) return;
            cancelRunning();

            const { pt, pr, pb, pl } = getFaqVars();
            item.classList.add("active");
            title.setAttribute("aria-expanded", "true");

            // 시작 상태
            setClosedStyles();
            // 목표 높이 계산을 위해 목표 패딩을 먼저 넣고 scrollHeight 측정
            content.style.paddingTop = `${pt}px`;
            content.style.paddingRight = `${pr}px`;
            content.style.paddingBottom = `${pb}px`;
            content.style.paddingLeft = `${pl}px`;
            content.style.height = "auto";
            const targetHeight = content.scrollHeight;

            // 다시 시작 상태로 되돌린 후 애니메이션
            content.style.height = "0px";
            content.style.paddingTop = "0px";
            content.style.paddingRight = "0px";
            content.style.paddingBottom = "0px";
            content.style.paddingLeft = "0px";
            content.style.opacity = "0";

            const anim = content.animate(
                [
                    { height: "0px", paddingTop: "0px", paddingRight: "0px", paddingBottom: "0px", paddingLeft: "0px", opacity: 0 },
                    { height: `${targetHeight}px`, paddingTop: `${pt}px`, paddingRight: `${pr}px`, paddingBottom: `${pb}px`, paddingLeft: `${pl}px`, opacity: 1 },
                ],
                { duration: 360, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" }
            );
            runningFaqAnims.set(content, anim);
            anim.onfinish = () => {
                runningFaqAnims.delete(content);
                setOpenStyles();
            };
        }

        function closeItem() {
            if (!item.classList.contains("active")) return;
            cancelRunning();

            const { pt, pr, pb, pl } = getFaqVars();
            // 현재 렌더링 높이에서 0으로
            const currentHeight = content.getBoundingClientRect().height;

            const anim = content.animate(
                [
                    { height: `${currentHeight}px`, paddingTop: `${pt}px`, paddingRight: `${pr}px`, paddingBottom: `${pb}px`, paddingLeft: `${pl}px`, opacity: 1 },
                    { height: "0px", paddingTop: "0px", paddingRight: "0px", paddingBottom: "0px", paddingLeft: "0px", opacity: 0 },
                ],
                { duration: 300, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" }
            );
            runningFaqAnims.set(content, anim);
            anim.onfinish = () => {
                runningFaqAnims.delete(content);
                item.classList.remove("active");
                title.setAttribute("aria-expanded", "false");
                setClosedStyles();
            };
        }

        // 초기 상태 정리
        if (item.classList.contains("active")) {
            title.setAttribute("aria-expanded", "true");
            setOpenStyles();
        } else {
            title.setAttribute("aria-expanded", "false");
            setClosedStyles();
        }

        function toggle(open) {
            const shouldOpen = typeof open === "boolean" ? open : !item.classList.contains("active");
            if (shouldOpen) openItem();
            else closeItem();
        }

        title.addEventListener("click", () => toggle());
        title.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle();
            }
        });
    });

    // 리사이즈 시 열린 FAQ는 높이/패딩 재정렬
    window.addEventListener("resize", () => {
        document.querySelectorAll(".faq-item.active .faq-content").forEach((c) => {
            // 애니메이션 중이면 취소하고, 열린 상태로 재적용
            const anim = runningFaqAnims.get(c);
            if (anim) anim.cancel();
            runningFaqAnims.delete(c);
            c.style.height = "auto";
        });
    });
});




