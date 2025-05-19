#!/bin/bash

# 이 스크립트는 Supabase 데이터베이스에 Prisma 스키마를 적용합니다

# Prisma 클라이언트 생성
echo "Prisma 클라이언트 생성 중..."
npx prisma generate

# 마이그레이션 파일 생성
echo "마이그레이션 파일 생성 중..."
npx prisma migrate dev --name init

# 데이터베이스 스키마 적용
echo "데이터베이스 스키마 적용 중..."
npx prisma db push

echo "마이그레이션 완료!"
