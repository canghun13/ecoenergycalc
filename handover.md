# EcoEnergyCalc 인수인계 문서 v10 (2026-07-11 기준)

이전 v9 문서 + 이번 세션(v9→v10) 내용을 통합 정리. 새 세션 시작 시 이 문서만 보고 바로 이어서 작업 가능하도록 작성함.

---

## 1. 사이트 기본 정보
- 도메인: `ecoenergycalc.com`
- GitHub 저장소: `canghun13/ecoenergycalc` (main 브랜치, GitHub Pages로 배포, custom domain 연결됨)
- 콘텐츠: 무료 에너지/기후 계산기 모음 (tools) + 블로그 (blog) + 비교글 (compare) + 용어집 (glossary)
- 수익모델: Google AdSense (client: `ca-pub-5592663499707350`)

## 2. 작업 방식 (매 세션 동일)
- 세션 시작 시 사용자가 **신규 GitHub PAT**를 채팅으로 줌 → API로 직접 커밋 (`https://api.github.com/repos/canghun13/ecoenergycalc/contents/{path}`, GET으로 sha 받고 → PUT으로 base64 인코딩된 content 커밋)
- 작업 끝나면 사용자가 토큰 **revoke**함 (매번 새 토큰)
- 사용자는 Search Console 데이터를 압축파일(zip)로 업로드해줌 — "Performance on Search"(검색어/페이지 클릭·노출·순위), 이번 세션부터 **"Coverage"(색인 생성 상태)**도 추가로 받기 시작함
- **작업 순서 선호**: 시작 전 "무엇을 왜 하는지" 계획 정리 → 컨펌 받고 → 진행 → 완료 후 요약. 단, 사용자가 이미 방향을 명확히 지시했으면(예: "신규 보강작업 잡아라 다른건 할필요없다") 재확인 없이 바로 실행.
- **완료했다고 보고하기 전에 반드시 실제 URL로 확인시켜줄 것** — 사용자가 스크린샷으로 직접 확인하는 걸 선호함. 스크린샷에서 실제 렌더링 버그가 자주 발견되므로, 코드 레벨 검증(JSON 유효성 등)만으로 "완료"라고 하지 말 것.

## 3. 현재 파일 개수 (2026-07-11 기준, 새 세션에서 재확인 필수 — 세션마다 계속 늘어남)
- tools: 30개 (신규 추가 없었음, 이번 세션은 기존 페이지 보강만)
- blog: 23개 (이번 세션에 `how-many-trees-to-offset-carbon-footprint.html` 신규 추가로 22→23)
- compare: 41개
- glossary: 1개 파일(`glossary/index.html`)이지만 내부에 용어 15개 (이번 세션에 "Carbon Offset" 용어 추가로 14→15)
- **새 세션에서는 반드시 `git/trees/main?recursive=1` API로 실제 개수 재확인할 것.** llms.txt에 적힌 "29 free web-based calculators" 같은 숫자도 실제 tools 개수랑 항상 대조해서 갱신.

## 4. HTML 구조 규칙 (반드시 지킬 것)
### 4-1. 페이지 타입별 기본 구조
- **tool 페이지**: `<section class="tool-layout">` 안에 2-column grid (계산기 박스 + 사이드바). FAQ 등 추가 섹션은 tool-layout **밖에서**, `</main>` 직전에 독립 `<section>`으로 추가.
- **blog 페이지**: `<section class="article-page"><div class="container"><div class="article-body">...</div></div></section>` 구조. 사이드바 없음.
- **glossary**: 단일 `glossary/index.html` 파일, `<div class="glossary-term" data-term="...">` 블록 반복. 각 용어는 `<h2 id="용어-슬러그">`로 앵커.

### 4-2. ⚠️ CSS 핵심 함정 (이번 세션에 새로 발견한 것들)
- **전역 CSS 리셋 있음**: `* { margin:0; padding:0; }`. 즉 `.article-body` 클래스가 없으면 `<p>`, `<h2>`, `<h3>` 사이에 **줄간격이 전혀 없어서 벽처럼 붙어 보임.** FAQ 섹션이든 뭐든 텍스트 블록을 새로 추가할 땐 반드시 `class="article-body"`로 감쌀 것 (tool 페이지 FAQ는 `<div class="container"><div class="article-body" style="max-width:800px;">...` 패턴 사용).
- **`.form-group input`이 모든 input에 `width:100%; appearance:none;` 등을 강제 적용함** — 텍스트/숫자 입력엔 맞지만 **체크박스에 적용되면 빈 알약 모양으로 깨짐.** style.css에 `.form-group input[type="checkbox"]`와 `.form-group label:has(input[type="checkbox"])` 예외 규칙을 이번 세션에 추가해서 전역 수정함 (커밋 `330e38c`). 앞으로 체크박스 새로 추가할 때는 이 규칙 덕분에 자동으로 정상 렌더링됨 — 확인만 하면 됨.
- **비교표는 `.table-scroll` wrapper 필수** (기존 규칙 유지), **`<table>` 자체에 `display:block` 금지**.
- **div/section 태그 개수 항상 맞춰서 검증할 것**: `content.count('<div')` vs `content.count('</div>')` 스크립트로 매번 체크. 이번 세션에 `tree-planting-offset.html`과 `solar-panel-count-calculator.html`에서 실제로 닫는 태그 누락 버그를 발견/수정함.
- **물결표(~) 같은 특수문자는 폰트에서 마이너스(−)처럼 보일 수 있음** — 헷갈릴 수 있는 특수문자는 그냥 평문("30 days (typical)")으로 쓰는 게 안전함.

