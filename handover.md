# EcoEnergyCalc 인수인계 문서 v15 (2026-07-19 기준)

v14 문서 + 이번 세션(v14→v15) 내용 통합. 새 세션 시작 시 이 문서만 보고 이어서 작업 가능하도록 작성함.

## 0. v15 세션 핵심 요약 (2026-07-19) — SC 데이터 분석 + 건조기 세액공제 팩트 오류 3건 발견/수정

- **작업 방식**: 사용자가 이번 세션에 "신규/보강은 반드시 ①기존 파일 중복확인 ②웹서치로 키워드 경쟁강도 확인(롱테일 전략 활용) ③수익화(AdSense) 관점 우선순위"를 명시적으로 재확인함. 추가로 "요즘 AI검색은 도메인 권위보다 콘텐츠 품질/문제해결·비교분석 구조가 중요하다"는 방향성을 줌 — 앞으로 신규/보강 콘텐츠는 이 원칙(문제해결형 + 비교분석형 구조)을 우선 적용할 것.
- **SC 데이터 분석 (5/18~7/16, 직전 대비 07-15·07-16 이틀치 신규 반영, 총 노출 249→257)**:
  - 클릭수는 여전히 전 쿼리 0. 대부분 쿼리 평균 게재순위 60~100위(구글 6~10페이지)로, 이는 온페이지 콘텐츠 부재보다 **신생 사이트 권위(백링크) 문제**로 판단됨. 상위 노출 클러스터(tree planting offset 계열, solar carbon offset calculator 계열, water usage 계열, heating vs cooling)를 직접 열어 확인한 결과 **이미 타이틀/메타/FAQ가 해당 쿼리 변형들과 거의 완벽하게 매칭돼 있었음** → 이 클러스터들은 추가 콘텐츠보다 시간이 답인 상태로 판단, 무리한 추가 작업 안 함.
  - v12~v14에 추가한 신규 페이지(dehumidifier, pool-pump, humidifier, freezer, hot-tub-running-cost, are-carbon-offsets-worth-it, is-a-heat-pump-worth-it-without-tax-credit)는 이번 데이터에도 아직 노출 자체가 안 잡힘 — 너무 최근이라 정상, 다음 세션에 재확인.
  - **진짜 갭 하나 발견**: `compare/wind-vs-solar-energy.html`이 전부 "유틸리티(발전소) 규모" 비교로만 작성돼 있었는데, 실제 노출 쿼리 "solar vs wind cost per watt"는 주거용(가정용 설치) 의도의 쿼리 — $/watt는 주거용 설치 견적에서 쓰는 단위. 웹서치로 경쟁 강도 확인(대형 블로그/설치업체 다수 있지만 특화 계산기 사이트는 없음, 진입 여지 있다고 판단) 후, 주거용 cost-per-watt 비교표 + "어떤 걸 선택해야 하나" 의사결정 프레임 섹션 + FAQ 3개(스키마 포함) 신규 추가.
  - `compare/electric-vs-gas-dryer.html`: 건조기 쿼리 클러스터("clothes dryer energy cost calculator" 등) 대응 FAQ 3개 추가(스키마 포함).
