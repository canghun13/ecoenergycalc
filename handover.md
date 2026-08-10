# EcoEnergyCalc 인수인계 문서 v20 (2026-08-10 기준)

v19 문서 + 이번 세션(v19→v20) 내용 통합. 새 세션 시작 시 이 문서만 보고 이어서 작업 가능하도록 작성함.

## 0. v20 세션 핵심 요약 (2026-08-10, Opus 분석 세션 — 코드 수정 없음, 진단만)

### 0-0-3. ✅ 보류했던 콘텐츠 정확도 오류 4건 전부 해결 (커밋 `83d6508`) — **미결 항목 없음**

이전 세션들에서 "요금 갱신 범위 밖 / 원본 결함이라 별도 세션 필요"로 계속 미뤄왔던 것들. 전부 처리 완료.

1. **`compare/electric-vs-gas-dryer.html` — 10배 자릿수 오류**: `5kWh × 0.13 = $0.65`인데 `$0.065`로 표기. FAQ 스키마·화면표시 FAQ·본문 3곳에 전파돼 있었음. 추가로 본문은 5kWh/load 기준인데 페이지 계산기는 3.75kWh(45분 × 5kW) 기준이라 서로 안 맞던 것도 계산기 기준으로 통일.
2. **`tools/washing-machine-energy-cost.html`**: hot→cold 절감액 "$95/year"가 같은 페이지의 per-load 리스트($1.33 vs $0.07 × 260 = $328)와 3.5배 불일치. 세탁기 타입별 4항목도 명시된 W×분 기준으로 역산 안 됨. 둘 다 재계산.
3. **`compare/central-ac-vs-window-unit.html`**: "$35–$65 at 13¢"에서 상한($65)은 700W로 정확했으나 하한이 500W 기준 $47이어야 하는데 $35로 오기돼 있었음(그래서 이전 세션들이 "역산 불일치"로 계속 스킵). 명시된 500–700W 기준으로 재계산.
4. **`blog/how-much-does-an-ev-save-on-fuel-costs.html`** — ⚠️ **우리가 만든 문제**: 전국평균을 18¢로 올리면서, "near national average"로 분류된 州들(12~13¢)이 오히려 평균보다 훨씬 낮아지는 모순이 생김. **EIA 2026-08 실측 州별 요금을 웹에서 검증해 14개 州 전면 재계산·재분류.** Ohio는 19.52¢로 평균 이상이라 그룹 자체를 이동. 홈충전 요금대($0.10–0.16)도 현 평균 미달이라 갱신.
   - **교훈(다음 세션 주의)**: 전국평균을 바꾸면 "평균 대비" 표현을 쓰는 모든 곳이 깨진다. 요금 갱신 시 숫자만 보지 말고 **"average / typical / near national average" 같은 상대 표현**도 함께 검색해서 점검할 것.

**현재 남은 `13¢/kWh`·`$0.13` 5건은 전부 정당한 것들이라 건드리면 안 됨**: `electric-bike-vs-car`·`ev-vs-gas-car`·`public-transport-vs-car`의 `$0.13/mile`은 **휘발유차 마일당 비용**(전기요금 아님), `how-much-does-an-ev-save-on-fuel-costs`의 `$0.13`은 **오클라호마 실제 요금(13.38¢, 검증됨)**, `central-heat-vs-space-heater`의 `$0.13–$0.25`는 **州별 요금 스프레드 하한**(최저요금 州가 실제로 12.35~13.6¢라 유효).

### 0-0-0. ⚠️⚠️ P0-A가 `compare/` 전체를 누락했던 것 발견 → 해결 완료 (커밋 `fa48b59`)

**P0-A(요금 기본값 갱신)가 `tools/`만 처리하고 `compare/` 26개 + blog 2개 계산기를 통째로 빠뜨리고 있었음.** 즉 P0-A "완료" 보고 이후에도 사이트 계산기 28개가 계속 13¢/16¢로 계산하고 있었던 것. 입력 기본값 28건 + JS fallback 상수 28건 전부 18¢로 통일 완료.

- **재발 방지용 검증 커맨드(다음 세션에서 반드시 이걸로 확인할 것)** — `tools/`만 보지 말 것:
  ```
  for f in tools/*.html compare/*.html blog/*.html; do
    grep -oE '<input[^>]*id="[^"]*(rate|elec)[^"]*"[^>]*value="(1[0-7](\.[0-9])?)"' "$f" | sed "s|^|$f: |"
  done
  grep -rn "getElementById('[^']*\(rate\|elec\)[^']*')\.value)\s*/\s*100\s*||\s*0\.1[0-7]" --include=*.html .
  ```
  현재 두 스캔 모두 **0건**.
- **JS 무결성 검증 방법(이번에 도입, 앞으로 계산기 건드리면 매번 할 것)**: 컨테이너에 `node`가 있음. `node --check`로 46개 파일 문법 검사 통과, 나아가 DOM 스텁을 만들어 계산기를 **실제로 실행**해 출력값까지 확인함. 구조 스캔만으로는 JS 계산 버그를 절대 못 잡으니 반드시 실행 검증할 것.

### 0-0-2. ✅ `electric-heat-vs-gas-heat.html` 3중 불일치 — 원인 규명 후 전부 해결 (커밋 `fa48b59`)

이전 세션에서 "미수정, 별도 검토 필요"로 남겼던 건. 조사해보니 **셋 중 하나는 진짜 코드 버그였음**:

1. **[실제 버그] 계산기 크로스오버 공식이 COP를 나누지 않고 곱하고 있었음** — `(gas*10/0.95)/(293.07*2.5)`는 `/2.5`여야 맞음. 이 버그로 사용자에게 "히트펌프가 유리한 조건: 전기요금 **2.4¢/kWh** 미만"이라는 현실에 없는 값이 표시되고 있었음(정답 15.3¢). 수정 후 node로 실행해 15.3¢ 출력 확인.
2. **[내용 오류] 본문의 "히트펌프 COP3.0 = $0.053/kBTU"는 사실 전기저항(COP1) 값**이었음. 역산해보면 0.18/3.412 = 0.0528로 정확히 일치. 계산기 자체 기준(COP2.5/95% AFUE)으로 문단 전면 재작성 — 현 요금(18¢/$1.70)에서 히트펌프 COP3.0($0.018)과 가스퍼니스 95%($0.018)가 사실상 동률이고 COP2.5($0.021)는 오히려 가스보다 비싸다는 점을 정직하게 반영("electric wins decisively" 문구 삭제).
3. **[기준 혼선] 사이드바 크로스오버**를 계산기와 같은 기준(15¢)으로 정렬. 직전 커밋에서 넣었던 22¢는 다른 페이지(heating-vs-cooling.html)의 COP3/80% AFUE 기준을 잘못 가져온 것이라 정정.
- **결과: 계산기 출력 / 사이드바 / 본문 세 곳 수치 완전 일치.** 부수적으로 innerHTML의 미이스케이프 `<`도 `&lt;`로 수정.

### 0-0-1. ✅ 가스요금(1.10/1.30→1.70/therm) 전용 배치 완료 (같은 날 후속 세션, 커밋 `f9ea463`)

P0-B 작업 중 부수적으로 발견했던 "$1.10/therm 잔존 11개 파일" 이슈를 마저 정리함. 10개 파일 수정(1개는 원래 있던 electric-vs-gas-water-heater.html P0-B에서 이미 처리된 것으로 확인돼 제외). `grep -rln '\$1\.10/therm|value="1\.10"|value="1\.30"' --include=*.html .` 결과 **완전히 0건.**

- **계산기 8개**: 입력 기본값 + JS fallback 상수 기계적 수정(1.70 통일) — `electric-heat-vs-gas-heat`, `electric-vs-gas-dryer`, `gas-dryer-vs-heat-pump-dryer`, `heat-pump-vs-furnace-vs-boiler`, `induction-vs-gas-vs-electric-stove`, `propane-vs-natural-gas`, `tankless-vs-tank-water-heater`, (`electric-vs-gas-water-heater`는 P0-B에서 이미 처리됨).
- **`low-flow-vs-standard-showerhead.html`**: 사용자 입력 없는 하드코딩 JS 상수(가스 1.10→1.70, 전기 16¢→18¢ 동시 발견) + 드롭다운 라벨 동반 수정.
- **`blog/is-it-cheaper-to-heat-or-cool-your-home.html`**: 가스 1000therm 기준으로 역산 확인 후 재계산. **P0-B 때 "범위 밖"으로 미뤄뒀던 전기저항($3,000-3,900)·히트펌프($700→$1,000-1,300) 문구도 가스와 짝을 맞춰 이번에 같이 재계산함** — COP~3 기준으로 역산 정확히 맞음. "more than twice" 비교 문구도 새 비율(1.76-2.3x)에 맞게 "75-130% more"로 정정.
- **`compare/gas-dryer-vs-heat-pump-dryer.html`**: ⚠️ **결론이 또 뒤집힘** — 가스(1.10→1.70, +55%)가 전기(16→18¢, +12.5%)보다 훨씬 크게 올라서, 가스건조기와 히트펌프건조기 운영비가 사실상 동률로 수렴함("가스가 제일 저렴" → "거의 동률"). H2 제목·본문·Quick Facts 사이드바 3곳 전부 수정.
- **`compare/electric-heat-vs-gas-heat.html`**: 손익분기점(elec<17¢ at $1.30gas) 재계산해서 22¢(at $1.70gas)로 갱신. **⚠️ 단, 이 파일 자체에 3중 불일치 발견함(미수정, 별도 검토 필요)**: ①계산기는 COP2.5·95%AFUE 가정 ②이 손익분기점 문구는 역산해보니 실제로는 COP3·80%AFUE 기준(계산기와 다름, 대신 heating-vs-cooling.html과는 일치) ③본문 문단(line 52)의 "히트펌프 COP3.0 → $0.053/kBTU"는 역산해보면 실제로는 전기저항(COP1) 값과 정확히 일치함 — 히트펌프 값이 아니라 전기저항 값을 히트펌프라고 잘못 표기한 것으로 보임. 세 군데가 서로 다른 가정을 쓰고 있어 어느 게 "의도된" 기준인지 판단 불가, 콘텐츠 정확도 전용 세션 필요.

### 0-0. ⚠️ (같은 날 후속 세션 기록) IndexNow 구현 — 키 파일 커밋 완료, 제출은 이 샌드박스에서 불가능함이 확인됨

- **키 확정**: `284760dd18f46ec1273996ed32a8e5f4` (32자 hex). **다시 만들지 말 것** — 재생성하면 기존 제출 이력이 무효화됨.
- 루트에 `/284760dd18f46ec1273996ed32a8e5f4.txt` 커밋 완료(내용=키 문자열만, 개행 없음, 32바이트 정확히 확인).
- `scripts/submit_indexnow.py` 커밋 완료 — sitemap.xml 118개 URL을 IndexNow 벌크 엔드포인트로 POST하는 스크립트. **아직 한 번도 성공 실행되지 않음.**
- **원인**: 이 세션이 실행되는 샌드박스의 네트워크 egress 프록시가 `api.indexnow.org`와 `ecoenergycalc.com` 둘 다 차단함(`x-deny-reason: host_not_allowed`) — 허용 도메인 목록에 github/pypi/npm 계열만 있고 이 두 호스트는 없음. **IndexNow 쪽 거부가 아니라 이 작업 환경 자체의 제약임.**
- **다음 세션에서 반드시 첫 번째로 시도할 것**: `python3 scripts/submit_indexnow.py` 재실행. 네트워크 허용 도메인이 세션마다 바뀔 수 있으므로 매번 먼저 시도해볼 것 — 이번처럼 403이 나오면 아래 사용자 액션으로 대체.
- ⚠️ **사용자 액션 필요 (Claude가 대신할 수 없음)**:
  1. `https://ecoenergycalc.com/284760dd18f46ec1273996ed32a8e5f4.txt`가 브라우저에서 정상적으로 열리는지(200, 키 문자열만 표시) 직접 확인해줄 것 — GitHub Pages 반영은 됐을 것으로 예상되나 Claude가 직접 검증 못함.
  2. 키 파일이 정상 확인되면, 로컬 환경이나 다른 터미널에서 `python3 scripts/submit_indexnow.py`를 실행해 118개 URL을 제출해줄 것(레포를 pull 받아서 실행하면 됨). 또는 Bing Webmaster Tools 콘솔에서 수동으로 사이트맵을 제출해도 IndexNow와 별개로 크롤링 유도 효과가 있음.
  3. **Bing Webmaster Tools(webmaster.bing.com) 계정 등록 + 도메인 소유확인 + `https://ecoenergycalc.com/sitemap.xml` 제출** — 이건 원래부터 사용자만 할 수 있는 단계.

**이번 세션에서 파일 수정은 handover.md 하나뿐이다. 아래 0-7의 작업 지시는 전부 Sonnet이 다음 세션에 실행할 것.**

### 0-1. ⚠️ 최대 발견: 전기요금 단가가 사이트 전체에서 13¢/kWh로 굳어 있음 (2021~22년 수치)