### 4-3. JSON-LD 스키마 규칙
- 최상위 키 중복 절대 금지 (object_pairs_hook으로 중복 검증하는 스크립트 이번 세션에 만듦 — 전체 스캔 결과 실제 중복은 0건이었음, 첫 스캔에서 나온 138건은 FAQ 질문들의 정상적인 `name` 중첩을 오탐한 것이었으니 **단순 텍스트 grep으로 판단하지 말고 반드시 object_pairs_hook 방식으로 재검증할 것**)
- **FAQPage 스키마를 추가하면 반드시 본문에도 똑같은 질문/답변이 눈에 보이는 텍스트로 있어야 함.** 스키마만 있고 본문에 없으면 구글 가이드라인 위반 + 리치 리절트 거부 가능성. (이번 세션 전에 4개 파일에서 이 버그 발견해서 수정함)
- blog Article 타입은 `datePublished`와 `dateModified` **둘 다 필수**. 누락 사례 7건 발견해서 수정한 전례 있음 — 새 페이지 만들 때 빠뜨리지 말 것.
- 페이지 수정할 때마다 `dateModified`를 그날 날짜로 갱신할 것.

## 5. 신규 페이지 체크리스트
1. HTML 파일 작성 (900+ 단어 권장, 위 구조 규칙 준수)
2. `sitemap.xml`에 URL 추가
3. `llms.txt`에 링크+설명 추가 (섹션별로 정리되어 있음, 개수 언급하는 요약문도 갱신)
4. JSON-LD 스키마 (Article/WebApplication + 필요시 FAQPage) — 본문과 반드시 매칭
5. **Companion pair 상호링크**: 관련 tool ↔ blog 페이지가 있으면 서로 링크 (사이드바 "Related Articles"/"Related Calculators" 박스 활용)
6. **Glossary 연결**: 관련 용어가 glossary에 있으면 새 페이지에서 링크 걸고, glossary 쪽에도 새 페이지로 역링크 추가. 없으면 이번 세션처럼 새로 만들어도 됨 (스킵하지 말 것 — 사용자가 명확히 지적한 부분)
7. 커밋 후 반드시 Pages 빌드 상태 확인, URL로 사용자에게 직접 확인 요청

## 6. GitHub Pages 빌드 관련 (자주 발생하는 이슈)
- 커밋 여러 개를 짧은 시간 안에 연달아 푸시하면 빌드가 꼬여서 `errored` 또는 `building`(duration 0)에서 멈추는 경우가 매우 잦음.
- 해결 순서:
  1. `robots.txt`에 사소한 변경(주석 추가 등) 커밋해서 강제 재트리거 — 안 먹힐 때도 많음
  2. 그래도 안 되면 **GitHub 웹 UI에서 Settings → Pages → Build and deployment → 폴더 드롭다운을 다른 값으로 바꿨다가 다시 `/(root)`로 되돌리고 Save 두 번** — 이 트릭이 API보다 잘 먹힘
  3. 그래도 안 되면 **사용자가 브라우저에서 직접 아무 파일이나 열어서 스페이스 하나 추가하고 커밋** — 이게 제일 확실하게 큐를 풀어줬음 (API 커밋보다 웹 UI 커밋이 막힌 큐를 더 잘 뚫는 경향 확인됨)
  4. 강제 빌드 API(`POST /pages/builds`)는 PAT 권한 부족으로 403 남, 사용 불가
  5. `Settings → Pages`에 "Last deployed by ... N분 전"이라고 떠도, 그게 **최신 커밋 기준이 아니라 마지막으로 성공한 빌드 기준일 수 있음** — 커밋 sha랑 대조해서 실제로 반영됐는지 꼭 확인할 것
