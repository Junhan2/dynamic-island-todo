-- 사용자 테이블
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT UNIQUE,
  "emailVerified" TIMESTAMP WITH TIME ZONE,
  "image" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 팀 테이블
CREATE TABLE IF NOT EXISTS "Team" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 팀 멤버 테이블
CREATE TABLE IF NOT EXISTS "TeamMember" (
  "id" TEXT PRIMARY KEY,
  "role" TEXT NOT NULL DEFAULT 'member',
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "teamId" TEXT NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "teamId")
);

-- 할 일 테이블
CREATE TABLE IF NOT EXISTS "Todo" (
  "id" TEXT PRIMARY KEY,
  "text" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "deadline" TIMESTAMP WITH TIME ZONE,
  "createdById" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "teamId" TEXT REFERENCES "Team"("id") ON DELETE SET NULL
);

-- 할 일 할당 테이블
CREATE TABLE IF NOT EXISTS "TodoAssignment" (
  "id" TEXT PRIMARY KEY,
  "todoId" TEXT NOT NULL REFERENCES "Todo"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE ("todoId", "userId")
);

-- RLS(Row Level Security) 정책 설정
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Todo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TodoAssignment" ENABLE ROW LEVEL SECURITY;

-- 필요한 권한 정책 생성
-- 사용자는 자신의 정보만 볼 수 있음
CREATE POLICY "사용자는 자신의 정보만 볼 수 있음" ON "User"
  FOR SELECT USING (auth.uid() = id);

-- 사용자는 팀의 멤버인 경우 팀을 볼 수 있음
CREATE POLICY "사용자는 팀의 멤버인 경우 팀을 볼 수 있음" ON "Team"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "TeamMember"
      WHERE "teamId" = "Team".id AND "userId" = auth.uid()
    )
  );

-- 사용자는 자신이 속한 팀 멤버십을 볼 수 있음
CREATE POLICY "사용자는 자신이 속한 팀 멤버십을 볼 수 있음" ON "TeamMember"
  FOR SELECT USING (
    "userId" = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM "TeamMember"
      WHERE "teamId" = "TeamMember"."teamId" AND "userId" = auth.uid()
    )
  );

-- 사용자는 자신의 할 일이나 자신이 속한 팀의 할 일을 볼 수 있음
CREATE POLICY "사용자는 자신의 할 일이나 자신이 속한 팀의 할 일을 볼 수 있음" ON "Todo"
  FOR SELECT USING (
    "createdById" = auth.uid() OR
    EXISTS (
      SELECT 1 FROM "TeamMember"
      WHERE "teamId" = "Todo"."teamId" AND "userId" = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM "TodoAssignment"
      WHERE "todoId" = "Todo".id AND "userId" = auth.uid()
    )
  );

-- 사용자는 자신에게 할당된 할 일 할당 정보를 볼 수 있음
CREATE POLICY "사용자는 자신에게 할당된 할 일 할당 정보를 볼 수 있음" ON "TodoAssignment"
  FOR SELECT USING (
    "userId" = auth.uid() OR
    EXISTS (
      SELECT 1 FROM "Todo"
      WHERE id = "TodoAssignment"."todoId" AND (
        "createdById" = auth.uid() OR
        EXISTS (
          SELECT 1 FROM "TeamMember"
          WHERE "teamId" = "Todo"."teamId" AND "userId" = auth.uid()
        )
      )
    )
  );

-- 쓰기 권한 추가
-- 사용자는 자신의 할 일을 생성/수정/삭제할 수 있음
CREATE POLICY "사용자는 자신의 할 일을 생성할 수 있음" ON "Todo"
  FOR INSERT WITH CHECK (auth.uid() = "createdById");

CREATE POLICY "사용자는 자신의 할 일을 수정할 수 있음" ON "Todo"
  FOR UPDATE USING (
    auth.uid() = "createdById" OR
    EXISTS (
      SELECT 1 FROM "TeamMember"
      WHERE "teamId" = "Todo"."teamId" AND "userId" = auth.uid()
    )
  );

CREATE POLICY "사용자는 자신의 할 일을 삭제할 수 있음" ON "Todo"
  FOR DELETE USING (
    auth.uid() = "createdById" OR
    EXISTS (
      SELECT 1 FROM "TeamMember"
      WHERE "teamId" = "Todo"."teamId" AND "userId" = auth.uid() AND "role" = 'owner'
    )
  );

-- 사용자는 할 일 할당을 관리할 수 있음
CREATE POLICY "사용자는 할 일 할당을 생성할 수 있음" ON "TodoAssignment"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Todo"
      WHERE id = "TodoAssignment"."todoId" AND (
        "createdById" = auth.uid() OR
        EXISTS (
          SELECT 1 FROM "TeamMember"
          WHERE "teamId" = "Todo"."teamId" AND "userId" = auth.uid()
        )
      )
    )
  );

CREATE POLICY "사용자는 할 일 할당을 삭제할 수 있음" ON "TodoAssignment"
  FOR DELETE USING (
    "userId" = auth.uid() OR
    EXISTS (
      SELECT 1 FROM "Todo"
      WHERE id = "TodoAssignment"."todoId" AND (
        "createdById" = auth.uid() OR
        EXISTS (
          SELECT 1 FROM "TeamMember"
          WHERE "teamId" = "Todo"."teamId" AND "userId" = auth.uid()
        )
      )
    )
  );

-- 사용자는 팀을 생성/관리할 수 있음
CREATE POLICY "사용자는 팀을 생성할 수 있음" ON "Team"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "사용자는 팀의 소유자인 경우 팀을 수정할 수 있음" ON "Team"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "TeamMember"
      WHERE "teamId" = "Team".id AND "userId" = auth.uid() AND "role" = 'owner'
    )
  );

CREATE POLICY "사용자는 팀의 소유자인 경우 팀을 삭제할 수 있음" ON "Team"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "TeamMember"
      WHERE "teamId" = "Team".id AND "userId" = auth.uid() AND "role" = 'owner'
    )
  );

-- 팀 멤버십 관리
CREATE POLICY "사용자는 팀 멤버를 추가할 수 있음" ON "TeamMember"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "TeamMember"
      WHERE "teamId" = "TeamMember"."teamId" AND "userId" = auth.uid() AND "role" = 'owner'
    ) OR
    ("userId" = auth.uid() AND NOT EXISTS (
      SELECT 1 FROM "TeamMember"
      WHERE "teamId" = "TeamMember"."teamId" AND "userId" = auth.uid()
    ))
  );

CREATE POLICY "사용자는 팀의 소유자인 경우 팀 멤버십을 수정할 수 있음" ON "TeamMember"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "TeamMember"
      WHERE "teamId" = "TeamMember"."teamId" AND "userId" = auth.uid() AND "role" = 'owner'
    )
  );

CREATE POLICY "사용자는 팀의 소유자이거나 본인인 경우 팀 멤버십을 삭제할 수 있음" ON "TeamMember"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "TeamMember"
      WHERE "teamId" = "TeamMember"."teamId" AND "userId" = auth.uid() AND "role" = 'owner'
    ) OR
    "userId" = auth.uid()
  );
