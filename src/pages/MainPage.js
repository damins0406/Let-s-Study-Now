import React from "react";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* 상단 네비게이션 */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>🚀 Let's Study Now</div>
        <ul style={styles.navLinks}>
          <li onClick={() => navigate("/")}>홈</li>
          <li onClick={() => navigate("/open-study")}>오픈 스터디방</li>
          <li onClick={() => navigate("/group-study")}>그룹 스터디방</li>
          <li onClick={() => navigate("/checklist")}>체크리스트</li>
          <li onClick={() => navigate("/profile")}>프로필</li>
        </ul>
        <button style={styles.loginBtn} onClick={() => navigate("/login")}>
          로그인
        </button>
      </nav>

      {/* 메인 소개 배너 */}
      <header style={styles.header}>
        <h1>Let's Study Now 📚</h1>
        <p style={styles.subtitle}>
          혼자서도, 함께서도 꾸준히 성장할 수 있는 스마트 스터디 플랫폼!
        </p>
        <p>
          집중 타이머로 생산성을 높이고, 스터디방과 그룹을 통해 함께 공부하며,
          <br />
          목표를 체크리스트로 관리하세요.
        </p>
        <button style={styles.startBtn} onClick={() => navigate("/open-study")}>
          지금 시작하기
        </button>
      </header>

      {/* 주요 기능 카드 */}
      <section style={styles.cardSection}>
        <div style={styles.card}>
          <h3>👥 오픈 스터디방</h3>
          <p>현재 열려 있는 공용 스터디룸에 언제든지 자유롭게 입장하세요.</p>
          <button style={styles.cardBtn} onClick={() => navigate("/open-study")}>
            참여하기
          </button>
        </div>

        <div style={styles.card}>
          <h3>💬 그룹 스터디방</h3>
          <p>
            같은 공부 시간을 설정한 사용자들끼리 자동으로 매칭되어 공부를
            시작할 수 있어요.
          </p>
          <button style={styles.cardBtn} onClick={() => navigate("/group-study")}>
            그룹 만들기
          </button>
        </div>

        <div style={styles.card}>
          <h3>📋 체크리스트</h3>
          <p>오늘의 학습 목표를 설정하고 달성 여부를 관리하세요.</p>
          <button style={styles.cardBtn} onClick={() => navigate("/checklist")}>
            관리하기
          </button>
        </div>

        <div style={styles.card}>
          <h3>🧑‍💻 프로필 설정</h3>
          <p>자기소개, 관심 분야, 프로필 사진을 수정하세요.</p>
          <button style={styles.cardBtn} onClick={() => navigate("/profile")}>
            프로필 보기
          </button>
        </div>
      </section>

      {/* 서비스 소개 섹션 */}
      <section style={styles.aboutSection}>
        <h2>서비스 소개 🌟</h2>
        <p>
          <strong>Let's Study Now</strong>는 혼자 공부하기 어려운 사람들을 위한
          협업형 학습 플랫폼입니다.  
          집중 타이머, 스터디 그룹, 체크리스트 등 다양한 기능으로
          사용자의 학습 효율을 극대화합니다.
        </p>
        <p>
          오픈 스터디를 통해 함께 공부하는 사람들의 에너지를 느끼며 나만의 속도로 공부에 몰입하고,
          그룹 스터디로 꾸준한 학습 습관을 만들어보세요.
        </p>
      </section>

      {/* 푸터 */}
      <footer style={styles.footer}>
        <p>© 2025 Let's Study Now | 함께 성장하는 스터디 플랫폼</p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Noto Sans KR', sans-serif",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 60px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  logo: {
    fontSize: "22px",
    fontWeight: "bold",
  },
  navLinks: {
    listStyle: "none",
    display: "flex",
    gap: "25px",
    fontWeight: "500",
    cursor: "pointer",
  },
  loginBtn: {
    background: "#fff",
    color: "#3b82f6",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  header: {
    textAlign: "center",
    padding: "100px 20px 80px",
    background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
    color: "#fff",
  },
  subtitle: {
    fontSize: "18px",
    marginBottom: "10px",
  },
  startBtn: {
    background: "#fff",
    color: "#3b82f6",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: "bold",
    marginTop: "25px",
    cursor: "pointer",
    transition: "0.3s",
  },
  cardSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    padding: "60px 80px",
  },
  card: {
    background: "#fff",
    borderRadius: "15px",
    padding: "25px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardBtn: {
    marginTop: "15px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.3s",
  },
  aboutSection: {
    backgroundColor: "#e7f0ff",
    padding: "60px 80px",
    textAlign: "center",
    lineHeight: 1.8,
  },
  footer: {
    textAlign: "center",
    backgroundColor: "#f1f3f5",
    padding: "20px",
    color: "#555",
    marginTop: "auto",
  },
};

export default MainPage;
