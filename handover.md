# EcoEnergyCalc 인수인계 문서 v11 (2026-07-13 기준)

v10 문서 + 이번 세션(v10→v11) 내용 통합. 새 세션 시작 시 이 문서만 보고 이어서 작업 가능하도록 작성함.

---

## 1. 사이트 기본 정보
- 도메인: `ecoenergycalc.com`
- GitHub 저장소: `canghun13/ecoenergycalc` (main 브랜치, GitHub Pages 배포, custom domain 연결)
- 콘텐츠: 무료 에너지/기후 계산기 모음 (tools) + 블로그 (blog) + 비교글 (compare) + 용어집 (glossary)
- 수익모델: Google AdSense (client: `ca-pub-5592663499707350`)
- **이 저장소에 `handover.md`를 직접 두고 매 세션 갱신+커밋하는 방식으로 전환함 (v10부터). 채팅에 파일 업로드하는 대신 저장소에서 바로 읽고 쓸 것.**

## 2. 작업 방식
- 세션 시작 시 사용자가 신규 GitHub PAT를 채팅으로 줌 → API로 직접 커밋. 끝나면 사용자가 revoke.
- Search Console(Performance + Coverage) zip, 최근부터는 **Google Analytics 개요 CSV("보고서_개요.csv")**도 같이 줌 — GA에는 트래픽 소스, 참여시간, **총수익(AdSense)**, 리텐션 등이 들어있음. 새 세션에서 GA 파일이 오면 꼭 열어볼 것.
- 대시보드나 시각화 자료 만들지 말고 분석은 텍스트로만 보고할 것 (2026-07-13 세션에 명시적으로 지시받음).
- 신규 콘텐츠는 반드시: ① 기존 파일과 중복 확인 → ② 웹서치로 키워드 경쟁강도 확인 → ③ 수익화(AdSense 트래픽/클릭) 관점에서 우선순위 판단 후 결정. 경쟁 심한 주제(대형 브랜드가 이미 장악)는 스킵.
- 완료 보고 전 반드시 실제 URL로 확인 요청 — 스크린샷에서 실제 렌더링/로직 버그가 자주 나옴.

## 3. 현재 파일 개수 (2026-07-13 기준, 새 세션에서 재확인 필수)
- tools: 29개
- blog: 23개
- compare: 41개
- glossary: 1개 파일에 용어 15개
- 새 세션에서는 `git/trees/main?recursive=1`로 재확인. llms.txt 숫자도 항상 대조.

## 4. HTML/CSS 구조 규칙
### 4-1. 페이지 타입별 기본 구조
- tool 페이지: `<section class="tool-layout">` 2-column grid. FAQ 등 추가 섹션은 tool-layout 밖, `</main>` 직전 독립 섹션으로.
- blog 페이지: `<section class="article-page"><div class="container"><div class="article-body">...</div></div></section>`.
- glossary: 단일 `glossary/index.html`, `<div class="glossary-term" data-term="...">` 블록 반복, `<h2 id="슬러그">`로 앵커.

### 4-2. ⚠️ CSS/구조 함정 (누적)
- 전역 CSS 리셋 `* { margin:0; padding:0; }` — 텍스트 블록은 반드시 `class="article-body"`로 감쌀 것. 안 그러면 문단 간격 없이 벽처럼 붙어 보임.
- `.form-group input[type="checkbox"]`, `.form-group label:has(input[type="checkbox"])` — 체크박스 CSS 버그 v10에서 전역 수정 완료. 새로 체크박스 추가해도 자동 정상 렌더링됨.
- `.form-group select`에 화살표 아이콘 CSS 추가함 (v11, `background-image` SVG). `appearance:none`이 select 화살표도 지워버렸던 것 수정.
- `.table-scroll` wrapper 필수, `<table>` 자체에 `display:block` 금지.
- **`<div class="table-scroll">`를 열고 안 닫는 실수가 반복적으로 나옴** — 이번 세션(v11)에도 `washing-machine-water-usage.html`, `solar-panel-cost-2026.html`, `how-much-does-it-cost-to-run-ac.html` 3개에서 추가로 발견/수정함 (v10에서 `solar-panel-count-calculator.html`도 같은 버그였음). **표 있는 페이지 만들거나 수정할 때마다 div open/close 카운트를 스크립트로 검증하는 습관 필수.**
- 물결표(~) 등 특수문자는 폰트에서 다르게 보일 수 있어 평문 권장.
- **전체 사이트에 `<input type="radio">`는 없음** (v11에 확인함, 체크박스만 존재).