- **⚠️ 팩트 오류 3건 발견 및 수정 (세액공제 관련, v14 세액공제 대전수정에서 놓친 부분)**: 히트펌프 건조기 관련 페이지들에 "$840은 IRA 30% 세액공제(Section 25C)이며 2025-12-31부로 종료됐다"는 서술이 있었는데, 웹서치로 교차검증한 결과 **이건 애초에 사실이 아니었음** — 세탁건조기는 Section 25C 적용 대상 자체가 아니었음(25C는 HVAC 히트펌프/히트펌프 온수기/단열재/창문/도어만 해당, "표준 가전(냉장고·건조기·식기세척기)은 ENERGY STAR 인증 여부와 무관하게 25C 대상 아님"이 IRS 규정상 명확함). 실제 "$840" 수치는 **HEEHRA/HEAR(고효율 전기가전 리베이트)**라는 별도 프로그램에서 나온 것 — 이건 세액공제가 아니라 소득기준(AMI 150% 이하) 리베이트이고, 연방 자금이지만 주별로 시행 시기가 다름(2026년 현재도 주별로 순차 시행/일부는 이미 소진). 즉 "2025-12-31 종료"라는 서술도 틀림(그건 25C/25D 얘기지 HEEHRA 얘기가 아님). 다음 3개 파일 수정 완료:
  - `compare/heat-pump-dryer-vs-electric.html` (본문 문단 + 계산기 result-note + 사이드바 Quick Facts)
  - `compare/gas-dryer-vs-heat-pump-dryer.html` (인트로 문단 + 계산기 result-note + "IRA 세액공제" 섹션 전체를 "세액공제 vs 리베이트 구분" 섹션으로 재작성 + 비교표 행)
  - `blog/how-much-does-it-cost-to-run-a-dryer.html` (본문 문단)
  - 참고: `blog/how-to-save-on-laundry-energy-costs.html`은 확인해보니 이미 정확하게 "HEEHRA 리베이트"로 서술돼 있었음(오류 없음) — 대조군으로 확인해서 안심할 수 있었음.
  - **교훈**: v14에서 세액공제 관련 28개 파일을 전수 수정했지만, 그 스캔은 "25C/25D/EV 세액공제가 아직 유효하다는 서술"만 찾는 정규식/키워드 기반이었고, "적용 대상이 아닌 항목에 세액공제를 잘못 갖다붙인" 유형의 오류(이번 건조기 케이스처럼 25C 대상이 아닌 가전에 25C 세액공제를 서술)는 안 걸러졌음. **세액공제/리베이트 관련 서술을 다룰 때는 매번 "이 항목이 애초에 이 프로그램의 적용 대상이 맞는가?"부터 웹서치로 확인하는 습관이 필요함** — 다음 세션에서 다른 가전(식기세척기, 냉장고 등) 페이지에도 유사한 오류가 있는지 `grep -rn "tax credit\|25C\|IRA" tools/ blog/ compare/`로 훑어보고 각 항목이 실제 25C/25D 적용 대상인지 재검증할 것.
- **전체 사이트 재스캔(article-body/div/h2/JSON-LD)**: 작업 전후 모두 0건, 안전 확인.
- **⚠️ 이번 세션에는 신규 페이지 추가 안 함** — SC 데이터상 뚜렷한 신규 콘텐츠 갭이 없었고(기존 페이지들이 쿼리 클러스터를 이미 잘 커버 중), 오히려 팩트 오류 발견에 세션 상당 시간을 씀. 사용자가 준 "AI검색은 콘텐츠 품질이 권위보다 중요" 원칙에 따르면 이번 팩트 정정이 신규 페이지보다 우선순위가 높다고 판단함 — 부정확한 세액공제 정보는 AI 검색엔진이 인용 시 그대로 오답을 퍼뜨릴 위험이 있고, 사용자 신뢰에도 직접 영향.
- **다음 세션 우선순위**: (1) 위에서 언급한 "적용 대상 아닌 항목에 세액공제 오적용" 패턴을 다른 가전/항목에도 있는지 전수 재검사, (2) 새 SC 데이터로 v12~v14 신규 페이지 노출 여부 재확인, (3) 섹션 10의 compare 백로그(얇은 페이지) 계속 보강, (4) AdSense 심사 결과 재확인(이번 세션엔 사용자가 언급 안 해서 안 건드림).

