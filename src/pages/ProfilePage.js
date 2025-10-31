import React from "react";

function ProfilePage() {
  return (
    <div style={styles.container}>
      <h1>🧑‍💻 프로필 설정</h1>
      <p>프로필 사진, 자기소개, 공부 분야를 관리하세요.</p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "100px",
  },
};

export default ProfilePage;
