#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Prisma 클라이언트 경로 확인
const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');

try {
  if (fs.existsSync(prismaClientPath)) {
    console.log('✅ Prisma 클라이언트가 정상적으로 생성되었습니다.');
    console.log(`경로: ${prismaClientPath}`);
    
    // 디렉토리 내용 확인
    const files = fs.readdirSync(prismaClientPath);
    console.log(`파일 목록:`, files);
  } else {
    console.error('❌ Prisma 클라이언트가 생성되지 않았습니다.');
    console.error(`경로 ${prismaClientPath}가 존재하지 않습니다.`);
    process.exit(1);
  }
} catch (err) {
  console.error('Prisma 클라이언트 확인 중 오류가 발생했습니다:', err);
  process.exit(1);
}
