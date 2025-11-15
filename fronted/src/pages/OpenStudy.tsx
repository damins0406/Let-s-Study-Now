import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { openStudyAPI, StudyRoom } from "@/lib/api";
import { Users, Clock, BookOpen, Plus, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";

const STUDY_FIELDS = [
  "프로그래밍",
  "영어",
  "자격증",
  "공무원",
  "대학입시",
  "취업준비",
  "어학",
  "기타",
];

const OpenStudy: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null); // ✅ 현재 참여 중인 방
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // ✅ API 스키마에 맞게 수정 (studyField를 먼저, maxParticipants를 나중에)
  const [newRoom, setNewRoom] = useState({
    title: "",
    description: "",
    studyField: "",
    maxParticipants: 4,
  });

  useEffect(() => {
    loadRooms();
    if (user) {
      // ✅ 로컬 스토리지에서 현재 방 정보 복원
      const savedRoom = localStorage.getItem("currentStudyRoom");
      if (savedRoom) {
        try {
          const room = JSON.parse(savedRoom);
          setCurrentRoom(room);
        } catch (error) {
          console.error("Failed to parse saved room:", error);
          localStorage.removeItem("currentStudyRoom");
        }
      }
    } else {
      // 로그아웃 시 로컬 스토리지 초기화
      localStorage.removeItem("currentStudyRoom");
      setCurrentRoom(null);
    }
  }, [user]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const roomsData = await openStudyAPI.getRooms();
      setRooms(roomsData);
    } catch (error) {
      toast({
        title: "오류",
        description: "스터디 방 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleCreateRoom = async () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "방을 생성하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    if (!newRoom.title || !newRoom.studyField) {
      toast({
        title: "오류",
        description: "방 제목과 공부 분야를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (newRoom.title.length < 1 || newRoom.title.length > 30) {
      toast({
        title: "오류",
        description: "방 제목은 1-30자 이내여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (newRoom.maxParticipants < 2 || newRoom.maxParticipants > 10) {
      toast({
        title: "오류",
        description: "참여 인원은 2-10명 사이여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // ✅ API 스키마 순서에 맞게 전송
      await openStudyAPI.createRoom({
        title: newRoom.title,
        description: newRoom.description || undefined,
        studyField: newRoom.studyField,
        maxParticipants: newRoom.maxParticipants,
      });

      toast({
        title: "성공",
        description: "스터디 방이 생성되었습니다.",
      });

      setCreateDialogOpen(false);
      setNewRoom({
        title: "",
        description: "",
        studyField: "",
        maxParticipants: 4,
      });

      loadRooms();
    } catch (error: any) {
      // ✅ 서버에서 보낸 에러 메시지 표시
      const errorMessage = error?.message || "스터디 방 생성에 실패했습니다.";

      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleJoinRoom = async (roomId: number) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "참여하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await openStudyAPI.joinRoom(roomId.toString());

      // ✅ 참여한 방 정보를 로컬 스토리지에 저장
      const joinedRoom = rooms.find((r) => r.id === roomId);
      if (joinedRoom) {
        localStorage.setItem("currentStudyRoom", JSON.stringify(joinedRoom));
        setCurrentRoom(joinedRoom);
      }

      toast({
        title: "성공",
        description: "스터디 방에 참여했습니다.",
      });

      // ✅ 스터디룸 페이지로 이동
      navigate(`/room/${roomId}`);
    } catch (error: any) {
      // ✅ 409 Conflict - 이미 다른 방에 참여 중
      if (error?.message?.includes("이미 다른 스터디룸에 참여")) {
        try {
          // ✅ 로컬 스토리지에서 현재 방 정보 가져오기
          let currentRoomData = currentRoom;

          if (!currentRoomData) {
            const savedRoom = localStorage.getItem("currentStudyRoom");
            if (savedRoom) {
              currentRoomData = JSON.parse(savedRoom);
            }
          }

          if (currentRoomData) {
            const shouldLeave = confirm(
              `이미 "${currentRoomData.title}" 방에 참여 중입니다.\n현재 방을 나가고 새로운 방에 참여하시겠습니까?`
            );

            if (shouldLeave) {
              // 현재 방 나가기
              await openStudyAPI.leaveRoom(currentRoomData.id.toString());

              // 로컬 스토리지 초기화
              localStorage.removeItem("currentStudyRoom");

              // 새로운 방 참여
              await openStudyAPI.joinRoom(roomId.toString());

              // 새로운 방 정보 저장
              const newRoom = rooms.find((r) => r.id === roomId);
              if (newRoom) {
                localStorage.setItem(
                  "currentStudyRoom",
                  JSON.stringify(newRoom)
                );
                setCurrentRoom(newRoom);
              }

              toast({
                title: "성공",
                description: "새로운 스터디 방에 참여했습니다.",
              });

              navigate(`/room/${roomId}`);
            }
          } else {
            // 현재 방 정보를 가져올 수 없는 경우
            toast({
              title: "안내",
              description:
                "이미 다른 스터디룸에 참여 중입니다. 먼저 현재 방을 나간 후 다시 시도해주세요.",
              variant: "destructive",
            });
          }
        } catch (leaveError: any) {
          toast({
            title: "오류",
            description: leaveError?.message || "방 전환에 실패했습니다.",
            variant: "destructive",
          });
        }
      } else {
        // 기타 오류
        const errorMessage = error?.message || "스터디 방 참여에 실패했습니다.";
        toast({
          title: "오류",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* ✅ 현재 참여 중인 방 표시 */}
        {currentRoom && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      현재 참여 중인 방
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentRoom.title}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => navigate(`/room/${currentRoom.id}`)}>
                    방으로 이동
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await openStudyAPI.leaveRoom(currentRoom.id.toString());

                        // ✅ 로컬 스토리지 초기화
                        localStorage.removeItem("currentStudyRoom");

                        toast({
                          title: "나가기 완료",
                          description: "스터디 방에서 나갔습니다.",
                        });
                        setCurrentRoom(null);
                        loadRooms();
                      } catch (error: any) {
                        toast({
                          title: "오류",
                          description:
                            error?.message || "방 나가기에 실패했습니다.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    방 나가기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">오픈 스터디</h1>
            <p className="text-gray-600 mt-2">
              누구나 참여할 수 있는 실시간 스터디 방에서 함께 공부하세요
            </p>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={loadRooms} disabled={loading}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              새로고침
            </Button>

            {user && (
              <Dialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />방 만들기
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>새 스터디 방 만들기</DialogTitle>
                    <DialogDescription>
                      오픈 스터디 방을 생성하여 다른 사용자들과 함께 공부하세요
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="room-title">방 제목 *</Label>
                      <Input
                        id="room-title"
                        placeholder="방 제목을 입력하세요 (1-30자)"
                        value={newRoom.title}
                        onChange={(e) =>
                          setNewRoom((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        maxLength={30}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="room-description">방 설명</Label>
                      <Textarea
                        id="room-description"
                        placeholder="방에 대한 설명을 입력하세요 (선택사항)"
                        value={newRoom.description}
                        onChange={(e) =>
                          setNewRoom((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="study-field">공부 분야 *</Label>
                        <Select
                          value={newRoom.studyField}
                          onValueChange={(value) =>
                            setNewRoom((prev) => ({
                              ...prev,
                              studyField: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {STUDY_FIELDS.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-participants">최대 인원 *</Label>
                        <Select
                          value={newRoom.maxParticipants.toString()}
                          onValueChange={(value) =>
                            setNewRoom((prev) => ({
                              ...prev,
                              maxParticipants: parseInt(value),
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}명
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleCreateRoom}
                        disabled={
                          loading || !newRoom.title || !newRoom.studyField
                        }
                      >
                        {loading ? "생성 중..." : "방 만들기"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* 로그인 안한 경우 안내 메시지 */}
        {!user && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <p className="text-blue-900">
                  로그인하시면 스터디 방을 생성하거나 참여할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 방 목록 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            활성 스터디 방 ({rooms.length}개)
          </h2>

          {loading && rooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">스터디 방을 불러오는 중...</p>
            </div>
          ) : rooms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  활성 스터디 방이 없습니다
                </h3>
                <p className="text-gray-500 mb-4">
                  첫 번째 스터디 방을 만들어보세요!
                </p>
                {user && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />방 만들기
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Card
                  key={room.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">
                          {room.title}
                        </CardTitle>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {room.studyField}
                          </Badge>
                          {room.isFull && (
                            <Badge variant="destructive" className="text-xs">
                              정원 마감
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {room.currentParticipants}/{room.maxParticipants}
                        </div>
                        <div className="text-xs text-gray-500">참여자</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {room.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {room.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        방장: {room.creatorUsername}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleJoinRoom(room.id)}
                        disabled={loading || room.isFull || !user}
                      >
                        {room.isFull ? "정원 초과" : "참여하기"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenStudy;
