import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { groupAPI, studyRoomAPI, Group, StudyRoom } from "@/lib/api";
import { Users, Plus, Copy, Trash2, Clock, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";

const GroupStudy: React.FC = () => {
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [groupRooms, setGroupRooms] = useState<{
    [groupId: string]: StudyRoom[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
  });

  const [newRoom, setNewRoom] = useState({
    title: "",
    maxParticipants: 4,
    studyHours: 2,
    studyField: "프로그래밍",
  });

  useEffect(() => {
    loadMyGroups();
  }, []);

  const loadMyGroups = async () => {
    setLoading(true);
    try {
      const groups = await groupAPI.getMyGroups();
      setMyGroups(groups);
      for (const group of groups) {
        await loadGroupRooms(group.id);
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "그룹 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGroupRooms = async (groupId: string) => {
    try {
      const rooms = await studyRoomAPI.getGroupRooms(groupId);
      setGroupRooms((prev) => ({ ...prev, [groupId]: rooms }));
    } catch (error) {
      console.error("그룹 방 불러오기 실패:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast({
        title: "오류",
        description: "그룹 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await groupAPI.createGroup(
        newGroup.name,
        newGroup.description || undefined
      );
      toast({ title: "성공", description: "그룹이 생성되었습니다." });
      setCreateGroupDialogOpen(false);
      setNewGroup({ name: "", description: "" });
      await loadMyGroups();
    } catch (error) {
      toast({
        title: "오류",
        description: "그룹 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoom.title.trim() || !selectedGroupId) {
      toast({
        title: "오류",
        description: "방 제목과 그룹을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await studyRoomAPI.createRoom({
        title: newRoom.title,
        groupId: selectedGroupId,
        maxParticipants: newRoom.maxParticipants,
        studyHours: newRoom.studyHours,
        studyField: newRoom.studyField,
      });
      toast({ title: "성공", description: "스터디 방이 생성되었습니다." });
      setCreateRoomDialogOpen(false);
      setNewRoom({
        title: "",
        maxParticipants: 4,
        studyHours: 2,
        studyField: "프로그래밍",
      });
      await loadGroupRooms(selectedGroupId);
    } catch (error) {
      toast({
        title: "오류",
        description: "스터디 방 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("정말로 이 그룹을 삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      await groupAPI.deleteGroup(groupId);
      toast({ title: "성공", description: "그룹이 삭제되었습니다." });
      await loadMyGroups();
    } catch (error) {
      toast({
        title: "오류",
        description: "그룹 삭제에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    setLoading(true);
    try {
      await studyRoomAPI.joinRoom(roomId);
      toast({ title: "성공", description: "스터디 방에 참여했습니다." });
      await loadMyGroups();
    } catch (error) {
      toast({
        title: "오류",
        description: "스터디 방 참여에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (groupId: string) => {
    const inviteLink = `${window.location.origin}/#/group-invite/${groupId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({ title: "성공", description: "초대 링크가 복사되었습니다." });
  };

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
                      value={newGroup.name}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>그룹 설명</Label>
                    <Textarea
                      placeholder="그룹에 대한 설명을 입력하세요 (선택사항)"
                      value={newGroup.description}
                      onChange={(e) =>
                        setNewGroup({
                          ...newGroup,
                          description: e.target.value,
                        })
                      }
                      rows={3}
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
                      disabled={loading || !newGroup.name.trim()}
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
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                    >
                      <option value="">그룹을 선택하세요</option>
                      {myGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>방 제목 *</Label>
                    <Input
                      placeholder="방 제목을 입력하세요"
                      value={newRoom.title}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>최대 인원</Label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={newRoom.maxParticipants}
                        onChange={(e) =>
                          setNewRoom({
                            ...newRoom,
                            maxParticipants: parseInt(e.target.value),
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
                        loading || !newRoom.title.trim() || !selectedGroupId
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
                            {group.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            멤버 {group.memberCount}명
                          </CardDescription>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyInviteLink(group.id)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {group.description && (
                        <p className="text-sm text-gray-600 mb-4">
                          {group.description}
                        </p>
                      )}
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
                      {group.name} 스터디 방
                    </h3>
                    {rooms.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">
                            {group.name}에 활성 스터디 방이 없습니다
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
                                {room.title}
                              </CardTitle>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {room.currentParticipants}/
                                  {room.maxParticipants}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  남은 시간
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
                                    room.currentParticipants >=
                                      room.maxParticipants
                                  }
                                >
                                  {room.currentParticipants >=
                                  room.maxParticipants
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
