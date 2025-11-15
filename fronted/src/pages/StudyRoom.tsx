import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { openStudyAPI, studyRoomAPI } from "@/lib/api";
import {
  Users,
  Clock,
  Send,
  Paperclip,
  Image as ImageIcon,
  Download,
  LogOut,
  Play,
  Pause,
  Square,
  Copy,
  QrCode,
  TrendingUp,
} from "lucide-react";

interface Participant {
  id: string;
  username: string;
  profileImage?: string;
  level: number;
  title: string;
  status: "studying" | "resting" | "away";
  statusMessage: string;
  statusDuration: number; // 현재 상태 지속 시간 (초)
  totalTime: number; // 총 참여 시간 (초)
}

interface ChatMessage {
  id: string;
  type: "text" | "image" | "file" | "system";
  sender?: string;
  content: string;
  imageUrl?: string;
  fileName?: string;
  fileSize?: number;
  timestamp: Date;
}

const StudyRoom: React.FC = () => {
  const { user } = useAuth();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasJoinedRef = useRef(false); // ✅ 중복 참여 방지

  // Room Info
  const [roomInfo, setRoomInfo] = useState({
    title: "알고리즘 마스터 스터디",
    studyField: "프로그래밍",
    currentParticipants: 3,
    maxParticipants: 6,
    remainingTime: 7530, // 초 단위 (2시간 5분 30초)
    createdBy: "", // ✅ 방장 ID
    creatorUsername: "", // ✅ 방장 닉네임
  });

  // Participants
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      username: "김철수",
      level: 5,
      title: "🎯 스터디 마스터",
      status: "studying",
      statusMessage: "알고리즘 문제 풀이 중...",
      statusDuration: 1500, // 25분
      totalTime: 5025, // 1시간 23분 45초
    },
    {
      id: "2",
      username: "이영희",
      level: 3,
      title: "⭐ 꾸준한 도전자",
      status: "resting",
      statusMessage: "잠깐 쉬는 중",
      statusDuration: 300, // 5분
      totalTime: 7893, // 2시간 11분 33초
    },
    {
      id: "3",
      username: "박민수",
      level: 2,
      title: "📚 열정 학습자",
      status: "studying",
      statusMessage: "화이팅!",
      statusDuration: 900, // 15분
      totalTime: 3245, // 54분 5초
    },
  ]);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "system",
      content: "김철수님이 입장했습니다.",
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: "2",
      type: "text",
      sender: "김철수",
      content: "안녕하세요! 오늘도 화이팅해요!",
      timestamp: new Date(Date.now() - 7100000),
    },
    {
      id: "3",
      type: "system",
      content: "이영희님이 입장했습니다.",
      timestamp: new Date(Date.now() - 7000000),
    },
  ]);
  const [messageInput, setMessageInput] = useState("");

  // My Status
  const [myStatus, setMyStatus] = useState<"studying" | "resting">("studying");
  const [myStatusMessage, setMyStatusMessage] = useState("");

  // Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [restMinutes, setRestMinutes] = useState(5);
  const [currentTimerType, setCurrentTimerType] = useState<"study" | "rest">(
    "study"
  );
  const [timerSeconds, setTimerSeconds] = useState(studyMinutes * 60);

  // Today's Stats
  const [todayStats, setTodayStats] = useState({
    totalStudyTime: 9240, // 2시간 34분
    studySessions: 4,
    restSessions: 3,
  });

  // Dialogs
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  // 시간 포맷 함수
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 채팅 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ 방 입장 처리
  useEffect(() => {
    if (!user || !roomId || hasJoinedRef.current) return;

    const joinRoom = async () => {
      try {
        // TODO: 실제 API 호출로 방 정보 로드 및 참여 처리
        // await studyRoomAPI.getRoom(roomId);
        hasJoinedRef.current = true;
        console.log("Joined room:", roomId);
      } catch (error) {
        console.error("Failed to join room:", error);
        navigate("/open-study");
      }
    };

    joinRoom();
  }, [user, roomId, navigate]);

  // ✅ 브라우저 뒤로가기/새로고침/닫기 시 방 나가기
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (roomId && hasJoinedRef.current) {
        // 동기적으로 방 나가기 요청 (sendBeacon 사용)
        const baseURL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const url = `${baseURL}/api/open-study/rooms/${roomId}/leave`;

        // sendBeacon은 페이지를 떠날 때도 요청을 보장
        // credentials 포함을 위해 fetch keepalive 사용
        fetch(url, {
          method: "POST",
          credentials: "include",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }).catch((err) => console.error("Failed to leave room:", err));
      }
    };

    const handlePopState = async () => {
      // 뒤로가기 감지
      if (roomId && hasJoinedRef.current) {
        try {
          await leaveRoom();
        } catch (error) {
          console.error("Failed to leave room on back:", error);
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);

      // 컴포넌트 언마운트 시 방 나가기
      if (roomId && hasJoinedRef.current) {
        leaveRoom();
      }
    };
  }, [roomId]);

  // ✅ 방 나가기 함수
  const leaveRoom = async () => {
    if (!roomId) return;

    try {
      // ✅ 실제 API 호출 (오픈 스터디)
      await openStudyAPI.leaveRoom(roomId);

      // ✅ 로컬 스토리지 초기화
      localStorage.removeItem("currentStudyRoom");

      hasJoinedRef.current = false;
      console.log("Left room:", roomId);
    } catch (error) {
      console.error("Failed to leave room:", error);

      // 그룹 스터디인 경우도 시도
      try {
        await studyRoomAPI.leaveRoom(roomId);
        localStorage.removeItem("currentStudyRoom");
        hasJoinedRef.current = false;
      } catch (groupError) {
        console.error("Failed to leave group room:", groupError);
      }
    }
  };

  // ✅ 방 삭제 함수 (방장 전용)
  const deleteRoom = async () => {
    if (!roomId) return;

    try {
      // ✅ 오픈 스터디 방 삭제 시도
      try {
        await openStudyAPI.deleteRoom(roomId);
        console.log("Open study room deleted:", roomId);

        toast({
          title: "방 삭제 완료",
          description: "스터디 방이 삭제되었습니다.",
        });
        return;
      } catch (openError) {
        // 오픈 스터디 방이 아니면 그룹 스터디 시도
        console.log("Not an open study room, trying group room...");
      }

      // ✅ 그룹 스터디 방 삭제 시도
      await studyRoomAPI.deleteRoom(roomId);
      console.log("Group study room deleted:", roomId);

      toast({
        title: "방 삭제 완료",
        description: "스터디 방이 삭제되었습니다.",
      });
    } catch (error: any) {
      console.error("Failed to delete room:", error);
      toast({
        title: "오류",
        description: error?.message || "방 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 타이머 로직
  useEffect(() => {
    if (timerRunning && !timerPaused) {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            // 타이머 종료
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timerRunning, timerPaused]);

  // 타이머 완료 처리
  const handleTimerComplete = () => {
    const newType = currentTimerType === "study" ? "rest" : "study";
    const newSeconds =
      newType === "study" ? studyMinutes * 60 : restMinutes * 60;

    setCurrentTimerType(newType);
    setTimerSeconds(newSeconds);

    // 경험치 보너스 +10
    toast({
      title: "🎉 타이머 완료!",
      description: `${
        currentTimerType === "study" ? "공부" : "휴식"
      } 세션 완료! +10 경험치`,
    });

    // 통계 업데이트
    if (currentTimerType === "study") {
      setTodayStats((prev) => ({
        ...prev,
        studySessions: prev.studySessions + 1,
        totalStudyTime: prev.totalStudyTime + studyMinutes * 60,
      }));
    } else {
      setTodayStats((prev) => ({
        ...prev,
        restSessions: prev.restSessions + 1,
      }));
    }

    // 시스템 메시지 추가
    addSystemMessage(
      `타이머가 ${currentTimerType === "study" ? "공부" : "휴식"} 세션에서 ${
        newType === "study" ? "공부" : "휴식"
      } 세션으로 자동 전환되었습니다.`
    );
  };

  // 타이머 시작
  const handleTimerStart = () => {
    if (!timerRunning) {
      setTimerSeconds(
        currentTimerType === "study" ? studyMinutes * 60 : restMinutes * 60
      );
    }
    setTimerRunning(true);
    setTimerPaused(false);
  };

  // 타이머 일시정지
  const handleTimerPause = () => {
    setTimerPaused(true);
  };

  // 타이머 중지
  const handleTimerStop = () => {
    setTimerRunning(false);
    setTimerPaused(false);
    setTimerSeconds(
      currentTimerType === "study" ? studyMinutes * 60 : restMinutes * 60
    );
  };

  // 상태 전환
  const handleStatusToggle = (newStatus: "studying" | "resting") => {
    setMyStatus(newStatus);
    addSystemMessage(
      `${user?.username}님이 ${
        newStatus === "studying" ? "공부" : "휴식"
      } 모드로 전환했습니다.`
    );
  };

  // 상태 메시지 업데이트
  const handleStatusMessageUpdate = () => {
    if (myStatusMessage.trim()) {
      toast({
        title: "상태 메시지 업데이트",
        description: "상태 메시지가 변경되었습니다.",
      });
    }
  };

  // 메시지 전송
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "text",
      sender: user?.username || "익명",
      content: messageInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
  };

  // 시스템 메시지 추가
  const addSystemMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "system",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // 이미지 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "오류",
        description: "이미지 크기는 10MB를 초과할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    // TODO: 실제로는 서버에 업로드하고 URL을 받아야 함
    const imageUrl = URL.createObjectURL(file);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "image",
      sender: user?.username || "익명",
      content: "",
      imageUrl,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  // 파일 업로드
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "오류",
        description: "파일 크기는 50MB를 초과할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "file",
      sender: user?.username || "익명",
      content: "",
      fileName: file.name,
      fileSize: file.size,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  // 초대 링크 복사
  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/#/room/${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "초대 링크 복사 완료",
      description: "초대 링크가 클립보드에 복사되었습니다.",
    });
  };

  // 방 나가기
  const handleExitRoom = async () => {
    if (!roomId) return;

    // ✅ 방장 확인 (createdBy 또는 creatorUsername으로 확인)
    const isCreator =
      user &&
      (roomInfo.createdBy === user.id ||
        roomInfo.creatorUsername === user.username);

    if (isCreator) {
      const confirmDelete = confirm(
        "방장이 나가면 방이 삭제됩니다.\n정말로 방을 나가시겠습니까?"
      );

      if (!confirmDelete) {
        return;
      }

      // 방장이 나가면 방 삭제 시도
      await deleteRoom();
    }

    await leaveRoom();
    navigate("/open-study");
  };

  // 상태별 색상
  const getStatusColor = (status: "studying" | "resting" | "away") => {
    switch (status) {
      case "studying":
        return "bg-green-500";
      case "resting":
        return "bg-orange-500";
      case "away":
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: "studying" | "resting" | "away") => {
    switch (status) {
      case "studying":
        return "공부중";
      case "resting":
        return "휴식중";
      case "away":
        return "자리비움";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">{roomInfo.title}</h1>
          <Badge variant="secondary">{roomInfo.studyField}</Badge>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-medium">
              {formatTime(roomInfo.remainingTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span className="font-medium">
              {roomInfo.currentParticipants}/{roomInfo.maxParticipants}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInviteDialogOpen(true)}
          >
            <Users className="w-4 h-4 mr-2" />
            초대
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExitDialogOpen(true)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            나가기
          </Button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 채팅 영역 */}
        <div className="flex-1 flex flex-col">
          {/* 채팅 메시지 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === "system" ? (
                  <div className="text-center text-sm text-gray-500 py-2">
                    {message.content}
                  </div>
                ) : (
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.sender?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.sender}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {message.type === "text" && (
                        <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                          <p className="text-gray-900">{message.content}</p>
                        </div>
                      )}

                      {message.type === "image" && (
                        <div className="bg-white rounded-lg p-2 shadow-sm">
                          <img
                            src={message.imageUrl}
                            alt="uploaded"
                            className="max-w-xs rounded cursor-pointer hover:opacity-90"
                            onClick={() => window.open(message.imageUrl)}
                          />
                        </div>
                      )}

                      {message.type === "file" && (
                        <div className="bg-white rounded-lg px-4 py-3 shadow-sm flex items-center justify-between max-w-md">
                          <div className="flex items-center space-x-3">
                            <Paperclip className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {message.fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(
                                  (message.fileSize || 0) /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* 채팅 입력 */}
          <div className="border-t bg-white p-4">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                onChange={handleFileUpload}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                id="image-upload"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Input
                placeholder="메시지를 입력하세요..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 나의 컨트롤 패널 */}
          <div className="border-t bg-gray-50 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">나의 컨트롤</h3>

            {/* 상태 토글 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant={myStatus === "studying" ? "default" : "outline"}
                className={
                  myStatus === "studying"
                    ? "bg-green-500 hover:bg-green-600"
                    : ""
                }
                onClick={() => handleStatusToggle("studying")}
              >
                🟢 공부중
              </Button>
              <Button
                variant={myStatus === "resting" ? "default" : "outline"}
                className={
                  myStatus === "resting"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }
                onClick={() => handleStatusToggle("resting")}
              >
                🟡 휴식중
              </Button>
            </div>

            {/* 상태 메시지 */}
            <div className="mb-4">
              <Label className="text-sm text-gray-600 mb-2">상태 메시지</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="상태 메시지 (최대 50자)"
                  value={myStatusMessage}
                  onChange={(e) =>
                    setMyStatusMessage(e.target.value.slice(0, 50))
                  }
                  maxLength={50}
                />
                <Button onClick={handleStatusMessageUpdate}>적용</Button>
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">
                {myStatusMessage.length}/50
              </p>
            </div>

            {/* 타이머 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  학습 타이머
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">공부 시간</Label>
                    <select
                      className="w-full p-2 border rounded mt-1"
                      value={studyMinutes}
                      onChange={(e) => setStudyMinutes(Number(e.target.value))}
                      disabled={timerRunning}
                    >
                      <option value={10}>10분</option>
                      <option value={25}>25분</option>
                      <option value={50}>50분</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">휴식 시간</Label>
                    <select
                      className="w-full p-2 border rounded mt-1"
                      value={restMinutes}
                      onChange={(e) => setRestMinutes(Number(e.target.value))}
                      disabled={timerRunning}
                    >
                      <option value={5}>5분</option>
                      <option value={10}>10분</option>
                      <option value={15}>15분</option>
                    </select>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {currentTimerType === "study" ? "공부 중" : "휴식 중"}
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {formatTime(timerSeconds)}
                  </p>
                </div>

                <div className="flex space-x-2">
                  {!timerRunning || timerPaused ? (
                    <Button className="flex-1" onClick={handleTimerStart}>
                      <Play className="w-4 h-4 mr-2" />
                      {timerRunning ? "재개" : "시작"}
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={handleTimerPause}
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      일시정지
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleTimerStop}
                    disabled={!timerRunning}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    중지
                  </Button>
                </div>

                {/* 오늘의 학습 기록 */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      📊 오늘의 학습 기록
                    </span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>총 학습 시간:</span>
                      <span className="font-medium">
                        {formatTime(todayStats.totalStudyTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>공부 세션:</span>
                      <span className="font-medium">
                        {todayStats.studySessions}회
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>휴식 세션:</span>
                      <span className="font-medium">
                        {todayStats.restSessions}회
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 참여자 목록 */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900 flex items-center justify-between">
              <span>
                👥 참여자 ({participants.length}/{roomInfo.maxParticipants})
              </span>
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {participants.map((participant) => (
              <Card key={participant.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarImage src={participant.profileImage} />
                      <AvatarFallback>
                        {participant.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-purple-600">
                          {participant.title}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 truncate">
                        {participant.username}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(
                            participant.status
                          )}`}
                        />
                        <span className="text-sm text-gray-600">
                          {getStatusText(participant.status)} (
                          {formatTime(participant.statusDuration)})
                        </span>
                      </div>
                      {participant.statusMessage && (
                        <p className="text-sm text-gray-500 mt-1 italic truncate">
                          "{participant.statusMessage}"
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(participant.totalTime)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* 초대 다이얼로그 */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 친구 초대하기</DialogTitle>
            <DialogDescription>
              친구들을 초대하여 함께 공부하세요!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2">초대 링크</Label>
              <div className="flex space-x-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/#/room/${roomId}`}
                  className="flex-1"
                />
                <Button onClick={handleCopyInviteLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-center">
              <Label className="text-sm font-medium mb-2">QR 코드</Label>
              <div className="flex justify-center mt-2">
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-gray-400" />
                  <p className="text-xs text-gray-500 mt-2">
                    QR 코드 생성 예정
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 나가기 확인 다이얼로그 */}
      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>스터디룸 나가기</DialogTitle>
            <DialogDescription>
              정말로 스터디룸을 나가시겠습니까?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setExitDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleExitRoom}>
              나가기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyRoom;
