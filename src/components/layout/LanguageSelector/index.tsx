import styled from "@emotion/styled";
import { useState } from "react";

export default function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState<"KO" | "EN">("KO");

  return (
    <LanguageContainer>
      <img
        src="src/assets/langIcon.png"
        width={25}
        height={25}
        alt="langIcon"
      />
      <LanguageItem
        isSelected={selectedLang === "KO"}
        onClick={() => setSelectedLang("KO")}
      >
        KO
      </LanguageItem>
      <LanguageItem
        isSelected={selectedLang === "EN"}
        onClick={() => setSelectedLang("EN")}
      >
        EN
      </LanguageItem>
    </LanguageContainer>
  );
}

const LanguageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const LanguageItem = styled.div<{ isSelected: boolean }>`
  cursor: pointer;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.palette.primary.dark : theme.palette.primary.nonFocus};
  transition: color 0.2s ease;
`;
