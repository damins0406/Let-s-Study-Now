import React from "react";

function TimerPage() {
  return (
    <div style={styles.container}>
      <h1>🧠 집중 타이머</h1>
      <p>여기서 공부 / 휴식 타이머를 설정할 수 있습니다.</p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "100px",
  },
};

export default TimerPage;
