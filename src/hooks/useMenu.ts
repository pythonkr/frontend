import { useState, useRef, useEffect } from "react";

interface MenuItem {
  text: string;
  href?: string;
  subMenu?: {
    text: string;
    href: string;
  }[];
}

export const useMenu = () => {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [focusedMenu, setFocusedMenu] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        focusedMenu &&
        !menuRefs.current[focusedMenu]?.contains(event.target as Node)
      ) {
        setFocusedMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [focusedMenu]);

  const handleKeyDown = (e: React.KeyboardEvent, menu: MenuItem) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFocusedMenu(menu.text);
    }
  };

  const handleBlur = (menu: MenuItem) => {
    setTimeout(() => {
      if (!menuRefs.current[menu.text]?.contains(document.activeElement)) {
        setFocusedMenu(null);
      }
    }, 0);
  };

  return {
    hoveredMenu,
    focusedMenu,
    menuRefs,
    setHoveredMenu,
    setFocusedMenu,
    handleKeyDown,
    handleBlur,
  };
};