- `13¢/kWh` 또는 `$0.13` 문자열이 **41개 HTML 파일**에 존재. 그중 **계산기 입력 기본값(`value="13"`)이 20개 tool 파일**에 박혀 있음.
- 예외는 `tools/ac-running-cost.html`(16) 하나뿐. 그 외 `tools/led-vs-incandescent.html` JS 내부 0.15, `compare/train-vs-plane-carbon.html` 0.134 등 산발적 값도 있음.
- **웹서치 재확인(2026-08-10)**: EIA 기준 2026년 미국 주택용 평균 전기요금은 **18.0~18.4¢/kWh**(STEO 2026 연평균 전망 18.02¢, 2026-08 시점 월간 집계 기준 18.44¢로 보도됨. 2025년 17.29¢ → 2026년 상승). 즉 **사이트의 모든 비용 산출값이 실제보다 약 28~38% 낮게 표시되고 있음.**
- 가스류도 같이 낡음: `tools/heating-vs-cooling.html` $1.10/therm, `tools/dryer-energy-cost.html` $1.30/therm. **2026 EIA 주택용 천연가스는 대략 $1.45~1.95/therm 범위**, 프로판 약 $2.67/gal, 난방유 약 $3.50/gal(난방유·프로판 주간 시리즈는 비수기라 10월 재개).
- **왜 이게 1순위인가**: ①이 사이트의 상품 자체가 "비용 계산기"인데 그 핵심 상수가 4년 낡음 — 신뢰성 훼손이 곧 제품 결함 ②사용자 대부분은 기본값을 바꾸지 않으므로 실제 노출되는 숫자가 전부 틀림 ③**수익화 직결**: 요금이 낮게 잡히면 태양광 절감액·페이백이 실제보다 나쁘게 나와서 리드젠 전환을 스스로 깎아먹음(`solar-panel-savings`, `solar-panel-roi`, `solar-panel-count-calculator` 전부 13¢ 기준) ④유일하게 성장 중인 채널이 AI 어시스턴트인데, AI는 "최신·정확한 수치"를 인용 기준으로 삼음.
- v19의 지시 4번("냉장고 클러스터만 요금 갱신")은 **범위 판단이 틀렸다**. 냉장고 클러스터 단독 문제가 아니라 사이트 전역 문제이므로 v20에서 전면 확대함.

### 0-2. ⚠️ 두 번째 발견: 실제 유기 트래픽은 100% Bing 계열이고 Google은 0

GA(2026-07-13~08-09, 28일) 세션 소스:
| 소스 | 세션 |
|---|---|
| (direct)/(none) | 82 |
| duckduckgo/organic | 16 |
| bing/organic | 13 |
| yahoo/organic | 4 |
| ecosia.org/organic | 3 |
| copilot.com (ai-assistant + not set) | 4 |
| 디렉토리 referral(newtool/kittylaunch/foundrlist) | 4 |
| **google/organic** | **0** |

- **Bing 인덱스 계열(bing+duckduckgo+yahoo+ecosia) = 36세션.** DuckDuckGo·Yahoo·Ecosia는 전부 Bing 인덱스를 쓴다. 즉 이 사이트는 **Bing에서는 이미 클릭을 받을 만큼 랭크되어 있고, Google에서만 안 되는 것**이다(SC 노출 393 / 클릭 0, 3개월 누적).
- **3세션 연속 google/organic 0건.** v19에서 "샌드박스 탈출 국면"으로 해석했으나, 이번 데이터로는 그 해석이 성급했다(0-3 참고).
- **전략적 함의**: 지금까지 모든 작업이 Google을 향해 있었는데, 정작 돈이 되는 채널은 Bing 계열이다. 그리고 **Bing 인덱스가 곧 Copilot / ChatGPT Search의 소스**다 — 이 사이트에서 유일하게 살아있는 두 채널(Bing 유기검색 + AI 어시스턴트)이 같은 인덱스를 공유한다. **Bing Webmaster Tools 등록 + IndexNow 도입이 투입 대비 회수가 가장 큰 인프라 작업이다.**
- IndexNow는 정적 사이트에서 그대로 된다: 루트에 `{키}.txt`(8~128자 영숫자, hex 권장) 하나 올리고 `api.indexnow.org`에 URL 목록을 POST하면 끝. GitHub Pages도 루트 정적 파일 서빙되므로 문제 없음. **키 파일은 반드시 200으로 응답해야 하고 리다이렉트되면 검증 실패한다.**
- ⚠️ **사용자 액션 필요**: Bing Webmaster Tools(webmaster.bing.com) 계정 등록 + 도메인 소유 확인 + 사이트맵 제출은 사용자가 직접 해야 함. Sonnet은 키 파일과 제출 스크립트까지만 만들 수 있음.

### 0-3. 순위 추세 재평가 — v19의 "샌드박스 탈출" 판단은 아직 확정 아님

노출 가중평균 순위(SC 3개월, 2026-05-18~08-08):
| 기간 | 노출 | 가중평균 순위 |
|---|---|---|
| 05-18~05-31 | 111 | 69.4 |
| 06-01~06-15 | 41 | 82.5 |
| 06-16~06-30 | 47 | 88.4 |
| 07-01~07-15 | 53 | 73.5 |
| **07-16~07-31** | **117** | **43.2** |
| 07-20~08-01 (v19가 본 구간) | 88 | 39.5 |
| **08-01~08-08** | **24** | **66.5** |

- **8월 첫 주에 되돌아갔다.** 08-02~08-08 7일간 노출 18건·가중평균 70.6위로, 7월 후반(주당 약 55건·43위)에서 크게 후퇴.
- 3개월 총 노출도 375(v19) → 393(v20)으로 **6일간 +18건**에 그침. 7월 후반 속도라면 +50건 이상이어야 했다.
- **결론: v19의 "16일 연속 유지 = 확정 추세" 판단을 철회하지는 않되, "탈출 완료"로 보지 말 것.** 7월 후반은 스파이크였을 가능성이 살아있음. 다음 세션에서 08-09~08-25 구간을 반드시 재확인해서 ①66위대가 유지되면 스파이크 확정 ②다시 40위대로 내려오면 추세 확정, 두 갈래로 판정할 것.
- **어느 쪽이든 행동은 바뀌지 않는다**: Google 클릭은 여전히 0이고, 실제 수익 채널은 Bing+AI다(0-2).

### 0-4. ⚠️ 세 번째 발견: 최대 쿼리 클러스터(태양광 CO2)가 엉뚱한 페이지로 매칭되고 있음

| 쿼리 | 노출 | 순위 |
|---|---|---|
| solar carbon footprint calculator | 16 | 91.4 |
| solar panels carbon footprint calculator | 8 | 87.3 |
| solar carbon offset calculator | 8 | 87.5 |
| co2 emission reduction with solar calculator | 7 | 94.9 |
| solar co2 offset calculator | 7 | 96.1 |
| solar panel carbon offset calculator | 6 | 85.5 |
| co2 saved per kwh solar calculator | 2 | 93 |
| co2 reduction calculator solar pv | 1 | 85 |
| solar pv carbon savings calculator | 1 | 100 |
| **합계** | **56** | **가중평균 90.8** |

- **56노출 = 이 사이트 최대 단일 토픽 클러스터**이고, 하필 수익화 1순위인 태양광 라인이다.
- 그런데 전용 페이지 `tools/solar-co2-offset-calculator.html`은 **노출 4건 / 순위 6위**뿐. 즉 위 56건은 이 페이지가 아니라 다른 페이지(홈 89@73.3이 가장 유력)로 매칭되고 있다.
- **페이지 자체는 문제 없음을 확인함**: title `Solar Carbon Footprint & CO2 Offset Calculator`, 1,424단어, 내부 인바운드 링크 9개, FAQ가 위 쿼리들과 거의 그대로 대응. **온페이지 문제가 아니라 구글의 페이지 선택 문제**다.
- ⚠️ **사용자 액션 필요 (2분)**: GSC UI에서 쿼리 `solar carbon footprint calculator`로 필터 → "페이지" 탭을 열어 **실제로 어떤 URL이 노출되고 있는지** 확인해서 알려줄 것. 홈페이지가 잡히면 처방(홈에서의 앵커 강화 + 홈 내 태양광 섹션 축소)이 달라진다. 이 확인 없이 추측으로 손대지 말 것.
- 앵커 텍스트 현황: 사이트 전체 인바운드 앵커가 전부 `Solar CO2 Offset Calculator` 계열 13건. 쿼리 상위형인 `solar carbon footprint calculator` 앵커가 **0건**임 — 확인 결과와 무관하게 앵커 다양화는 해도 손해 없음.

### 0-5. 구조·정합성 검증 결과 (v19 대비 변화)

- ✅ 구조 스캔(고아 닫힘태그 / div / h2~h4 / JSON-LD) **118파일 0건**.
- ✅ 내부 broken link **0건**(`assets/js/nav.js` 공용 푸터 포함).
- ✅ sitemap 118 URL 전부 실존, canonical 5개 디렉토리 인덱스 전부 정상(트레일링 슬래시 일관).
- ✅ GitHub Pages: 최신 커밋 `32c2a8c`가 `status: built`로 정상 반영됨. **v19에서 걱정한 `d99a019`/`d87bba2` 빌드 지연은 해소됐음 — 예상대로 API 지연이었고 콘텐츠 문제가 아니었다.**
- ⚠️ **FAQ 스키마-본문 불일치 6건** (v19의 7건에서 1건 감소):
  - `tools/water-usage.html` 3건 — 스키마 `How much water does the average household use per day?` vs 본문 `...average U.S. household...` / 스키마 `How much water does a washing machine use per load?` vs 본문 `How much water does a washing machine use?` / 스키마 `How can I reduce my household water usage?` vs 본문 `How can I reduce my water bill?`(**이건 표현 차이가 아니라 의미가 다름**)
  - `tools/washing-machine-water-usage.html` 2건, `tools/ac-running-cost.html` 1건.
  - water-usage는 노출 3위 페이지(56@60.5)라 우선 처리 가치 있음.
- ⚠️ **`tools/index.html`에 카드가 없는 tool 3개 발견**: `electric-bill-spike-calculator.html`(v19에서 이미 지적됨), **`solar-panel-count-calculator.html`(태양광 수익 라인인데 허브에서 링크 없음)**, `washing-machine-water-usage.html`(쿼리 `washing machine water usage calculator` 5노출 35위 — 사이트 내 최상위권 순위인데 허브 미연결). 카드 35개 vs 실제 tool 38개.
- ⚠️ **`tools/water-usage.html` 본문에 실질 중복 섹션 확인**: `Where Does Household Water Go?`(134단어)와 `Where Your Water Actually Goes`(100단어)가 같은 EPA 용도별 비율을 반복, `Highest-Impact Ways to Reduce Water Use`(186단어)와 `High-Impact Water Saving Upgrades`(99단어)가 같은 WaterSense 변기 13,000갤런 근거를 반복. 과거 일괄 확장 작업의 잔재로 보임. **전 사이트 토큰중복 스캔 결과 본문 중복이 확정된 건 이 파일 한 개뿐**(다른 후보들은 FAQ가 본문을 요약하는 정상 패턴이라 오탐).

### 0-5-1. ✅ 위 3건 전부 완료 (2026-08-10, 같은 날 후속 세션, 커밋 `1092985`)

- **카드 3개 추가**: `tools/index.html`에 `electric-bill-spike-calculator`(energy), `solar-panel-count-calculator`(solar), `washing-machine-water-usage`(water) 추가. 카드 38개 = 실제 계산기 38개 전부 일치 확인.
- **FAQ 불일치 6건 전부 해소**: water-usage 3건(2건은 표현 정렬, 1건은 답변 내용을 재확인해 의미가 맞는 스키마 쪽 문구로 정정), washing-machine-water-usage 2건, ac-running-cost 1건. **전체 사이트 FAQ 재스캔 결과 0건.**
- **water-usage.html 중복 병합**: 1쌍은 고유 정보(82갤런 세부 내역, 누수 감지법) 전부 보존하며 통합. 2쌍은 확인해보니 두 번째 목록이 첫 번째보다 정보량이 적은 완전 하위집합이라 고유 콘텐츠가 전혀 없었음 — 삭제 후 단어수 손실(8%대) 방지를 위해 6개 항목 종합한 신규 문단(3개 업그레이드 조합 시 연 19,600~22,400갤런/$118~134 절약) 추가. **H2 10개→8개, 전체 단어수 1902→1821(−4.3%)**, 구조/링크/FAQ 재검증 전부 0건.

### 0-5-2. ✅ P0-B 완료 (2026-08-10, 배치1~8, 최종 커밋 `2a322d8`) — **41개 파일 전수 검토 종료**

원본 41개 파일(`grep -rlE '13¢/kWh|\$0\.13' --include=*.html .`) 전부 검토 완료. **33개 재계산 반영, 8개는 의도적으로 미수정**(사유 아래). **이 목록은 더 이상 재확인할 필요 없음 — P0-B는 닫힌 작업임.**

**재계산 완료 33개** (커밋: `eea9695` 배치1(4) → `9dc387a` 배치2(7) → `4962a5f` 배치3(4) → `4a26492` 배치4(5) → `11a5b1e` 배치5(7) → `9bc5a78`/`b392963`/`96cf1e8`/`f339643` 배치6~7(6) → `2a322d8` 배치8(1, appliance-energy-cost.html)):
- 대부분 역산 검증(같은 파생금액이 kWh×0.13으로 정확히 나오는지 확인 후 ×0.18로 재계산) 통과.
- **결론 자체가 뒤집힌 케이스 2건 — 다음 세션 검수 시 특히 주의**:
  - `compare/induction-vs-gas-vs-electric-stove.html`: "induction이 $20-40 유리" → "거의 동률"
  - `tools/heating-vs-cooling.html`: 파일 자체가 명시한 가스-히트펌프 손익분기점(17¢/kWh)을 새 전국평균(18¢)이 넘어서면서 "히트펌프가 가스 이긴다" → "거의 대등"으로 정정
