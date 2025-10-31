import React from "react";

function OpenStudyPage() {
  return (
    <div style={styles.container}>
      <h1>👥 오픈 스터디방</h1>
      <p>누구나 참여할 수 있는 공개 스터디방 목록입니다.</p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "100px",
  },
};

export default OpenStudyPage;
