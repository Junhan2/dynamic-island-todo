# Supabase 사용 가이드

Dynamic Island Todo 애플리케이션은 Supabase를 데이터베이스 및 백엔드 서비스로 사용합니다. 이 문서는 Supabase 설정 및 사용 방법을 안내합니다.

## 사전 준비

1. [Supabase](https://supabase.com/) 계정 생성
2. 새 Supabase 프로젝트 생성
3. Google OAuth 클라이언트 ID 및 비밀번호 발급

## 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정합니다:

```env
# NextAuth 설정
NEXTAUTH_URL="http://localhost:3000"  # 개발 환경
NEXTAUTH_SECRET="your-secure-secret"   # 안전한 임의의 문자열

# Google OAuth 설정
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
DATABASE_URL="postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres"
```

## 데이터베이스 마이그레이션

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 스키마 적용
npx prisma db push
```

## Supabase 대시보드 사용

### 데이터 관리
1. Supabase 대시보드의 'Table Editor'에서 데이터 관리
2. SQL 쿼리를 실행하려면 'SQL Editor' 사용

### 인증 설정
1. 'Authentication' > 'Providers'에서 Google 인증 설정
2. 'Settings' > 'URL Configuration'에서 Redirect URL 설정:
   - `https://your-domain.com/api/auth/callback/google`

### 스토리지 활용 (옵션)
1. 'Storage' > 'Buckets'에서 파일 저장소 생성
2. 버킷 생성 후 퍼블릭/프라이빗 권한 설정

## API 사용 예시

```typescript
// 할 일 목록 가져오기
const fetchTodos = async () => {
  const { data, error } = await supabase
    .from('Todo')
    .select(`
      *,
      createdBy: User!createdById(id, name, image),
      assignedTo: TodoAssignment(
        *,
        user: User(id, name, image)
      ),
      team: Team(id, name)
    `)
    .order('completed')
    .order('deadline');
    
  if (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
    
  return data;
};

// 새 할 일 생성
const createTodo = async (text, deadline, assignedTo) => {
  const { data, error } = await supabase
    .from('Todo')
    .insert([{
      text,
      completed: false,
      createdById: currentUser.id,
      deadline: deadline || null
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating todo:', error);
    return null;
  }
    
  return data;
};
```

## 운영 환경 배포

Vercel에 배포할 때는 다음 환경 변수들을 설정해야 합니다:

1. `NEXTAUTH_URL`: 배포된 애플리케이션 URL (예: https://your-app.vercel.app)
2. `NEXTAUTH_SECRET`: 안전한 임의의 문자열
3. `GOOGLE_CLIENT_ID` 및 `GOOGLE_CLIENT_SECRET`
4. `NEXT_PUBLIC_SUPABASE_URL` 및 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. `DATABASE_URL`: Supabase PostgreSQL 연결 문자열

## 문제 해결

### 일반적인 문제

1. **인증 오류**: Google 클라이언트 설정에서 승인된 리디렉션 URI를 확인하세요
2. **데이터베이스 연결 오류**: DATABASE_URL 및 Supabase 설정을 확인하세요
3. **배포 실패**: Vercel 로그를 확인하고 환경 변수가 올바르게 설정되었는지 확인하세요

### 도움 리소스

- [Supabase 문서](https://supabase.io/docs)
- [NextAuth.js 문서](https://next-auth.js.org/getting-started/introduction)
- [Prisma 문서](https://www.prisma.io/docs/getting-started)