- **가스요금(1.10~1.30/therm)도 같이 발견해서 1.70으로 동반 수정한 파일**: `dryer-energy-cost.html`, `heating-cost-by-fuel.html`(입력값 P0-A 때 누락됐던 것 재발견), `electric-vs-gas-water-heater.html`(4행 표 전체), `how-much-does-it-cost-to-run-a-dryer.html`, `propane-vs-natural-gas.html`(JS 하드코딩 상수).
- **역산이 정확히 안 맞아 "비율 스케일링(×18/13)"으로 처리한 파일**(원본이 정확히 어떤 kWh 기준인지 특정 불가하지만, cost=kWh×rate가 선형이라 비율 스케일링은 수학적으로 항상 정확함): `tools/appliance-energy-cost.html`의 두 리스트, `blog/how-much-does-it-cost-to-run-ac.html`의 일부 항목 등.
- **작업 중 발견한 사이트 레이아웃 버그**(표 데이터행 border-bottom이 첫 셀에만 적용): 별도로 6개 파일 수정, 커밋 `a938bc9`(0-5-3 참고).

**의도적으로 미수정 8개(전부 사유 있음, 건드리지 말 것)**:
- `compare/central-ac-vs-window-unit.html` — 저가($35) 구간이 어떤 W/일수 조합으로도 역산 안 됨. 원본 결함.
- `compare/central-heat-vs-space-heater.html` — "$0.13–$0.25/kWh"는 계산된 금액이 아니라 저요금~고요금 州 스프레드 인용. 국가평균 갱신과 무관.
- `compare/electric-bike-vs-car.html`, `compare/ev-vs-gas-car.html`, `compare/public-transport-vs-car.html` — 전부 "$0.13/mile"이 휘발유차 마일당 비용이라 kWh 요금과 무관한 오탐. `ev-vs-gas-car.html`은 실제론 16¢(2025) 기준을 쓰고 있어 이것도 별도로 낡았지만 13¢ 프로젝트 범위 밖.
- `compare/electric-vs-gas-dryer.html` — **본문 자체에 자릿수 오류 있음**(5kWh×13¢=$0.65인데 $0.065로 표기, 3곳 모두 동일 오류로 전파됨). 요금 갱신과 무관한 콘텐츠 정확도 이슈, 별도 세션에서 원본부터 다시 계산해야 함.
- `blog/how-much-does-an-ev-save-on-fuel-costs.html` — Florida/Colorado 등 州별 요금 예시는 "국가평균"이 아니라 각 州 고유 수치라 범위 밖(주의: 처음에 실수로 FL을 국가평균으로 잘못 재계산했다가 되돌린 적 있음 — 재작업 시 같은 실수 주의). Colorado 행은 자체 $3.60/gallon과 안 맞고 $3.50 기준의 결과값이 나와 있는 것도 별도 결함으로 발견(미수정).
- `tools/washing-machine-energy-cost.html` — "$95/year 절감" 문구가 같은 파일의 hot/cold 리스트와 2.5배 안 맞고, 세탁기 타입별 비교 4항목도 명시된 W×분×rate로 역산 안 됨. 원본 콘텐츠 정확도 이슈.
- **부수적으로 발견된 별도 이슈(P0-B 범위 밖, 아직 미착수)**: `$1.10/therm` 또는 `value="1.10"/"1.30"` 잔존이 11개 파일 더 있음(`grep -rln '\$1\.10/therm\|value="1\.10"\|value="1\.30"' --include=*.html .`로 재확인). 가스요금 전용 배치가 필요함.
- `tools/appliance-energy-cost.html`의 냉장고 항목 — "150W avg" 라벨인데 실제 $ 범위는 44-70W 기준으로 역산됨(사이트 다른 곳의 확정된 $237/150W와 안 맞음). 라벨-수치 불일치, 미수정.

### 0-5-3. ✅ 표 레이아웃 버그 6건 수정 (2026-08-10, 커밋 `a938bc9`) — 사용자가 스크린샷으로 신고

- **원인**: 데이터 행에서 `padding`/`border-bottom` 인라인 스타일이 **첫 번째 `<td>`에만** 붙어있고 나머지 칸엔 없어서, 구분선이 첫 칸 밑에만 그어지는 버그. `solar-panel-cost-2026.html` 표에서 발견, 전 사이트 스캔해서 5개 더 찾음: `how-much-does-it-cost-to-run-ac.html`, `washing-machine-water-usage.html`, `solar-panel-count-calculator.html`, `appliance-energy-cost.html`, `heating-cost-by-fuel.html`. **전부 수정 완료, 재스캔 결과 0건.**
- colspan 요약행 4개(`heat-pump-dryer`, `heat-pump-water-heater`, `mono-vs-poly-solar`, `solar-panels-vs-battery-storage`)는 확인해보니 애초에 border-bottom이 없는 디자인이라 문제없음(오탐).
- **부수 발견**: `heating-cost-by-fuel.html`의 가스요금 입력 기본값이 P0-A 때 누락되어 `$1.10/therm` 그대로였음 → `$1.70`로 정정.
- ⚠️ **부수 발견 2 (미착수)**: `$1.10/therm` 또는 `value="1.30"` 잔존이 이 파일 말고도 **11개 파일 더** 있음(`grep -rln '\$1\.10/therm\|value="1\.10"\|value="1\.30"' --include=*.html .`로 재확인). 대부분 본문 서술. 전기요금(13→18¢) 프로젝트와 별개로, 가스요금(1.10/1.30→1.70) 전용 배치를 새로 만들어야 함. 아직 목록만 뽑아둔 상태.

### 0-6. 인덱싱 커버리지 — 미색인이 8 → 15로 늘어남 (2026-07-25)

| 사유 | 소스 | 페이지 |
|---|---|---|
| 찾을 수 없음(404) | 웹사이트 | 3 |
| 리디렉션이 포함된 페이지 | 웹사이트 | 3 |
| 적절한 표준 태그가 포함된 대체 페이지 | 웹사이트 | 2 |
| 발견됨 - 현재 색인이 생성되지 않음 | Google | 7 |

- 색인 생성된 페이지는 108(7/11) → **111(7/25 이후 정체)**. 즉 색인 +3인데 미색인 +7.
- 404 3건 / 리디렉션 3건은 이번 export에 **URL 목록이 포함돼 있지 않아 특정 불가**. canonical·sitemap·내부링크는 전부 정상이므로 사이트 내부 원인은 아닌 것으로 보임(리디렉션 3건은 `http://ecoenergycalc.com/` 계열일 가능성이 큼 — SC 페이지 목록에 http 버전이 1노출로 잡혀 있음).
- ⚠️ **사용자 액션 필요**: GSC → 페이지(색인 생성) 리포트에서 "찾을 수 없음(404)"과 "리디렉션이 포함된 페이지" 항목을 열어 **URL 목록을 export해서 다음 세션에 첨부**할 것. 그래야 원인 특정 가능.

### 0-7. 다음 세션(Sonnet) 작업 지시 — 우선순위 순

수익화 관점 우선순위. 1·2번은 반드시 이번 순서대로.

1. **[P0-A] 전기요금 기본값 일괄 갱신 (기계적, 저위험)** — 20개 tool의 요금 입력 `value="13"` → `value="18"`, 라벨/placeholder의 "13¢" 문구 동반 수정. `tools/ac-running-cost.html`(16)도 18로 통일. `tools/led-vs-incandescent.html` JS `0.15`, `compare/train-vs-plane-carbon.html` `0.134`도 0.18로. 가스류는 `heating-vs-cooling.html` $1.10→$1.70/therm, `dryer-energy-cost.html` $1.30→$1.70/therm(EIA 2026 범위 $1.45~1.95의 중앙값). **숫자 재계산이 없는 작업이므로 먼저 끝낼 것.**
2. **[P0-B] 본문 파생 금액 재계산 (고위험, 주의)** — 41개 파일의 본문/표에 13¢ 기준으로 계산된 달러 금액이 박혀 있음(예: `appliance-energy-cost.html`의 "150W 냉장고 1,314kWh/년 → $171/년", 표 전체가 13¢ 기준, "Common Appliance Energy Costs (U.S. Average, 13¢/kWh)" 제목 포함). **단가만 바꾸고 금액을 안 고치면 지금보다 더 나쁜 상태가 된다.** 파일 단위로 ①13¢ 언급 전수 추출 → ②각 금액이 어떤 kWh × 단가로 나온 건지 역산 → ③18¢로 재계산 → ④반올림 자릿수 원본 유지, 순서로 진행. 파일마다 끝나면 그 파일의 모든 금액을 다시 검산할 것. **dateModified 갱신 필수.**
3. **[P1] Bing/IndexNow 인프라** — 루트에 IndexNow 키 파일 생성(32자 hex, 파일명=키, 내용=키), sitemap 118 URL을 `api.indexnow.org/indexnow`에 일괄 제출하는 스크립트 작성 및 실행, robots.txt 확인(현재 정상). **키는 커밋되는 공개 파일이므로 비밀이 아님 — 다만 재생성 시 기존 제출이 무효화되니 한 번 정하면 바꾸지 말 것.** 사용자에게 Bing Webmaster Tools 등록을 안내할 것.
4. **[P2] 저비용 정리 3종** — ①`tools/index.html`에 누락 카드 3개 추가(`data-category` 유효값 사전 확인 필수) ②FAQ 스키마-본문 6건 정렬(water-usage 3, washing-machine-water-usage 2, ac-running-cost 1 — 본문 h3 문구를 스키마 쪽으로 맞추는 게 쿼리 대응상 유리) ③`tools/water-usage.html` 중복 섹션 2쌍 병합(내용 손실 없이 합치고 단어수는 유지).
5. **[P3] 신규 클러스터 후보: Community Solar** — 검증 결과는 0-8 참고. **사용자 승인 후 착수할 것.**
6. **compare/ 신규 페이지 금지 유지** (v19부터 3세션 연속 확인, 44파일에 노출 32건).

### 0-8. 신규 니치 검증: Community Solar (착수 전 사용자 승인 필요)

- **사이트 내 중복 0건 확인**: `grep -ril "community solar"` → **전 사이트 0건**. 태양광 페이지를 10개 넘게 가진 사이트에 커뮤니티 솔라가 통째로 없음.
- **경쟁 구도 검증(웹서치 2026-08-10)**: 검색결과 상위가 전부 **사업자 자체 계산기**(Perch Energy, Clearway, Neighborhood Sun, Nexamp, Finray) + EnergySage. **중립적 제3자 계산기가 없다** — v17 Demand Response, v19 Budget Billing과 정확히 같은 승산 패턴(경쟁자가 애그리게이터가 아니라 판매자 본인).
- **차별화 각도(이게 핵심)**: 사업자 계산기는 전부 "얼마 아끼는지"만 보여주고 **두 장 청구서 구조(유틸리티 청구서 + 사업자 청구서를 따로 낸다)를 숨긴다.** 이게 실사용자 최대 혼란 지점이다. 중립 계산기로 "실제 순지출이 얼마나 줄어드는가 / 두 청구서 합계는 얼마인가"를 보여주면 그 자체가 유일한 포지션이 된다.
- **미서비스 오디언스**: 이 사이트는 지금까지 전부 주택 소유자 대상이다. 커뮤니티 솔라는 **세입자·아파트 거주자·지붕이 안 되는 집** — 완전히 안 건드린 시장이고, 마침 이 사이트의 최다 노출 쿼리들(전기요금 절감)과 의도가 겹친다.
- **수익화**: 태양광 리드젠 라인 안에 그대로 들어감(0-6 v19 방침). 커뮤니티 솔라는 구독 전환 단가가 리드당 지불 구조로 잡히는 카테고리이고, 일반 태양광 리드가 $50~300/건 수준으로 재확인됨(2026-08 웹서치). 로컬 설치가 필요 없어 **전환 마찰이 지붕형보다 낮다**.
- **사실 정확도 주의(필수)**: ①커뮤니티 솔라는 **23개 주 + DC**에서만 운영됨 — "전국 어디서나"로 쓰면 사실오류 ②절감폭은 통상 **5~20%**, 사업자 광고 문구를 그대로 옮기지 말 것 ③크레딧이 청구서에 반영되기까지 **보통 2~3 청구주기** 걸림 ④지붕형 태양광이 가능한 주택 소유자에게는 **지붕형이 재무적으로 더 유리**하다는 점을 명시할 것(이걸 빼면 중립성이 무너지고, 이 사이트의 기존 태양광 자산과도 모순됨).
- **롱테일 타깃**: "is community solar worth it", "community solar vs rooftop solar", "community solar two bills explained", "how much does community solar actually save", "community solar for renters", "can I cancel community solar".
- **제안 구성**: `blog/is-community-solar-worth-it.html`(1,200~1,500단어) + `tools/community-solar-savings-calculator.html`(월 전기요금·할인율·유틸리티 요금인상률 입력 → 두 청구서 합계·순절감·지붕형 대비 비교) + `compare/` 신규는 금지이므로 기존 `blog/solar-panel-guide.html`·`tools/solar-panel-savings.html`·`blog/why-electric-bills-are-rising-ai-data-centers.html`과 상호링크 + 용어집에 "Community Solar", "Bill Credit" 2항목 추가.

