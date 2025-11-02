import React, { useEffect, useState } from "react";

function MyPage() {
  // 로그인된 사용자 정보 (예시: 로그인 시 localStorage에 저장된 정보 사용)
  const [user, setUser] = useState({
    username: "",
    email: "",
    age: "",
    bio: "",
    studyField: "",
    profileImage: "",
  });

  useEffect(() => {
    // 로그인 시 저장된 사용자 정보 불러오기 (예: localStorage)
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
    } else {
      // 로그인 안 돼있으면 로그인 페이지로 리다이렉트
      window.location.href = "/login";
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img
          src={
            user.profileImage ||
            "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"
          }
          alt="프로필"
          style={styles.profileImage}
        />
        <h2 style={styles.username}>{user.username || "사용자"}</h2>
        <p style={styles.email}>{user.email}</p>

        <div style={styles.infoBox}>
          <p><strong>나이:</strong> {user.age || "미입력"}</p>
          <p><strong>공부 분야:</strong> {user.studyField || "미입력"}</p>
          <p><strong>자기소개:</strong></p>
          <p style={{ whiteSpace: "pre-line" }}>{user.bio || "소개가 없습니다."}</p>
        </div>

        <button
          style={styles.settingBtn}
          onClick={() => (window.location.href = "/account-settings")}
        >
          ⚙️ 계정 설정
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #2563eb, #1e3a8a)", // 파란 배경
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
  },
  card: {
    width: "420px",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: "16px",
    boxShadow: "0 4px 25px rgba(0,0,0,0.15)",
    padding: "35px 40px",
    textAlign: "center",
  },
  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #2563eb",
    marginBottom: "15px",
  },
  username: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: "5px",
  },
  email: {
    color: "#4b5563",
    marginBottom: "20px",
  },
  infoBox: {
    textAlign: "left",
    backgroundColor: "#f9fafb",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
  },
  settingBtn: {
    width: "100%",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default MyPage;
