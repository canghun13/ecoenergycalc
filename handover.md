# EcoEnergyCalc 인수인계 문서 v13 (2026-07-16 기준)

v12 문서 + 이번 세션(v12→v13) 내용 통합. 새 세션 시작 시 이 문서만 보고 이어서 작업 가능하도록 작성함.

## 0. v13 세션 핵심 요약 (2026-07-16)
- **⚠️ 이번 세션에 첨부된 Search Console zip 파일은 v12 세션 때와 완전히 동일한 파일이었음** (날짜 07-12까지, 파일명도 동일). 새 데이터 아님 — 다음 세션에서 서치콘솔 자료 받으면 날짜 범위부터 확인할 것.
- **GitHub Pages 빌드 트러블슈팅 (이번 세션 대부분 시간 소요)**: 사용자가 이전에 "Claude" GitHub App(Claude Code의 PR/이슈 자동연동 기능)을 설치해서 별도로 `claude/search-console-content-v1w0g1` 브랜치에서 v13 작업(제습기/냉동고 계산기 추가)을 진행했었음. 그런데 GitHub Pages 빌드가 계속 "Page build failed"로 실패해서 사용자가 해당 PR들을 전부 revert함. 확인 결과:
  - **revert 이후 콘텐츠는 마지막 정상 빌드(a79b20d, v12 종료 시점)와 완전히 동일**(diff 0줄) — 즉 콘텐츠 버그가 원인이 아니었음.
  - 그런데도 revert commit 자체와 이후 재시도들까지 5연속 "Page build failed" — GitHub Pages 빌드 큐/서비스 자체의 일시적 문제로 판단 (rapid rebuild 트리거를 너무 여러 번 해서 그럴 수도 있음).
  - **사용자가 직접 사이트(`ecoenergycalc.com`)를 브라우저로 열어서 정상 작동 확인함** — GitHub Pages는 빌드 실패해도 마지막 성공 버전을 계속 서빙하므로 사이트가 다운된 적은 없었음.
  - 사용자가 "Claude" GitHub App은 제거함. **앞으로 이 프로젝트는 계속 채팅에서 주는 개인 PAT로 직접 git clone/push하는 방식만 사용** (GitHub App/Claude Code 브랜치 워크플로우는 더 이상 없음).
  - 교훈: 빌드 실패 X 표시가 떠도 당황하지 말고 ①콘텐츠가 마지막 정상 상태와 diff 있는지부터 확인 ②없으면 사용자에게 실제 사이트 열어봐서 살아있는지 확인 요청 — 재빌드를 무한정 반복 트리거하지 말 것 (오히려 GitHub 쪽 빌드 큐를 더 막을 수 있음). robots.txt에 트리거용 주석을 넣었다가 지우는 방식을 썼는데, 최종적으로는 사용자가 GitHub 웹에서 직접 robots.txt를 깨끗한 버전으로 정리함 — 현재 robots.txt는 트리거 주석 없는 순수한 버전 유지 중.
- **v13 Claude Code 브랜치의 제습기/냉동고 계산기 콘텐츠 자체는 검증 결과 문제 없었음** (단어수 1400+, div 균형, JSON-LD 정상, Jekyll 충돌 요소 없음) → cherry-pick으로 복원함: `tools/humidifier-running-cost.html`, `tools/freezer-running-cost.html`.
- **신규 tool 페이지 1개 추가**: `tools/hot-tub-running-cost.html` — 인플레이터블(간이) vs 빌트인(고정식) 핫텁 운영비를 한 페이지에서 비교하는 계산기. 롱테일 키워드 여러 개("hot tub running cost calculator", "inflatable hot tub running cost", "built-in vs inflatable hot tub cost") 동시 커버 목적으로 설계.
- **경쟁강도 리서치 결과 (백로그 갱신)**: 이번 세션에 확인한 electric water heater / dishwasher / generator running cost 계산기는 전부 **8개 이상의 전용 경쟁 사이트**가 이미 존재(perchenergy, homeguide, ecocostsavings, learnmetrics, calculory, appliancerunningcost.com 등) → 전부 스킵 결정. Hot tub은 경쟁자 다수가 핫텁 판매업체(제품 판매 목적 계산기)라 순수 정보성 콘텐츠로는 상대적으로 승산 있다고 판단해 진행.
- 사이트맵/llms.txt/tools 인덱스/관련 페이지 사이드바 상호링크 전부 반영 완료 (humidifier↔dehumidifier, freezer↔refrigerator, hot-tub↔pool-pump/appliance-energy-cost).
- 전체 사이트 재스캔: article-body 버그/div 불균형/JSON-LD 오류/broken link/sitemap 불일치 전부 0건.
- 파일 개수 (2026-07-16 기준): tools 34개, blog 23개, compare 41개.

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