### v15 세션 후반 — 사용자 지침 변경: "지금은 공격적으로 확장할 때" (신규 콘텐츠 1건 추가)
- 사용자가 "Google 순위가 0이어도 Bing 등 다른 검색엔진에선 다를 수 있다, 지금은 신규 콘텐츠로 롱테일을 먼저 점거해야 나중에 경쟁 붙어도 유리하다"는 방향으로 전략 수정 지시 → 신규 콘텐츠 발굴에 집중.
- **경쟁강도 조사 결과**: 가전 running-cost 계열 후보(게이밍 PC 전력비용, 전기벽난로 운영비, 필풀히터 운영비, 섬프펌프 전기료) 전부 웹서치로 확인해보니 **8개 이상의 전용 "appliance running ccost calculator" 애그리게이터 사이트가 이미 존재**(learnmetrics, ecocostsavings, runwatts, slashplan, sumppumpgurus/sumppumpcentral, poolheatpumps.com 등 — 특히 runwatts.com은 자체적으로 "141개 가전, 50개 주" 커버한다고 명시할 정도로 이 틈새를 이미 장악 중) → 전부 스킵. **결론: appliance running-cost 단일 계산기 카테고리는 이제 사실상 레드오션으로 판단, 이 유형의 신규 콘텐츠는 당분간 지양할 것.**
- **신규 발견/진행**: `tools/ai-carbon-footprint-calculator.html` (AI 챗봇 사용 탄소발자국 계산기) 신규 추가.
  - 선정 이유: 2026년 7월 현재 매우 뜨거운 화제(ChatGPT/Gemini 쿼리당 CO2 배출량 관련 기사 다수, 추정치가 0.03g~68g로 편차가 극심함)인데, 웹서치 결과 **인터랙티브 계산기 형태의 경쟁자가 전무함**(전부 정보성 블로그/기사: Piktochart, Earth911, Seedling, Kanoppi, Arbor.eco 등) — 계산기+비교분석 콤보가 우리 사이트의 강점과 정확히 맞아떨어짐.
  - 방법론: OpenAI(Sam Altman, 2025-06 공개, 평균 쿼리당 0.34Wh)과 Google(2025-08 공개, Gemini 중간값 프롬프트 0.24Wh) — 현재 업계에서 유일하게 공식 공개된 두 수치를 기반으로 하고, 나머지(추론형 태스크 3.4Wh 등)는 별도 명시. CO2 환산은 사이트 기존 표준(EPA eGRID, 미국 평균 0.386kg/kWh — solar-co2-offset-calculator.html과 동일)을 재사용해 방법론 일관성 유지. "AI 사용은 개인 탄소발자국에서 미미한 비중(연간 몇 kg 수준 vs 미국인 평균 16톤/년)"이라는 균형잡힌 문제해결형 분석도 포함 — 사용자가 요청한 "AI검색엔 문제해결/비교분석형 콘텐츠가 유리하다"는 방향에 정확히 부합.
  - sitemap.xml/llms.txt(계산기 총 개수 34→35 갱신)/tools/index.html/관련 계산기 3개(carbon-footprint, tree-planting-offset) 상호링크 전부 반영 완료. 전체 재스캔 결과 이상 없음.
  - **다음 세션 확인할 것**: 새 SC 데이터로 이 페이지 노출 여부 확인 (7/19 게시라 최소 1~2주는 지나야 반영될 것으로 예상).
- **다음 세션 방향 메모**: 사용자가 "공격적 확장 + 롱테일 선점" 노선으로 전환을 지시했으므로, 다음 세션에서도 신규 콘텐츠 발굴을 우선순위 상단에 둘 것. 단, appliance running-cost 카테고리는 레드오션이니 피하고, ①경쟁자가 "전용 계산기 애그리게이터"가 아니라 "일반 블로그/미디어"인 틈새(이번 AI 탄소발자국 사례처럼) ②최근 화제성 있는 데이터/뉴스에서 파생되는 틈새(v14의 heat-pump-worth-it 사례처럼) 이 두 패턴을 우선 탐색할 것.

### v15 세션 마지막 — FAQ 스키마 정밀검증 스크립트 신설 + 신규 블로그 1건 추가
- **새 버그 탐지 스크립트 작성 (섹션 10 반영)**: 기존 재스캔 스크립트는 구조(div/h2/JSON 유효성)만 검사했는데, "FAQPage 스키마의 질문이 본문에 실제로 존재하는가"를 검사하는 스크립트를 새로 만들어 전체 사이트 스캔함. 21건 발견 — 대부분(19건)은 `tools/water-usage.html`, `blog/solar-panel-guide.html` 등에서 스키마 질문과 본문 h3 문구가 약간만 다른 경미한 케이스(예: "per load" 유무, "the" 유무)였고 실질적 콘텐츠는 존재해서 우선순위 낮음(다음에 한가할 때 문구 통일 정도로 정리 가능). **하지만 2건은 진짜 갭**이었음 — v14에서 신규 작성한 `blog/are-carbon-offsets-worth-it.html`과 `blog/is-a-heat-pump-worth-it-without-tax-credit.html`에 FAQPage 스키마는 있는데 본문에 **매칭되는 FAQ 섹션 자체가 아예 없었음**(섹션 4-3 규칙을 v14에서 위반한 것을 이번에 발견). 둘 다 본문에 실제 FAQ 섹션 추가해서 수정 완료, 재검증 0건.
  - **교훈**: 기존 재스캔 스크립트(구조 버그용)와 이 신규 스크립트(FAQ 매칭용)는 서로 다른 버그 계열을 잡는다 — **앞으로 새 세션 시작 시 또는 새 파일 작성 후에는 두 스크립트를 모두 돌릴 것.** 아래 코드 추가:
