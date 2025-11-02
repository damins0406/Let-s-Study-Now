import React, { useState } from "react";

function FindPasswordPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email) {
      alert("이메일은 필수 입력 항목입니다.");
      return;
    }

    // TODO: Spring Boot API 연동 (POST /api/find-password)
    console.log("비밀번호 찾기 요청:", formData);
    alert("입력하신 이메일로 임시 비밀번호가 발송되었습니다.");
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>🔑 비밀번호 찾기</h1>
        <p style={styles.subtitle}>
          가입 시 등록한 이메일로 임시 비밀번호를 보내드립니다.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>


          <input
            type="email"
            name="email"
            placeholder="이메일 (필수)"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.submitBtn}>
            임시 비밀번호 발송
          </button>
        </form>

        <div style={styles.links}>
          <a href="/login" style={styles.link}>로그인 페이지로 돌아가기</a>
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
  box: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px 50px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "420px",
    textAlign: "center",
  },
  title: {
    marginBottom: "10px",
    color: "#3b82f6",
  },
  subtitle: {
    color: "#666",
    marginBottom: "25px",
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
  submitBtn: {
    marginTop: "20px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "12px 0",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  links: {
    marginTop: "20px",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "14px",
  },
};

export default FindPasswordPage;