## 3. 현재 파일 개수 (2026-07-16 기준, 새 세션에서 재확인 필수)
- tools: 34개 (v13에서 humidifier-running-cost·freezer-running-cost 복원 + hot-tub-running-cost 신규 추가)
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
- **`article-body`가 본문 중간에서 너무 일찍 닫히고 그 뒤 콘텐츠가 스타일 없이 벗겨진 채 렌더링되는 버그가 매우 광범위하게 퍼져있음.** v10에서 `tree-planting-offset.html`, v11에서 `battery-storage.html`/`insulation-savings.html`/`flight-carbon.html`/`green-home-upgrade-roi.html`에서 전부 같은 패턴으로 발견됨 — 아마 과거 특정 시점에 콘텐츠를 일괄로 확장하면서 반복된 실수로 보임. **탐지 스크립트**: `class="article-body"` 있는 tool 페이지에서 `re.findall(r'</p>\s*\n\s*</div>\s*\n\s*\n\s{10,}<h[23]>', content)` 패턴으로 스캔하면 잡힘 (v11에서 이 정규식으로 4개 추가 발견함). **새 세션 시작하면 이 정규식으로 tools/blog/compare 전체 재스캔부터 하는 게 좋음 — 아직 다 못 잡았을 가능성 있음.**
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

## 7. 수익화 현황 (v12 기준: 2026-07-15 확인)
- **AdSense는 현재 "심사 중"** (v12에서 사용자가 확인해줌). 심사 통과 전까지 광고가 어떤 방식이든 노출되지 않는 게 정상이므로, 광고 슬롯이 빈 껍데기(`<div class="adslot"><!-- AdSense --></div>`, 실제 `<ins class="adsbygoogle">` 태그 없음)인 것과 Auto Ads 여부는 심사 완료 후에 재점검할 것. **다음 세션에서 가장 먼저 확인: 심사 통과했는지, 통과했으면 광고 슬롯에 실제 `<ins>` 태그를 넣어야 하는지 Auto Ads만으로 충분한지.**
- GA(v11, 6/15~7/12, 28일 기준— v12에서는 GA 파일 받지 못함): 총 페이지뷰 941, Organic Search 세션 13개 vs Direct 113개 — 트래픽 대부분이 검색 유입이 아니었음. 총수익 28일 내내 $0. 국가 분포는 US 38 > India 19 > China 7 > UK/Korea 5 등으로 분산. 리텐션 매우 낮음.
- v12 SC 데이터(최근 ~2개월 누적): 총 노출 237, 클릭 0, 평균 게재순위 60~100대. 심사 중이라 광고 수익화는 아직 손댈 수 없는 단계이므로 이번 세션은 트래픽 기반(콘텐츠 확장)에 집중함.

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
1. **AdSense 심사 결과 확인 — 통과했으면 광고 슬롯(`adslot`)이 빈 껍데기인 상태 그대로인지, Auto Ads가 켜져 있는지 반드시 확인. 이게 수익화의 가장 큰 레버.**
2. **새 SC 데이터 받으면 먼저 날짜 범위부터 확인할 것** — v13 세션에 첨부된 파일이 v12 때와 완전 동일한 파일이었음 (07-12까지 데이터, 파일명도 동일). 최근 며칠 데이터가 안 보이면 재요청.
3. 새 SC 데이터로 v12/v13 신규 페이지(dehumidifier, pool-pump, humidifier, freezer, hot-tub-running-cost) 노출/색인 여부 확인.
4. **백로그: compare 카테고리 전체(41개 중 상당수)가 600~900단어대로 얇음.** v12에서 얇음+고아 교집합 4개만 처리함 — 색인률이 계속 정체되면 나머지 compare 페이지들도 순차적으로 900+ 단어로 확장 검토.
5. **백로그(경쟁 심함, 스킵 확정)**: EV 충전비용, electric water heater running cost, dishwasher running cost, generator running cost — 전부 전용 경쟁 계산기 사이트 8개 이상 존재. Heat pump running cost는 중간 경쟁으로 보류 상태, 권위 오르면 재검토.
6. GA 데이터 오면 항상 열어볼 것 — SC 노출만으로 우선순위 잡지 말고 실제 방문 있는 페이지도 같이 볼 것.
7. **버그 재발 패턴 정리**: article-body 조기종료 버그가 v10/v11/v12에서 계속 나왔음(v13에서는 재스캔 결과 0건). 새 세션 시작하면 항상 정규식 재스캔부터 할 것: `re.findall(r'</p>\s*\n\s*</div>\s*\n\s*\n\s{10,}<h[23]>', content)`.
8. **GitHub Pages 빌드 대응 원칙 (v13에서 확립)**: 빌드 실패(X) 표시가 보이면 ①먼저 현재 콘텐츠가 마지막 성공 빌드와 diff 있는지 확인 ②없으면 콘텐츠 문제 아님 — GitHub Pages 서비스 자체 이슈일 가능성 높음 ③재빌드 트리거는 최소한으로만(과도하게 반복 트리거하면 오히려 빌드 큐가 막힐 수 있음) ④사용자에게 실제 사이트가 브라우저에서 열리는지 확인 요청 — GH Pages는 빌드 실패해도 마지막 성공 버전을 계속 서빙하므로 사이트가 다운되는 일은 없음.
9. **워크플로우 확정**: "Claude" GitHub App은 사용자가 제거함 — 앞으로도 채팅에서 주는 PAT로 직접 git clone/push하는 방식만 사용. GitHub App/Claude Code 브랜치 워크플로우 관련 언급 나오면 이미 제거된 상태임을 참고.
10. 사용자가 결과 화면 스크린샷 주면 숫자 재검산하는 습관 유지