### 0-9. GA 상세 (2026-07-13~08-09, 28일) — v19 대비

- 활성 사용자 **106명**(v19 87 → +22%), 신규 110, 이벤트 **750**(v19 904 → **-17%**), 활성사용자당 평균 참여시간 **39.2초**(v19 64초 → **-39%**).
- **사용자는 늘었는데 이벤트와 체류가 동시에 떨어졌다 = 저품질/봇 유입 증가.** 도시 분포가 이를 뒷받침: Singapore 13, **Boardman 5(AWS us-west-2)**, **Council Bluffs 3(Google 데이터센터)**, **The Dalles 1(Google 데이터센터)** — 합계 22명(21%)이 데이터센터 소재지. Busan 4는 사용자 본인.
- **실제 외부 인간 사용자는 대략 80명 선으로 봐야 함.** direct 82세션을 순수 트래픽으로 절대 과대평가하지 말 것(v19에서도 같은 경고).
- **copilot.com 4세션 — v19와 동일, 증가 멈춤.** v19에서 "3세션 연속 증가 확정"이라 썼으나 이번엔 횡보. perplexity는 이번에도 미집계. **AI 채널은 여전히 유일하게 살아있지만 자동 성장하지는 않는다 — llms.txt 유지만으로는 부족하고 Bing 인덱스 강화(0-2)가 실질 레버다.**
- GA 페이지뷰 상위(SC 노출과 다름, 둘 다 볼 것): 홈 83뷰 / water-usage 16 / home-energy-cost 12 / **driving-vs-flying-carbon 11(활성 10명)** / about 10 / **car-vs-ev-carbon 10(활성 9명)** / tools 허브 7 / ev-vs-gas-true-cost 6 / heating-vs-cooling 6.
  - `compare/driving-vs-flying-carbon`은 SC 노출 0인데 GA 방문 11 — **Bing 계열에서만 유입되는 페이지**. 0-2의 근거이자, Bing 최적화가 통할 페이지의 실례.
  - 이탈률 1.0인 페이지: solar-panels-vs-wind-turbine, refrigerator-energy-cost, washing-machine-water-usage, front-load-vs-top-load-washer, heat-pump-water-heater-vs-electric, heat-pump-vs-furnace, how-many-trees-to-offset, how-much-water-does-a-washing-machine-use, is-it-cheaper-to-heat-or-cool. 표본이 1~2명이라 통계적 의미는 없으나 다음 세션에 누적 추적할 것.

### 0-10. 페이지별 돌파 후보 (v19 표 갱신, 3개월 누적)

| 페이지 | 노출 | 순위 | v19 대비 |
|---|---|---|---|
| blog/solar-panel-guide | 13 | **7.5** | 유지 — 사이트 최고 자산 |
| blog/how-much-does-it-cost-to-run-a-refrigerator | 28 | 27.9 | 노출 25→28, 순위 24.1→27.9 (소폭 악화) |
| blog/solar-panel-cost-2026 | 8 | 13.8 | 유지 |
| tools/car-vs-ev-carbon | 7 | 13.9 | 유지 |
| compare/electric-vs-gas-water-heater | 8 | 22.1 | 순위 18.7→22.1 (악화) |
| compare/wind-vs-solar-energy | 8 | 26.5 | 유지 |
| tools/home-carbon-footprint | 8 | 27.9 | 유지 |
| tools/electric-bill / tools/solar-co2-offset-calculator | 4 / 4 | 6.3 / 6.0 | 순위는 최상위권인데 노출이 안 붙음 |

**노출 많고 순위 깊음(권위 문제로 분류했던 그룹)**: 홈 89@73.3, tree-planting-offset 57@81.3, water-usage 56@60.5, heating-vs-cooling 46@65.9, appliance-energy-cost 24@65.3. **단, water-usage는 이번에 본문 중복이 확인됐으므로(0-5) 순수 권위 문제가 아님 — "권위 문제라 손대지 말 것"을 이 페이지에는 적용하지 말 것.**

**섹션별 노출**: tools 244 / root 108 / blog 88 / compare 45 / glossary 1. compare는 44파일에 45노출로 여전히 최악(v19 32→45로 늘긴 했음).

**v19 신규 클러스터 추적**: `blog/is-budget-billing-worth-it` 노출 1 @88, 쿼리 "what is levelized billing" 1노출 @88. `tools/budget-billing-estimator`는 아직 노출 0. **커밋 5일 만의 첫 색인·첫 노출이므로 정상 궤도**, 다음 세션에 재확인할 것. `disclosure.html`은 아직 노출 0(정상).

### 0-11. 파일 개수 (2026-08-10 재확인)

- tools: **39개**(index.html 포함, 실제 계산기 38개)
- blog: **29개**(index.html 포함)
- compare: **44개**(index.html 포함)
- glossary: 1파일에 용어 **21개**
- 루트 HTML 5개(index, about, contact, privacy, disclosure)
- **총 HTML 118개, sitemap 118 URL** — 정합성 확인 완료.

---

## (아카이브) v19 문서 이하 — 2026-08-03 기준

## 0. v19 세션 핵심 요약 (2026-08-03, Opus 분석 세션) — ⚠️ **순위 대폭 개선 확인(88위→40위)** + 수익화 전략 근본 전환(AdSense 비의존)

### 0-1. ⚠️ 가장 중요: 순위 개선이 노이즈가 아니라 확정된 추세임
v18에서 "07-17/07-18 순위 개선은 표본이 작아 노이즈일 수 있다"고 판단했으나, **이번 데이터로 확정 추세임이 검증됨**. 노출 가중평균 순위 기준:

| 기간 | 노출 | 가중평균 순위 |
|---|---|---|
| 05-18~05-31 | 111 | 69.4 |
| 06-01~06-15 | 41 | 82.5 |
| 06-16~06-30 | 47 | 88.4 |
| 07-01~07-15 | 53 | 73.5 |
| **07-16~07-31** | **117** | **43.2** |
| **07-20~08-01** | **88** | **39.5** |

- 16일 연속 유지 + 동일 길이 구간 대비 노출 2.5배(47→117). 표본 노이즈로 설명 불가.
- 색인 페이지도 73(6월)→89(7/1)→**108(7/11 이후)**, 미색인 8개.
- **해석**: 신생 도메인 샌드박스 탈출 국면으로 판단. 그동안 "권위 문제라 시간이 답"이라고 미뤄둔 판단이 데이터로 확인됨 — 다음 1~2개월이 첫 클릭이 나오는 분기점이 될 가능성이 높음.
- **단, 클릭은 여전히 3개월 누적 0건.** 40위는 구글 4페이지라 CTR이 사실상 0인 게 정상. 첫 클릭을 만들려면 **몇 개 페이지를 10위 안으로 밀어넣는 것**이 유일한 경로 — 사이트 전체 평균을 올리는 게 아니라 상위 후보 소수에 집중할 것.

### 0-2. 페이지별 돌파 후보 (노출 × 순위 조합 기준, 다음 세션에도 이 표를 갱신할 것)
| 페이지 | 노출 | 순위 | 판단 |
|---|---|---|---|
| blog/how-much-does-it-cost-to-run-a-refrigerator | 25 | 24.1 | 노출 최다. 단 레드오션 확정(아래) |
| blog/solar-panel-guide | 13 | **7.5** | **이미 1페이지.** 사이트 최고 자산 |
| blog/solar-panel-cost-2026 | 8 | 13.8 | 2페이지 |
| tools/car-vs-ev-carbon | 7 | 13.9 | v18 보강 효과로 보임 |
| compare/electric-vs-gas-water-heater | 7 | 18.7 | v16 보강 효과 |
| compare/wind-vs-solar-energy | 8 | 26.5 | |
| tools/home-carbon-footprint | 8 | 27.9 | |

**노출은 많은데 깊은 순위(콘텐츠 아니라 권위 문제, 손대지 말 것)**: 홈 86@72.7, water-usage 56@60.5, tree-planting-offset 56@81.3, heating-vs-cooling 46@65.9, appliance-energy-cost 24@65.3.

**섹션별 노출**: tools 244 / root 108 / blog 83 / compare 32 / glossary 1. compare가 44개 파일로 최다인데 노출은 최소 — compare 카테고리는 투자 대비 회수가 가장 나쁜 섹션임이 3세션 연속 확인됨. **compare 신규 페이지는 당분간 만들지 말 것.**

### 0-3. v18 신규/보강 페이지 추적 결과
- `blog/demand-response-programs-...`: 노출 1, **순위 9** — 색인+상위 진입 성공
- `tools/ai-water-footprint-calculator`: 노출 1, **순위 7** — 성공
- `blog/ev-vs-gas-true-cost`: 노출 3, 순위 6 (v18 고마일리지 섹션 추가분) — "electric vehicle delivery fuel savings" 쿼리는 아직 순위 99, 미정착
- `tools/car-vs-ev-carbon`: 노출 7, 순위 13.86 (FAQ 추가 효과로 추정)
- `compare/well-water-vs-city-water`: 노출 1, 순위 90 — 부진
- **`tools/ai-carbon-footprint-calculator`: 노출 0건 (SC 페이지 목록에 아예 없음).** v18에서 추가한 이미지생성 모드는 쿼리 유입을 전혀 만들지 못함. AI 틈새는 v17부터 계속 경고했듯 이미 닫힘 — **AI+에너지 계산기 라인은 더 이상 확장하지 말 것.**

### 0-4. GA 분석 (2026-07-06~08-02, 28일)
- 활성 사용자 87명(v18 72명 대비 +21%), 신규 89, 이벤트 904, 평균 참여 64초.
- 소스: direct 69세션 / duckduckgo 14 / bing 9 / **copilot.com(ai-assistant) 4** / foundrlist(referral) 4 / yahoo 3 / ecosia 2 / Findly.tools 1 / eod.kittylaunch.org 1 / newtool.site 1.
- ⚠️ **google/organic 세션 0건.** SC 노출 375건이 전부 클릭으로 이어지지 않았다는 것과 정확히 일치.
- **copilot.com/ai-assistant: 1(v16) → 3(v18) → 4(v19). 3세션 연속 증가 확정.** perplexity는 이번엔 미집계. **AI 어시스턴트 경유가 이 사이트에서 유일하게 성장 중인 채널** — llms.txt 유지·갱신은 계속 최우선으로 다룰 것.
- direct 69세션은 실제 직접입력이 아니라 디렉토리 등재(foundrlist/kittylaunch/newtool/Findly, 사용자가 직접 등록 중)에서 리퍼러 유실된 것 + 봇 혼재로 추정. 순수 사용자 트래픽으로 과대평가하지 말 것.
- 이상치: heating-vs-cooling 39뷰/활성사용자 4명(1인당 10뷰) — 봇 또는 단일 세션 반복. 이 페이지 지표는 신뢰하지 말 것.

### 0-5. 이번 세션 검증 결과 (전부 통과)
구조버그(고아 닫힘태그/div/h2~h4/JSON-LD) 0건 · 내부 broken link 0건 · sitemap 115 URL 전부 실존 · GitHub Pages 최신 커밋(`3496d23`) `status: built` 정상.
**FAQ 매칭 15건은 v15부터 동일하게 유지 중이나, 이 중 8건이 `blog/solar-panel-guide.html` 하나에 몰려 있음** — 이 파일은 스키마에 FAQ 9개가 있는데 본문 h3는 5개뿐. 사이트 최고 순위 페이지(7.5위)에서 스키마-본문 불일치가 나는 것이므로 **경미 이슈가 아니라 우선 처리 대상으로 격상**(작업 지시는 아래 0-7).

### 0-6. ⚠️ 수익화 방침 전환 — AdSense 비의존 (사용자 지시, 2026-08-03)
**사용자 지시 원문 취지**: "우린 구글 애드센스에 의존하지 않는다. 수익이 되는 제휴 광고면 다 한다. AdSense는 게시 탈락 시 재심사 여부를 Opus가 판단한다. 다른 제휴/광고사도 마찬가지다. **AdSense보다 다른 제휴·광고가 이득일 때는 그 방향을 나에게 추천할 것.**"

