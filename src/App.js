import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage.js";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import FindPasswordPage from "./pages/FindPasswordPage";
import OpenStudyPage from "./pages/OpenStudyPage.js";
import GroupStudyPage from "./pages/GroupStudyPage.js";
import ChecklistPage from "./pages/ChecklistPage.js";
import ProfilePage from "./pages/ProfilePage.js";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/find-password" element={<FindPasswordPage />} />
        <Route path="/open-study" element={<OpenStudyPage />} />
        <Route path="/group-study" element={<GroupStudyPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