```python
mismatches=[]
for f in files:
    c = open(f, encoding='utf-8').read()
    scripts = re.findall(r'<script type="application/ld\+json">(.*?)</script>', c, re.S)
    body_wo_scripts = re.sub(r'<script type="application/ld\+json">.*?</script>', '', c, flags=re.S)
    for s in scripts:
        try: data = json.loads(s)
        except Exception: continue
        if isinstance(data, dict) and data.get('@type') == 'FAQPage':
            for q in data.get('mainEntity', []):
                name = q.get('name','')
                if name and name not in body_wo_scripts:
                    mismatches.append((f, name))
```
- **신규 콘텐츠 1건 추가**: `blog/why-electric-bills-are-rising-ai-data-centers.html` — "AI 데이터센터가 가정용 전기료를 얼마나 올리는가"라는, 2026년 7월 현재 CNBC/Consumer Reports/Bloomberg/techxplore가 다루는 매우 화제성 높은 주제. 계산기 애그리게이터가 아니라 저널리즘/정책 콘텐츠 영역이라 경쟁 성격이 다르다고 판단해 진행. 논쟁적 지점(데이터센터가 원인이라는 쪽 vs 시장설계·예측오류가 원인이라는 SemiAnalysis 반론)은 한쪽으로 단정하지 않고 균형있게 서술함(Claude 균형서술 원칙 적용). 기존 `tools/electric-bill-spike-calculator.html`, `blog/reduce-electric-bill.html`, 이번 세션 신규 `tools/ai-carbon-footprint-calculator.html`과 전부 상호링크해서 "전기료/AI 인프라" 클러스터 형성. sitemap/llms.txt/blog index 반영, 구조+FAQ스키마 재검증 통과.
- **파일 개수 (2026-07-19 세션 종료 기준)**: tools 35개, blog 26개, compare 41개.
- **다음 세션 최우선**: 새 세션 시작하면 반드시 위의 FAQ 매칭 스크립트 + 기존 구조 스캔 스크립트를 함께 돌려서 재확인할 것. 그 다음 새 SC 데이터로 이번 세션 신규 페이지 2개(ai-carbon-footprint-calculator, why-electric-bills-are-rising-ai-data-centers) 노출 여부 확인.

### v15 세션 마지막 — 사용자 스크린샷 제보로 발견한 신규 버그 패턴 (스타일 깨짐)
- `blog/why-electric-bills-are-rising-ai-data-centers.html`의 FAQ 섹션이 `article-body` 래퍼 밖에 인라인 스타일(`<h2 style="max-width:800px...">`, `<div style="max-width:800px;margin:0 auto;">`)만으로 배치돼 있어서, 사이트 전역 CSS(카드 타이포그래피, h2 스타일링)가 적용 안 되고 **h2가 파란 배경 박스로 깨져 보이는 버그** 발생 — 사용자가 스크린샷으로 제보해서 발견.
- **원인**: 이 파일 작성 시 "Related Calculators" 블록까지만 표준 `<section class="article-page"><div class="container"><div class="article-body">...</div></div></section>` 구조를 닫고, 그 뒤에 FAQ를 별도 섹션으로 다시 열지 않고 그냥 인라인 스타일 div로 이어붙인 것이 원인. `blog/how-much-does-it-cost-to-run-ac.html` 같은 기존 정상 파일은 FAQ를 위해 `<section class="article-page" style="padding-top:0;"><div class="container"><div class="article-body"><h2>Frequently Asked Questions</h2>...` 패턴으로 **완전히 새 섹션을 다시 연다** — 이 표준 패턴을 참고해서 재구성함.
- **교훈/패턴 추가**: 본문 뒤에 "Related Calculators" 링크 박스 + FAQ를 붙이는 blog 페이지 구조를 새로 만들 때는, FAQ 앞에서 `</div></div></section>`로 완전히 섹션을 닫고 `<section class="article-page" style="padding-top:0;"><div class="container"><div class="article-body">`로 새로 열 것 — 절대 article-body 밖에서 인라인 스타일만으로 FAQ를 얹지 말 것. 기존 구조 스캔 스크립트(div/h2/JSON 균형)는 이런 "스타일 클래스 누락"까지는 못 잡으므로, **완료 보고 전 실제 렌더링을 스크린샷이나 URL로 확인하는 습관이 특히 중요**(섹션 5 체크리스트 7번과 동일한 원칙, 재강조).




---

