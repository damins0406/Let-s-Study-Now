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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { openStudyAPI, OpenStudyRoom } from "@/lib/api";
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
  Copy,
  TrendingUp,
  BookOpen,
  Coffee,
  HelpCircle,
  MessageCircle,
  X,
  CheckCircle,
} from "lucide-react";

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

interface Participant {
  id: string;
  username: string;
  status: "studying" | "resting";
  isCreator: boolean;
}

interface HelpRequest {
  id: string;
  requester: string;
  question: string;
  imageUrl?: string;
  fileName?: string;
  timestamp: Date;
  status: "open" | "helping" | "resolved";
  helper?: string;
  answers: HelpAnswer[];
}

interface HelpAnswer {
  id: string;
  answerer: string;
  content: string;
  timestamp: Date;
}

const OpenStudyRoomPage: React.FC = () => {
  const { user } = useAuth();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const helpFileInputRef = useRef<HTMLInputElement>(null);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false);

  // Room Info
  const [roomInfo, setRoomInfo] = useState<OpenStudyRoom | null>(null);
  const [loading, setLoading] = useState(true);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");

  // My Status
  const [myStatus, setMyStatus] = useState<"studying" | "resting">("studying");

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Today's Stats
  const [todayStats, setTodayStats] = useState({
    totalStudyTime: 0,
    studySessions: 0,
    restSessions: 0,
  });

  // Participants
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Help Requests
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [newHelpQuestion, setNewHelpQuestion] = useState("");
  const [newHelpImage, setNewHelpImage] = useState<string | null>(null);
  const [newHelpFileName, setNewHelpFileName] = useState<string | null>(null);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [selectedHelpRequest, setSelectedHelpRequest] =
    useState<HelpRequest | null>(null);
  const [answerInput, setAnswerInput] = useState("");

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

  // 상대적 시간 표시
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  // 채팅 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 타이머 로직
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (myStatus === "studying") {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
        setTodayStats((prev) => ({
          ...prev,
          totalStudyTime: prev.totalStudyTime + 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [myStatus]);

  // 방 입장 처리
  useEffect(() => {
    if (!user || !roomId || hasJoinedRef.current) return;

    const joinRoom = async () => {
      try {
        setLoading(true);
        console.log("Attempting to join room:", roomId);

        let roomData: OpenStudyRoom;
        try {
          roomData = await openStudyAPI.getRoom(roomId);
          console.log("Room data loaded:", roomData);
          setRoomInfo(roomData);

          setParticipants([
            {
              id: "creator",
              username: roomData.creatorUsername || "방장",
              status: "studying",
              isCreator: true,
            },
          ]);
        } catch (error: any) {
          console.error("Failed to get room info:", error);
          toast({
            title: "오류",
            description: "방 정보를 불러올 수 없습니다.",
            variant: "destructive",
          });
          navigate("/open-study");
          return;
        }

        try {
          await openStudyAPI.joinRoom(roomId);
          console.log("Successfully joined room via API");
        } catch (joinError: any) {
          if (
            joinError?.message?.includes("이미") ||
            joinError?.message?.includes("already") ||
            joinError?.message?.includes("409")
          ) {
            console.log("Already in room, continuing...");
          } else {
            throw joinError;
          }
        }

        localStorage.setItem("currentOpenStudyRoom", roomId);
        hasJoinedRef.current = true;

        if (roomData.creatorUsername !== user.username) {
          setParticipants((prev) => [
            ...prev,
            {
              id: user.id?.toString() || "me",
              username: user.username,
              status: "studying",
              isCreator: false,
            },
          ]);
        }

        addSystemMessage(`${user.username}님이 입장했습니다.`);

        toast({
          title: "입장 완료",
          description: `${roomData.title}에 입장했습니다.`,
        });

        setLoading(false);
      } catch (error: any) {
        console.error("Failed to join room:", error);

        toast({
          title: "입장 실패",
          description: error?.message || "방 입장에 실패했습니다.",
          variant: "destructive",
        });

        localStorage.removeItem("currentOpenStudyRoom");
        setLoading(false);
        navigate("/open-study");
      }
    };

    joinRoom();
  }, [user, roomId, navigate]);

  // 브라우저 이벤트 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomId && hasJoinedRef.current && !isLeavingRef.current) {
        isLeavingRef.current = true;
        localStorage.removeItem("currentOpenStudyRoom");

        const baseURL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const url = `${baseURL}/api/open-study/rooms/${roomId}/leave`;

        fetch(url, {
          method: "POST",
          credentials: "include",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }).catch((err) => console.error("Failed to leave room:", err));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (roomId && hasJoinedRef.current && !isLeavingRef.current) {
        leaveRoom();
      }
    };
  }, [roomId]);

  const leaveRoom = async () => {
    if (!roomId || isLeavingRef.current) return;
    isLeavingRef.current = true;

    try {
      localStorage.removeItem("currentOpenStudyRoom");
      await openStudyAPI.leaveRoom(roomId);
      hasJoinedRef.current = false;
    } catch (error) {
      console.error("Failed to leave room:", error);
      localStorage.removeItem("currentOpenStudyRoom");
      hasJoinedRef.current = false;
    }
  };

  const deleteRoom = async () => {
    if (!roomId || isLeavingRef.current) return;
    isLeavingRef.current = true;

    try {
      localStorage.removeItem("currentOpenStudyRoom");
      await openStudyAPI.deleteRoom(roomId);
      toast({
        title: "방 삭제 완료",
        description: "스터디 방이 삭제되었습니다.",
      });
      hasJoinedRef.current = false;
    } catch (error: any) {
      console.error("Failed to delete room:", error);
      localStorage.removeItem("currentOpenStudyRoom");
      hasJoinedRef.current = false;
      toast({
        title: "오류",
        description: error?.message || "방 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleStatusToggle = (newStatus: "studying" | "resting") => {
    if (myStatus === newStatus) return;

    if (newStatus === "resting" && myStatus === "studying") {
      setTodayStats((prev) => ({
        ...prev,
        studySessions: prev.studySessions + 1,
      }));
      addSystemMessage(
        `${
          user?.username
        }님이 휴식 모드로 전환했습니다. (공부 시간: ${formatTime(
          timerSeconds
        )})`
      );
    } else if (newStatus === "studying" && myStatus === "resting") {
      setTodayStats((prev) => ({
        ...prev,
        restSessions: prev.restSessions + 1,
      }));
      addSystemMessage(`${user?.username}님이 공부 모드로 전환했습니다.`);
    }

    setMyStatus(newStatus);
    setParticipants((prev) =>
      prev.map((p) =>
        p.username === user?.username ? { ...p, status: newStatus } : p
      )
    );
  };

  const handleTimerReset = () => {
    setTimerSeconds(0);
    toast({
      title: "타이머 리셋",
      description: "타이머가 00:00으로 초기화되었습니다.",
    });
  };

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

  const addSystemMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "system",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

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

  // 도움 요청 이미지 업로드
  const handleHelpImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const imageUrl = URL.createObjectURL(file);
    setNewHelpImage(imageUrl);
    setNewHelpFileName(file.name);
  };

  // 도움 요청 등록
  const handleSubmitHelpRequest = () => {
    if (!newHelpQuestion.trim()) {
      toast({
        title: "오류",
        description: "질문 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const newRequest: HelpRequest = {
      id: Date.now().toString(),
      requester: user?.username || "익명",
      question: newHelpQuestion,
      imageUrl: newHelpImage || undefined,
      fileName: newHelpFileName || undefined,
      timestamp: new Date(),
      status: "open",
      answers: [],
    };

    setHelpRequests((prev) => [newRequest, ...prev]);
    setNewHelpQuestion("");
    setNewHelpImage(null);
    setNewHelpFileName(null);
    setHelpDialogOpen(false);

    addSystemMessage(
      `${user?.username}님이 도움을 요청했습니다: "${newHelpQuestion.slice(
        0,
        30
      )}..."`
    );

    toast({
      title: "도움 요청 등록",
      description: "질문이 등록되었습니다. 다른 참여자들이 답변해줄 거예요!",
    });
  };

  // 도움 요청에 답변
  const handleSubmitAnswer = () => {
    if (!answerInput.trim() || !selectedHelpRequest) return;

    const newAnswer: HelpAnswer = {
      id: Date.now().toString(),
      answerer: user?.username || "익명",
      content: answerInput,
      timestamp: new Date(),
    };

    setHelpRequests((prev) =>
      prev.map((req) =>
        req.id === selectedHelpRequest.id
          ? {
              ...req,
              answers: [...req.answers, newAnswer],
              status: "helping" as const,
              helper: req.helper || user?.username,
            }
          : req
      )
    );

    setAnswerInput("");

    toast({
      title: "답변 등록",
      description: "답변이 등록되었습니다!",
    });
  };

  // 도움 요청 해결 완료
  const handleResolveRequest = (requestId: string) => {
    setHelpRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "resolved" as const } : req
      )
    );

    setSelectedHelpRequest(null);

    toast({
      title: "해결 완료",
      description: "질문이 해결되었습니다! 🎉",
    });
  };

  // 도움 요청 삭제
  const handleDeleteRequest = (requestId: string) => {
    setHelpRequests((prev) => prev.filter((req) => req.id !== requestId));
    setSelectedHelpRequest(null);

    toast({
      title: "삭제 완료",
      description: "질문이 삭제되었습니다.",
    });
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/#/open-study/room/${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "초대 링크 복사 완료",
      description: "초대 링크가 클립보드에 복사되었습니다.",
    });
  };

  const handleExitRoom = async () => {
    if (!roomId || !roomInfo) return;

    const isCreator =
      user &&
      (roomInfo.createdBy === user.id ||
        roomInfo.creatorUsername === user.username);

    if (isCreator) {
      const confirmDelete = confirm(
        "방장이 나가면 방이 삭제됩니다.\n정말로 방을 나가시겠습니까?"
      );

      if (!confirmDelete) {
        setExitDialogOpen(false);
        return;
      }

      await deleteRoom();
    } else {
      await leaveRoom();
      toast({
        title: "방 나가기 완료",
        description: "스터디룸에서 나왔습니다.",
      });
    }

    setExitDialogOpen(false);
    navigate("/open-study");
  };

  if (loading || !roomInfo) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">스터디룸에 입장하는 중...</p>
        </div>
      </div>
    );
  }

  const openRequests = helpRequests.filter((r) => r.status !== "resolved");
  const resolvedRequests = helpRequests.filter((r) => r.status === "resolved");

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">{roomInfo.title}</h1>
          <Badge variant="secondary">{roomInfo.studyField}</Badge>

          {/* 참여자 수 팝오버 */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                <Users className="w-4 h-4 mr-2" />
                <span className="font-medium">
                  {participants.length}/{roomInfo.maxParticipants}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-900">
                  👥 참여자 목록
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg ${
                        participant.isCreator
                          ? "bg-yellow-50 border border-yellow-200"
                          : participant.username === user?.username
                          ? "bg-indigo-50 border border-indigo-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback
                          className={
                            participant.isCreator
                              ? "bg-yellow-500 text-white"
                              : participant.username === user?.username
                              ? "bg-indigo-500 text-white"
                              : "bg-gray-400 text-white"
                          }
                        >
                          {participant.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {participant.username}
                          </span>
                          {participant.isCreator && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-yellow-100"
                            >
                              방장
                            </Badge>
                          )}
                          {participant.username === user?.username &&
                            !participant.isCreator && (
                              <Badge variant="secondary" className="text-xs">
                                나
                              </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              participant.status === "studying"
                                ? "bg-green-500"
                                : "bg-orange-500"
                            }`}
                          ></span>
                          <span className="text-xs text-gray-500">
                            {participant.status === "studying"
                              ? "공부중"
                              : "휴식중"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-4">
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
        {/* 왼쪽: 채팅 */}
        <div className="flex-1 flex flex-col">
          {/* 상태 전환 + 타이머 */}
          <div className="border-b bg-white p-4">
            <div className="flex items-center gap-4">
              <Button
                variant={myStatus === "studying" ? "default" : "outline"}
                className={
                  myStatus === "studying"
                    ? "bg-green-500 hover:bg-green-600"
                    : ""
                }
                onClick={() => handleStatusToggle("studying")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                공부중
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
                <Coffee className="w-4 h-4 mr-2" />
                휴식중
              </Button>

              <div className="flex items-center gap-3 ml-4 px-4 py-2 bg-gray-100 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold tabular-nums ${
                      myStatus === "studying"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {formatTime(timerSeconds)}
                  </span>
                  {myStatus === "studying" ? (
                    <span className="flex items-center text-xs text-green-600">
                      <Play className="w-3 h-3 mr-1" />
                      진행중
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-orange-500">
                      <Pause className="w-3 h-3 mr-1" />
                      일시정지
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTimerReset}
                  className="text-gray-500 hover:text-gray-700"
                >
                  리셋
                </Button>
              </div>

              <div className="ml-auto flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>총 {formatTime(todayStats.totalStudyTime)}</span>
                </div>
                <div>공부 {todayStats.studySessions}회</div>
                <div>휴식 {todayStats.restSessions}회</div>
              </div>
            </div>
          </div>

          {/* 채팅 메시지 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>아직 메시지가 없습니다.</p>
                <p className="text-sm">첫 번째 메시지를 보내보세요!</p>
              </div>
            )}
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
        </div>

        {/* 오른쪽: 질문 & 도움 요청 시스템 */}
        <div className="w-96 border-l bg-white overflow-y-auto flex flex-col">
          {/* 헤더 */}
          <div className="p-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-gray-900">질문 & 도움 요청</h3>
                {openRequests.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {openRequests.length}
                  </Badge>
                )}
              </div>
              <Button size="sm" onClick={() => setHelpDialogOpen(true)}>
                <HelpCircle className="w-4 h-4 mr-1" />
                질문하기
              </Button>
            </div>
          </div>

          {/* 질문 목록 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {openRequests.length === 0 && resolvedRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">아직 질문이 없습니다</p>
                <p className="text-sm mt-1">
                  공부하다 막히는 부분이 있으면
                  <br />
                  도움을 요청해보세요!
                </p>
              </div>
            ) : (
              <>
                {/* 열린 질문들 */}
                {openRequests.map((request) => (
                  <Card
                    key={request.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      request.status === "helping"
                        ? "border-blue-300 bg-blue-50"
                        : "border-red-200 bg-red-50"
                    }`}
                    onClick={() => setSelectedHelpRequest(request)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-red-500 text-white text-xs">
                              {request.requester.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {request.requester}
                          </span>
                          <Badge
                            variant={
                              request.status === "helping"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {request.status === "helping"
                              ? "답변 중"
                              : "도움 필요"}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(request.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-800 mb-2 line-clamp-2">
                        "{request.question}"
                      </p>

                      {request.imageUrl && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <Paperclip className="w-3 h-3" />
                          <span>{request.fileName || "이미지 첨부"}</span>
                        </div>
                      )}

                      {request.answers.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <MessageCircle className="w-3 h-3" />
                          <span>답변 {request.answers.length}개</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* 해결된 질문들 */}
                {resolvedRequests.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 pt-4">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-600">
                        해결된 질문 ({resolvedRequests.length})
                      </span>
                    </div>
                    {resolvedRequests.map((request) => (
                      <Card
                        key={request.id}
                        className="cursor-pointer opacity-60 hover:opacity-100 transition-all bg-green-50 border-green-200"
                        onClick={() => setSelectedHelpRequest(request)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-green-500 text-white text-xs">
                                  {request.requester.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">
                                {request.requester}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-green-100"
                              >
                                해결됨 ✓
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            "{request.question}"
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          {/* 오늘의 학습 기록 (하단) */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                📊 오늘의 학습
              </span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg p-2">
                <p className="text-lg font-bold text-gray-900">
                  {formatTime(todayStats.totalStudyTime)}
                </p>
                <p className="text-xs text-gray-500">총 학습</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-lg font-bold text-green-600">
                  {todayStats.studySessions}
                </p>
                <p className="text-xs text-gray-500">공부 세션</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-lg font-bold text-orange-600">
                  {todayStats.restSessions}
                </p>
                <p className="text-xs text-gray-500">휴식 세션</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 질문하기 다이얼로그 */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-red-500" />
              도움 요청하기
            </DialogTitle>
            <DialogDescription>
              공부하다 막히는 부분이 있으면 질문해보세요!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>질문 내용</Label>
              <Textarea
                placeholder="어떤 부분이 어려우신가요? 자세히 설명해주세요..."
                value={newHelpQuestion}
                onChange={(e) => setNewHelpQuestion(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label>이미지 첨부 (선택)</Label>
              <div className="mt-2">
                {newHelpImage ? (
                  <div className="relative">
                    <img
                      src={newHelpImage}
                      alt="preview"
                      className="w-full max-h-40 object-contain rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setNewHelpImage(null);
                        setNewHelpFileName(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      ref={helpFileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleHelpImageUpload}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => helpFileInputRef.current?.click()}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      스크린샷 첨부
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setHelpDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                onClick={handleSubmitHelpRequest}
                disabled={!newHelpQuestion.trim()}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                도움 요청
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 질문 상세 다이얼로그 */}
      <Dialog
        open={!!selectedHelpRequest}
        onOpenChange={(open) => !open && setSelectedHelpRequest(null)}
      >
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedHelpRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-red-500 text-white">
                        {selectedHelpRequest.requester.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedHelpRequest.requester}님의 질문</span>
                  </DialogTitle>
                  <Badge
                    variant={
                      selectedHelpRequest.status === "resolved"
                        ? "secondary"
                        : selectedHelpRequest.status === "helping"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {selectedHelpRequest.status === "resolved"
                      ? "해결됨 ✓"
                      : selectedHelpRequest.status === "helping"
                      ? "답변 중"
                      : "도움 필요"}
                  </Badge>
                </div>
                <DialogDescription>
                  {formatRelativeTime(selectedHelpRequest.timestamp)}에 요청됨
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* 질문 내용 */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-gray-800">
                    {selectedHelpRequest.question}
                  </p>
                </div>

                {/* 첨부 이미지 */}
                {selectedHelpRequest.imageUrl && (
                  <div>
                    <Label className="text-sm text-gray-500">첨부 이미지</Label>
                    <img
                      src={selectedHelpRequest.imageUrl}
                      alt="attached"
                      className="mt-2 w-full rounded-lg border cursor-pointer hover:opacity-90"
                      onClick={() => window.open(selectedHelpRequest.imageUrl)}
                    />
                  </div>
                )}

                {/* 답변 목록 */}
                {selectedHelpRequest.answers.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm text-gray-500">
                      답변 ({selectedHelpRequest.answers.length})
                    </Label>
                    {selectedHelpRequest.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {answer.answerer.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {answer.answerer}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(answer.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">
                          {answer.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 답변 입력 (해결되지 않은 경우만) */}
                {selectedHelpRequest.status !== "resolved" && (
                  <div className="space-y-2">
                    <Label>답변 작성</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="답변을 입력하세요..."
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSubmitAnswer()
                        }
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={!answerInput.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex justify-between pt-4 border-t">
                  {selectedHelpRequest.requester === user?.username ? (
                    <div className="flex gap-2">
                      {selectedHelpRequest.status !== "resolved" && (
                        <Button
                          variant="default"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() =>
                            handleResolveRequest(selectedHelpRequest.id)
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          해결 완료
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleDeleteRequest(selectedHelpRequest.id)
                        }
                      >
                        삭제
                      </Button>
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedHelpRequest(null)}
                  >
                    닫기
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
                  value={`${window.location.origin}/#/open-study/room/${roomId}`}
                  className="flex-1"
                />
                <Button onClick={handleCopyInviteLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 나가기 다이얼로그 */}
      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>스터디룸 나가기</DialogTitle>
            <DialogDescription>
              {user &&
              (roomInfo.createdBy === user.id ||
                roomInfo.creatorUsername === user.username)
                ? "방장이 나가면 방이 삭제됩니다. 정말로 나가시겠습니까?"
                : "정말로 스터디룸을 나가시겠습니까?"}
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

export default OpenStudyRoomPage;
