import React from "react";

function ChecklistPage() {
  return (
    <div style={styles.container}>
      <h1>📋 체크리스트</h1>
      <p>오늘의 목표를 설정하고 진행 상황을 확인하세요.</p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "100px",
  },
};

export default ChecklistPage;
