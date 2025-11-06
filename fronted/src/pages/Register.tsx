import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';

const STUDY_FIELDS = [
  '프로그래밍',
  '영어',
  '자격증',
  '공무원',
  '대학입시',
  '취업준비',
  '어학',
  '기타'
];

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    bio: '',
    studyFields: [] as string[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudyFieldChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      studyFields: checked 
        ? [...prev.studyFields, field]
        : prev.studyFields.filter(f => f !== field)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (formData.studyFields.length === 0) {
      return;
    }

    if (formData.studyFields.length > 5) {
      return;
    }

    setLoading(true);
    const success = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      age: formData.age ? parseInt(formData.age) : undefined,
      bio: formData.bio || undefined,
      studyFields: formData.studyFields
    });
    setLoading(false);

    if (success) {
      navigate('/login');
    }
  };

  const isFormValid = 
    formData.username.length >= 2 && 
    formData.username.length <= 12 &&
    formData.email &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    formData.studyFields.length > 0 &&
    formData.studyFields.length <= 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
            <CardDescription className="text-center">
              새 계정을 만들어 스터디를 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">아이디 *</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="2-12자 이내"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    minLength={2}
                    maxLength={12}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">나이</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="나이를 입력하세요"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호 *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="최소 8자, 영문+숫자"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>관심 공부 분야 * (최소 1개, 최대 5개)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {STUDY_FIELDS.map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={formData.studyFields.includes(field)}
                        onCheckedChange={(checked) => 
                          handleStudyFieldChange(field, checked as boolean)
                        }
                        disabled={
                          !formData.studyFields.includes(field) && 
                          formData.studyFields.length >= 5
                        }
                      />
                      <Label htmlFor={field} className="text-sm">
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
                  name="bio"
                  placeholder="자신을 소개해주세요"
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength={200}
                  rows={3}
                />
                <p className="text-xs text-gray-500 text-right">
                  {formData.bio.length}/200
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !isFormValid}
              >
                {loading ? '가입 중...' : '회원가입'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                  로그인
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;