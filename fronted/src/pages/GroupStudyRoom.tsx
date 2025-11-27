import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  studyRoomAPI,
  timerAPI,
  GroupStudyRoom,
  StudyRoomParticipant,
  TimerStatusResponse,
  TimerStatus, // ✅ 추가
  TimerMode, // ✅ 추가 (필요시)
} from "@/lib/api";
import {
  Users,
  Clock,
  Send,
  LogOut,
  Play,
  Pause,
  BookOpen,
  Coffee,
  TrendingUp,
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: "text" | "system";
  sender?: string;
  content: string;
  timestamp: Date;
}

const GroupStudyRoomPage: React.FC = () => {
  const { user } = useAuth();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false);

  // Room Info
  const [roomInfo, setRoomInfo] = useState<GroupStudyRoom | null>(null);
  const [loading, setLoading] = useState(true);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");

  // ✅ 타이머 상태 (백엔드 연동)
  const [timerStatus, setTimerStatus] = useState<TimerStatusResponse | null>(
    null
  );

  // Participants
  const [participants, setParticipants] = useState<StudyRoomParticipant[]>([]);

  // Dialogs
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  // 채팅 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ 타이머 상태 폴링 (1초마다)
  useEffect(() => {
    if (!user || !roomId || !hasJoinedRef.current) return;

    const interval = setInterval(async () => {
      try {
        const status = await timerAPI.getTimerStatus();
        setTimerStatus(status);
      } catch (error) {
        console.error("타이머 상태 조회 실패:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, roomId]);

  // ✅ 참여자 목록 폴링 (5초마다)
  useEffect(() => {
    if (!user || !roomId || !hasJoinedRef.current) return;

    const loadParticipants = async () => {
      try {
        const participantList = await studyRoomAPI.getParticipants(roomId);
        setParticipants(participantList);
      } catch (error) {
        console.error("참여자 조회 실패:", error);
      }
    };

    loadParticipants();
    const interval = setInterval(loadParticipants, 5000);

    return () => clearInterval(interval);
  }, [user, roomId]);

  // ✅ 방 입장 처리 (타이머 시작 포함)
  useEffect(() => {
    if (!user || !roomId || hasJoinedRef.current) return;

    const joinRoom = async () => {
      try {
        setLoading(true);
        console.log("Attempting to join group study room:", roomId);

        // 1. 방 정보 로드
        let roomData: GroupStudyRoom;
        try {
          roomData = await studyRoomAPI.getRoom(roomId);
          console.log("Room data loaded:", roomData);
          setRoomInfo(roomData);
        } catch (error: any) {
          console.error("Failed to get room info:", error);
          toast({
            title: "오류",
            description: "방 정보를 불러올 수 없습니다.",
            variant: "destructive",
          });
          navigate("/group-study");
          return;
        }

        // 2. 방 참여 (JWT 자동)
        try {
          await studyRoomAPI.joinRoom(roomId);
          console.log("Successfully joined room via API");
        } catch (joinError: any) {
          // 500 에러 또는 이미 참여 중인 경우
          if (
            joinError?.message?.includes("이미") ||
            joinError?.message?.includes("already") ||
            joinError?.message?.includes("500")
          ) {
            console.log("Already in room or duplicate join, continuing...");
          } else {
            throw joinError;
          }
        }

        // 3. ✅ 타이머 시작
        try {
          const isCreator = roomData.creatorId === Number(user.id);
          const timerResponse = await timerAPI.startTimer(
            Number(roomId),
            isCreator
          );
          setTimerStatus(timerResponse);
          console.log("Timer started:", timerResponse);
        } catch (timerError: any) {
          console.error("타이머 시작 실패:", timerError);
          toast({
            title: "알림",
            description: "타이머 시작에 실패했지만 방에는 입장했습니다.",
            variant: "default",
          });
        }

        hasJoinedRef.current = true;

        addSystemMessage(`${user.username}님이 입장했습니다.`);

        toast({
          title: "입장 완료",
          description: `${roomData.roomName}에 입장했습니다.`,
        });

        setLoading(false);
      } catch (error: any) {
        console.error("Failed to join room:", error);

        toast({
          title: "입장 실패",
          description: error?.message || "방 입장에 실패했습니다.",
          variant: "destructive",
        });

        setLoading(false);
        navigate("/group-study");
      }
    };

    joinRoom();
  }, [user, roomId, navigate]);

  // 브라우저 이벤트 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomId && hasJoinedRef.current && !isLeavingRef.current) {
        isLeavingRef.current = true;

        const baseURL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

        // ✅ 타이머 종료
        fetch(`${baseURL}/api/timer/end`, {
          method: "POST",
          credentials: "include",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
        }).catch((err) => console.error("Failed to end timer:", err));

        // 방 나가기
        const url = `${baseURL}/api/study-rooms/${roomId}/leave`;
        fetch(url, {
          method: "POST",
          credentials: "include",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
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

  // ✅ 방 나가기 (타이머 종료 포함)
  const leaveRoom = async () => {
    if (!roomId || isLeavingRef.current) return;
    isLeavingRef.current = true;

    try {
      // ✅ 타이머 종료
      try {
        await timerAPI.endTimer();
        console.log("Timer ended successfully");
      } catch (timerError) {
        console.error("Failed to end timer:", timerError);
      }

      await studyRoomAPI.leaveRoom(roomId);
      hasJoinedRef.current = false;
    } catch (error) {
      console.error("Failed to leave room:", error);
      hasJoinedRef.current = false;
    }
  };

  // ✅ 상태 전환 (공부/휴식)
  const handleStatusToggle = async () => {
    if (!timerStatus) return;

    try {
      // ✅ api.ts의 TimerStatus 타입 사용: "STUDYING" | "RESTING"
      const newStatus: TimerStatus =
        timerStatus.status === "STUDYING" ? "RESTING" : "STUDYING";

      // 백엔드 API 호출 (구현 필요)
      // const newTimerStatus = await timerAPI.toggleStatus();
      // setTimerStatus(newTimerStatus);

      // 임시: 로컬 상태만 업데이트
      const updatedStatus: TimerStatusResponse = {
        ...timerStatus,
        status: newStatus,
      };
      setTimerStatus(updatedStatus);

      const statusText = newStatus === "STUDYING" ? "공부" : "휴식";

      addSystemMessage(
        `${user?.username}님이 ${statusText} 모드로 전환했습니다.`
      );

      toast({
        title: `${statusText} 모드`,
        description: `${statusText} 모드로 전환되었습니다.`,
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error?.message || "상태 전환에 실패했습니다.",
        variant: "destructive",
      });
    }
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

  const handleExitRoom = async () => {
    if (!roomId || !roomInfo) return;

    const isCreator = user && roomInfo.creatorId === Number(user.id);

    if (isCreator) {
      const confirmExit = confirm(
        "방장이 나가면 다른 참여자에게 방장 권한이 이양되거나 방이 삭제됩니다.\n정말로 나가시겠습니까?"
      );

      if (!confirmExit) {
        setExitDialogOpen(false);
        return;
      }
    }

    await leaveRoom();
    toast({
      title: "방 나가기 완료",
      description: "스터디룸에서 나왔습니다.",
    });

    setExitDialogOpen(false);
    navigate("/group-study");
  };

  // 시간 포맷 (초 → mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {roomInfo.roomName}
          </h1>
          <Badge variant="secondary">{roomInfo.studyField}</Badge>

          {/* 참여자 수 팝오버 */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                <Users className="w-4 h-4 mr-2" />
                <span className="font-medium">
                  {participants.length}/{roomInfo.maxMembers}
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
                      key={participant.memberId}
                      className={`flex items-center space-x-3 p-2 rounded-lg ${
                        participant.memberId === roomInfo.creatorId
                          ? "bg-yellow-50 border border-yellow-200"
                          : participant.username === user?.username
                          ? "bg-indigo-50 border border-indigo-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.profileImageUrl} />
                        <AvatarFallback
                          className={
                            participant.memberId === roomInfo.creatorId
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
                          {participant.memberId === roomInfo.creatorId && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-yellow-100"
                            >
                              방장
                            </Badge>
                          )}
                          {participant.username === user?.username &&
                            participant.memberId !== roomInfo.creatorId && (
                              <Badge variant="secondary" className="text-xs">
                                나
                              </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              participant.timerStatus === "STUDYING"
                                ? "bg-green-500"
                                : "bg-orange-500"
                            }`}
                          ></span>
                          <span className="text-xs text-gray-500">
                            {participant.timerStatus === "STUDYING"
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

          {/* 남은 시간 표시 */}
          {roomInfo.remainingMinutes && roomInfo.remainingMinutes > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>남은 시간: {roomInfo.remainingMinutes}분</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
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
          {/* ✅ 상태 전환 + 타이머 */}
          <div className="border-b bg-white p-4">
            <div className="flex items-center gap-4">
              <Button
                variant={
                  timerStatus?.status === "STUDYING" ? "default" : "outline"
                }
                className={
                  timerStatus?.status === "STUDYING"
                    ? "bg-green-500 hover:bg-green-600"
                    : ""
                }
                onClick={handleStatusToggle}
                disabled={!timerStatus || !timerStatus.isRunning}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                공부중
              </Button>
              <Button
                variant={
                  timerStatus?.status === "RESTING" ? "default" : "outline"
                }
                className={
                  timerStatus?.status === "RESTING"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }
                onClick={handleStatusToggle}
                disabled={!timerStatus || !timerStatus.isRunning}
              >
                <Coffee className="w-4 h-4 mr-2" />
                휴식중
              </Button>

              {/* ✅ 백엔드에서 받은 타이머 정보 */}
              <div className="flex items-center gap-3 ml-4 px-4 py-2 bg-gray-100 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold tabular-nums ${
                      timerStatus?.status === "STUDYING"
                        ? "text-green-600"
                        : "text-orange-400"
                    }`}
                  >
                    {timerStatus?.formattedElapsedTime || "00:00"}
                  </span>
                  {timerStatus?.isRunning ? (
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
              </div>

              {/* ✅ 학습/휴식 시간 */}
              <div className="ml-auto flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span>
                    학습:{" "}
                    {timerStatus
                      ? formatTime(timerStatus.studySeconds)
                      : "0:00"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Coffee className="w-4 h-4 text-orange-500" />
                  <span>
                    휴식:{" "}
                    {timerStatus ? formatTime(timerStatus.restSeconds) : "0:00"}
                  </span>
                </div>
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
                      <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                        <p className="text-gray-900">{message.content}</p>
                      </div>
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
      </div>

      {/* 나가기 다이얼로그 */}
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

export default GroupStudyRoomPage;