**이번 세션 웹서치로 확인한 사실(2026-08 기준, 다음 세션에 재확인할 것):**
- **Ezoic: 2026-02-19부터 월 활성사용자 25만 명 요구로 변경됨.** 기존 "저트래픽도 가능"은 완전히 폐기된 정보. 현 트래픽(월 87명)으로는 논외. Mediavine/Raptive도 당연히 논외.
- 무제한 승인 네트워크(Adsterra, Infolinks, BidVertiser, Sovrn 등)는 가입 가능하지만, 월 87명 기준 수익은 사실상 0이고 스크립트만 추가돼 LCP만 나빠짐 — **현 단계에서 붙이지 말 것.** (Sovrn은 디스플레이+커머스 링크 자동전환을 동시 제공해서 나중에 재검토 가치는 있음)
- **Amazon Associates: 가입 후 180일 내 적격 판매 3건 미달성 시 계정 폐쇄.** 2026-04-14자 약관 개정으로 180일 배송완료 요건 추가, onsite halo 수수료 인하, "original content" 정의 강화까지 겹침. 홈임프루브먼트 3%, 주방 4.5%. **월 87명 트래픽에서 지금 가입하면 3건 미달로 계정을 날릴 확률이 매우 높음 → 지금 가입 금지. 월 1,000 사용자 이상일 때 가입할 것.**
- **태양광 리드젠 제휴가 이 사이트에 압도적으로 유리함**: 적격 리드당 $9.60(EnergySage/FlexOffers 경유, 쿠키 45일)에서 $75~300 수준. 리드 1건 = AdSense 기준 대략 3만~10만 페이지뷰에 해당하는 금액. 업계에서 **"인터랙티브 태양광 계산기"가 최고 전환 자산**으로 꼽히는데, 그게 바로 이 사이트의 기존 자산(`solar-panel-roi`, `solar-panel-savings`, `solar-panel-count-calculator`, 그리고 순위 7.5위의 `blog/solar-panel-guide`)임.

**→ 결론 및 사용자 추천 사항: 디스플레이 광고(AdSense 포함)는 이 사이트의 주 수익원이 될 수 없음. 태양광/홈서비스 리드젠 제휴를 1순위로 전환할 것.** 단계별 트리거는 아래.

| 단계 | 트리거 | 할 일 |
|---|---|---|
| 지금 (월 <1,000) | — | 배관만 깔기: 제휴 고지 페이지, privacy.html 문구 수정, FlexOffers 가입 신청(소규모 퍼블리셔 수용). **Amazon·디스플레이 네트워크 금지** |
| 월 1,000~10,000 | 태양광 클러스터에 유의미 트래픽 | 태양광 리드젠 CTA를 solar 계산기 4종에 삽입, 전환 측정 |
| 월 10,000+ | 세션 기준 | Journey by Mediavine(≈10k 세션), Amazon Associates, Sovrn 재검토 |

**AdSense 관련 현황 및 판단(Opus 판단으로 기록)**:
- 현재 112개 HTML이 `pagead2.googlesyndication.com` 스크립트를 로드하는데 `adslot`은 전부 빈 주석(`<!-- AdSense code here -->`)임. **즉 수익 0인 채로 외부 스크립트 비용만 지불 중.** `ads.txt`도 없음.
- **✅ 심사 상태 확인됨(2026-08-03, 사용자 확인): 아직 신청 중(심사 대기 상태), v14부터 5세션째 미확인이던 항목 이번에 해소.**
- **판단: 심사 대기 중이므로 스크립트 태그는 제거하지 말고 그대로 둘 것** — 심사 진행 중에 코드를 뺐다가 오히려 심사에 영향을 줄 수 있음. 결과가 나오면: (승인 시) 슬롯에 실제 `<ins>` 채울지 vs 리드젠 우선 방침 유지할지 재판단, (거절 시) 재심사 여부는 아래 트리거표대로 판단 — 현 트래픽에서 AdSense 기대수익은 월 $0.1 수준이라 재심사를 서두를 이유 없음. 재심사는 **월 5,000 사용자 이상 + 리드젠 실적이 안 나올 때**만 의미 있음.
- **다음 세션에서 계속 확인할 것**: 승인/거절 결과가 나왔는지가 최우선 확인 사항으로 유지.
- **제휴 링크를 넣기 전 반드시 선행할 것**: `privacy.html` 60행의 "EcoEnergyCalc is not affiliated with, endorsed by, or sponsored by any of the brands mentioned." 문구는 제휴 링크와 정면 충돌함 → FTC 준수 문구로 교체 필요. 제휴 고지(disclosure)는 링크가 있는 모든 페이지에서 접근 가능해야 함.

### 0-7. 다음 세션(Sonnet) 작업 지시 — 우선순위 순
1. ~~`blog/solar-panel-guide.html` FAQ 스키마-본문 불일치 해소~~ **✅ 완료(같은 세션 내 이어서 처리, 2026-08-03, 커밋 `d99a019`)** — 상세는 0-7-1 참고
2. ~~**신규 클러스터: Budget Billing / Levelized Billing**~~ **✅ 완료(2026-08-03, 커밋 `030957a`)** — 상세는 0-8-1 참고
3. ~~**제휴 배관 작업**: 제휴 고지 페이지 신설 + privacy.html 문구 수정~~ **✅ 완료(2026-08-03, 커밋 `d87bba2`)** — 상세는 0-8-2 참고. **실제 제휴 링크는 아직 미삽입**(지시대로 사전 정비만 완료), 사용자 승인 후 진행할 것
4. 냉장고 클러스터는 2026년 전기요금 수치(전국평균 17~18.56¢/kWh)만 갱신하는 선에서 소폭 보강 (레드오션이라 신규 URL 금지)

### 0-7-1. solar-panel-guide.html FAQ 수정 완료 기록 (2026-08-03)
- **원인**: 이 파일에 FAQPage JSON-LD 스키마가 **2개 별도 `<script>` 블록으로 중복 존재**(6문항+5문항, "How much do solar panels cost in 2026?" 1건은 완전 중복). 스키마 문항 중 8개가 본문 h3와 문자열 불일치 — 세액공제/페이백 관련 질문이 서로 다른 표현으로 2벌씩 있었고(예: "What is the solar panel payback period?" vs "How long does it take for solar panels to pay for themselves?"), 홈밸류/CO2offset/buy-or-lease 3개 질문은 아예 본문에 대응 섹션이 없었음.
- **처리**: 두 스크립트를 8문항짜리 스키마 하나로 병합(중복 문항 통합, 표현 불일치 문항은 본문 h3 텍스트에 맞춰 재작성), 본문에 없던 3개 질문(Should I buy or lease / How much CO2 do solar panels offset / Does going solar increase home value)은 기존 본문 섹션(Buying vs Leasing, CO2, Resale Value) 내용을 요약해 h3+답변으로 신규 추가. dateModified 2026-08-03 갱신.
- **세액공제 정보 재검증(웹서치)**: Section 25D 2025-12-31 종료 사실 IRS 공식 FAQ·SEIA·Congress.gov CRS로 재교차확인, 기존 서술 정확함 확인. 추가로 "리스/PPA는 Section 48E 상업용 크레딧을 2027년까지 여전히 활용 가능"이라는 뉘앙스를 buy-or-lease 답변에 보강(기존에 없던 디테일, solar.com 등 다수 소스로 확인).
- **검증**: 파일 단위 재스캔(div/h2~h4/JSON유효성/FAQ매칭) 전부 0건. 전체 사이트 재스캔 결과 이 파일 관련 이슈 0건(타 파일의 기존 경미한 FAQ 불일치 7건은 그대로, 이번 세션 대상 아님).
- **⚠️ GitHub Pages 빌드 확인 필요**: 커밋 `d99a019` push 확인(API `commits/main`으로 반영 확인됨)했으나, push 후 4분 넘게 `pages/builds/latest`가 이전 커밋(`d00796c`)에 머물러 있음 — 콘텐츠 diff는 없고 API 자체 지연으로 추정(handover 섹션 6/v13 선례와 동일 패턴). **다음 세션에서 가장 먼저 `pages/builds/latest`로 `d99a019` 이후 상태가 `built`인지 확인할 것.** 과도한 재트리거는 하지 않음.

### 0-8. ⚠️ 이번 세션 유일한 검증 통과 신규 니치: Budget Billing / Levelized Billing
- **사이트 내 중복 0건 확인**: `grep -ril "budget billing\|levelized billing\|LIHEAP\|bill assistance\|payment plan"` → 전부 0건. 전기요금을 주제로 하는 사이트에 청구·납부 프로그램 콘텐츠가 통째로 비어 있는 최대 토픽 공백.
- **경쟁강도 검증 결과**: 소비자용 "budget billing 계산기/판단 도구"가 **검색결과에 존재하지 않음**. 경쟁은 ①각 유틸리티 자체 안내 페이지(Wake EMC, Berea, AES Indiana 등 — 지역별로 파편화, 전국 단위 경쟁자 아님) ②일반 금융 블로그(WalletHub, PennyHoarder, Albert, electricityrates.com) 뿐. EnergyCAP·utilitycalculator.pro 등은 B2B이거나 다른 의도. **v17 Demand Response 성공 패턴과 정확히 동일한 경쟁 구도**(계산기 애그리게이터가 아니라 유틸리티 공식페이지가 경쟁자).
- **신선한 뉴스 훅**: 인디애나주 HEA 1002(2026, 2026-02-26 서명) — ⚠️ 이 세션에서 처음 정리한 표현("주 단위 표준으로 일괄 전환")이 부정확했음이 실제 콘텐츠 작성 중 재검증(법안 원문 legiscan.com, AES Indiana/NIPSCO 공식 고지, Taft/Mondaq 법무 요약)으로 드러나 바로잡음: **의무 자동가입 대상은 LIHEAP 등 에너지지원 자격/신청 고객뿐**이고(2026-06-30 이후 첫 청구주기부터, 옵트아웃 가능), 그 외 일반 고객은 여전히 선택 가입임. 다만 "Budget Billing"이라는 명칭 자체를 "Levelized Billing"으로 바꾸도록 강제하는 조항(추가 고객보호 조치 없이는 구 명칭 사용 금지)이 있어 유틸리티들이 폭넓게 리브랜딩 중인 것은 사실(AES Indiana 2026-08-01부터, NIPSCO 2026-07-01부터 명칭 변경 확인). **다음에 이 소재로 글을 더 쓸 경우 이 구분을 반드시 유지할 것** — "전 고객 의무화"로 서술하면 사실오류.
- 2026 상반기 미국 유틸리티 요금인상 신청액 $186억(Q2만 $92억, 전년 Q2 대비 +26%), 미국 가구 6곳 중 1곳이 공과금 연체(NEADA) — 시즌성·화제성 모두 충족, 확인 완료.
- **롱테일 타깃**: "is budget billing worth it", "budget billing vs levelized billing", "will I owe money on budget billing", "budget billing true up", "does budget billing save money", "budget billing pros and cons"
- **주의**: budget billing은 요금을 **줄이지 않고 평탄화만 한다**는 게 핵심 팩트임. 절약 상품처럼 서술하면 사실오류가 됨. true-up(정산월) 리스크, 이탈 시 이연잔액 즉시 정산, 가입 요건(12개월 이력·연체 0원)까지 균형있게 다룰 것.

### 0-8-1. Budget Billing 클러스터 완료 기록 (2026-08-03, 커밋 `030957a`)
- **생성**: `blog/is-budget-billing-worth-it.html`(약 1,550단어, FAQ 4개), `tools/budget-billing-estimator.html`(계산기 — 최고월/최저월/현재평균/예상요금인상률 입력 → 평탄화 월납부액·계절별 현금흐름차·true-up 위험범위 출력, FAQ 3개).
- **계산기 로직**: `parseFloat(x)||기본값` 안티패턴 미사용, `isNaN` 체크로 처리(handover 10-8 준수). true-up 범위는 레벨라이즈드(소액·잦은 정산)와 전통적 버짓빌링(연 1회 대규모 정산)의 차이를 반영해 low/high 범위로 제시하고, result-note에 "견적 아님" 고지 명시(v17 DR 계산기와 동일 처리).
- **용어집**: `glossary/index.html`에 "Budget Billing", "True-Up" 2개 항목 추가(스키마+본문 정확 매칭 확인, dateModified 갱신).
- **상호링크**: `tools/electric-bill-spike-calculator.html`, `blog/reduce-electric-bill.html`, `blog/demand-response-programs-get-paid-to-save-energy.html`, `blog/why-electric-bills-are-rising-ai-data-centers.html` 4개 파일 전부 양방향 링크 추가 완료. 자기참조 링크 0건 확인.
- **인프라 갱신**: sitemap.xml(신규 2개 URL, 총 117개 확인), llms.txt(계산기 수 37→38, 신규 항목 2개 추가), tools/index.html(`data-category="energy"` 카드 추가 — 유효 카테고리값 사전 확인함), blog/index.html(`data-date="2026-08-03"` 카드 추가).
- **compare/ 신규 없음** — 지시대로 준수.
- **검증**: 전체 사이트 재스캔 결과 구조 이슈 0건, FAQ 불일치는 기존 7건 그대로(이번 세션 대상 아님, 타 파일), 용어집 불일치는 기존 1건 그대로(Demand Charge/TOU, v17부터 미해결), broken link 0건, sitemap-파일시스템 정합성 확인(117 URL 전부 실존, tools/blog/compare 파일 전부 sitemap에 존재).
- **GitHub Pages 빌드 확인**: 커밋 `030957a` push 후 `pages/builds/latest`가 `built` 상태로 정상 반영됨(약 80초 소요, 이번엔 지연 없었음).
- **참고(이번 세션 발견, 별건)**: `tools/electric-bill-spike-calculator.html`가 애초에 `tools/index.html` 카드 목록에 없었던 것을 발견함(이번 작업 범위 밖이라 손대지 않음). 다음 세션에서 추가 검토 가치 있음.

