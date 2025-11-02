import React, { useState } from "react";

function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Spring API 연동 예정 (예: POST /api/login)
    console.log("로그인 요청:", formData);
    alert(`환영합니다, ${formData.username}님!`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>🔐 Let's Study Now</h1>
        <p style={styles.subtitle}>계정에 로그인하여 스터디를 시작하세요.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="username"
            placeholder="아이디"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.loginBtn}>
            로그인
          </button>
        </form>

        <div style={styles.links}>
          <a href="/signup" style={styles.link}>
            회원가입
          </a>
          <span style={styles.divider}>|</span>
          <a href="/find-password" style={styles.link}>
            비밀번호 찾기
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loginBox: {
    background: "#fff",
    borderRadius: "16px",
    padding: "50px 40px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "380px",
  },
  title: {
    marginBottom: "10px",
    color: "#3b82f6",
  },
  subtitle: {
    marginBottom: "30px",
    color: "#666",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  loginBtn: {
    marginTop: "10px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "12px 0",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  links: {
    marginTop: "20px",
    color: "#666",
    fontSize: "14px",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
  },
  divider: {
    margin: "0 8px",
    color: "#aaa",
  },
};

export default LoginPage;