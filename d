<body>
  <div class="page">
    <!-- 헤더 -->
    <div class="doc-header">
      <div class="header-badge">⚡ PNCoding · 프롬프트 생성기</div>
      <h1>랜딩페이지 <span>프롬프트 생성기</span></h1>
      <p>
        내 기획 내용을 채우고 버튼을 누르면 AI에게 줄 프롬프트가 완성됩니다.<br />완성된
        프롬프트를 복사해서 AI에 그대로 붙여넣으면 됩니다.
      </p>
    </div>

    <div class="guide-box">
      <span style="font-size: 18px; flex-shrink: 0">💡</span>
      <div>
        <strong>빈 칸을 채우고 아래 '프롬프트 생성하기' 버튼을 누르세요.</strong
        ><br />
        카페 예시가 기본값으로 들어가 있어요. 내 브랜드 내용으로 바꿔 채우거나,
        그냥 두면 카페 예시로 만들어집니다.
      </div>
    </div>

    <!-- ① 기본 정보 -->
    <div class="card">
      <div class="card-header">
        <div class="card-num">①</div>
        <div>
          <div class="card-title">기본 정보</div>
          <div class="card-sub">이 사이트가 무엇을 위한 사이트인지 정한다</div>
        </div>
      </div>
      <div class="card-body">
        <div class="field">
          <div class="field-label">브랜드 이름</div>
          <input type="text" id="brandName" placeholder="예) NOIR CAFÉ" />
          <div class="field-hint">영문으로 쓰면 더 고급스러워 보인다</div>
        </div>
        <div class="field">
          <div class="field-label">사이트 목적</div>
          <textarea
            id="purpose"
            placeholder="예) 카페를 모르는 사람들에게 브랜드를 소개하고 방문을 유도하는 홍보 사이트"
          ></textarea>
          <div class="field-hint">이 사이트를 왜 만드는지 한 줄로</div>
        </div>
        <div class="field">
          <div class="field-label">타겟 (누가 볼 건지)</div>
          <input
            type="text"
            id="target"
            placeholder="예) 아직 우리 카페를 모르는 20~40대"
          />
          <div class="field-hint">나이대·관심사·상황을 간단히 적는다</div>
        </div>
      </div>
    </div>

    <!-- ② 브랜드 정보 -->
    <div class="card">
      <div class="card-header">
        <div class="card-num">②</div>
        <div>
          <div class="card-title">브랜드 정보</div>
          <div class="card-sub">브랜드를 짧게 표현한다</div>
        </div>
      </div>
      <div class="card-body">
        <div class="field">
          <div class="field-label">슬로건 — 히어로 섹션 메인 문장</div>
          <input
            type="text"
            id="slogan"
            placeholder="예) 단 한 잔에도 타협하지 않는 프리미엄 스페셜티 카페"
          />
          <div class="field-hint">
            사이트 맨 위에 크게 들어갈 한 줄. 브랜드의 핵심을 담는다.
          </div>
        </div>
        <div class="field">
          <div class="field-label">한 줄 소개 — 브랜드 설명</div>
          <textarea
            id="tagline"
            placeholder="예) 어둠 속에서 피어난 한 잔의 여유를 선사하는 스페셜티 카페"
            style="min-height: 52px"
          ></textarea>
          <div class="field-hint">
            브랜드 소개 섹션에 들어갈 설명. 슬로건보다 조금 더 길어도 된다.
          </div>
        </div>
        <div class="field">
          <div class="field-label">대표 메뉴 / 서비스 3가지</div>
          <div style="display: flex; flex-direction: column; gap: 7px">
            <input
              type="text"
              id="menu1"
              placeholder="① 예) 블랙 에스프레소 — 에티오피아 원두 블렌딩, ₩6,500"
            />
            <input
              type="text"
              id="menu2"
              placeholder="② 예) 스모키 라떼 — 캐러멜 스모크 향, ₩7,500"
            />
            <input
              type="text"
              id="menu3"
              placeholder="③ 예) 다크 초콜릿 케이크 — 벨기에산 72% 다크, ₩9,000"
            />
          </div>
          <div class="field-hint">
            이름 + 간단 설명 + 가격. 사이트에서 카드 형태로 보여진다.
          </div>
        </div>
      </div>
    </div>

    <!-- ② 위치 & 운영 정보 (선택) -->
    <div class="card">
      <div class="card-header">
        <div class="card-num optional">②+</div>
        <div>
          <div class="card-title">
            위치 &amp; 운영 정보
            <span
              style="
                font-size: 13px;
                font-weight: 400;
                color: var(--text-muted);
              "
              >(선택)</span
            >
          </div>
          <div class="card-sub">
            오프라인 매장이 있으면 체크해서 입력한다. 온라인 브랜드·포트폴리오는
            건너뛴다.
          </div>
        </div>
      </div>
      <div class="card-body">
        <label class="location-toggle-wrap">
          <input type="checkbox" id="useLocation" />
          <span>위치 &amp; 운영 정보 섹션 포함하기</span>
        </label>
        <div class="location-fields" id="locationFields">
          <div class="field">
            <div class="field-label">주소</div>
            <input
              type="text"
              id="address"
              placeholder="예) 서울특별시 마포구 연남동 NOIR CAFÉ B1F"
            />
          </div>
          <div class="field">
            <div class="field-label">운영시간</div>
            <textarea
              id="hours"
              placeholder="예) 평일 11:00 – 22:00 / 주말 10:00 – 23:00 / 매월 첫째 월요일 휴무"
              style="min-height: 52px"
            ></textarea>
          </div>
          <div class="field">
            <div class="field-label">연락처 (공개할 것만)</div>
            <input
              type="text"
              id="contact"
              placeholder="예) 02-000-0000 / hello@noircafe.kr / @noir.cafe"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ③ 디자인 방향 -->
    <div class="card">
      <div class="card-header">
        <div class="card-num">③</div>
        <div>
          <div class="card-title">디자인 방향</div>
          <div class="card-sub">
            컨셉을 고르면 색상·폰트가 자동으로 채워진다
          </div>
        </div>
      </div>
      <div class="card-body">
        <!-- 컨셉 선택 -->
        <div class="field">
          <div class="field-label">컨셉 / 분위기 — 클릭해서 선택</div>
          <div class="concept-grid" id="conceptGrid">
            <div
              class="concept-card active"
              data-concept="다크 프리미엄 — 어둡고 고급스럽고 조용한 느낌"
              data-bg="#0F172A"
              data-accent="#D4AF74"
              data-text="#F5F0E8"
              data-font-title="Playfair Display"
              data-font-body="Noto Sans KR"
            >
              <div class="concept-emoji">🌑</div>
              <div class="concept-name">다크 프리미엄</div>
              <div class="concept-desc">
                어두운 배경 + 골드·크림.<br />고급스럽고 임팩트 강함.
              </div>
            </div>
            <div
              class="concept-card"
              data-concept="모던 미니멀 — 깔끔하고 여백이 넉넉한 애플 스타일"
              data-bg="#FFFFFF"
              data-accent="#0F172A"
              data-text="#1E293B"
              data-font-title="Inter"
              data-font-body="Noto Sans KR"
            >
              <div class="concept-emoji">🤍</div>
              <div class="concept-name">모던 미니멀</div>
              <div class="concept-desc">
                흰 배경 + 넉넉한 여백.<br />애플 스타일.
              </div>
            </div>
            <div
              class="concept-card"
              data-concept="따뜻한 빈티지 — 베이지·브라운 계열의 감성적인 느낌"
              data-bg="#FAF7F2"
              data-accent="#8B5E3C"
              data-text="#2D1B0E"
              data-font-title="Lora"
              data-font-body="Noto Sans KR"
            >
              <div class="concept-emoji">🍂</div>
              <div class="concept-name">따뜻한 빈티지</div>
              <div class="concept-desc">
                베이지·브라운 계열.<br />감성 SNS 느낌.
              </div>
            </div>
          </div>
          <div style="margin-top: 8px">
            <input
              type="text"
              id="customConcept"
              placeholder="직접 입력하려면 여기에 — 예) 네온 사이버펑크 느낌"
            />
            <div class="field-hint" style="margin-top: 4px">
              위 3가지 외 다른 느낌이면 여기에 직접 적는다
            </div>
          </div>
        </div>

        <!-- 색상 -->
        <div class="field">
          <div class="field-label">색상 팔레트</div>
          <div class="color-row">
            <div class="color-field">
              <div class="color-label">메인 배경</div>
              <div class="color-input-wrap">
                <input type="color" id="colorBgPicker" value="#0F172A" />
                <input
                  type="text"
                  id="colorBg"
                  class="hex-input"
                  value="#0F172A"
                  maxlength="7"
                  placeholder="#0F172A"
                />
              </div>
            </div>
            <div class="color-field">
              <div class="color-label">강조색 (포인트)</div>
              <div class="color-input-wrap">
                <input type="color" id="colorAccentPicker" value="#D4AF74" />
                <input
                  type="text"
                  id="colorAccent"
                  class="hex-input"
                  value="#D4AF74"
                  maxlength="7"
                  placeholder="#D4AF74"
                />
              </div>
            </div>
            <div class="color-field">
              <div class="color-label">텍스트 색상</div>
              <div class="color-input-wrap">
                <input type="color" id="colorTextPicker" value="#F5F0E8" />
                <input
                  type="text"
                  id="colorText"
                  class="hex-input"
                  value="#F5F0E8"
                  maxlength="7"
                  placeholder="#F5F0E8"
                />
              </div>
            </div>
          </div>
          <div class="field-hint" style="margin-top: 6px">
            색상을 모르면 위에서 컨셉을 클릭하면 자동으로 채워진다
          </div>
        </div>

        <!-- 폰트 -->
        <div class="field">
          <div class="field-label">폰트</div>
          <div class="font-row">
            <div>
              <div class="font-label">제목 폰트</div>
              <input
                type="text"
                id="fontTitle"
                value="Playfair Display"
                placeholder="예) Playfair Display"
              />
            </div>
            <div>
              <div class="font-label">본문 폰트</div>
              <input
                type="text"
                id="fontBody"
                value="Noto Sans KR"
                placeholder="예) Noto Sans KR"
              />
            </div>
          </div>
          <div class="field-hint">
            잘 모르면 그냥 두면 된다. 컨셉 클릭하면 자동 채워짐.
          </div>
        </div>
      </div>
    </div>

    <!-- ④ 섹션 구성 -->
    <div class="card">
      <div class="card-header">
        <div class="card-num">④</div>
        <div>
          <div class="card-title">섹션 구성</div>
          <div class="card-sub">
            페이지에 들어갈 내용을 순서대로 나열한다. 수정·추가·삭제 가능.
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="sections-list" id="sectionsList">
          <div class="section-item">
            <div class="section-num">1</div>
            <input
              type="text"
              value="히어로 — 브랜드 이름 + 슬로건 + CTA 버튼 (풀스크린 배경 이미지)"
              placeholder="섹션 이름과 내용 설명"
              data-i="0"
            />
            <button class="btn-del" data-i="0" title="삭제">×</button>
          </div>
          <div class="section-item">
            <div class="section-num">2</div>
            <input
              type="text"
              value="브랜드 소개 — 브랜드 스토리 2~3줄 + 통계 또는 포인트 3가지"
              placeholder="섹션 이름과 내용 설명"
              data-i="1"
            />
            <button class="btn-del" data-i="1" title="삭제">×</button>
          </div>
          <div class="section-item">
            <div class="section-num">3</div>
            <input
              type="text"
              value="시그니처 메뉴 — 대표 메뉴/서비스 3가지 (이미지 + 이름 + 설명 + 가격)"
              placeholder="섹션 이름과 내용 설명"
              data-i="2"
            />
            <button class="btn-del" data-i="2" title="삭제">×</button>
          </div>
          <div class="section-item">
            <div class="section-num">4</div>
            <input
              type="text"
              value="공간 / 제품 분위기 — 사진 그리드 (5장)"
              placeholder="섹션 이름과 내용 설명"
              data-i="3"
            />
            <button class="btn-del" data-i="3" title="삭제">×</button>
          </div>
          <div class="section-item">
            <div class="section-num">5</div>
            <input
              type="text"
              value="위치 &amp; 운영시간 — 지도 + 주소 + 영업시간 + 연락처"
              placeholder="섹션 이름과 내용 설명"
              data-i="4"
            />
            <button class="btn-del" data-i="4" title="삭제">×</button>
          </div>
          <div class="section-item">
            <div class="section-num">6</div>
            <input
              type="text"
              value='마무리 CTA — "지금 방문하기" 또는 "연락하기" 버튼'
              placeholder="섹션 이름과 내용 설명"
              data-i="5"
            />
            <button class="btn-del" data-i="5" title="삭제">×</button>
          </div>
        </div>
        <button class="btn-add" id="addSection" type="button">
          ＋ 섹션 추가하기
        </button>
      </div>
    </div>

    <!-- 생성 버튼 -->
    <button class="btn-generate" id="generateBtn" type="button">
      ✨ 프롬프트 생성하기
    </button>

    <!-- 결과 영역 -->
    <div class="result-wrap" id="resultWrap">
      <div class="result-top">
        <div class="result-title">완성된 프롬프트 — AI에 그대로 붙여넣기</div>
        <button class="btn-copy" id="copyBtn" type="button">📋 복사하기</button>
      </div>
      <div class="result-steps">
        <span class="result-step">① 아래 텍스트 박스 클릭</span>
        <span style="color: var(--text-muted)">→</span>
        <span class="result-step">② '복사하기' 버튼</span>
        <span style="color: var(--text-muted)">→</span>
        <span class="result-step"
          >③ AI 채팅창 열기 (Claude Desktop 또는 Cursor)</span
        >
        <span style="color: var(--text-muted)">→</span>
        <span class="result-step">④ Ctrl+V 붙여넣기</span>
        <span style="color: var(--text-muted)">→</span>
        <span class="result-step">⑤ Enter</span>
      </div>
      <div class="prompt-box">
        <div class="prompt-bar">
          <div class="p-dot" style="background: #ff5f57"></div>
          <div class="p-dot" style="background: #ffbd2e"></div>
          <div class="p-dot" style="background: #27c840"></div>
          <span>Claude Desktop 또는 Cursor — 붙여넣기 ready</span>
        </div>
        <div class="prompt-content" id="resultContent"></div>
      </div>
      <div class="after-box">
        <span style="font-size: 18px; flex-shrink: 0">✅</span>
        <div>
          <strong
            >이 프롬프트를 AI 채팅창(Claude Desktop 또는 Cursor)에 붙여넣고
            Enter를 누르면 코드를 만들어준다.</strong
          ><br />
          결과가 마음에 안 들면 "히어로 섹션 배경 이미지를 더 어둡게 해줘" 처럼
          이어서 수정 요청하면 된다.
        </div>
      </div>
      <button class="btn-reset" id="resetBtn" type="button">
        ↑ 내용 수정해서 다시 생성하기
      </button>
    </div>

    <div class="doc-footer">PNCoding · 바이브코딩 프롬프트 생성기 · v1.0</div>
  </div>
  <script>
    /* ─── 기본 섹션 목록 ─── */
    let sections = [
      "히어로 — 브랜드 이름 + 슬로건 + CTA 버튼 (풀스크린 배경 이미지)",
      "브랜드 소개 — 브랜드 스토리 2~3줄 + 통계 또는 포인트 3가지",
      "시그니처 메뉴 — 대표 메뉴/서비스 3가지 (이미지 + 이름 + 설명 + 가격)",
      "공간 / 제품 분위기 — 사진 그리드 (5장)",
      "위치 & 운영시간 — 지도 + 주소 + 영업시간 + 연락처",
      '마무리 CTA — "지금 방문하기" 또는 "연락하기" 버튼',
    ];

    /* ─── 섹션 리스트 렌더 ─── */
    function renderSections() {
      const list = document.getElementById("sectionsList");
      list.innerHTML = "";
      sections.forEach((text, i) => {
        const item = document.createElement("div");
        item.className = "section-item";
        item.innerHTML = `
        <div class="section-num">${i + 1}</div>
        <input type="text" value="${escHtml(text)}" placeholder="섹션 이름과 내용 설명" data-i="${i}" />
        <button class="btn-del" data-i="${i}" title="삭제">×</button>
      `;
        list.appendChild(item);
      });
      list.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("input", (e) => {
          sections[+e.target.dataset.i] = e.target.value;
        });
      });
      list.querySelectorAll(".btn-del").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          sections.splice(+e.currentTarget.dataset.i, 1);
          renderSections();
        });
      });
    }

    function escHtml(s) {
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    renderSections();

    document.getElementById("addSection").addEventListener("click", () => {
      sections.push("");
      renderSections();
      const inputs = document
        .getElementById("sectionsList")
        .querySelectorAll("input");
      inputs[inputs.length - 1].focus();
    });

    /* ─── 컨셉 카드 ─── */
    document.querySelectorAll(".concept-card").forEach((card) => {
      card.addEventListener("click", () => {
        document
          .querySelectorAll(".concept-card")
          .forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        setColors(card.dataset.bg, card.dataset.accent, card.dataset.text);
        document.getElementById("fontTitle").value = card.dataset.fontTitle;
        document.getElementById("fontBody").value = card.dataset.fontBody;
        document.getElementById("customConcept").value = "";
      });
    });

    function setColors(bg, accent, text) {
      setColor("colorBg", "colorBgPicker", bg);
      setColor("colorAccent", "colorAccentPicker", accent);
      setColor("colorText", "colorTextPicker", text);
    }
    function setColor(textId, pickerId, val) {
      document.getElementById(textId).value = val;
      document.getElementById(pickerId).value = val;
    }

    /* ─── 색상 피커 ↔ 텍스트 동기화 ─── */
    [
      ["colorBgPicker", "colorBg"],
      ["colorAccentPicker", "colorAccent"],
      ["colorTextPicker", "colorText"],
    ].forEach(([pid, tid]) => {
      const picker = document.getElementById(pid);
      const text = document.getElementById(tid);
      picker.addEventListener("input", () => {
        text.value = picker.value;
      });
      text.addEventListener("input", () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(text.value)) picker.value = text.value;
      });
    });

    /* ─── 위치 정보 토글 ─── */
    document.getElementById("useLocation").addEventListener("change", (e) => {
      document
        .getElementById("locationFields")
        .classList.toggle("open", e.target.checked);
    });

    /* ─── 값 읽기 ─── */
    function get(id, fallback = "") {
      const v = document.getElementById(id).value.trim();
      return v || fallback;
    }

    /* ─── 프롬프트 생성 ─── */
    document.getElementById("generateBtn").addEventListener("click", () => {
      const brandName = get("brandName", "NOIR CAFÉ");
      const purpose = get(
        "purpose",
        "카페를 모르는 사람들에게 브랜드를 소개하고 방문을 유도하는 홍보 사이트",
      );
      const target = get("target", "아직 우리 카페를 모르는 20~40대");
      const slogan = get(
        "slogan",
        "단 한 잔에도 타협하지 않는 프리미엄 스페셜티 카페",
      );
      const tagline = get(
        "tagline",
        "어둠 속에서 피어난 한 잔의 여유를 선사하는 스페셜티 카페",
      );
      const menu1 = get(
        "menu1",
        "블랙 에스프레소 — 에티오피아·콜롬비아 블렌딩, ₩6,500",
      );
      const menu2 = get(
        "menu2",
        "스모키 라떼 — 캐러멜 스모크 향 시그니처, ₩7,500",
      );
      const menu3 = get(
        "menu3",
        "다크 초콜릿 케이크 — 벨기에산 72% 다크, ₩9,000",
      );

      const customConcept = document
        .getElementById("customConcept")
        .value.trim();
      const selectedCard = document.querySelector(".concept-card.active");
      const concept =
        customConcept ||
        (selectedCard
          ? selectedCard.dataset.concept
          : "다크 프리미엄 — 어둡고 고급스럽고 조용한 느낌");

      const bgColor = get("colorBg", "#0F172A");
      const accentColor = get("colorAccent", "#D4AF74");
      const textColor = get("colorText", "#F5F0E8");
      const fontTitle = get("fontTitle", "Playfair Display");
      const fontBody = get("fontBody", "Noto Sans KR");

      const sectionLines = sections
        .filter((s) => s.trim())
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n");

      const useLocation = document.getElementById("useLocation").checked;
      let locationBlock = "";
      if (useLocation) {
        const address = get("address");
        const hours = get("hours");
        const contact = get("contact");
        const lines = [];
        if (address) lines.push(`- 주소: ${address}`);
        if (hours) lines.push(`- 운영시간: ${hours}`);
        if (contact) lines.push(`- 연락처: ${contact}`);
        if (lines.length)
          locationBlock = `\n\n【위치 & 운영 정보】\n${lines.join("\n")}`;
      }

      const prompt = `${brandName} 랜딩페이지를 만들어줘. 아래 기획 내용을 바탕으로 히어로 섹션부터 시작해줘.

【기본 정보】
- 사이트 목적: ${purpose}
- 타겟: ${target}
- 브랜드 이름: ${brandName}

【브랜드 정보】
- 슬로건: ${slogan}
- 한 줄 소개: ${tagline}
- 대표 메뉴/서비스:
  ① ${menu1}
  ② ${menu2}
  ③ ${menu3}${locationBlock}

【디자인 방향】
- 컨셉: ${concept}
- 색상: 배경 ${bgColor} / 강조 ${accentColor} / 텍스트 ${textColor}
- 폰트: 제목 ${fontTitle} / 본문 ${fontBody}
- 반응형: 모바일 768px 이하에서 1열, 텍스트 크기 줄이기, 버튼 크게

【섹션 구성】
${sectionLines}

【기술 조건】
- HTML + CSS + JS 단일 파일 (index.html)
- 이미지 경로: img/ 폴더 (hero.jpg, OurStory.jpg, 메뉴명.jpg, Our_Space_1~5.jpg)
- 이미지가 없는 자리는 어두운 회색(#2D2D2D) placeholder로 처리해줘
- 텍스트는 기획 내용 참고해서 자연스럽고 풍부하게 채워줘
- 스크롤 페이드인 애니메이션 포함 (IntersectionObserver)
- 고정 네비게이션 바 포함 (스크롤 시 배경 블러 처리)
- 반응형 포함해서 처음부터 완성본으로 만들어줘`;

      /* 결과 표시 */
      document.getElementById("resultContent").textContent = prompt;
      const wrap = document.getElementById("resultWrap");
      wrap.classList.add("visible");
      setTimeout(
        () => wrap.scrollIntoView({ behavior: "smooth", block: "start" }),
        80,
      );
    });

    /* ─── 복사 ─── */
    document.getElementById("copyBtn").addEventListener("click", () => {
      const text = document.getElementById("resultContent").textContent;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById("copyBtn");
        const prev = btn.textContent;
        btn.classList.add("done");
        btn.textContent = "✅ 복사됨!";
        setTimeout(() => {
          btn.classList.remove("done");
          btn.textContent = prev;
        }, 2000);
      });
    });

    /* ─── 다시 수정 ─── */
    document.getElementById("resetBtn").addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  </script>
  <script
    type="module"
    src="https://static.cloudflareinsights.com/beacon.min.js/v3d52b47920f24c319d37e2661827c42b1787588026925"
    integrity="sha512-d9sL6GJLXn6fInD1+TVXhTcQOsmxeHfmHAvwGDIxp5TO+uo1fiWW7mHomMj4MLRlCsJDTqXzWLHJFFlPCEIj/A=="
    data-cf-beacon='{"version":"2024.11.0","token":"d624626dbb6e4ef0a6f39c4e7acec2dd","r":1}'
    crossorigin="anonymous"
  ></script>
</body>
