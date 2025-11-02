import React, { useState } from "react";

function SignUpPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    age: "",
    studyField: "",
    introduction: "",
    profileImage: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 필수 항목 검증
    if (!formData.username || !formData.password || !formData.email || !formData.age) {
      alert("필수 입력 항목을 모두 입력해주세요.");
      return;
    }

    // 백엔드(Spring) 연동 시 이 부분에서 formData 전송
    console.log("회원가입 요청 데이터:", formData);
    alert("회원가입이 완료되었습니다 🎉");
  };

  return (
    <div style={styles.container}>
      <div style={styles.signupBox}>
        <h1 style={styles.title}>📝 회원가입</h1>
        <p style={styles.subtitle}>Let's Study Now에 오신 걸 환영합니다!</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* 아이디 */}
          <input
            type="text"
            name="username"
            placeholder="아이디 (필수)"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {/* 비밀번호 */}
          <input
            type="password"
            name="password"
            placeholder="비밀번호 (필수)"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {/* 이메일 */}
          <input
            type="email"
            name="email"
            placeholder="이메일 (필수)"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {/* 나이 */}
          <input
            type="number"
            name="age"
            placeholder="나이 (필수)"
            value={formData.age}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {/* 프로필 사진 */}
          <label style={styles.label}>프로필 사진 (선택)</label>
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={handleChange}
            style={styles.fileInput}
          />

          {/* 공부 분야 */}
          <label style={styles.label}>공부 분야 (선택)</label>
          <select
            name="studyField"
            value={formData.studyField}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="">선택 안 함</option>
            <option value="programming">프로그래밍</option>
            <option value="design">디자인</option>
            <option value="language">언어 공부</option>
            <option value="exam">시험 준비</option>
            <option value="etc">기타</option>
          </select>

          {/* 자기소개 */}
          <label style={styles.label}>자기소개 (선택)</label>
          <textarea
            name="introduction"
            placeholder="자신을 간단히 소개해주세요."
            value={formData.introduction}
            onChange={handleChange}
            style={styles.textarea}
          />

          {/* 회원가입 버튼 */}
          <button type="submit" style={styles.submitBtn}>
            가입하기
          </button>
        </form>

        <div style={styles.links}>
          <a href="/login" style={styles.link}>
            이미 계정이 있으신가요? 로그인하기
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
  signupBox: {
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
  label: {
    textAlign: "left",
    color: "#444",
    fontWeight: "500",
    marginTop: "10px",
  },
  fileInput: {
    padding: "8px 0",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  textarea: {
    height: "80px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    resize: "none",
    fontFamily: "inherit",
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

export default SignUpPage;
