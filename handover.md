# EcoEnergyCalc 인수인계 문서 v13 (2026-07-16 기준)

v12 문서 + 이번 세션(v12→v13) 내용 통합. 새 세션 시작 시 이 문서만 보고 이어서 작업 가능하도록 작성함.

## 0. v13 세션 핵심 요약 (2026-07-16)
- 사용자가 SC zip 2개(Performance+Coverage, 7/16 export)만 주고 "신규/보강 작업 정리 후 바로 진행 + 경쟁 피하는 롱테일 키워드 + AI검색 시대엔 도메인 권위보다 콘텐츠(문제해결/비교분석)가 중요 + 수익화 관점 우선순위"를 지시. GA 파일은 이번엔 없었음.
- **GSC 데이터 분석 결과: 새로운 쿼리 갭 없음.** 노출 상위 쿼리 76개를 전수 확인했으나 전부 기존 페이지가 이미 커버 중(물 사용량/냉난방비/나무심기 탄소상쇄/가전 에너지비용/태양광 CO2 등). "mono vs poly efficiency"(v12에 스킵 결정) 등도 그대로. 순위가 이미 좋은 페이지도 있음: `blog/solar-panel-guide.html`(평균 7.46위, 노출13), `blog/ev-vs-gas-true-cost.html`(6위), `tools/solar-co2-offset-calculator.html`(3위) — 하지만 노출 자체가 1~13회로 너무 적어서 클릭 0인 게 CTR 문제라기보다 표본 부족(이항분포상 당연한 결과)으로 판단, 손대지 않음(사용자가 먼저 꺼내기 전까진 우선순위 아님, 섹션 8 지침 유지).
- Coverage: 색인 89(2026-07-10 기준, v12와 동일 — 리포트가 지연 반영이라 최신 변화는 다음 세션에 확인 필요), 미색인 11 그대로. 심각한 문제(리디렉션3/404 2/크롤링됨-미색인 6)도 v12와 동일한 숫자 — URL 특정 불가 원인도 동일해서 재진단 스킵.
- **신규 tool 페이지 2개 추가**: `humidifier-running-cost.html`, `freezer-running-cost.html`(chest+upright 겸용). 결정 과정(웹서치로 경쟁강도 확인): 후보로 hot tub(경쟁사가 hot tub 판매 브랜드 사이트라 상업적 의도 정렬이 강해 이기기 어려움 → 스킵), ceiling fan(이미 `compare/ceiling-fan-vs-ac.html`이 있어 자기잠식 우려 → 스킵), electric water heater/well pump(경쟁은 감당할 만하지만 humidifier/freezer 대비 우선순위 낮음 → 백로그)를 검토. Humidifier는 dehumidifier의 정확한 짝(같은 검색 의도 클러스터, 상호링크 시너지)이고 freezer는 refrigerator-energy-cost.html의 자연스러운 확장이며, 둘 다 경쟁사가 energybot/slashplan/learnmetrics/ecocostsavings 같은 우리와 비슷한 체급의 니치 계산기 사이트뿐이라 승산 있다고 판단.
- **AI검색 대응 설계**: 사용자 지시대로 두 페이지 모두 단순 계산기+FAQ에 그치지 않고 "비교분석형" 섹션을 core로 넣음 — humidifier는 "Cool Mist vs Warm Mist 비용 비교"(8~12배 차이, 직접 비교 데이터로 LLM이 인용하기 좋은 형태), "Humidifier vs Dehumidifier 비용 비교"(dehumidifier 페이지와 상호링크); freezer는 "Chest vs Upright 비용 비교"(15~25% 차이, 물리적 이유 설명), "세컨드 프리저 살 가치가 있는가"(문제해결형 — 대량구매 절약액 vs 전기요금 비교). 둘 다 첫 문단에 숫자로 직답하는 구조 유지(기존 성공 템플릿과 동일).
- 신규 페이지 둘 다: FAQ 스키마+본문 매칭, 900+ 단어, sitemap.xml/llms.txt 반영(개수 31→33 갱신), tools/index.html 카드 추가. 상호링크: `dehumidifier-running-cost.html`↔`humidifier-running-cost.html`, `refrigerator-energy-cost.html`↔`freezer-running-cost.html`, 허브 페이지(`appliance-energy-cost.html`/`home-energy-cost.html`/`ac-running-cost.html`) 사이드바에도 추가. 신규 페이지 둘 다 인바운드 링크 5개로 시작(오르판 아님).
- **버그 재스캔 (세션 시작 시 항상 하는 루틴)**: article-body 조기종료 패턴, table-scroll div 불균형, div open/close 불일치, JSON-LD 파싱 오류 — tools/blog/compare 전체 재스캔 결과 **0건** (v12 종료 시점과 동일하게 클린 유지됨, 이번 세션에 새로 만든 파일도 스크립트로 검증 완료).
- **AdSense 확인**: `<ins class="adsbygoogle">` 실 태그 여전히 없음(빈 `adslot` div만 존재) — v12에서 확인된 "심사 중" 상태 이후 변화 없어 보임. 이번 세션엔 사용자가 AdSense 얘기를 꺼내지 않아 먼저 묻지 않음 — 다음 세션에서 심사 통과 여부 먼저 확인할 것(섹션 10 참고).
- 파일 개수: tools 32→34, blog 24(변동없음), compare 42(변동없음), glossary 1(변동없음).

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
- tools: 34개 (v13에서 humidifier-running-cost, freezer-running-cost 추가)
- blog: 24개
- compare: 42개
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

