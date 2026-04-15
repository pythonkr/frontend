import * as React from "react";

export const Cover2026: React.FC = () => (
  <iframe
    src="/cover_2026.html"
    style={{
      display: "block",
      width: "100vw",
      height: "100%",
      border: "none",
      // 부모 section 컨테이너(maxWidth: 1200px, padding)를 벗어나 뷰포트 전체 너비를 채움
      marginLeft: "calc(-50vw + 50%)",
      marginRight: "calc(-50vw + 50%)",
    }}
    title="PyCon KR 2026 Cover"
  />
);