## 0. v14 세션 핵심 요약 (2026-07-17) — ⚠️ 사이트 전체 세액공제 정보 대규모 수정
- **가장 중요한 발견**: 사용자가 블로그 콘텐츠 보강을 요청해서 신규 블로그 주제(EV 세제혜택 가이드)를 리서치하던 중, **연방 정부의 주요 청정에너지 세액공제가 전부 종료됐다는 사실을 발견함**:
  - **Section 25D (주택용 태양광/배터리/지열/태양열온수기 30% 세액공제)**: 2025-12-31부로 종료 (One Big Beautiful Bill Act, 2025-07-04 서명)
  - **Section 25C (히트펌프/단열재/창문/HPWH 30% 세액공제, 연간 최대 $3,200)**: 2025-12-31부로 종료 (동일 법안)
  - **연방 EV 구매 세액공제 (신차 최대 $7,500, 중고차 최대 $4,000)**: 2025-09-30부로 종료 (계약 예외 조항 있음)
  - **살아남은 것**: HOMES/HEEHRA 리베이트 프로그램(별도 예산 편성돼서 OBBBA 영향 안 받음, 소득기준 있음, 주별로 순차 시행 중), 주/지방/유틸리티 인센티브(dsireusa.org에서 확인 가능)
  - 출처: IRS 공식 FAQ, SEIA, Congress.gov CRS 등 다수 소스로 교차 확인 완료.
- **사이트 전체에서 "30% 세액공제 아직 유효/2032년까지"라고 잘못 서술한 파일을 전수 조사해서 수정함 — 총 28개 파일**:
  - tools: solar-panel-roi, solar-panel-savings, solar-panel-count-calculator, battery-storage, wind-turbine, green-home-upgrade-roi, home-energy-cost, insulation-savings (8개)
  - blog: solar-panel-guide, solar-panel-cost-2026, solar-incentives-by-state, renewable-energy-subsidies, heat-pump-vs-furnace, how-much-does-it-cost-to-run-a-dryer, how-to-lower-your-heating-bill, reduce-carbon-footprint, reduce-electric-bill, ev-vs-gas-true-cost, how-much-does-an-ev-save-on-fuel-costs, index(요약카드) (12개)
  - compare: central-ac-vs-window-unit, electric-heat-vs-gas-heat, electric-vs-gas-water-heater, gas-dryer-vs-heat-pump-dryer, heat-pump-vs-furnace-vs-boiler, heat-pump-water-heater-vs-electric, monocrystalline-vs-polycrystalline-solar, solar-lease-vs-buy-vs-loan, solar-shingles-vs-solar-panels, solar-water-heater-vs-electric, tankless-vs-tank-water-heater, on-grid-vs-off-grid-solar, solar-panels-vs-wind-turbine, solar-vs-generator, ev-vs-hybrid-vs-gas, ev-vs-gas-car, heat-pump-dryer-vs-electric, propane-vs-natural-gas, index(요약카드) (19개)
  - about.html (1개)
