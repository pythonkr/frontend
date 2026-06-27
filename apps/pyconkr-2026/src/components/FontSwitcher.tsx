import { FC, useState } from "react";

/**
 * 가독성 비교용 임시 폰트 전환 도구.
 * 페이지 최상단에 고정된 select 로 폰트를 바꾸면 --app-font(전역 CSS 변수)를 덮어써
 * 본문(MDX/네이티브 HTML)과 MUI Typography 가 한 번에 전환된다.
 * (각 폰트 정의는 main.css 의 @font-face, 기본값은 globalStyles 의 :root 참고)
 */
const FALLBACK = `"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`;

const FONT_OPTIONS: { label: string; stack: string }[] = [
  // 기본값(:root --app-font)과 동일한 exqt 스택
  {
    label: "exqt (현재 기본)",
    stack: `"exqtEnglish", "exqtNumber", "exqt", ${FALLBACK}`,
  },
  {
    label: "exqt 가로 1.2배",
    stack: `"exqtWide12", ${FALLBACK}`,
  },
  {
    label: "exqt 가로 1.35배",
    stack: `"exqtWide135", ${FALLBACK}`,
  },
  {
    label: "exqt 가로 1.5배",
    stack: `"exqtWide15", ${FALLBACK}`,
  },
  {
    label: "둥근모꼴+Fixedsys",
    stack: `"RoundedFixedsys", ${FALLBACK}`,
  },
  {
    label: "PF스타더스트",
    stack: `"PFStardust", ${FALLBACK}`,
  },
  {
    label: "갈무리11 (닌텐도DS풍)",
    stack: `"Galmuri11", ${FALLBACK}`,
  },
  {
    label: "갈무리14 (큰 크기)",
    stack: `"Galmuri14", ${FALLBACK}`,
  },
  {
    label: "갈무리9 (작은 크기)",
    stack: `"Galmuri9", ${FALLBACK}`,
  },
  {
    label: "Neo둥근모",
    stack: `"NeoDunggeunmo", ${FALLBACK}`,
  },
  {
    label: "물마루",
    stack: `"Mulmaru", ${FALLBACK}`,
  },
  {
    label: "마루민야 (둥근고딕)",
    stack: `"MaruMinya", ${FALLBACK}`,
  },
  {
    label: "갈무리Mono11 (고정폭)",
    stack: `"GalmuriMono11", ${FALLBACK}`,
  },
  {
    label: "갈무리11 Condensed (좁게)",
    stack: `"Galmuri11Condensed", ${FALLBACK}`,
  },
  {
    label: "DOS고딕",
    stack: `"DOSGothic", ${FALLBACK}`,
  },
  {
    label: "DOS샘물",
    stack: `"DOSSaemmul", ${FALLBACK}`,
  },
  {
    label: "DOS명조 (픽셀 명조)",
    stack: `"DOSMyungjo", ${FALLBACK}`,
  },
  {
    label: "Pretendard (비교용)",
    stack: FALLBACK,
  },
];

export const FontSwitcher: FC = () => {
  const [index, setIndex] = useState(0);

  return (
    <select
      aria-label="폰트 미리보기 전환"
      value={index}
      onChange={(e) => {
        const next = Number(e.target.value);
        setIndex(next);
        document.documentElement.style.setProperty("--app-font", FONT_OPTIONS[next].stack);
      }}
      style={{
        position: "fixed",
        top: 6,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 3000,
        // 컨트롤 자체는 어떤 폰트를 골라도 항상 읽히도록 Pretendard 고정
        fontFamily: FALLBACK,
        fontSize: 13,
        lineHeight: 1.4,
        letterSpacing: "normal",
        color: "#ededde",
        background: "#1e1230",
        border: "1px solid #ed5ebd",
        borderRadius: 6,
        padding: "4px 10px",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
      }}
    >
      {FONT_OPTIONS.map((opt, i) => (
        <option key={opt.label} value={i} style={{ color: "#000" }}>
          {`폰트: ${opt.label}`}
        </option>
      ))}
    </select>
  );
};
