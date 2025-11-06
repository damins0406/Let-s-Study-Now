import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [newRoom, setNewRoom] = useState({
    title: "",
    description: "",
    maxParticipants: 4,
    studyField: "",
  });

  useEffect(() => {
    if (user) {
      loadRooms();
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
      await openStudyAPI.createRoom({
        title: newRoom.title,
        description: newRoom.description || undefined,
        maxParticipants: newRoom.maxParticipants,
        studyField: newRoom.studyField,
      });

      toast({
        title: "성공",
        description: "스터디 방이 생성되었습니다.",
      });

      setCreateDialogOpen(false);
      setNewRoom({
        title: "",
        description: "",
        maxParticipants: 4,
        studyField: "",
      });

      loadRooms();
    } catch (error) {
      toast({
        title: "오류",
        description: "스터디 방 생성에 실패했습니다.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleJoinRoom = async (roomId: string) => {
    setLoading(true);
    try {
      await openStudyAPI.joinRoom(roomId);
      toast({
        title: "성공",
        description: "스터디 방에 참여했습니다.",
      });
      loadRooms();
    } catch (error) {
      toast({
        title: "오류",
        description: "스터디 방 참여에 실패했습니다.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  /*if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>로그인이 필요합니다</CardTitle>
              <CardDescription>
                오픈 스터디를 이용하려면 로그인해주세요
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  } */

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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

                    <div className="space-y-2">
                      <Label htmlFor="study-field">공부 분야 *</Label>
                      <Select
                        value={newRoom.studyField}
                        onValueChange={(value) =>
                          setNewRoom((prev) => ({ ...prev, studyField: value }))
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
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">활성 방</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rooms.filter((room) => room.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    참여 가능한 방
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      rooms.filter(
                        (room) =>
                          room.currentParticipants < room.maxParticipants
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 참여자</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rooms.reduce(
                      (sum, room) => sum + room.currentParticipants,
                      0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 스터디 방 목록 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            활성 스터디 방
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
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />방 만들기
                </Button>
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
                        <CardDescription className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {room.studyField}
                          </Badge>
                        </CardDescription>
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
                        {new Date(room.createdAt).toLocaleString("ko-KR")}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleJoinRoom(room.id)}
                        disabled={
                          loading ||
                          room.currentParticipants >= room.maxParticipants ||
                          !room.isActive
                        }
                      >
                        {room.currentParticipants >= room.maxParticipants
                          ? "정원 초과"
                          : !room.isActive
                          ? "비활성"
                          : "참여하기"}
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