- **수정 유형**: (1) 계산기 JS 로직에서 `* 0.70` 또는 `- 7500` 같은 자동 세액공제 적용 코드 제거 (10개+ 파일에서 실제 계산 결과가 틀리게 나오고 있었음 — 단순 텍스트 오류가 아니라 **계산기 결과값 자체가 잘못 계산되고 있던 심각한 버그**), (2) FAQ 스키마 답변 수정("Yes, available through 2032" → "No, expired"), (3) 본문 서술 수정, (4) 사이드바 Quick Facts 수정, (5) `tools/solar-panel-roi.html`/`compare/ev-vs-gas-car.html`의 사용자 토글 입력 기본값을 "세액공제 적용 안 함"으로 변경.
- **버그 하나 더 발견 수정**: `compare/ev-vs-gas-car.html`에서 세액공제 입력 기본값을 0으로 바꾸면서 `parseFloat(value)||7500` 형태의 JS fallback이 있었는데, **0은 JS에서 falsy라 입력값 0이 무시되고 7500으로 대체되는 버그**를 같이 발견해서 수정함(`isNaN` 체크로 교체). 이런 `||기본값` 패턴은 값 0이 유효한 입력인 필드에서는 항상 버그 위험 있음 — 다음 세션에서 유사 패턴 발견하면 점검할 것.
- **구조적 버그 하나 더 발견 수정**: `blog/solar-incentives-by-state.html`에 짝 안 맞는 `<h2>` 태그(빈 `<h2>` + 나중에 닫는 태그만 있는 조각)가 있었음. article-body 조기종료 버그와는 다른 패턴이지만 같은 계열(HTML 구조 깨짐) — 발견 즉시 수정.
- **전체 사이트 최종 재검증**: "after ITC/before ITC/after credit/30% federal/through 2032/$7,500" 등 세액공제 관련 활성형(현재도 유효하다는 뉘앙스) 서술 전수 재스캔 결과 0건. article-body 버그/div 불균형/JSON-LD 오류/broken link도 전부 0건.
- 이번 세션엔 신규 페이지 추가 안 함 — 발견된 사실 오류 수정에 세션 시간 대부분 사용. 다음 세션에서 블로그 신규 콘텐츠(EV 세제혜택 가이드 등) 이어서 진행할 것.
- **세액공제 수정 이후 신규 블로그 1개 추가**: `blog/are-carbon-offsets-worth-it.html` ("탄소 상쇄가 사기인가/합법인가" 주제). 경쟁 리서치 결과 home energy audit(Angi/HomeAdvisor 등 대형 사이트 다수)는 스킵, 이 주제는 경쟁자가 니치 계산기 사이트가 아니라 일반 매체/NGO(NRDC, CBC 등)라 경쟁 구도가 다르고 기존 계산기(tree-planting-offset, solar-co2-offset-calculator)와 자연스럽게 연결돼서 선정. 논쟁적 주제라 찬반 균형 유지하며 작성(한쪽 입장 강요 안 함). sitemap/llms.txt/blog 인덱스/관련 계산기 3개 상호링크 전부 반영.
- **신규 블로그 2개째**: `blog/is-a-heat-pump-worth-it-without-tax-credit.html` — UC버클리 경제학자(Lucas Davis)가 7/13에 발행한 최신 분석 인용: 세액공제 종료됐는데도 히트펌프 출하량(AHRI 데이터)이 안 줄었다는 반전 스토리, 태양광(세액공제 종료 후 설치 급감)과 대비. 리서치 중 net metering/중고 EV 배터리 체크/수영장 히터/뱀파이어전력/홈에너지오딧 등 여러 후보가 전부 대형 전문 경쟁사 다수라 스킵했고, 이 주제는 3일 전 나온 신선한 데이터라 경쟁 콘텐츠가 아직 없어서 선정. **부수 발견**: `blog/heat-pump-vs-furnace.html`에도 solar-incentives-by-state.html과 동일한 "빈 `<h2>` 태그" 구조 버그가 있어서 같이 수정 — **이 패턴(빈 헤더 태그)이 article-body 조기종료 버그와는 별개로 존재하는 걸 확인**, 전체 사이트를 속성 포함 정확한 정규식(`<h2[ >]`)으로 재스캔해서 추가 문제 없음 확인함.
- **세션 마지막에 한 번 더 정밀 재스캔(줄 단위 "고아 닫힘태그" 패턴 검사 추가)한 결과 `blog/reduce-electric-bill.html`에서 세 번째 변형 버그 발견**: article-body가 콜아웃 박스 직후 일찍 닫히고, 실제 본문 섹션 2개("How to Read Your Electric Bill", "How Much Can You Realistically Save?")가 "Related Calculators" 스타일 박스 안에 통째로 잘못 삽입되어 스타일 없이 렌더링되고 있었음 — 구조 재정렬해서 수정. **이 반복 버그 계열(article-body 조기종료 + 빈/고아 헤더 태그)이 여러 파일에서 계속 발견되고 있음 — 과거 특정 시점 콘텐츠 일괄 작업에서 반복 발생한 것으로 추정.** 다음 세션에서도 새 파일 다룰 때마다 아래 검증 스크립트로 재스캔 습관화할 것 (섹션 10 참고).
- **마지막으로 compare 백로그 보강 2건**: smart-thermostat-vs-programmable.html(618→1096단어), induction-vs-gas-vs-electric-stove.html(653→1125단어) — 둘 다 FAQ 스키마+본문 추가. 남은 얇은 compare 페이지 순위는 섹션 10 참고.
- 서치콘솔 07-17 데이터는 이미 확인함 (변화 미미, 07-15 이후 신규 페이지 반영 전이라 정상) — 상세는 아래 섹션 참고.
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
- **추가: 07-17에 사용자가 진짜 새 SC 데이터(07-14까지)를 다시 줌** — 총 노출 237→249, 클릭 여전히 0, 색인 89/미색인 11 그대로(변화 없음, 7/1부터 정체). v12/v13 신규 페이지는 데이터 기간이 07-14까지라 아직 반영 안 됨(너무 이른 시점, 정상). about.html이 처음으로 노출 데이터에 잡힘(2회, 순위5) — E-E-A-T 보강 이후 크롤링은 되고 있다는 신호. 다음 세션에서 07-15 이후 데이터 오면 신규/보강 페이지 효과 확인할 것.
- **⚠️ GitHub 쪽 인프라 이슈 발생 및 대응 기록**: v13 작업 커밋 이후 Pages 빌드가 7연속 "Page build failed"로 실패. 콘텐츠는 매번 diff 0으로 확인됐고, GitHub API 자체가 500 Unicorn 에러를 반환하는 것까지 확인 → **GitHub 인프라 자체의 일시적 장애로 최종 판단**(콘텐츠/저장소 문제 아님). 사용자가 직접 반복 새로고침/robots.txt 커밋으로 재시도하면서 자연 해소됨. 교훈: 이런 패턴(콘텐츠 diff 없는데 빌드만 연속 실패)이 보이면 GitHub 상태 문제일 가능성을 먼저 의심하고, 무리한 재빌드 트리거보다 시간을 두고 기다리는 게 맞음.
- **버그 발견 및 수정**: `tools/hot-tub-running-cost.html`의 인플레이터블 vs 빌트인 비교표(3열)가 `table-scroll` 랩퍼 없이 만들어져서 모바일에서 잘림 — 사용자가 스크린샷으로 제보. 수정 완료, 전체 사이트 정밀 재스캔(JS 결과표 제외, 정적 3열 이상 비교표만 필터) 결과 이 페이지 외 동일 문제 없음 확인.

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

