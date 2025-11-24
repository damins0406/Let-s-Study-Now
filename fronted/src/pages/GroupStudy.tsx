import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { groupAPI, studyRoomAPI, Group, GroupStudyRoom } from "@/lib/api";
import { Users, Plus, Copy, Trash2, Clock, BookOpen } from "lucide-react";
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

const GroupStudy: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [groupRooms, setGroupRooms] = useState<{
    [groupId: number]: GroupStudyRoom[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const [newGroup, setNewGroup] = useState({
    groupName: "",
  });

  const [newRoom, setNewRoom] = useState({
    roomName: "",
    maxMembers: 4,
    studyHours: 2,
    studyField: "프로그래밍",
  });

  useEffect(() => {
    if (user) {
      console.log("==== User Object ====");
      console.log("Full user:", user);
      console.log("user.id:", user.id);
      console.log("user.id type:", typeof user.id);
      console.log("Number(user.id):", Number(user.id));
      console.log("isNaN(Number(user.id)):", isNaN(Number(user.id)));
      console.log("====================");
      loadMyGroups();
    }
  }, [user]);

  const loadMyGroups = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log("Attempting to load groups with session-based auth...");

      // ✅ 먼저 세션 기반으로 시도 (leaderId 없이)
      try {
        const groups = await groupAPI.getMyGroups();
        setMyGroups(groups);
        for (const group of groups) {
          await loadGroupRooms(group.id);
        }
        console.log("Successfully loaded groups using session");
        return;
      } catch (sessionError: any) {
        console.log(
          "Session-based failed, trying with leaderId...",
          sessionError?.message
        );

        console.log("user object:", user);

        let leaderId: number;

        if (user.id) {
          leaderId = Number(user.id);
        } else if (user.username) {
          console.error(
            "user.id is undefined, backend should return user ID in /api/profile"
          );
          toast({
            title: "오류",
            description:
              "사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.",
            variant: "destructive",
          });
          return;
        } else {
          console.error("Both user.id and user.username are undefined");
          toast({
            title: "오류",
            description: "사용자 정보가 없습니다. 다시 로그인해주세요.",
            variant: "destructive",
          });
          return;
        }

        if (isNaN(leaderId)) {
          console.error("user object:", user);
          toast({
            title: "오류",
            description: `유효하지 않은 사용자 ID입니다. user.id = ${user.id}`,
            variant: "destructive",
          });
          return;
        }

        console.log("Attempting with leaderId:", leaderId);
        const groups = await groupAPI.getMyGroupsWithId(leaderId);
        setMyGroups(groups);
        for (const group of groups) {
          await loadGroupRooms(group.id);
        }
      }
    } catch (error: any) {
      console.error("그룹 로드 에러:", error);
      toast({
        title: "오류",
        description: error?.message || "그룹 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGroupRooms = async (groupId: number) => {
    try {
      const rooms = await studyRoomAPI.getGroupRooms(groupId);
      setGroupRooms((prev) => ({ ...prev, [groupId]: rooms }));
    } catch (error) {
      console.error("그룹 방 불러오기 실패:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "그룹을 생성하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    if (!newGroup.groupName.trim()) {
      toast({
        title: "오류",
        description: "그룹 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // ✅ user.id 확인
      if (!user.id) {
        toast({
          title: "오류",
          description: "사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const leaderId = Number(user.id);

      if (isNaN(leaderId)) {
        toast({
          title: "오류",
          description: "유효하지 않은 사용자 ID입니다.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // ✅ API 호출 (leaderId 필수)
      await groupAPI.createGroup({
        groupName: newGroup.groupName,
        leaderId: leaderId,
      });

      toast({ title: "성공", description: "그룹이 생성되었습니다." });
      setCreateGroupDialogOpen(false);
      setNewGroup({ groupName: "" });
      await loadMyGroups();
    } catch (error: any) {
      console.error("그룹 생성 에러:", error);
      toast({
        title: "오류",
        description: error?.message || "그룹 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

    if (!newRoom.roomName.trim() || selectedGroupId === null) {
      toast({
        title: "오류",
        description: "방 제목과 그룹을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    // ✅ user.id 확인
    if (!user.id) {
      toast({
        title: "오류",
        description: "사용자 ID를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const creatorId = Number(user.id);

    if (isNaN(creatorId)) {
      toast({
        title: "오류",
        description: "유효하지 않은 사용자 ID입니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // ✅ API 스키마에 맞게 수정
      await studyRoomAPI.createRoom({
        groupId: selectedGroupId, // ✅ number 타입
        roomName: newRoom.roomName,
        studyField: newRoom.studyField,
        studyHours: newRoom.studyHours,
        maxMembers: newRoom.maxMembers,
        creatorId: creatorId, // ✅ number 타입
      });

      toast({ title: "성공", description: "스터디 방이 생성되었습니다." });
      setCreateRoomDialogOpen(false);
      setNewRoom({
        roomName: "",
        maxMembers: 4,
        studyHours: 2,
        studyField: "프로그래밍",
      });
      await loadGroupRooms(selectedGroupId);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error?.message || "스터디 방 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("정말로 이 그룹을 삭제하시겠습니까?")) return;

    // ✅ user.id 확인
    if (!user || !user.id) {
      toast({
        title: "오류",
        description: "사용자 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const userId = Number(user.id);

    if (isNaN(userId)) {
      toast({
        title: "오류",
        description: "유효하지 않은 사용자 ID입니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // ✅ userId 파라미터 추가
      await groupAPI.deleteGroup(groupId, userId);
      toast({ title: "성공", description: "그룹이 삭제되었습니다." });
      await loadMyGroups();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error?.message || "그룹 삭제에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

    // ✅ user.id 확인
    if (!user.id) {
      toast({
        title: "오류",
        description: "사용자 ID를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const memberId = Number(user.id);

    if (isNaN(memberId)) {
      toast({
        title: "오류",
        description: "유효하지 않은 사용자 ID입니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // ✅ memberId 파라미터 추가
      await studyRoomAPI.joinRoom(roomId, memberId);
      toast({ title: "성공", description: "스터디 방에 참여했습니다." });

      // ✅ 스터디룸 페이지로 이동
      navigate(`/room/${roomId}`);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error?.message || "스터디 방 참여에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (groupId: number) => {
    const inviteLink = `${window.location.origin}/#/group-invite/${groupId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({ title: "성공", description: "초대 링크가 복사되었습니다." });
  };

  // 로그인하지 않은 경우 안내 메시지
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto mt-12">
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                로그인이 필요합니다
              </h3>
              <p className="text-gray-500 mb-4">
                그룹 스터디를 이용하려면 로그인해주세요
              </p>
              <Button onClick={() => (window.location.href = "#/login")}>
                로그인하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">그룹 스터디</h1>
            <p className="text-gray-600 mt-2">
              친구들과 그룹을 만들어 체계적으로 스터디를 진행하세요
            </p>
          </div>

          <div className="flex space-x-3">
            {/* 그룹 생성 */}
            <Dialog
              open={createGroupDialogOpen}
              onOpenChange={setCreateGroupDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  그룹 만들기
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>새 그룹 만들기</DialogTitle>
                  <DialogDescription>
                    새로운 스터디 그룹을 생성하여 멤버들과 함께 공부하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>그룹 이름 *</Label>
                    <Input
                      placeholder="그룹 이름을 입력하세요"
                      value={newGroup.groupName}
                      onChange={(e) =>
                        setNewGroup({ groupName: e.target.value })
                      }
                      maxLength={50}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCreateGroupDialogOpen(false)}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleCreateGroup}
                      disabled={loading || !newGroup.groupName.trim()}
                    >
                      {loading ? "생성 중..." : "그룹 만들기"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 스터디 방 생성 */}
            <Dialog
              open={createRoomDialogOpen}
              onOpenChange={setCreateRoomDialogOpen}
            >
              <DialogTrigger asChild>
                <Button disabled={myGroups.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  스터디 방 만들기
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>새 스터디 방 만들기</DialogTitle>
                  <DialogDescription>
                    그룹 스터디 방을 생성하여 멤버들과 함께 공부하세요
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>그룹 선택 *</Label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedGroupId || ""}
                      onChange={(e) =>
                        setSelectedGroupId(Number(e.target.value) || null)
                      }
                    >
                      <option value="">그룹을 선택하세요</option>
                      {myGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.groupName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>방 제목 *</Label>
                    <Input
                      placeholder="방 제목을 입력하세요"
                      value={newRoom.roomName}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, roomName: e.target.value })
                      }
                      maxLength={30}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>공부 분야 *</Label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newRoom.studyField}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, studyField: e.target.value })
                      }
                    >
                      {STUDY_FIELDS.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>최대 인원</Label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={newRoom.maxMembers}
                        onChange={(e) =>
                          setNewRoom({
                            ...newRoom,
                            maxMembers: parseInt(e.target.value),
                          })
                        }
                      >
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num}명
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>공부 시간</Label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={newRoom.studyHours}
                        onChange={(e) =>
                          setNewRoom({
                            ...newRoom,
                            studyHours: parseInt(e.target.value),
                          })
                        }
                      >
                        {[1, 2, 3, 4, 5].map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}시간
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCreateRoomDialogOpen(false)}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleCreateRoom}
                      disabled={
                        loading ||
                        !newRoom.roomName.trim() ||
                        selectedGroupId === null
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

        {/* 그룹 및 방 목록 */}
        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList>
            <TabsTrigger value="groups">내 그룹</TabsTrigger>
            <TabsTrigger value="rooms">스터디 방</TabsTrigger>
          </TabsList>

          <TabsContent value="groups">
            {myGroups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    참여 중인 그룹이 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    첫 번째 그룹을 만들어보세요!
                  </p>
                  <Button onClick={() => setCreateGroupDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    그룹 만들기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group) => (
                  <Card
                    key={group.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {group.groupName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            방장 ID: {group.leaderId}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyInviteLink(group.id)}
                            title="초대 링크 복사"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteGroup(group.id)}
                            title="그룹 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {new Date(group.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </div>
                        <Badge variant="secondary">
                          활성 방 {groupRooms[group.id]?.length || 0}개
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rooms">
            <div className="space-y-6">
              {myGroups.map((group) => {
                const rooms = groupRooms[group.id] || [];
                return (
                  <div key={group.id}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {group.groupName} 스터디 방
                    </h3>
                    {rooms.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">
                            {group.groupName}에 활성 스터디 방이 없습니다
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map((room) => (
                          <Card
                            key={room.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">
                                {room.roomName}
                              </CardTitle>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {room.currentMembers || 0}/{room.maxMembers}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {room.remainingMinutes
                                    ? `${room.remainingMinutes}분 남음`
                                    : "진행 중"}
                                </span>
                              </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                              <div className="flex justify-between items-center">
                                <Badge variant="outline" className="text-xs">
                                  {room.studyField}
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={() => handleJoinRoom(room.id)}
                                  disabled={
                                    loading ||
                                    room.currentMembers >= room.maxMembers
                                  }
                                >
                                  {room.currentMembers >= room.maxMembers
                                    ? "정원 초과"
                                    : "입장하기"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupStudy;