### 0-8-2. 제휴 수익화 사전 정비 완료 기록 (2026-08-03, 커밋 `d87bba2`)
- **`privacy.html` 60행 수정**: "not affiliated with, endorsed by, or sponsored by any of the brands mentioned" 문구를 FTC 준수형으로 교체 — 브랜드명은 정보제공 목적, 일부 링크는 제휴링크일 수 있고 사용자 추가비용 없음, `disclosure.html`로 링크. "Last updated" 날짜도 2026-08-03으로 갱신.
- **`disclosure.html` 신규 생성**(487단어, about.html 구조 그대로 복제): 수익 구조(광고+제휴), 편집 독립성 선언("리뷰나 순위는 대가로 좌우되지 않는다"), 계산기 결과가 제휴사와 무관하게 공개 데이터·표준 공식으로 산출된다는 명시적 문단, FTC 고지 취지 설명, contact.html 연결.
- **⚠️ 실제 제휴 링크는 이번 세션에 넣지 않음** — 지시대로 사전 정비만 완료. 실제 제휴 프로그램(FlexOffers 등) 가입 및 링크 삽입은 사용자 승인 후 별도 세션에서 진행할 것(섹션 0-6 단계별 트리거 참고).
- **푸터 링크**: `assets/js/nav.js`의 공용 푸터 템플릿(전 페이지 공통 렌더링)에 Disclosure 링크 1곳 추가 — "Site" 링크그룹과 하단 카피라이트 줄 양쪽에 반영해 118개 전 페이지에 한 번에 적용됨. `node --check`로 JS 문법 검증 완료.
- **인프라 갱신**: sitemap.xml(신규 1개 URL, 총 118개 확인), llms.txt(Core Pages 섹션에 disclosure 항목 추가).
- **⚠️ ads.txt는 지시대로 생성하지 않음** — AdSense 심사 상태(현재 "심사 대기 중", 섹션 7-0 참고)가 완전히 확정되기 전까지는 보류. **다음에 만들 때 확인할 것**: 승인이 나오면 AdSense 게시자 ID로 정식 ads.txt를 생성하고, 만약 이후 다른 제휴/광고 네트워크(Sovrn 등)를 추가로 붙이게 되면 그 네트워크의 판매자 ID도 함께 등록해야 함(복수 항목 가능).
- **검증**: 전체 사이트 구조 스캔(div/h2~h4/JSON) 0건, `assets/js/nav.js`를 포함한 전체 broken link 스캔 0건(공용 푸터 템플릿 링크까지 별도로 검증함), sitemap-파일시스템 정합성 확인(118 URL 전부 실존).
- **⚠️ GitHub Pages 빌드 확인 필요**: 커밋 `d87bba2` push 확인(API `commits/main`으로 반영 확인됨)했으나, push 후 4분 넘게 `pages/builds/latest`가 이전 커밋(`c725b2c`)에 머물러 있음 — v13/v19-1(solar-panel-guide) 때와 동일한 API 자체 지연 패턴으로 추정, 콘텐츠 diff 문제 아님. **다음 세션에서 가장 먼저 `pages/builds/latest`로 `d87bba2` 이후 상태가 `built`인지 확인할 것.** 과도한 재트리거는 하지 않음.
- **참고(발견, 별건, 이번 작업 범위 밖이라 손대지 않음)**: `about.html`의 "How We Keep This Free" 섹션이 "Ads are served through Google AdSense; we don't hand-pick advertisers or accept sponsored placements"라고만 서술 중 — 섹션 0-6의 AdSense 비의존·제휴 우선 방침과 어긋나는 낡은 문구임. 실제 제휴 링크를 넣는 다음 단계에서 이 문단도 함께 갱신할 것(제휴는 "판매자를 골라 우대"하는 것이 아니라 계산기 로직과 무관한 순수 링크라는 disclosure.html의 논리를 그대로 가져오면 됨).

---

## 0-9. v18 세션 요약 (2026-07-27) — EV 클러스터 보강 3건 + AI 계산기 이미지생성 모드 추가, 신규 페이지 후보는 전부 레드오션으로 확인되어 보류

- **작업 방식 확인**: 이번 세션에 사용자가 재확인한 지침 — ①신규 콘텐츠는 반드시 기존 파일 중복확인 + 웹서치 경쟁강도 확인(롱테일 전략) ②"AI검색은 도메인 권위보다 콘텐츠 품질(문제해결/비교분석형)이 중요"하다는 방향성 재강조 ③수익화(AdSense) 관점 우선순위 ④대시보드/시각화 없이 텍스트로만 분석 보고 ⑤작업 끝나면 handover.md도 갱신해서 같이 push ⑥완료 후 화면 깨짐 확인 필요한 페이지만 링크 제공.
- **세션 시작 시 재검증 스크립트 전부 실행**: 구조버그(div/h2/JSON-LD) 0건, FAQ-본문 매칭 15건(전부 v15~v17에 이미 확인된 기존 경미한 이슈, 신규 없음), 글로서리 DefinedTermSet 매칭 1건(기존과 동일, "Demand Charge/Time-of-Use Rate"), 내부링크 broken-link 0건, sitemap.xml 115개 URL 전부 실제 파일 존재 확인. **GitHub Pages 마지막 빌드(`11b86cc`, v17 종료 커밋) 상태 `built` 정상 확인** — v17에서 우려했던 빌드 지연은 해소된 상태였음.
- **SC 데이터 분석 (최근 3개월, perf 차트는 07-24까지, Coverage 차트는 07-10까지 — 통상적인 리포트 지연 폭, 파일 자체는 신규였음)**: **클릭 여전히 전 쿼리 0건**, 대부분 쿼리 평균 순위 60~100위대로 기존 패턴과 동일. 다만 EV/냉장고/온수기/공간히터 관련 일부 쿼리는 13~20위권까지 올라와 있음(`car-vs-ev-carbon.html` 관련 쿼리 순위 13.86, "how much does refrigerator cost" 17.87, "gas vs electric water heater monthly cost" 17.5, "is it cheaper to run space heaters or central heat" 15) — 이 페이지들이 상대적으로 성과가 좋은 편. Coverage "심각한 문제"에 리디렉션 3건/404 2건/크롤링됨-미색인 6건 여전히 URL 특정 불가(CSV 내보내기 한계, 반복 확인된 사항) — 이번에도 GSC UI에서 직접 확인 필요.
- **GA 데이터 분석 (6/29~7/26, 28일)**: 활성사용자 72명, Direct/(none) 트래픽 압도적(49~69/72). **copilot.com/ai-assistant 유입이 1건→3건으로 증가** (v17 대비) — AI 어시스턴트 경유 트래픽이 서서히 늘어나는 추세로 판단되나 표본이 작아 확정 신호는 아님, 다음 세션에서도 계속 추적할 것. 도시별 데이터에 Boardman(OR)·Council Bluffs(IA) 등 데이터센터 밀집 지역이 잡혀 일부는 봇/크롤러 트래픽일 가능성 있음(참고만, 조치 불필요). 페이지별로는 appliance-energy-cost(55뷰)·heating-vs-cooling(45)·water-usage(34)·car-vs-ev-carbon(33)·electric-bill-spike-calculator(29)·solar-panel-count-calculator(26) 등이 상위 — 이번 세션 신규 데모 없이도 v17 신규 페이지 `demand-response-programs` 블로그가 벌써 GA 4뷰 기록(빠른 반응).
- **⚠️ 신규 콘텐츠 후보 검토 결과 — 웹서치로 확인한 4개 후보 전부 레드오션으로 확인, 신규 페이지 보류**:
  1. "배달/라이드셰어 드라이버 EV 절약 계산기" (SC 쿼리 "electric vehicle delivery fuel savings" 1회 노출에서 착안) — Coltura(대형 비영리, EVQ 파워드), Mystro(라이드셰어/배달 전용 cost-per-mile 계산기), Healvanna 등 경쟁 존재. 완전 무경쟁은 아니라고 판단.
  2. "AI 이미지생성 탄소발자국 계산기" — aiimpactcalculator.com(LLM Impact Tracker, 이미 이미지생성 옵션 포함), CalcWolf 등 전용 계산기 이미 존재 — v17에서 우려한 "AI 에너지 틈새 폐쇄 속도가 매우 빠르다"가 이번에도 확인됨.
  3. "수영장 히터 가스 vs 전기 vs 히트펌프 계산기" — Trouble Free Pool, poolchemicalcalculator.com 등 전용 계산기 다수 + 블로그 다수. 레드오션.
  4. "전기 vs 가스 잔디깎이 운영비 계산기" — RunWatts(기존에도 확인된 애그리게이터), lawncalcpro.com 전용 계산기 존재. 레드오션.
  - **결론/패턴 재확인**: v15~v17에 이어 이번에도 "특정 가전/장비 단일 운영비 계산기" 유형 신규 후보는 검토할 때마다 이미 전용 계산기 사이트가 존재함 — 이 유형의 완전 신규 페이지 발굴은 계속 어려워지는 추세. **대신 이번 세션은 신규 URL을 만드는 대신, ①실트래픽 있는데 FAQ가 아예 없거나 얇은 기존 페이지 보강 ②이미 순위가 붙어있는 페이지의 키워드 갭(고마일리지 운전자 등)을 신규 섹션으로 흡수 ③경쟁사가 이미 갖춘 기능(이미지생성 모드)을 기존 계산기에 추가해 기능 격차 해소 — 세 가지 방식으로 전환.** 이 판단은 v14 세션(사실오류 수정 우선, 신규 0건) 선례와 같은 맥락 — 무리하게 레드오션에 신규 페이지를 밀어넣기보다 기존 자산 강화가 이번 세션엔 더 합리적이라고 판단.
- **보강 작업 4건 (신규 페이지 0건)**:
  1. `blog/ev-vs-gas-true-cost.html` (SC 순위 6위로 사이트 내 최상위권인데 FAQ가 아예 없었음) — "고마일리지 드라이버(배달/라이드셰어)" 신규 섹션 추가: 마일당 절약이 마일리지에 비례해 커진다는 점, 12,000mi/yr 평균 운전자 대비 35,000mi/yr 기준 손익분기 18~30개월로 단축되는 계산, 자택충전 접근성이 핵심 변수라는 점, **2026년 7월 IRS 표준 마일리지율이 72.5¢→76¢로 연중 인상된 최신 사실**(가스값 상승 반영, 웹서치로 확인한 매우 신선한 뉴스 — EV/가스차 무관하게 동일 정액 공제라 EV의 실제 원가 우위를 못 반영한다는 포인트로 연결) 반영. FAQ 3개 신규(스키마 매칭 확인). SC 쿼리 갭("electric vehicle delivery fuel savings")도 자연스럽게 커버.
  2. `tools/car-vs-ev-carbon.html` (SC 순위 13.86위, GA 33뷰로 실트래픽 있는데 FAQ 0건) — FAQ 3개 신규 추가(제조배출/그리드별 비교/배터리 크기별 배출 질문).
  3. `compare/ev-vs-gas-car.html` (588단어로 얇고 FAQ 0건) — 고마일리지 드라이버 섹션(짧게, 위 블로그로 링크 유도해 콘텐츠 중복 방지) + FAQ 3개 신규.
  4. `tools/ai-carbon-footprint-calculator.html` — 이미지생성 모드 옵션 2종(diffusion ~6Wh, 고품질/멀티스텝 ~15Wh) 추가. Scientific Reports(2024) 동료검토 연구의 DALL-E2 ~2.2g CO2e/image 수치와 CalcWolf의 "텍스트 대비 2~30배" 추정치를 근거로 명시, 비디오생성은 더 높다는 점도 언급. 본문 신규 섹션 + FAQ 1개 추가(기존 3개 FAQ에 이어 4번째). 메타설명/JSON-LD description/llms.txt 전부 이미지생성 반영해서 갱신.
  - **작업 중 자체 발견 실수**: FAQ 스키마에 4번째 질문("이미지생성이 챗봇보다 에너지 많이 쓰나?")을 추가하면서 본문에 대응하는 h3+답변을 넣는 걸 깜빡함 — 재검증 스크립트(FAQ 매칭)로 즉시 발견해서 수정함. **교훈 재확인**: FAQ 스키마와 본문은 반드시 스크립트로 검증할 것(섹션 4-3 규칙 그대로 적용됨, 신규 세션에서도 한 번 더 안전하게 걸러짐).
- **전체 재검증 후 커밋**: 구조/FAQ매칭/글로서리/broken-link 스캔 전부 통과(신규 이슈 0건) 확인 후 커밋 1건으로 push 완료. 커밋 메시지에 스킵한 4개 레드오션 후보와 사유 기록.
- **파일 개수 변동 없음(2026-07-27 세션 종료, v17과 동일)**: tools 38개, blog 28개, compare 44개, glossary 1개 파일에 용어 19개 — 이번 세션은 신규 URL 추가 없이 기존 4개 파일만 수정했기 때문.
- **다음 세션 우선순위**:
  1. 새 SC 데이터로 이번 세션 보강 페이지(특히 `blog/ev-vs-gas-true-cost.html`, `compare/ev-vs-gas-car.html`)의 "electric vehicle delivery" 관련 쿼리 노출 여부 확인, `tools/ai-carbon-footprint-calculator.html`의 이미지생성 관련 신규 쿼리 유입 확인.
  2. copilot.com/ai-assistant 유입이 3세션 연속 증가 추세인지 다음 GA 데이터로 재확인.
  3. AdSense 심사 결과 — 이번 세션도 사용자가 언급 안 해서 확인 못함, 여전히 최대 수익화 레버이므로 다음 세션에서 먼저 물어볼 것.
  4. 레드오션으로 확인한 4개 후보(배달 EV/AI이미지생성/수영장히터/전기잔디깎이)는 재검토 불필요 — 확정.
  5. Coverage의 404/리디렉션/미색인 URL 특정을 위해 사용자에게 GSC UI 직접 확인 요청 계속 필요(반복 확인된 한계).
  6. `blog/ev-vs-gas-true-cost.html`의 "article-meta" 읽기 시간 텍스트("9 min read")가 이번 보강으로 실제 분량이 늘었으니 다음에 손볼 여유 있으면 "10 min read"로 미세 조정 가능(우선순위 낮음, 사용자가 신경 안 쓸 수준).