### 4-3. JSON-LD 스키마 규칙
- 최상위/객체별 키 중복 금지 — 검증은 반드시 `object_pairs_hook` 방식으로 (단순 grep은 FAQ 질문들의 정상적인 `name` 중첩을 중복으로 오탐함).
- **FAQPage 스키마 추가하면 본문에도 반드시 동일한 질문/답변이 보이는 텍스트로 있어야 함.** v10에서 새로 만든 `blog/how-many-trees-to-offset-carbon-footprint.html`조차 이 실수를 했다가 v11에서 발견/수정함 — **새 파일 만들 때도 예외 없이 체크할 것.**
- blog Article은 `datePublished`+`dateModified` 둘 다 필수. 페이지 수정 시마다 `dateModified` 그날 날짜로 갱신.

## 5. 신규 페이지 체크리스트
1. HTML 작성 (900+ 단어)
2. `sitemap.xml`에 URL 추가
3. `llms.txt`에 링크+설명 추가 (요약문 숫자도 갱신)
4. JSON-LD 스키마, 본문과 반드시 매칭 (4-3 참고)
5. Companion pair 상호링크 (tool ↔ blog)
6. Glossary 연결 (관련 용어 없으면 새로 만들어도 됨 — 스킵하지 말 것)
7. 커밋 후 Pages 빌드 상태 확인 + URL로 사용자 확인 요청

## 6. GitHub Pages 빌드 이슈 대응 순서
1. `robots.txt` 사소한 변경 커밋으로 강제 재트리거 (안 먹힐 때 많음)
2. GitHub 웹 UI → Settings → Pages → 폴더 드롭다운 다른 값으로 바꿨다가 `/(root)`로 복귀 + Save 두 번
3. 그래도 안 되면 **사용자가 브라우저에서 직접 파일 열어 스페이스 추가 후 커밋** — 제일 확실함
4. 강제 빌드 API는 PAT 권한 부족으로 403, 사용 불가
5. "Last deployed N분 전"은 최신 커밋 기준이 아닐 수 있음 — 커밋 sha 대조 필수
6. 완료 보고 전 `pages/builds/latest`로 `status: built` 확인 + API `contents` 엔드포인트로 실제 반영 확인 (raw.githubusercontent는 CDN 캐시로 지연될 수 있음)

## 7. 수익화 현황 (2026-07-13 GA 데이터 기준, 신규 확인 사항)
- **⚠️ 광고 슬롯이 전부 빈 껍데기**: `<div class="adslot"><!-- AdSense --></div>` — 실제 `<ins class="adsbygoogle">` 태그가 하나도 없음. `adsbygoogle.js` 스크립트는 로드되고 있어서 **Auto Ads로 설정되어 있다면 정상일 수 있음** — 이건 코드로 확인 불가, **AdSense 대시보드에서 직접 확인 필요한 사항**. 사용자에게 확인 요청해놓은 상태 (v11 세션 끝난 시점까지 답변 못 받음, 다음 세션에서 후속 확인할 것).
- GA(6/15~7/12, 28일): 총 페이지뷰 941, **Organic Search 세션 13개 vs Direct 113개** — 트래픽 대부분이 검색 유입이 아님. 총수익 28일 내내 $0. 국가 분포는 US 38 > India 19 > China 7 > UK/Korea 5 등으로 분산.
- 리텐션 매우 낮음 (주차별 재방문 거의 없음).

