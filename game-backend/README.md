# AMI Game Backend

게임용 백엔드 API 서버입니다. 포스트맨(Postman)으로 테스트할 수 있도록 컬렉션이 함께 제공됩니다.

> **포스트맨의 역할에 대해**: 포스트맨은 API를 실행해주는 서버가 아니라, API를 **설계·테스트·문서화**하는 도구입니다.
> 실제 데이터 저장과 로직은 이 서버(Express)가 담당하고, 포스트맨은 이 서버의 API를 호출해서 확인하는 용도로 사용합니다.

## 기능

| 분류 | 엔드포인트 | 설명 |
|------|-----------|------|
| 상태 | `GET /api/health` | 서버 상태 확인 |
| 인증 | `POST /api/auth/register` | 회원가입 (username, password) |
| 인증 | `POST /api/auth/login` | 로그인 → JWT 토큰 발급 |
| 인증 | `POST /api/auth/guest` | 게스트 로그인 (계정 없이 바로 플레이) |
| 세이브 | `GET /api/saves/:slot` | 세이브 데이터 불러오기 |
| 세이브 | `PUT /api/saves/:slot` | 세이브 데이터 저장 (슬롯별) |
| 세이브 | `DELETE /api/saves/:slot` | 세이브 삭제 |
| 랭킹 | `POST /api/leaderboard` | 점수 제출 (최고 기록만 유지) |
| 랭킹 | `GET /api/leaderboard?limit=10` | 상위 랭킹 조회 |
| 랭킹 | `GET /api/leaderboard/me` | 내 순위 조회 |

인증이 필요한 API는 `Authorization: Bearer <token>` 헤더를 사용합니다.

## 실행 방법

```bash
cd game-backend
npm install
npm start          # http://localhost:3000
```

개발 중에는 파일 변경 시 자동 재시작:

```bash
npm run dev
```

## 포스트맨으로 테스트하기

1. 포스트맨 실행 → **Import** 버튼 클릭
2. `postman/game-backend.postman_collection.json` 과 `postman/local.postman_environment.json` 두 파일을 임포트
3. 우측 상단에서 **Game Backend — Local** 환경 선택
4. **Auth > Register** (또는 **Guest Login**) 요청 실행
   - 응답의 JWT 토큰이 자동으로 `{{token}}` 환경변수에 저장됩니다
5. 이후 Saves / Leaderboard 요청들은 저장된 토큰을 자동으로 사용합니다

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | `3000` | 서버 포트 |
| `JWT_SECRET` | `dev-secret-change-me` | JWT 서명 키 — **배포 시 반드시 변경** |
| `DATA_DIR` | `./data` | 데이터 저장 폴더 |

## 데이터 저장

프로토타입 단계라 `data/db.json` 파일에 저장합니다 (git에는 커밋되지 않음).
유저가 많아지면 `src/store.js`의 `load`/`save`만 PostgreSQL, MongoDB 등 실제 DB로 교체하면 됩니다 — 라우트 코드는 그대로 사용 가능합니다.

## 게임 클라이언트에서 호출 예시 (JavaScript)

```js
// 게스트 로그인
const { token } = await fetch('http://localhost:3000/api/auth/guest', { method: 'POST' })
  .then(r => r.json());

// 세이브 저장
await fetch('http://localhost:3000/api/saves/main', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ data: { level: 5, gold: 1200 } }),
});

// 점수 제출
await fetch('http://localhost:3000/api/leaderboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ score: 9500 }),
});
```
