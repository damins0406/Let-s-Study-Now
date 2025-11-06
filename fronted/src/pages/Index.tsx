import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, BookOpen, CheckSquare, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "오픈 스터디",
      description: "누구나 참여할 수 있는 실시간 스터디 방에서 함께 공부하세요",
      action: () => navigate("/open-study"),
      color: "bg-blue-500",
    },
    {
      icon: BookOpen,
      title: "그룹 스터디",
      description: "친구들과 그룹을 만들어 체계적으로 스터디를 진행하세요",
      action: () => navigate("/group-study"),
      color: "bg-green-500",
    },
    {
      icon: CheckSquare,
      title: "체크리스트",
      description: "학습 목표를 설정하고 달성률을 확인하세요",
      action: () => navigate("/checklist"),
      color: "bg-purple-500",
    },
    {
      icon: Clock,
      title: "프로필",
      description: "자신의 프로필을 설정해주세요.",
      action: () => navigate("/profile"),
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Let's Study Now!
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              혼자 공부하기 어려우신가요? 함께 공부하며 동기부여를 받아보세요!
            </p>
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => navigate("/register")}
                >
                  지금 시작하기
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => navigate("/login")}
                >
                  로그인
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg mb-4">안녕하세요, {user.username}님!</p>
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => navigate("/open-study")}
                >
                  스터디 시작하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            다양한 스터디 방식
          </h2>
          <p className="text-lg text-gray-600">
            자신에게 맞는 방식으로 효율적인 학습을 시작하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={feature.action}
              >
                <CardHeader className="text-center">
                  <div
                    className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                1,000+
              </div>
              <div className="text-gray-600">활성 사용자</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                5,000+
              </div>
              <div className="text-gray-600">완료된 스터디</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                10,000+
              </div>
              <div className="text-gray-600">학습 시간</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Let's Study Now! All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
