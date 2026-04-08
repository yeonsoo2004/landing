document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".slider-track");
    const slides = document.querySelectorAll(".slide");
    const prevBtn = document.querySelector(".arrow-prev");
    const nextBtn = document.querySelector(".arrow-next");
    const dots = document.querySelectorAll(".dot");

    let currentIndex = 0;
    const totalSlides = slides.length;

    // 슬라이더 이동 및 상태 업데이트 함수
    function updateSlider() {
        // 반응형 구조이므로, 현재 화면에서 슬라이드 1개가 차지하는 실제 너비를 계산합니다.
        const slideWidth = slides[0].clientWidth;

        // 트랙(track)을 현재 인덱스 위치에 맞게 가로로 이동시킵니다.
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        // 하단 닷(dot)의 활성화 디자인(색상)을 업데이트합니다.
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    // 이전 화살표 버튼 클릭 이벤트
    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

    // 다음 화살표 버튼 클릭 이벤트
    nextBtn.addEventListener("click", () => {
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
            updateSlider();
        }
    });

    // 하단 닷(dot) 클릭 이벤트 (원하는 슬라이드로 바로 이동)
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            currentIndex = index;
            updateSlider();
        });
    });

    // 화면 크기가 변할 때(리사이즈) 슬라이드 위치가 어긋나지 않도록 재계산
    window.addEventListener("resize", () => {
        // 크기 조절 시 애니메이션이 들어가면 버벅일 수 있으므로 잠시 끕니다.
        track.style.transition = 'none';
        updateSlider();
        
        // 크기 조절이 끝난 직후 부드러운 애니메이션을 다시 켭니다.
        setTimeout(() => {
            track.style.transition = 'transform 0.5s ease-in-out';
        }, 50);
    });

    // 페이지가 처음 로드되었을 때 위치 초기화
    updateSlider();
});