## 3. 현재 파일 개수 (2026-07-17 기준, 새 세션에서 재확인 필수)
- tools: 35개 (v15에서 ai-carbon-footprint-calculator 신규 추가)
- blog: 26개 (v15에서 why-electric-bills-are-rising-ai-data-centers.html 신규 추가)
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
0. **⚠️ 최우선: 세액공제 정보 재확인 습관화.** v14에서 연방 세액공제(25C/25D/EV) 전부 종료된 걸 발견하고 28개 파일 수정함(섹션 0 참고). 이런 대형 정책 변화는 또 있을 수 있음 — 새 세션 시작 시, 특히 새로 콘텐츠 만들거나 금액/세제 관련 서술 다룰 때 "이게 지금도 유효한 정책인가?" 웹서치로 재확인하는 습관을 들일 것. 특히 HOMES/HEEHRA 리베이트는 "주별 순차 시행 중"이라고 썼는데 진행 상황이 바뀔 수 있으니 다음에 이 주제 다시 다루면 최신 상태 확인.
1. **AdSense 심사 결과 확인 — 통과했으면 광고 슬롯(`adslot`)이 빈 껍데기인 상태 그대로인지, Auto Ads가 켜져 있는지 반드시 확인. 이게 수익화의 가장 큰 레버.**
2. **블로그 신규 콘텐츠 이어서 진행할 것.** v14 세션은 사용자가 "블로그도 좀 해라"고 요청해서 시작했는데, 리서치 중 세액공제 오류 발견해서 그거 고치느라 세션 대부분을 씀. SC 데이터 기준 블로그가 tools보다 훨씬 순위가 잘 나옴(solar-panel-guide 순위 7, ev-vs-gas-true-cost 순위 6 — tools 최고는 65위)는 사실은 여전히 유효하니, 다음 세션에서 신규 블로그 주제(예: 원래 검토하다 만 "EV 세제혜택 가이드" — 이제는 "세액공제가 없어진 상황 가이드"로 방향 전환 필요) 마저 진행할 것.
3. **새 SC 데이터 받으면 먼저 날짜 범위부터 확인할 것** — v13 세션에 첨부된 파일이 v12 때와 완전 동일한 파일이었음. 최근 며칠 데이터가 안 보이면 재요청.
4. 새 SC 데이터로 v12/v13 신규 페이지(dehumidifier, pool-pump, humidifier, freezer, hot-tub-running-cost) 노출/색인 여부 확인.
5. **백로그: compare 카테고리 전체(41개 중 상당수)가 600~900단어대로 얇음.** v12에서 얇음+고아 교집합 4개, v14에서 최상위 얇은 2개(smart-thermostat-vs-programmable, induction-vs-gas-vs-electric-stove) 추가 보강 완료(FAQ로 900+ 단어). **남은 얇은 페이지(900단어 미만) 순위**: public-transport-vs-car(636), driving-vs-flying-carbon(650), electric-bike-vs-car(659), electric-heat-vs-gas-heat(689, 이미 v14에서 세액공제 문구는 수정했으나 여전히 얇음), portable-ac-vs-window-ac(690), wind-vs-solar-energy(693), heat-pump-dryer-vs-electric(696, 세액공제 로직도 이미 v14에서 손봄), electric-vs-gas-water-heater(701, 세액공제 문구 수정했으나 얇음), low-flow-vs-standard-showerhead(706), dishwasher-vs-hand-washing(718), electric-vs-gas-dryer(722) 등 — 색인률 계속 정체되면 이 순서로 이어서 보강.
6. **백로그(경쟁 심함, 스킵 확정)**: EV 충전비용, electric water heater running cost, dishwasher running cost, generator running cost — 전부 전용 경쟁 계산기 사이트 8개 이상 존재. Heat pump running cost는 중간 경쟁으로 보류 상태, 권위 오르면 재검토.
7. GA 데이터 오면 항상 열어볼 것 — SC 노출만으로 우선순위 잡지 말고 실제 방문 있는 페이지도 같이 볼 것.
8. **버그 재발 패턴 정리 — 새 세션 시작하면 항상 아래 스크립트로 전체 사이트 재스캔부터 할 것 (v14에서 최종 검증된 버전):**
```python
import re, glob, json
files = list(set(glob.glob('tools/*.html')+glob.glob('blog/*.html')+glob.glob('compare/*.html')+glob.glob('glossary/*.html')+['about.html','index.html']))
for f in files:
    c = open(f, encoding='utf-8').read()
    for i, line in enumerate(c.split('\n')):
        s = line.strip()
        if re.search(r'</h[234]>$', s) and not re.search(r'<h[234][ >]', s):
            print("ORPHAN CLOSE TAG:", f, i+1, s[:80])  # article-body 조기종료 계열 버그 전부 이걸로 잡힘
    if c.count('<div') != c.count('</div>'):
        print("DIV MISMATCH:", f)
    for tag in ['h2','h3','h4']:
        if len(re.findall(rf'<{tag}[ >]', c)) != c.count(f'</{tag}>'):
            print(f"{tag.upper()} MISMATCH:", f)  # 속성 있는 태그(<h2 style="...">) 포함해서 정확히 셀 것
    for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>', c, re.S):
        try: json.loads(m)
        except Exception as e: print("JSON ERROR:", f, e)
```
이 정규식(줄 단위 "고아 닫힘태그" 탐지)이 기존 `</p>\s*</div>\s*<h[23]>` 정규식보다 훨씬 정밀함 — v14에서 이걸로 3번째 변형 버그(reduce-electric-bill.html)까지 잡아냄. **지금까지 발견된 반복 버그 총 정리**: article-body/헤더 관련 구조 버그가 v10~v14에 걸쳐 최소 6개 파일에서 나왔음(tree-planting-offset, green-home-upgrade-roi 계열, wind-turbine, solar-incentives-by-state, heat-pump-vs-furnace, reduce-electric-bill) — 과거 특정 시점 콘텐츠 일괄 생성 작업에서 반복된 패턴으로 추정, 아직 다 못 찾았을 가능성 있으니 위 스크립트를 매 세션 첫 단계로 습관화할 것. 정적 3열 이상 비교표에 `table-scroll` 랩퍼 누락되는 패턴도 발견됨(hot-tub-running-cost.html) — 새 비교표 만들 때마다 `<div class="table-scroll"><table>...</table></div>`로 감싸는 걸 습관화할 것. **JS 계산기에서 `parseFloat(x)||기본값` 패턴도 위험 — 사용자가 유효하게 0을 입력해도 기본값으로 대체되는 버그 가능(ev-vs-gas-car.html에서 발견) — `isNaN()` 체크로 대체할 것.**
9. **GitHub Pages 빌드 대응 원칙 (v13에서 확립, 실전 검증 완료)**: 빌드 실패(X) 표시가 보이면 ①먼저 현재 콘텐츠가 마지막 성공 빌드와 diff 있는지 확인 ②없으면 콘텐츠 문제 아님 — GitHub Pages/API 자체 이슈일 가능성 높음(실제로 GitHub API가 500 Unicorn 에러를 반환하는 것까지 확인한 사례 있음) ③재빌드 트리거는 최소한으로만(과도하게 반복 트리거하면 오히려 빌드 큐가 막힐 수 있음) ④사용자에게 실제 사이트가 브라우저에서 열리는지 확인 요청 — GH Pages는 빌드 실패해도 마지막 성공 버전을 계속 서빙하므로 사이트가 다운되는 일은 없음 ⑤이런 경우 30분~1시간 정도 그냥 기다리면 자연 해소되는 경우가 많음(v13에서 실제로 그렇게 해소됨).
10. **워크플로우 확정**: "Claude" GitHub App은 사용자가 제거함 — 앞으로도 채팅에서 주는 PAT로 직접 git clone/push하는 방식만 사용.
11. 사용자가 결과 화면 스크린샷 주면 숫자 재검산하는 습관 유지