## 8. 인덱싱/경쟁 현황 (참고만, 사용자가 먼저 언급 안 하면 우선순위로 잡지 말 것)
- Coverage: 색인 73/100 정체 지속 (리포트 자체가 2주가량 지연 반영이라 최신 아닐 수 있음)
- 경쟁사: `greenenergycalc.com`, `cleanenergycalc.com` 등 훨씬 큰 규모
- **사용자 지침 유지: 사용자가 먼저 꺼내기 전까지 먼저 걱정하거나 우선순위로 잡지 말 것.**

## 9. 이번 세션(v10→v11)에 한 작업 전체 목록
### 진단 (신규)
- **AdSense adslot이 빈 껍데기(주석)임을 발견, 사용자에게 대시보드 확인 요청함 — 다음 세션에서 답변 확인할 것**
- GA 데이터 첫 분석: Direct 트래픽 압도적, 수익 $0, 리텐션 낮음

### 보강
- `tools/dryer-energy-cost.html`: "clothes dryer energy cost calculator" 키워드 클러스터 대응 — 타이틀/메타에 "clothes" 추가, FAQ 3개 신규
- **추가로: GA 페이지뷰 데이터 기준(SC 노출이 아니라 실제 방문자 있는 페이지) FAQ 4개 페이지 보강함 — `compare/ceiling-fan-vs-ac.html`(21뷰), `tools/battery-storage.html`(13뷰), `tools/home-energy-cost.html`(11뷰), `tools/heating-cost-by-fuel.html`(10뷰). 전부 FAQ 아예 없던 페이지였음. SC 노출만 보고 "할 거 없다"고 판단했다가 사용자 지적으로 GA 관점 추가해서 찾은 것 — 다음에도 SC와 GA 둘 다 볼 것.**

### 버그 수정 (전체 사이트 스캔으로 발견)
- `assets/css/style.css`: select 드롭다운 화살표 아이콘 누락 수정 (전역)
- `tools/washing-machine-water-usage.html`, `blog/solar-panel-cost-2026.html`, `blog/how-much-does-it-cost-to-run-ac.html`: `.table-scroll` 닫는 div 누락 (기존 버그, 반복 패턴)
- `blog/how-many-trees-to-offset-carbon-footprint.html`: FAQPage 스키마만 있고 본문에 FAQ 없던 버그 (v10에서 신규 작성 시 실수한 것을 v11에서 발견/수정)

### 스킵
- "mono vs poly efficiency" 신규 콘텐츠: 이미 `compare/monocrystalline-vs-polycrystalline-solar.html`로 커버 중 + 웹서치 결과 EnergySage/EcoWatch 등 대형 사이트가 이미 장악 + 노출 1회뿐이라 우선순위 낮음, 스킵

## 10. 다음 세션 우선순위 제안
1. **AdSense Auto Ads 활성화 여부 사용자에게 재확인 — 이게 확인되면 수익화의 가장 큰 레버일 수 있음**
2. 새 SC/GA 데이터로 이번 세션 보강분(dryer, ceiling-fan-vs-ac, battery-storage, home-energy-cost, heating-cost-by-fuel 등) 반영 여부 확인
3. **주간 작업 판단 기준: SC 노출 데이터만 보지 말고 GA 페이지뷰(실제 방문자 있는 페이지)도 항상 같이 확인할 것.** SC 노출이 정체돼 있어도 GA에 트래픽 있는 페이지 중 FAQ/보강 안 된 곳이 있으면 그게 우선순위.
4. `.table-scroll` 미닫힘 버그가 반복적으로 나오고 있음 — 표 만드는 템플릿/습관 자체를 점검해볼 것
5. 사용자가 결과 화면 스크린샷 주면 숫자 재검산하는 습관 유지