### 4-2b. ⚠️ 외부 링크 도메인 주의 (지속 유효 사실)
- **NREL이 2025-12-01부로 "National Laboratory of the Rockies(NLR)"로 개편, 도메인 `nrel.gov` → `nlr.gov` 이전 중.** `developer.nrel.gov`는 2026-05-29 완전 폐기 확인됨. `pvwatts.nrel.gov` 같은 하위 도메인도 `pvwatts.nlr.gov`로 교정 필요(v12에서 about.html 수정함). `tools/solar-panel-savings.html`·`tools/wind-turbine.html`의 `maps.nrel.gov`는 텍스트 언급이라 아직 미수정 상태. **정부/기관 도메인으로 신규 외부 링크를 추가하거나 기존 링크를 점검할 때는 항상 nlr.gov 이전 여부를 재확인할 것.**

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

## 7. 수익화 현황 (v13 기준: 2026-07-16 확인)
- **AdSense는 여전히 심사 중으로 보임** — `<ins class="adsbygoogle">` 실제 태그 없이 빈 `adslot` div만 존재하는 상태 v12와 동일(변화 없음). 이번 세션엔 사용자가 AdSense를 언급하지 않아 먼저 묻지 않았음. **다음 세션에서 가장 먼저 확인: 심사 통과했는지, 통과했으면 광고 슬롯에 실제 `<ins>` 태그를 넣어야 하는지 Auto Ads만으로 충분한지.** (v11부터 계속 이어지는 최우선 확인사항)
- GA(마지막 수신: v11, 6/15~7/12 28일 기준. v12·v13 둘 다 GA 파일 못 받음 — 2세션 연속 GA 없이 SC만 받는 중): 총 페이지뷰 941, Organic Search 13 vs Direct 113. 총수익 28일 내내 $0.
- v13 SC 데이터(지난 3개월 누적, 7/16 export): **총 노출 237(v12와 동일 숫자 — SC "지난 3개월" 필터라 실질적으로 같은 기간을 다시 받은 것일 가능성 높음, 신규 데이터가 아닐 수 있으니 다음 세션엔 "최근 28일"이나 실제로 갱신된 기간인지 확인할 것), 클릭 0, 평균 게재순위 60~100대.** 국가: 미국 188 > 영국 34 > 캐나다/이스라엘 4. 기기: 데스크톱 233 > 모바일 15 > 태블릿 1 — 모바일 노출이 데스크톱 대비 매우 적음(참고만, 사용자가 먼저 안 꺼내면 손대지 말 것).
- 이미 순위가 나쁘지 않은 개별 페이지들도 있음 — `blog/solar-panel-guide.html`(7.46위), `blog/ev-vs-gas-true-cost.html`(6위), `tools/solar-co2-offset-calculator.html`(3위). 노출이 1~13회뿐이라 클릭 0은 표본 부족 문제로 판단(이항분포상 자연스러움) — CTR/타이틀 개선을 우선순위로 잡지 않음. **다만 노출이 누적되어 두 자릿수를 넘기고도 계속 클릭 0이면 그때는 타이틀/메타디스크립션 매력도 문제로 재검토할 것.**

## 8. 인덱싱/경쟁 현황 (참고만, 사용자가 먼저 언급 안 하면 우선순위로 잡지 말 것)
- Coverage: 색인 89/100 정체 지속(v12, v13 둘 다 동일 숫자 — 리포트 자체가 지연 반영이라 최신 아닐 수 있음)
- 경쟁사: `greenenergycalc.com`, `cleanenergycalc.com` 등 훨씬 큰 규모. 신규 콘텐츠 후보 검토 시 소형 니치 계산기 사이트(energybot, slashplan, gridhacker, learnmetrics, ecocostsavings 등)와는 경쟁 가능, 브랜드/판매사이트나 유틸리티 회사 사이트(directenergy, angi 등)가 이미 장악한 키워드는 스킵.
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