- 매번 완료 보고 전에 `GET /repos/canghun13/ecoenergycalc/pages/builds/latest`로 `status: built` 확인하고, 가능하면 `raw.githubusercontent.com`이나 API `contents` 엔드포인트로 실제 반영된 내용까지 확인할 것 (raw.githubusercontent는 CDN 캐시 있어서 몇 분 지연될 수 있음 — API `contents` 엔드포인트가 더 정확함)

## 7. 인덱싱/경쟁 현황 (참고만 할 것 — 사용자가 "쓸데없는 걱정"이라고 명확히 선을 그은 부분)
- Coverage 리포트 기준 색인 페이지 73개 vs 실제 파일 100개 (6/13일부터 정체), 404 2건·리디렉션 3건 있었음
- `site:ecoenergycalc.com` 검색해도 결과 안 뜨고, 도메인명 검색해도 안 뜸 — 신생 도메인이라 그런 것으로 추정
- 경쟁사: `greenenergycalc.com`(계산기 34개), `cleanenergycalc.com`(16개) 등 훨씬 큰 규모의 직접 경쟁사 존재
- **사용자 지침: 이 부분은 사용자가 먼저 언급하기 전까지 먼저 걱정하거나 작업 우선순위로 잡지 말 것.** 신규+보강 작업에 집중.
- 자주 업데이트할 예정이라 색인 속도는 자연스럽게 따라올 거라는 게 사용자 입장.

## 8. 이번 세션(v9→v10)에 한 작업 전체 목록
### 보강
- `tools/tree-planting-offset.html`: FAQ 4개 추가, 메타/타이틀 키워드 보강, article-body 조기 닫힘 버그 수정, 중복 섹션("How to Choose Quality Reforestation Programs" h2/h3 중복) 병합, FAQ 스타일 수정
- `tools/appliance-energy-cost.html`: FAQ 4개 추가, FAQ 스타일 수정
- `blog/renewable-energy-subsidies.html`: FAQ 3개 추가 ("energy subsidy" 문구 반영)
- `tools/solar-co2-offset-calculator.html`, `tools/heating-vs-cooling.html`, `tools/electric-bill-spike-calculator.html`, `tools/solar-panel-count-calculator.html`: FAQ 섹션 문단 간격(article-body) 수정

### 신규
- `blog/how-many-trees-to-offset-carbon-footprint.html` (1000단어, tree-planting-offset.html과 companion, sitemap/llms.txt 반영)
- glossary "Carbon Offset" 용어 신규 추가 (tool + blog와 3자 상호링크)

### 버그 수정 (스크린샷 기반 사용자 피드백으로 발견)
- `tools/solar-panel-count-calculator.html`: `.table-scroll` 닫는 div 누락 (기존 버그)
- `assets/css/style.css`: 체크박스가 `.form-group input` 전역 스타일 상속받아 깨지던 버그 → 전역 수정 (사이트 전체 적용됨)
- `tools/electric-bill-spike-calculator.html`: 계산 로직에서 체크한 요인 합이 실제 증가액을 **초과**하는 경우(over-explained) 아무 안내도 없던 버그 수정, "~30 days"의 물결표가 폰트에서 마이너스처럼 보이던 문제를 "30 days (typical)"로 텍스트 수정

### 미완료/스킵
- 3순위였던 물 사용량 클러스터(`water-usage.html`, `washing-machine-water-usage.html`)는 최근에 이미 충분히 보강되어 이번엔 스킵함
- EV 충전 비용 계산기, 홈 배터리 스토리지 블로그 등 신규 카테고리 후보는 웹서치 결과 대형 경쟁사가 이미 장악하고 있어 스킵

## 9. 다음 세션 우선순위 제안
1. 새 Search Console 데이터로 클릭/노출 변화 확인 (이번 세션 보강분들이 반영됐는지)
2. 이번 세션에 발견한 CSS/구조 버그 패턴(article-body 누락, div 불균형, 체크박스 등)이 **다른 페이지에도 더 있는지** 전체 스캔 — 이번엔 시간 관계상 일부만 확인함
3. 체크박스 외에 `radio`, `select` 등 다른 input 타입도 비슷한 렌더링 버그 있는지 확인 안 해봤음 — 필요시 점검
4. 계산기 로직(JS) 버그가 electric-bill-spike-calculator에서 하나 나온 것처럼, **다른 계산기들의 계산 결과도 사용자가 스크린샷으로 검증하면 추가로 나올 가능성 있음** — 사용자가 결과 화면 스크린샷 주면 숫자 재검산하는 습관 유지할 것
5. sitemap.xml/llms.txt는 지난 세션에 100% 일치 확인했으나 신규 페이지 추가할 때마다 다시 깨질 수 있으니 매번 체크
