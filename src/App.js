import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage.js";
import TimerPage from "./pages/TimerPage.js";
import OpenStudyPage from "./pages/OpenStudyPage.js";
import GroupStudyPage from "./pages/GroupStudyPage.js";
import ChecklistPage from "./pages/ChecklistPage.js";
import ProfilePage from "./pages/ProfilePage.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/timer" element={<TimerPage />} />
        <Route path="/open-study" element={<OpenStudyPage />} />
        <Route path="/group-study" element={<GroupStudyPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
