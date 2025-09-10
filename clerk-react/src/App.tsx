import { SignedIn, SignedOut, useSignIn, useSignUp, useClerk, useUser } from '@clerk/clerk-react';
import { useState } from 'react';
import './App.css';

export default function App() {
  const { signIn, setActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { signOut } = useClerk();
  const { user } = useUser(); // 사용자 정보 가져오기
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false); // 프로필 보기 상태
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        // 회원가입 - 유저네임 + 비밀번호만
        const result = await signUp?.create({
          username: username,
          password: password,
        });
        
        if (result?.status === 'complete') {
          await setSignUpActive?.({ session: result.createdSessionId });
        }
      } else {
        // 로그인
        const result = await signIn?.create({
          identifier: username,
          password: password,
        });
        
        if (result?.status === 'complete') {
          await setActive?.({ session: result.createdSessionId });
        }
      }
    } catch (error: any) {
      console.error('오류:', error);
      setError(error.errors?.[0]?.message || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <SignedOut>
        <div className="login-container">
          <h1 className="login-title">
            {isSignUp ? '회원가입' : '로그인'}
          </h1>
          
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{isSignUp ? '유저네임' : '아이디'}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder={isSignUp ? '사용할 아이디' : '아이디'}
              />
            </div>
            
            <div className="form-group">
              <label>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="비밀번호"
                minLength={8}
              />
            </div>
            
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? '처리중...' : (isSignUp ? '회원가입' : '로그인')}
            </button>
          </form>
          
          <div className="signup-link">
            {isSignUp ? (
              <>
                이미 계정이 있으신가요?{' '}
                <a onClick={() => {
                  setIsSignUp(false); 
                  setError(''); 
                  setUsername(''); 
                  setPassword('');
                }}>
                  로그인
                </a>
              </>
            ) : (
              <>
                계정이 없으신가요?{' '}
                <a onClick={() => {
                  setIsSignUp(true); 
                  setError(''); 
                  setUsername(''); 
                  setPassword('');
                }}>
                  회원가입
                </a>
              </>
            )}
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="dashboard">
          {!showProfile ? (
            // 메인 대시보드
            <>
              <h1>환영합니다!</h1>
              <p>로그인 성공!</p>
              <div className="dashboard-buttons">
                <button 
                  onClick={() => setShowProfile(true)}
                  className="profile-btn"
                >
                  프로필 보기
                </button>
                <button 
                  onClick={() => signOut()}
                  className="logout-btn"
                >
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            // 프로필 화면
            <>
              <h1>프로필 정보</h1>
              <div className="profile-info">
                <div className="profile-item">
                  <strong>사용자 ID:</strong> {user?.id}
                </div>
                <div className="profile-item">
                  <strong>유저네임:</strong> {user?.username || '없음'}
                </div>
                <div className="profile-item">
                  <strong>이메일:</strong> {user?.primaryEmailAddress?.emailAddress || '없음'}
                </div>
                <div className="profile-item">
                  <strong>가입일:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '없음'}
                </div>
                <div className="profile-item">
                  <strong>마지막 로그인:</strong> {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('ko-KR') : '없음'}
                </div>
              </div>
              <div className="dashboard-buttons">
                <button 
                  onClick={() => setShowProfile(false)}
                  className="back-btn"
                >
                  뒤로가기
                </button>
                <button 
                  onClick={() => signOut()}
                  className="logout-btn"
                >
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </SignedIn>
    </div>
  );
}
