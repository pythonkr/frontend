import { Box, Chip, CircularProgress, Divider, Stack, styled, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { isNonNullish } from "remeda";

import { PageLayout } from "@apps/pyconkr-2026/components/layout/PageLayout";
import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";
import { CenteredPage, ErrorFallback, MDXRenderer } from "@frontend/common/components";
import { useCommonContext } from "@frontend/common/hooks/useCommonContext";
import { SponsorTierSchema } from "@frontend/common/schemas/backendAPI";

const PageNotFound: FC = () => <>404 Not Found</>;
const CenteredLoadingPage: FC = () => (
  <CenteredPage>
    <CircularProgress />
  </CenteredPage>
);

const LogoImage = styled("img")(({ theme }) => ({
  maxWidth: "20rem",
  height: "auto",

  padding: theme.spacing(8, 0),
  marginBottom: theme.spacing(4),

  [theme.breakpoints.down("lg")]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const DescriptionBox = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(2, 4),

  [theme.breakpoints.down("lg")]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },

  "& .markdown-body": {
    width: "100%",
    p: { margin: theme.spacing(2, 0) },
    a: { color: theme.palette.primary.main },
  },
}));

export const SponsorDetailPage: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CenteredLoadingPage /> }, () => {
    const { id } = useParams();
    const { language, sponsorTiers, setAppContext } = useAppContext();
    const { baseUrl, mdxComponents } = useCommonContext();
    const sponsors = sponsorTiers?.reduce((acc, tier) => [...acc, ...tier.sponsors], [] as SponsorTierSchema["sponsors"]);
    const sponsor = sponsors?.find((s) => s.id === id);

    const title = language === "ko" ? "후원사" : "Sponsor";
    const descriptionFallback = language === "ko" ? "해당 후원사의 설명은 준비 중이에요!" : "This sponsor's description is under preparation!";

    useEffect(() => {
      setAppContext((prev) => ({
        ...prev,
        title: `${title} - ${sponsor?.name || "Detail"}`,
        shouldShowTitleBanner: true,
        shouldShowSponsorBanner: !isNonNullish(sponsor),
      }));
    }, [sponsor, title, setAppContext]);

    if (!id || !sponsorTiers) return <CenteredLoadingPage />;
    if (!sponsor) return <PageNotFound />;

    return (
      <PageLayout sx={{ maxWidth: "960px" }}>
        <LogoImage src={sponsor.logo} alt={sponsor.name} loading="lazy" />
        <Divider flexItem />
        <Typography variant="h4" fontWeight="700" textAlign="start" sx={{ width: "100%", p: 2 }}>
          {sponsor.name.replace(/\\n/g, "\n")}
          {sponsor.tags.length ? (
            <Stack direction="row" spacing={1} sx={{ width: "100%", mt: 1 }} aria-label="후원사 태그 목록">
              {sponsor.tags.map((tag) => (
                <Chip key={tag} size="small" variant="outlined" color="primary" label={tag} />
              ))}
            </Stack>
          ) : null}
        </Typography>
        <Divider flexItem />
        <DescriptionBox>
          <MDXRenderer text={sponsor.description || descriptionFallback} format="md" baseUrl={baseUrl} mdxComponents={mdxComponents} />
        </DescriptionBox>
      </PageLayout>
    );
  })
);