## 9-1. 이번 세션(v12→v13)에 한 작업 전체 목록
### 분석
- GSC Performance(검색어/페이지/국가/기기) + Coverage zip 전수 분석 — 신규 쿼리 갭 없음 확인(상위 76개 쿼리 전부 기존 페이지가 이미 커버). 색인 89, 미노출 11로 v12와 숫자 동일.
- AdSense adslot 재확인 — 여전히 빈 껍데기, 변화 없음(사용자가 먼저 안 물어봐서 그대로 기록만 함).

### 신규 페이지 (웹서치로 경쟁강도 확인 후 결정)
- `tools/humidifier-running-cost.html`: cool mist/warm mist/furnace-mounted 프리셋, duty cycle 계산. "Cool Mist vs Warm Mist 비용 비교" + "Humidifier vs Dehumidifier 비용 비교" 섹션 포함(AI검색 대응 비교분석형 콘텐츠).
- `tools/freezer-running-cost.html`: chest/upright 겸용, 5개 사이즈·타입 프리셋(24시간 연속가동 평균전력 모델, refrigerator-energy-cost.html과 동일 패턴). "Chest vs Upright 비용 비교" + "세컨드 프리저 살 가치가 있는가"(문제해결형) 섹션 포함.
- 검토 후 스킵: hot tub(hot tub 판매 브랜드 사이트가 계산기 시장 장악, 상업적 의도 정렬 강함), ceiling fan(기존 `compare/ceiling-fan-vs-ac.html`과 자기잠식 우려).
- 백로그행: electric water heater / well pump running cost — 경쟁은 감당 가능하나 이번 세션 후보 대비 우선순위 낮아서 보류.
- sitemap.xml, llms.txt(개수 31→33 갱신), tools/index.html 카드 반영 완료. 상호링크: dehumidifier↔humidifier, refrigerator↔freezer, 허브 3개 페이지(appliance-energy-cost/home-energy-cost/ac-running-cost) 사이드바 반영.

### 검증
- article-body 조기종료/table-scroll/div 불균형/JSON-LD 파싱 오류 전체 재스캔 — 0건(신규 파일 포함).
- 신규 페이지 2개 인바운드 링크 각 5개 확인(오르판 아님), JS getElementById 참조-실제 id 불일치 없음 확인.

## 10. 다음 세션 우선순위 제안
1. **AdSense 심사 결과 확인 — 통과했으면 광고 슬롯(`adslot`)이 빈 껍데기인 상태 그대로인지, Auto Ads가 켜져 있는지 반드시 확인. 이게 수익화의 가장 큰 레버.** (v11부터 3세션째 이월 — 사용자가 안 꺼내면 먼저 물어볼지 판단 필요)
2. 새 SC 데이터로 v13 신규 페이지(humidifier-running-cost, freezer-running-cost) 노출/색인 여부 확인. v12 신규 페이지(dehumidifier-running-cost, pool-pump-running-cost)도 아직 노출 데이터에 안 잡혔으면 계속 지켜볼 것(신규 페이지는 색인까지 몇 주 소요 정상).
3. **다음 SC export 받으면 기간(지난 3개월/28일 등)과 총 노출수가 v12·v13과 다른지 꼭 확인 — 이번 세션엔 v12와 총 노출 237로 완전히 같은 숫자가 나와서 같은 기간을 다시 받았을 가능성이 있음.**
4. **백로그: compare 카테고리 전체(42개 중 상당수)가 600~900단어대로 얇음.** 여전히 미착수 — 색인률이 계속 정체되면 순차적으로 900+ 단어로 확장 검토.
5. 백로그: heat pump running cost / electric water heater running cost / well pump running cost calculator — v12·v13에서 경쟁 감당 가능하나 우선순위 밀려서 보류함. 다음 신규 페이지 세션에서 최우선 후보.
6. GA 데이터 오면 항상 열어볼 것 — SC 노출만으로 우선순위 잡지 말고 실제 방문 있는 페이지도 같이 볼 것 (v11 교훈 유지, v12·v13 둘 다 GA 없이 진행됨 — 2세션 연속이라 다음엔 사용자에게 GA도 있는지 먼저 물어봐도 좋음).
7. **버그 재발 패턴 정리**: article-body 조기종료 버그가 v10(tree-planting-offset), v11(4개), v12(wind-turbine)까지 나왔으나 v13 재스캔에서는 0건. 새 세션 시작하면 항상 정규식 재스캔부터 할 것: `re.findall(r'</p>\s*\n\s*</div>\s*\n\s*\n\s{10,}<h[23]>', content)`. 언제든 재발 가능하니 방심 금지.
8. 사용자가 결과 화면 스크린샷 주면 숫자 재검산하는 습관 유지
