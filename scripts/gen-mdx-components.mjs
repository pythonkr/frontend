/**
 * 공통 — <appDir>/public/.well-known/mdx-components.json 생성기 (root 에서 실행).
 * MUI: 이름+docUrl (props 제외, muiVersion 노출). 커스텀: react-docgen-typescript 로 props 추출.
 * 계약: backend mcp_app/MDX_COMPONENTS_SCHEMA.md.
 * 사용: node scripts/gen-mdx-components.mjs <appDir> [domain]
 *   예: node scripts/gen-mdx-components.mjs apps/pyconkr-2026 2026.pycon.kr
 * TODO: CUSTOM_SOURCES·OVERRIDES 는 앱이 늘면 보강.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, resolve } from "node:path";
import docgen from "react-docgen-typescript";

const require = createRequire(import.meta.url);
const repoRoot = process.cwd();

const [appDirArg, domain] = process.argv.slice(2);
if (!appDirArg) {
  console.error("usage: node scripts/gen-mdx-components.mjs <appDir> [domain]");
  process.exit(1);
}
const appDir = resolve(repoRoot, appDirArg);
const app = basename(appDir);
const MUI_DOCS_BASE = "https://mui.com/material-ui/api/";

// 커스텀 컴포넌트 props 출처 (앱 공통)
const CUSTOM_SOURCES = [
  resolve(repoRoot, "packages/common/src/components/index.ts"),
  resolve(repoRoot, "packages/common/src/components/mdx_components/index.ts"),
  resolve(repoRoot, "packages/shop/src/components/common/index.ts"),
  resolve(repoRoot, "packages/shop/src/components/features/index.ts"),
];

// 레지스트리 식별자(alias/래퍼) → props 출처. 없으면 valueId 그대로 사용.
// 문자열이면 원본 export 이름. 객체면 { export, omit }: omit 은 래퍼가 내부에서 채워(MDX 작성자가
// 못 바꿈) 노출하면 안 되는 prop 목록, "*" 면 전부 제외(래퍼가 prop 을 받지 않는 경우).
const OVERRIDES = {
  MDXMap: "Map",
  SecondaryStyledDetails: "HighlightedStyledDetails",
  PyConKR2025SessionList: { export: "SessionList", omit: ["fallbackImage"] },
  PyConKR2025SessionTimeTable: "SessionTimeTable",
  PyConKR2025MobileAccordion: { export: "MobileAccordion", omit: "*" },
  PyConKR2025MobileCover: { export: "MobileCover", omit: "*" },
};

const groupOf = (name) => (name.startsWith("Mui__") ? "mui" : name.startsWith("Common__") ? "common" : name.startsWith("Shop__") ? "shop" : "other");

// Mui__material__AccordionDetails → accordion-details
const muiDocUrl = (name) =>
  `${MUI_DOCS_BASE}${name
    .replace(/^Mui__material__/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()}/`;

// 레지스트리 `Key: Identifier,` 라인에서 태그명과 JS 식별자 추출
const registry = readFileSync(resolve(appDir, "src/consts/mdx_components.ts"), "utf8");
const entries = [...registry.matchAll(/^\s*([A-Z][A-Za-z0-9_]*__[A-Za-z0-9_]+)\s*:\s*([A-Za-z0-9_.]+)\s*,/gm)].map((m) => ({
  name: m[1],
  valueId: m[2].split(".").pop(),
}));

const isInNodeModules = (fileName) => /node_modules/.test(fileName);

const parser = docgen.withDefaultConfig({
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  savePropValueAsString: true,
  // MUI/React/HTML 등 외부에서 상속된 props 제외. parent 가 비어도(누수 케이스) declarations 로 걸러낸다.
  propFilter: (prop) => {
    const decls = prop.declarations ?? [];
    if (decls.length > 0 && decls.every((d) => isInNodeModules(d.fileName))) return false;
    if (prop.parent && isInNodeModules(prop.parent.fileName)) return false;
    return true;
  },
});

const docByExport = new Map();
for (const file of CUSTOM_SOURCES) {
  try {
    for (const doc of parser.parse(file)) docByExport.set(doc.displayName, doc);
  } catch (e) {
    console.warn(`[gen-mdx-components] docgen 실패: ${file} — ${e.message}`);
  }
}

const toProps = (props, omit) =>
  Object.entries(props)
    .filter(([propName, p]) => {
      // 래퍼가 내부에서 채우는 prop 제외 ("*" = 전부)
      if (omit === "*" || (Array.isArray(omit) && omit.includes(propName))) return false;
      // MDX/CMS 본문에서는 함수를 넘길 수 없으므로 함수형 prop 제외 (예: "(s: SessionSchema) => string")
      if (/=>/.test(p.type?.name ?? "")) return false;
      return true;
    })
    .map(([name, p]) => ({
      name,
      type: p.type?.name ?? "unknown",
      required: !!p.required,
      ...(p.defaultValue ? { default: p.defaultValue.value } : {}),
      ...(p.description ? { description: p.description } : {}),
    }));

const components = entries.map(({ name, valueId }) => {
  const group = groupOf(name);
  if (group === "mui") return { name, group, docUrl: muiDocUrl(name) };
  const override = OVERRIDES[valueId];
  const exportName = (typeof override === "object" ? override.export : override) ?? valueId;
  const omit = typeof override === "object" ? override.omit : undefined;
  const doc = docByExport.get(exportName);
  if (!doc) {
    console.warn(`[gen-mdx-components] props 미발견: ${name} (export '${exportName}')`);
    return { name, group };
  }
  return {
    name,
    group,
    ...(doc.description ? { description: doc.description } : {}),
    ...(doc.tags?.example ? { example: doc.tags.example } : {}),
    props: toProps(doc.props, omit),
  };
});

const muiVersion = JSON.parse(readFileSync(require.resolve("@mui/material/package.json"), "utf8")).version;

const manifest = {
  schemaVersion: 1,
  app,
  ...(domain ? { domain } : {}),
  generatedAt: new Date().toISOString(),
  muiVersion,
  muiDocsBaseUrl: MUI_DOCS_BASE,
  components,
};

const outPath = resolve(appDir, "public/.well-known/mdx-components.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`[gen-mdx-components] ${app}: ${components.length} components → ${outPath}`);
