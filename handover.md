# EcoEnergyCalc 인수인계 문서 v12 (2026-07-15 기준)

v11 문서 + 이번 세션(v11→v12) 내용 통합. 새 세션 시작 시 이 문서만 보고 이어서 작업 가능하도록 작성함.

## 0. v12 세션 핵심 요약 (2026-07-15)
- **AdSense는 현재 "심사 중"** (사용자 확인, v11에서 궁금했던 Auto Ads 여부는 심사 완료 전까지 의미 없음 — 심사 통과 여부부터 다음 세션에서 재확인할 것). 이번 세션은 순수 콘텐츠 확장/보강에 집중.
- 이번엔 GA 데이터 없이 Search Console(Performance+Coverage)만 받음. **총 노출 237, 클릭 0(전 기간), 평균 게재순위 60~100대** — 사이트 나이 2개월차, 도메인 권위 매우 낮은 게 원인으로 보임. 기존 상위 페이지(water-usage, heating-vs-cooling, appliance-energy-cost, tree-planting-offset)들은 이미 타이틀/FAQ/스키마가 쿼리와 잘 매칭되어 있어 콘텐츠 보강보다 "권위/백링크" 문제로 판단 → 이미 탄탄한 페이지에 추가 패딩하지 않고 새 페이지 확장에 집중.
- Coverage: 색인 73→89로 증가, 미색인 11개로 감소 (개선 흐름). 심각한 문제(리디렉션 3, 404 2, 크롤링됨-미색인 6)는 URL 특정 안 됨(CSV가 카운트만 제공) — 내부 링크 전수 검사 결과 broken link 0건, sitemap-파일 불일치 없음 → 우리 쪽 콘텐츠 문제 아니라 판단, 방치.
- **신규 tool 페이지 2개 추가**: `dehumidifier-running-cost.html`, `pool-pump-running-cost.html`. 결정 과정: EV 충전비용 계산기(가장 유력 후보)는 웹서치 결과 Tesla/EPA/CarMax/Blink 등 초대형 브랜드가 이미 장악 → 스킵. Heat pump running cost는 중간 경쟁(HVACBase, RunWatts 등 중소형 니치 사이트) → 이번엔 보류, 백로그. Dehumidifier/Pool pump는 경쟁사가 전부 우리와 비슷한 체급의 소형 니치 계산기 사이트(energybot, gridhacker, learnmetrics 등)라 승산 있다고 판단 + 기존 사이트의 가장 성과 좋은 템플릿("~running cost calculator" 가전 시리즈: dryer/washing-machine/fridge/space-heater/AC)과 정확히 같은 패턴이라 제작.
- 신규 페이지 둘 다: FAQ 스키마+본문 매칭, 900+ 단어, sitemap.xml/llms.txt 반영, tools/index.html 카드 추가, appliance-energy-cost.html/home-energy-cost.html/ac-running-cost.html 사이드바에 상호링크 추가 완료.
- **버그 신규 발견 및 수정**: `tools/wind-turbine.html`에서 기존에 반복되던 "article-body 조기 종료" 버그 추가 발견 — "Wind Resource Assessment" h3+본문이 article-body div 밖에서 스타일 없이 렌더링되고 있었음. 정규식 스캔으로 잡아서 수정 완료. **전체 사이트 재스캔 결과 이제 article-body 버그/table-scroll 버그/div 불균형/JSON-LD 파싱 오류 전부 0건** (v12 세션 종료 시점 기준).
- **색인 안 되는 페이지 원인 진단 시도**: 사용자가 미색인 페이지(11개) 원인을 물어봤으나, GSC zip export는 URL별 색인 사유를 안 줌(요약 카운트만 제공) — 웹 UI "페이지" 리포트에서만 확인 가능. 대신 repo 내 신호(단어수 + 내부링크 인바운드 개수)로 대리 진단: **고아 페이지(인바운드 링크 0~1개) 8개 발견 및 전부 상호링크로 해소**(4개는 blog, 4개는 compare — 그중 compare 4개는 얇기까지 해서(700~900단어) FAQ 추가로 1,100~1,300단어까지 확장). 재스캔 결과 고아 페이지 0건.
- compare 카테고리 전체(42개 중 상당수)가 여전히 tools/blog보다 얇음(600~900단어대) — 이번엔 얇음+고아 교집합만 처리, 나머지는 다음 세션 백로그.
- **about.html E-E-A-T 보강**: 363단어 → 644단어. 가짜 저자 프로필 대신 실제 데이터 출처(EIA/EPA/DOE/NREL/Poore&Nemecek 2018)를 링크와 함께 명시. 링크 4개 전부 웹서치로 실재 URL 확인 후 반영(DOE는 예전 URL이 energy.gov/save로 바뀌어 있어서 교정).
- 파일 개수: tools 30→32, blog 24(변동없음), compare 42(변동없음), glossary 1(변동없음).

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

## 3. 현재 파일 개수 (2026-07-15 기준, 새 세션에서 재확인 필수)
- tools: 32개 (v12에서 dehumidifier-running-cost, pool-pump-running-cost 추가)
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
2. 새 SC 데이터로 v12 신규 페이지(dehumidifier-running-cost, pool-pump-running-cost) 노출/색인 여부 확인. 아직 색인 안 됐으면 정상(신규 페이지는 몇 주 소요). 이번에 보강한 8개 고아 페이지/4개 얇은 compare 페이지도 색인 개선됐는지 같이 확인.
3. **백로그: compare 카테고리 전체(42개 중 상당수)가 600~900단어대로 얇음.** 이번 세션엔 얇음+고아 교집합 4개만 처리함 — 색인률이 계속 정체되면 나머지 compare 페이지들도 순차적으로 900+ 단어로 확장 검토.
4. 백로그: heat pump running cost calculator (tools, standalone) — v12에서 경쟁 중간 수준으로 판단해 보류함. 사이트 권위가 조금이라도 올라가면 재검토.
5. GA 데이터 오면 항상 열어볼 것 — SC 노출만으로 우선순위 잡지 말고 실제 방문 있는 페이지도 같이 볼 것 (v11 교훈 유지).
6. **버그 재발 패턴 정리**: article-body 조기종료 버그가 v10(tree-planting-offset), v11(4개), v12(wind-turbine) 계속 나오고 있음 — 오래된 페이지 위주로 나오는 걸 보면 과거 특정 시점 일괄 콘텐츠 확장 작업에서 반복된 실수로 추정. 새 세션 시작하면 항상 정규식 재스캔부터 할 것: `re.findall(r'</p>\s*\n\s*</div>\s*\n\s*\n\s{10,}<h[23]>', content)`. v12 종료 시점 기준 전체 사이트 0건이지만 언제든 재발 가능.
7. 사용자가 결과 화면 스크린샷 주면 숫자 재검산하는 습관 유지
