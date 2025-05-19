# Supabase + NextAuth.js 설정 가이드

## 1. Supabase 프로젝트 설정

1. [Supabase 대시보드](https://app.supabase.io/)에서 프로젝트에 접속합니다.
2. 왼쪽 메뉴에서 'Settings' > 'API'를 선택합니다.
3. 'Project URL'과 'anon' 키를 복사하여 `.env` 파일에 다음과 같이 추가합니다:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```
4. 'Settings' > 'Database'에서 PostgreSQL 연결 문자열을 복사하여 `DATABASE_URL`에 설정합니다:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"
   ```

## 2. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트를 생성합니다.
2. 'API 및 서비스' > '사용자 인증 정보'로 이동합니다.
3. '사용자 인증 정보 만들기' > 'OAuth 클라이언트 ID'를 선택합니다.
4. '승인된 자바스크립트 원본'에 `http://localhost:3000`을 추가합니다.
5. '승인된 리디렉션 URI'에 `http://localhost:3000/api/auth/callback/google`을 추가합니다.
6. 생성된 클라이언트 ID와 비밀번호를 `.env` 파일에 추가합니다:
   ```
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

## 3. Prisma 마이그레이션 실행

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 파일 생성
npx prisma migrate dev --name init

# 데이터베이스 스키마 적용
npx prisma db push
```

## 4. 배포 시 추가 설정 (Vercel 기준)

1. Vercel 프로젝트 설정에서 환경 변수 추가:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. 배포 설정에서 빌드 명령어 수정:
   ```
   npx prisma generate && next build
   ```

3. 프로덕션 환경의 `NEXTAUTH_URL`을 배포된 URL로 설정 (예: `https://your-app-name.vercel.app`)
