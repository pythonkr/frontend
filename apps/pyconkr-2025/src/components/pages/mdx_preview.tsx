import { MDXPreview } from "@frontend/common/components";
import { FC } from "react";

import { useAppContext } from "@apps/pyconkr-2025/contexts/app_context";

export const MDXPreviewPage: FC = () => {
  const { setAppContext } = useAppContext();
  return (
    <MDXPreview
      onMeta={(meta) =>
        setAppContext((prev) => ({
          ...prev,
          title: meta.title ?? prev.title,
          shouldShowTitleBanner: meta.showTitleBanner,
          shouldShowSponsorBanner: meta.showSponsorBanner,
        }))
      }
    />
  );
};