---



- **이번 세션은 SC/GA 신규 데이터 없이 진행** (사용자가 파일 첨부 안 하고 "오늘은 신규를 폭넓게 찾아보자"로 시작) — 순수 키워드 리서치 + 경쟁강도 체크 세션.
- **외부 변경 확인**: 세션 시작 시 pull하니 사용자가 직접 GitHub 웹에서 index.html에 커밋 2건(`8408ae1`, `31a0a47`) 추가한 상태였음 — KittyLaunch/Sell With Boost 배지 링크 추가(사용자가 채팅에서 직접 진행한다고 했던 것). 내 작업과 충돌 없음, 확인만 하고 넘어감.
- **⚠️ 매우 중요한 발견: 2026년 7월 중순 현재, "가전/에너지 running-cost 계산기" 유형은 거의 모든 카테고리가 이미 레드오션임.** 이번 세션에 폭넓게 조사한 14개+ 키워드 후보 전부 아래처럼 확인됨:
  - 전기벽난로 운영비, 크리스마스 조명 전기료, TOU(시간대별 요금) 절약 계산기, 커뮤니티솔라 vs 지붕솔라, EV 충전비용(마일당), VPP/홈배터리 페이백, 뱀파이어파워/팬텀로드, EV 배터리 열화, EV 겨울 히터 vs 시트히터 항속거리, 잔디 급수 스케줄, 패스트패션 탄소발자국, 그로우라이트 전기료, 웰워터 vs 상수도 — **전부 8개 이상의 전용 계산기 애그리게이터 사이트가 이미 존재**(SlashPlan, EnergyBot, GridHacker, calculator.academy, tooliro, ecocostsavings, learnmetrics, greenenergycalc.com(우리 기존 경쟁사!), evcalcs, agentcalc, localaimaster 등).
  - **특히 주목**: 지난 세션(v16) 성공 패턴이었던 "AI+에너지" 틈새(로컬 AI GPU 전기료 계산기)조차 이미 4~5개 전용 사이트가 생겨서 빠르게 닫히고 있음 — 이 패턴(경쟁자 없는 신흥 틈새 발굴)의 유효기간이 매우 짧다는 걸 확인. 앞으로 신규 콘텐츠 발굴 시 "지금 이 순간 경쟁자가 없다"는 것에 안심하지 말고, 매 세션 새로 검색해서 재확인할 것.
- **결국 찾은 상대적으로 나은 후보: Demand Response(수요반응) 프로그램** — 여름철 피크타임에 에어컨 사이클링을 유틸리티에 맡기면 연 $25~160+ 받는 프로그램. 경쟁강도 확인 결과 이 주제는 계산기 애그리게이터가 아니라 **각 유틸리티 자체 공식페이지(SCE/PG&E/ConEd/National Grid)와 콘텐츠형 가이드 1곳(energy-solutions.co) 정도**만 있어 상대적으로 경쟁 낮음. 범용 계산기는 유틸리티마다 금액이 천차만별이라 오히려 부정확해질 위험 있다고 판단해 **계산기가 아니라 문제해결형 정보 가이드**로 작성(사용자가 강조한 "AI검색은 문제해결/비교분석형 콘텐츠가 유리하다" 원칙 반영). 7월 폭염 시즌 타이밍도 적절.
  - `blog/demand-response-programs-get-paid-to-save-energy.html` 신규 추가. 내용: DR 작동원리(central AC 컴프레서 15~20분/시간 사이클링), 실제 수익 범위($25~100 기본, SCE 최대 $160, 배터리/EV차저 연동 시 더 높음), Direct Load Control vs BYOT(스마트서모스탯) 프로그램 비교, 쾌적성 트레이드오프에 대한 균형잡힌 분석(무리하게 좋다고만 안 하고 override 남용 시 탈락 위험 등 단점도 명시), 가입 방법 안내. FAQ 3개(스키마 포함).
  - 기존 `tools/electric-bill-spike-calculator.html`, `tools/ac-running-cost.html`, `compare/smart-thermostat-vs-programmable.html`과 전부 상호링크, blog/index.html/sitemap.xml/llms.txt 반영 완료.
- **보강 1건**: `compare/portable-ac-vs-window-ac.html` — FAQ 3개(스키마 포함) 추가. 세 번째 FAQ는 신규 DR 블로그와 자연스럽게 연결되는 질문("포터블/윈도우 에어컨도 DR 프로그램에 등록 가능한가?" → 보통 불가, DR은 중앙집중식 에어컨 위주라는 실질적 답변)으로 설계해서 두 글이 서로를 강화하도록 함.
- **재스캔+검증**: 신규/수정 파일(demand-response 블로그, portable-ac-vs-window-ac, electric-bill-spike-calculator, ac-running-cost, smart-thermostat-vs-programmable) 대상 구조버그+FAQ매칭+JSON중복키+div균형 전부 개별 확인 + 전체 사이트 재스캔 — 신규 이슈 0건.
- **GitHub Pages 빌드 확인**: 커밋 후 `pages/builds/latest`로 상태 확인 — `status: building` → 약 40초 후 `status: built`, commit sha 일치 확인 완료.
- **다음 세션 우선순위**: (1) 이번에 확인한 "가전 계산기 레드오션" 현황을 감안해, 신규 콘텐츠 발굴 시 계산기보다 "문제해결형 정보 가이드" 포맷을 우선 고려할 것(오늘 demand-response 사례처럼), (2) 이번 세션에 확정적으로 스킵한 14개 키워드는 다시 검토할 필요 없음(전부 레드오션 확정), (3) 새 SC/GA 데이터 오면 이번 세션 신규 페이지들(demand-response 클러스터 4개) 노출 여부 확인 — 7/24 게시라 최소 1~2주는 지나야 반영될 것, (4) 우물물 vs 상수도 비교는 오늘 유일하게 "계산기보다 판매업체 리드젠 콘텐츠"가 지배적인 니치였지만 우리 사이트에 관련 클러스터가 전혀 없어서 보류함 — 사용자가 원하면 다음에 새 필러(용어집 용어 추가 포함)로 제대로 붙여볼 것, (5) AdSense 심사 결과 여전히 미확인(사용자가 언급 안 하면 먼저 꺼내지 말 것 원칙 유지).

### v17 세션 후반 — 사용자 지적으로 "제대로 된 클러스터"로 확장 (tool + compare + glossary 추가)
- 사용자가 "블로그 1건은 클러스터가 아니지 않냐"고 지적 → Demand Response 주제를 진짜 클러스터로 확장.
- 확장 전 재확인 웹서치: "demand response 계산기"로 검색해보니 Enel X, Sympower, Energy Toolbase, LoadViz Pro, David Energy 등 계산기가 다수 나오지만 **전부 B2B/상업시설용(kW/MW 단위, 산업 고객 대상)**이었고, **가정용(residential) 대상 계산기는 실제로 하나도 없었음** — 이 갭을 확인하고 진행 결정.
- `tools/demand-response-savings-estimator.html` 신규: 프로그램 유형 4종(기본 AC사이클링/BYOT/프리미엄/배터리·EV연동) + 등록기기 수 입력 → 연간 예상 수익 범위 출력. 유틸리티마다 실제 금액이 크게 다르다는 점을 결과문구+FAQ에서 명확히 고지해서 과신 방지(정확한 견적 아님을 반복 강조).
- `compare/demand-response-vs-time-of-use-vs-solar-battery.html` 신규: DR/TOU/솔라+배터리 3가지를 초기비용·연간가치·트레이드오프 기준 비교표+분석. 세 가지 동시 병행 가능하다는 점도 FAQ에 명시.
- `glossary/index.html`: "Demand Response (DR)", "BYOT (Bring Your Own Thermostat)" 용어 2개 신규(스키마+본문 매칭 확인).
- 결과적으로 blog(v17 초반)+tool+compare+glossary 4개 페이지가 전부 상호링크된 완결 클러스터 완성. tools/index.html/compare/index.html 카테고리 필터 확인 후 정확한 data-category 값(heating/energy) 사용해서 카드 추가(처음에 "energy"를 compare 쪽에 잘못 넣었다가 compare 페이지의 유효 필터 목록에 "energy"가 없는 걸 발견하고 "heating"으로 수정함 — **교훈: 새 카드 추가 시 반드시 해당 index.html의 setFilter 버튼 목록에서 유효한 카테고리 값을 확인할 것, tools와 compare가 서로 다른 카테고리 셋을 씀**).
- compare 페이지 본문 작성 중 자기참조 링크 실수(같은 페이지를 링크로 걸어놓음) 발견 즉시 수정 — 새 페이지 작성 후 자기 URL이 본문 링크에 들어가 있는지도 체크리스트에 추가할 만함.
- 전체 재스캔(구조+FAQ매칭+JSON유효성+div균형) + **신규: 내부링크 broken-link 체크(href가 실제 파일로 존재하는지)**도 추가로 실행 — 전부 통과.
- **파일 개수 최종(2026-07-24 세션 종료)**: tools 37개, blog 28개, compare 43개, glossary 1개 파일에 용어 17개.

### v17 세션 마지막 — 두 번째 신규 클러스터: 우물물 vs 상수도 (compare + glossary 확장)
- 사용자가 "지금 할 수 있는 건 바로 하는 게 맞다"고 해서, 앞서 백로그로 남겨뒀던 "우물물 vs 상수도" 니치를 바로 진행함.
- `compare/well-water-vs-city-water.html` 신규: 우물 굴착비 + 상수도 요금 + 우물 펌프 전기료 + 연간 테스트/유지비를 입력받아 실제 손익분기 연수를 계산하는 페이지. 경쟁강도는 중간(welldrillingcosts.com 등 전용 계산기 존재)이었지만, 계산기가 아니라 판매업체 리드젠 콘텐츠가 더 지배적인 니치였고 우리 사이트의 water 클러스터(water-usage, rain-barrel-vs-municipal-water 등)에 자연스럽게 연결 가능해서 진행 결정.
  - **정합성 체크**: 본문에 "상수도 요금은 매년 3-5% 오른다"는 서술이 있는데 계산기의 10/20년 비교는 단순화를 위해 고정요금을 가정 — 서로 모순처럼 안 보이게 result-note에 "이 가정 때문에 실제 우물의 이득은 여기 표시된 것보다 클 가능성이 높다"고 명시해서 사전에 방지함(v16의 온수기 페이지 교훈 재적용).
- `glossary/index.html`: "Aquifer", "Water Softener" 용어 2개 신규(스키마+본문 매칭 확인).
- **⚠️ 부수 발견 및 수정**: `compare/index.html`의 필터 버튼 목록에 애초에 "water" 카테고리가 없었는데, 기존 `rain-barrel-vs-municipal-water.html`/`low-flow-vs-standard-showerhead.html` 2개 파일이 이미 `data-category="water"`로 등록되어 있어서 **필터 버튼을 눌러도 이 두 페이지는 절대 안 보이는 잠재 버그**가 있었음(전체 노출에선 보이지만 카테고리 필터링 시 사라짐). "Water & Environment" 필터 버튼을 새로 추가해서 기존 2개 + 신규 1개 카드 전부 정상 노출되도록 수정. **교훈 재확인**: tools/index.html과 compare/index.html은 서로 다른 카테고리 셋을 쓴다(tools: energy/solar/carbon/water, compare: solar/transport/heating/appliances/efficiency/carbon/water(이번에 추가)) — 새 카드 넣을 때마다 반드시 해당 index.html의 `setFilter` 버튼 목록부터 확인할 것.
- **글로서리 스키마 검증 스크립트 신규 추가**(FAQ 매칭 스크립트와 같은 패턴을 DefinedTermSet에도 적용): 이번에 처음 실행해보니 기존 "Demand Charge / Time-of-Use Rate" 스키마 항목이 본문과 정확히 문자열 매칭이 안 되는 경미한 기존 이슈를 발견 — Demand Charge에 대한 별도 설명 문단을 Time-of-Use 블록에 추가해서 실질적으로 보완함(정확한 문자열 매칭까진 안 되지만 콘텐츠는 이제 존재). **다음 세션부터는 FAQ 매칭 스크립트뿐 아니라 glossary DefinedTermSet 매칭도 새 세션 시작 시 같이 돌릴 것.**
- **⚠️ GitHub Pages 빌드 지연 발생**: 마지막 커밋(`11b86cc`) 푸시 후 약 3분간 빌드가 트리거되지 않음(API로 `commits/main` 확인 결과 push 자체는 정상 반영됨, `pages/builds`만 안 잡힘). 과도한 재시도 안 하고 handover.md 커밋을 이어서 진행 — 다음 세션에서 최종 커밋의 빌드 상태 재확인 필요.
- **파일 개수 최최종(2026-07-24 세션 완전 종료)**: tools 37개, blog 28개, compare 44개, glossary 1개 파일에 용어 19개.
- **다음 세션 최우선**: (1) 이번 세션 마지막 커밋(`11b86cc`, well-water 클러스터)의 GitHub Pages 빌드 상태 확인 — 새 세션 시작하면 가장 먼저 `pages/builds/latest`로 확인할 것, 안 됐으면 섹션 6 절차대로 대응, (2) 새 세션 시작 시 FAQ 매칭 스크립트 + glossary DefinedTermSet 매칭 스크립트 둘 다 실행.

