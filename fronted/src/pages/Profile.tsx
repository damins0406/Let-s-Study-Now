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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";
import { Eye, EyeOff, Upload } from "lucide-react";
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

const Profile: React.FC = () => {
  const { user: realUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const user = realUser || {
    username: "guest",
    email: "guest@example.com",
    age: "20",
    bio: "게스트 유저입니다.",
    studyFields: ["프로그래밍"],
    notificationEnabled: true,
    profileImageUrl: "",
  };

  // 프로필 수정 상태
  const [profileData, setProfileData] = useState({
    username: "",
    age: "",
    bio: "",
    studyFields: [] as string[],
    notificationEnabled: true,
  });

  // 이메일 변경 상태
  const [emailData, setEmailData] = useState({
    newEmail: "",
  });

  // 비밀번호 변경 상태
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        age: user.age?.toString() || "",
        bio: user.bio || "",
        studyFields: user.studyFields || [],
        notificationEnabled: user.notificationEnabled ?? true,
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (
      !profileData.username ||
      profileData.username.length < 2 ||
      profileData.username.length > 12
    ) {
      toast({
        title: "오류",
        description: "아이디는 2-12자 이내여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (
      profileData.studyFields.length === 0 ||
      profileData.studyFields.length > 5
    ) {
      toast({
        title: "오류",
        description: "관심 분야는 최소 1개, 최대 5개까지 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await authAPI.updateProfile({
        username: profileData.username,
        age: profileData.age ? parseInt(profileData.age) : undefined,
        bio: profileData.bio || undefined,
        studyFields: profileData.studyFields,
        notificationEnabled: profileData.notificationEnabled,
      });

      updateUser(updatedUser);
      toast({
        title: "성공",
        description: "프로필이 업데이트되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "프로필 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleEmailUpdate = async () => {
    if (!emailData.newEmail) {
      toast({
        title: "오류",
        description: "새 이메일을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await authAPI.updateEmail(emailData.newEmail);
      toast({
        title: "성공",
        description: "이메일이 변경되었습니다.",
      });
      setEmailData({ newEmail: "" });
    } catch (error) {
      toast({
        title: "오류",
        description: "이메일 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast({
        title: "오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "오류",
        description: "새 비밀번호는 최소 8자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "오류",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await authAPI.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      toast({
        title: "성공",
        description: "비밀번호가 변경되었습니다.",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "비밀번호 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
    ) {
      return;
    }

    setLoading(true);
    try {
      await authAPI.deleteAccount();
      toast({
        title: "계정 삭제",
        description: "계정이 성공적으로 삭제되었습니다.",
      });
      // 로그아웃 처리는 AuthContext에서 자동으로 처리됨
    } catch (error) {
      toast({
        title: "오류",
        description: "계정 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleStudyFieldChange = (field: string, checked: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      studyFields: checked
        ? [...prev.studyFields, field]
        : prev.studyFields.filter((f) => f !== field),
    }));
  };

  /* if (!user) {
    return <div>로딩 중...</div>;
  } */

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
          <p className="text-gray-600 mt-2">
            계정 정보를 관리하고 설정을 변경하세요
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="email">이메일</TabsTrigger>
            <TabsTrigger value="password">비밀번호</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>프로필 정보</CardTitle>
                <CardDescription>
                  기본 프로필 정보를 수정할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="프로필"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-600">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    프로필 사진 변경
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">아이디</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      placeholder="2-12자 이내"
                      minLength={2}
                      maxLength={12}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">나이</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileData.age}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          age: e.target.value,
                        }))
                      }
                      placeholder="나이를 입력하세요"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일 (읽기 전용)</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    이메일 변경은 '이메일' 탭에서 가능합니다
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>관심 공부 분야 (최소 1개, 최대 5개)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {STUDY_FIELDS.map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox
                          id={`profile-${field}`}
                          checked={profileData.studyFields.includes(field)}
                          onCheckedChange={(checked) =>
                            handleStudyFieldChange(field, checked as boolean)
                          }
                          disabled={
                            !profileData.studyFields.includes(field) &&
                            profileData.studyFields.length >= 5
                          }
                        />
                        <Label htmlFor={`profile-${field}`} className="text-sm">
                          {field}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">자기소개 (최대 200자)</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    placeholder="자신을 소개해주세요"
                    maxLength={200}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {profileData.bio.length}/200
                  </p>
                </div>

                <Button onClick={handleProfileUpdate} disabled={loading}>
                  {loading ? "저장 중..." : "프로필 저장"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>이메일 변경</CardTitle>
                <CardDescription>
                  계정의 이메일 주소를 변경할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-email">현재 이메일</Label>
                  <Input
                    id="current-email"
                    value={user.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-email">새 이메일</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={emailData.newEmail}
                    onChange={(e) => setEmailData({ newEmail: e.target.value })}
                    placeholder="새 이메일을 입력하세요"
                  />
                </div>

                <Button
                  onClick={handleEmailUpdate}
                  disabled={loading || !emailData.newEmail}
                >
                  {loading ? "변경 중..." : "이메일 변경"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
                <CardDescription>
                  계정의 비밀번호를 변경할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">현재 비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder="현재 비밀번호를 입력하세요"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">새 비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="새 비밀번호를 입력하세요 (최소 8자)"
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="새 비밀번호를 다시 입력하세요"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={
                    loading ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                >
                  {loading ? "변경 중..." : "비밀번호 변경"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>알림 설정</CardTitle>
                  <CardDescription>
                    알림 수신 여부를 설정할 수 있습니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">알림 수신</Label>
                      <p className="text-sm text-gray-500">
                        이메일 및 푸시 알림을 받을지 설정합니다
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={profileData.notificationEnabled}
                      onCheckedChange={(checked) =>
                        setProfileData((prev) => ({
                          ...prev,
                          notificationEnabled: checked,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">위험 구역</CardTitle>
                  <CardDescription>
                    계정을 영구적으로 삭제할 수 있습니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할
                      수 없습니다.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      {loading ? "삭제 중..." : "계정 삭제"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