---



- **세션 시작 시 재검증 스크립트부터 실행**(v15 지침대로): 구조 버그 스캔(고아 닫힘태그/div불균형/헤더불균형/JSON파싱) 0건, FAQ-본문 매칭 스캔 15건 발견 — 전부 v15에서 이미 확인된 것과 동일한 경미한 표현 차이(관사 유무 등, 실질 콘텐츠는 존재)로, 이번 세션에 건드린 파일에서 새로 발생한 건 아님을 확인. 우선순위 낮아서 이번에도 그대로 둠(다음에 한가할 때 문구 통일).
- **SC 데이터 (5/18~7/18, 총 노출 249→273으로 갱신)**: 클릭 여전히 0, 대부분 쿼리 평균 순위 60~100위대로 전과 동일한 패턴. **다만 07-17(순위 47.2)·07-18(순위 52.1) 이틀 순위가 눈에 띄게 개선** — 표본이 작아(노출 6~10건/일) 아직 노이즈일 가능성이 높다고 판단, 확정적 신호로 취급하지 않고 다음 세션에서 추세 지속 여부만 확인할 것. 기존 쿼리 클러스터는 v12~v15와 동일하게 기존 페이지들이 이미 잘 커버 중 — 새로운 뚜렷한 갭 없음.
- **Coverage 데이터에서 신규 확인 사항**: 색인 트렌드 차트는 07-10까지만 반영(2주 지연 재확인), 89/100 정체 그대로— 새 정보 없음. **다만 "심각한 문제" 카테고리에 리디렉션 포함 페이지 3건, 404(찾을 수 없음) 2건, "크롤링됨-현재 미색인" 6건이 잡혀 있음** — 이 CSV 내보내기 형식엔 구체적 URL이 없어 어떤 페이지인지 이번 세션에서는 특정 불가. 사용자에게 GSC 웹 UI에서 직접 확인 요청 필요(다음 세션 우선순위 참고).
- **GA 데이터**: 4주간(6/22~7/19) 활성 사용자 62명, Direct/(none) 트래픽이 압도적(48/62). Organic은 bing·duckduckgo·ecosia 소량, **perplexity.ai(ai-assistant)·copilot.com(ai-assistant) 유입도 각 1건씩 처음 잡힘** — AI 어시스턴트 경유 트래픽이 발생하기 시작한 신호(아직 극소량). 총수익 항목은 이번 CSV엔 포함 안 됨(AdSense 심사 상태는 사용자가 이번 세션에 언급 안 해서 확인 안 함 — 다음 세션에서 먼저 물어볼 것).
- **신규 콘텐츠 1건**: `tools/ai-water-footprint-calculator.html` — "AI 챗봇이 물을 얼마나 쓰는가" 계산기. **경쟁강도 웹서치 결과 인터랙티브 계산기 경쟁자 전무**(전부 저널리즘/블로그: Axis Intelligence, DataCenterDynamics, The Conversation, Medium 등) — v15의 ai-carbon-footprint-calculator.html과 정확히 같은 패턴(계산기+비교분석 콤보가 사이트 강점과 부합). 방법론: OpenAI(Sam Altman, 2025-06 공개, 평균 쿼리당 0.32mL=0.000085갤런)과 Google(공식 Gemini 기술보고서, 2025-08 공개, 중간값 프롬프트 0.26mL) — 두 회사가 공개한 유일한 두 수치(직접 냉각수만 집계)를 기준으로 하고, 전력 생산에 드는 간접 수자원까지 포함하는 독립 연구 추정치(~10mL, UC Riverside/Ren et al. 계열)를 별도 옵션으로 제공. "5방울 vs 물 한 병"이라는 실제로 언론에서 혼재되는 두 수치의 차이(직접냉각 vs 전체 라이프사이클)를 설명하는 문제해결형 구조로 작성 — 사용자가 이번 세션에 재확인한 "AI검색엔 문제해결/비교분석형 콘텐츠가 유리하다" 원칙에 정확히 부합. 기존 water-usage.html(사이트 기존 강점 계산기)과 자연스럽게 연결됨. sitemap.xml/llms.txt(계산기 총 개수 35→36 갱신)/tools/index.html/ai-carbon-footprint-calculator.html/water-usage.html/blog/why-electric-bills-are-rising-ai-data-centers.html 상호링크 전부 반영, 각 수정 파일 dateModified 갱신 완료.
- **보강 1건**: `compare/electric-vs-gas-water-heater.html` — 섹션 10 백로그의 얇은 compare 페이지 중, **실제 SC 노출 신호가 있는 유일한 페이지**(1회 노출, "gas vs electric water heater monthly cost" 쿼리, 순위 17)라 우선순위로 선정(수익화 관점: 다른 백로그 페이지는 SC/GA 어디에도 트래픽 신호가 없어 이번엔 후순위로 미룸). 계산기 기본값(50gal/day, 국평균 요금) 기준 4개 옵션 빠른 비교표 신규 추가 + FAQ 3개(스키마 포함) 추가. **비교표 작성 중 발견**: 기존 본문 서술("The Breakeven Electricity Rate" 문단, 4,000kWh/250therm 기준 가스 $350/전기 $547)과 계산기 JS의 실제 계산 로직(기본값 50gal/day 기준 가스탱크 $177/전기 $366)이 서로 다른 온수 사용량 가정(전자는 ~79gal/day 상당, 후자는 50gal/day)을 쓰고 있어 숫자가 다름을 검산으로 확인 — 둘 다 틀린 건 아니고 참조하는 통계 출처가 다른 것(전자는 EIA류 전국 평균 가정 통계, 후자는 계산기 자체 기본 입력값)이라, 신규 비교표는 반드시 "이 계산기 기본값 기준"이라고 명시해서 기존 문단과 모순처럼 안 보이게 처리함. **패턴 기록**: 계산기 페이지에 보조 비교표/quick-reference 표를 추가할 때는 반드시 실제 JS 함수로 직접 검산해서 숫자를 뽑아 넣을 것 — 본문 프로즈에 있는 다른 통계를 그대로 재사용하면 계산기 실제 출력과 안 맞을 수 있음(이번에 발견해서 사전에 방지함, 실제 오류로 배포되진 않음).
- **재스캔+검증**: 신규/수정 파일(ai-water-footprint-calculator.html, electric-vs-gas-water-heater.html) 대상 구조 버그 스캔 + FAQ매칭 스캔 + JSON-LD 중복키 검사(object_pairs_hook) + div/table-scroll 균형 전부 개별 확인, 전체 사이트 재스캔도 함께 실행 — 신규 이슈 0건.
- **GitHub Pages 빌드 확인**: 커밋 후 `pages/builds/latest`로 상태 확인 — `status: building` → 약 40초 후 `status: built`, commit sha 일치 확인 완료(섹션 6 절차대로 정상 처리, 문제 없었음).
- **다음 세션 우선순위**: (1) Coverage의 404/리디렉션/미색인 페이지 구체 URL을 사용자에게 GSC UI에서 직접 확인 요청, (2) AdSense 심사 결과 먼저 물어볼 것(이번 세션엔 사용자가 언급 안 해서 확인 못 함, 여전히 가장 큰 수익화 레버), (3) 새 SC 데이터로 07-17/07-18 순위 개선 추세가 지속되는지 + ai-water-footprint-calculator.html/이전 세션 신규 페이지들 노출 여부 확인, (4) perplexity.ai/copilot.com 같은 AI 어시스턴트 경유 트래픽이 이번에 처음 소량 잡혔으니 다음 GA 데이터에서도 늘어나는지 추이 관찰, (5) 섹션 10 백로그의 나머지 얇은 compare 페이지(public-transport-vs-car, driving-vs-flying-carbon, electric-bike-vs-car, electric-heat-vs-gas-heat, portable-ac-vs-window-ac, heat-pump-dryer-vs-electric, low-flow-vs-standard-showerhead, dishwasher-vs-hand-washing)는 이번 세션엔 SC/GA 신호가 전혀 없어 후순위로 미뤘음 — 신호 없는 상태가 계속되면 "신규 콘텐츠로 롱테일 선점" 전략에 맞춰 완전히 새로운 주제 발굴에 시간을 더 쓰는 것도 고려.

---



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
- 수익모델: **AdSense 비의존 방침(v19 확정)**. AdSense 계정은 존재하나(client: `ca-pub-5592663499707350`) 슬롯은 빈 껍데기이고 주 수익원으로 보지 않음. **태양광/홈서비스 리드젠 제휴 1순위**, 그 외 수익이 되는 제휴/광고사는 전부 검토 대상. 상세 판단 기준과 단계별 트리거는 섹션 0-6 참조.
- **이 저장소에 `handover.md`를 직접 두고 매 세션 갱신+커밋하는 방식으로 전환함 (v10부터). 채팅에 파일 업로드하는 대신 저장소에서 바로 읽고 쓸 것.**

## 2. 작업 방식
- 세션 시작 시 사용자가 신규 GitHub PAT를 채팅으로 줌 → API로 직접 커밋. 끝나면 사용자가 revoke.
- Search Console(Performance + Coverage) zip, 최근부터는 **Google Analytics 개요 CSV("보고서_개요.csv")**도 같이 줌 — GA에는 트래픽 소스, 참여시간, **총수익(AdSense)**, 리텐션 등이 들어있음. 새 세션에서 GA 파일이 오면 꼭 열어볼 것.
- 대시보드나 시각화 자료 만들지 말고 분석은 텍스트로만 보고할 것 (2026-07-13 세션에 명시적으로 지시받음).
- 신규 콘텐츠는 반드시: ① 기존 파일과 중복 확인 → ② 웹서치로 키워드 경쟁강도 확인 → ③ 수익화(AdSense 트래픽/클릭) 관점에서 우선순위 판단 후 결정. 경쟁 심한 주제(대형 브랜드가 이미 장악)는 스킵.
- 완료 보고 전 반드시 실제 URL로 확인 요청 — 스크린샷에서 실제 렌더링/로직 버그가 자주 나옴.

## 3. 현재 파일 개수 (2026-07-27 기준 v18에서 재확인, 새 세션에서 재확인 필수)
- tools: 38개 (v17 handover에 37개로 잘못 기재돼 있었음 — v18에서 실제 개수 재확인해서 수정)
- blog: 28개
- compare: 44개 (v17에서 demand-response-vs-time-of-use-vs-solar-battery, well-water-vs-city-water 신규 추가)
- glossary: 1개 파일에 용어 19개 (v17에서 Demand Response, BYOT, Aquifer, Water Softener 추가)
- v18은 신규 URL 추가 없이 기존 파일 4개만 수정한 세션이라 개수 변동 없음.
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

## 7. 수익화 현황
### 7-0. ⚠️ v19(2026-08-03) 방침 — 아래 v12 내용보다 이것이 우선함
- **AdSense에 의존하지 않는다.** 수익이 되는 제휴 광고면 종류를 가리지 않고 검토한다. AdSense 심사 탈락 시 재심사 여부는 Opus가 판단하고, 다른 제휴사/광고사도 동일 기준으로 판단한다. **AdSense보다 다른 제휴·광고가 이득이라고 판단되면 그 방향을 사용자에게 추천할 것.**
- 현 시점 Opus 판단: **디스플레이 광고 < 태양광 리드젠 제휴** (근거·수치·단계별 트리거는 섹션 0-6에 전부 정리). Ezoic 25만 MAU 요구로 사실상 봉쇄, Amazon은 180일 3판매 룰 때문에 지금 가입하면 계정 손실 위험. 제휴 링크 삽입 전 privacy.html 문구 수정 필수.
- 매 세션 재확인할 것: 제휴 프로그램 조건과 애드네트워크 가입 기준은 자주 바뀜(Ezoic이 2026-02에 바뀐 것처럼). **기억에 의존하지 말고 매번 웹서치로 현재 조건을 확인할 것.**

### 7-1. (구) v12 기준 기록: 2026-07-15 확인
- **AdSense는 당시 "심사 중"** (v12에서 사용자가 확인해줌). 심사 통과 전까지 광고가 어떤 방식이든 노출되지 않는 게 정상이므로, 광고 슬롯이 빈 껍데기(`<div class="adslot"><!-- AdSense --></div>`, 실제 `<ins class="adsbygoogle">` 태그 없음)인 것과 Auto Ads 여부는 심사 완료 후에 재점검할 것. **다음 세션에서 가장 먼저 확인: 심사 통과했는지, 통과했으면 광고 슬롯에 실제 `<ins>` 태그를 넣어야 하는지 Auto Ads만으로 충분한지.**
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
