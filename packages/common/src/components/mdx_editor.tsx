import { AddPhotoAlternate, Apps } from "@mui/icons-material";
import { Button, CircularProgress, MenuItem, Select, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { Suspense } from "@suspensive/react";
import MDEditor, { GroupOptions, ICommand, commands } from "@uiw/react-md-editor";
import type { MDXComponents } from "mdx/types";
import { CSSProperties, FC, SyntheticEvent, useRef, useState } from "react";
import { isString } from "remeda";
// import * as CryptoJS from "crypto-js";

import { BackendAdminAPI, Common } from "@frontend/common/hooks";
type CustomComponentInfoType = {
  k: string; // key
  n: string; // name
  v?: MDXComponents[string]; // value
};

type MDXEditorProps = {
  disabled?: boolean;
  defaultValue?: string;
  onChange?: (value?: string) => void;
  extraCommands?: ICommand[];
};

const TextEditorStyle: CSSProperties = {
  flexGrow: 1,
  width: "100%",
  maxWidth: "100%",

  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
  overflowWrap: "break-word",

  fieldSizing: "content",
} as CSSProperties;

// const calculateMD5FromFileBase64 = (fileBase64: string): string => CryptoJS.MD5(CryptoJS.enc.Base64.parse(fileBase64)).toString();

// const onFileInEvent: DragEventHandler<HTMLDivElement> = (event) => {
//   event.preventDefault();
//   event.stopPropagation();

//   if (!event.dataTransfer) { // Might be a drag event
//     alert('이 브라우저는 해당 동작을 지원하지 않습니다.');
//     return;
//   }

//   const images = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith("image/"))
//   if (images.length === 0) {
//     alert('이미지 파일만 첨부할 수 있어요.');
//     return;
//   }

//   images.forEach(
//     (item) => {
//       let reader = new FileReader();
//       reader.onload = (e) => {
//         if (!e.target || typeof e.target.result !== "string") return;
//         console.log(`이미지 MD5 해시: ${calculateMD5FromFileBase64(e.target.result.split(',')[1])}`);
//       }
//       reader.onerror = (e) => {
//         console.error('Error reading file:', e);
//         alert('파일을 읽는 중 오류가 발생했습니다.');
//       };
//       reader.readAsDataURL(item);
//     }
//   );
// }

const insertText = (newText: string, getState: () => false | commands.TextState, textApi: commands.TextAreaTextApi) => {
  const state = getState();
  if (!state) return undefined;

  if (state.selectedText) {
    newText += `\n${state.selectedText}`;
    if (state.selection.start - 1 !== -1 && state.text[state.selection.start - 1] !== "\n") newText = `\n${newText}`;
  } else {
    if (state.selection.start - 1 !== -1 && state.text[state.selection.start - 1] !== "\n") newText = `\n${newText}`;
    if (state.selection.end !== state.text.length && state.text[state.selection.end] !== "\n") newText += "\n";
  }

  textApi.replaceSelection(newText);
};

type ImageSelectorWidgetStateType = {
  tab: number;
  selectedImageUrl?: string;
};

type PublicFileType = {
  id: string;
  file: string;
  mimetype: string;
};

const ImageSelector: GroupOptions["children"] = Suspense.with({ fallback: <CircularProgress /> }, ({ close, getState, textApi }) => {
  const urlInputRef = useRef<HTMLInputElement>(null);
  const backendAdminAPIClient = BackendAdminAPI.useBackendAdminClient();
  // publicfile 뷰셋은 DRF 페이지네이션을 사용하므로 응답이 {results, ...} 객체임. 파일 선택용이라 전체를 한 번에 받도록 page_size를 키운다.
  const { data } = BackendAdminAPI.useListPaginatedQuery<PublicFileType>(backendAdminAPIClient, "file", "publicfile", { page_size: "200" });
  const [widgetState, setWidgetState] = useState<ImageSelectorWidgetStateType>({ tab: 0 });
  const setTab = (_: SyntheticEvent, tab: number) => setWidgetState((ps) => ({ ...ps, tab }));
  const setImageUrl = (selectedImageUrl?: string) => setWidgetState((ps) => ({ ...ps, selectedImageUrl }));

  const insertImage = (inputStr: string) => {
    console.log(textApi, getState);
    if (!textApi || !getState) return undefined;
    insertText(inputStr, getState, textApi);
    setImageUrl();
    close();
  };
  const getSelectedUrl = (): string | undefined => {
    if (widgetState.tab === 0 && isString(widgetState.selectedImageUrl) && widgetState.selectedImageUrl.trim() !== "") {
      return widgetState.selectedImageUrl.trim();
    } else if (widgetState.tab === 1 && urlInputRef.current && urlInputRef.current.checkValidity() && urlInputRef.current.value.trim() !== "") {
      return urlInputRef.current.value.trim();
    }

    if (widgetState.tab === 0) alert("사진을 선택해주세요.");
    if (widgetState.tab === 1) urlInputRef.current?.reportValidity();

    return undefined;
  };
  const onHTMLInsertBtnClick = () => {
    const url = getSelectedUrl();
    if (isString(url)) insertImage(`<img src="${url}" alt="이미지 설명" />`);
  };
  const onMarkdownInsertBtnClick = () => {
    const url = getSelectedUrl();
    if (isString(url)) insertImage(`![이미지 설명](${url})`);
  };

  return (
    <Stack spacing={1} sx={{ p: 1, flexGrow: 1, minWidth: 200, maxHeight: "50rem" }}>
      <Tabs value={widgetState.tab} onChange={setTab} scrollButtons={false}>
        <Tab wrapped label="업로드 된 사진 중 선택" />
        <Tab wrapped label="사진 URL 직접 입력" />
      </Tabs>
      {widgetState.tab === 0 && (
        <>
          <Typography variant="subtitle1" color="text.secondary">
            업로드 된 사진 중 선택
          </Typography>
          <Grid>
            {data.results
              .filter((item) => item.mimetype?.startsWith("image/"))
              .map((item) => ({ ...item, file: item.file.split("?")[0] })) // Remove query parameters if any
              .map((item) => {
                const selected = widgetState.selectedImageUrl === item.file;
                return (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setImageUrl(item.file)}
                    sx={{
                      border: `1px solid ${selected ? "primary.main" : "grey.400"}`,
                      backgroundColor: selected ? "primary.main" : "transparent",
                    }}
                  >
                    <img src={item.file} alt="이미지 미리보기" style={{ maxWidth: 100, maxHeight: 100 }} />
                  </Button>
                );
              })}
          </Grid>
        </>
      )}
      {widgetState.tab === 1 && (
        <>
          <Typography variant="subtitle1" color="text.secondary">
            사진 URL 직접 입력
          </Typography>
          <TextField label="사진 URL" size="small" type="url" fullWidth required inputRef={urlInputRef} />
        </>
      )}
      <Button size="small" variant="contained" onClick={onHTMLInsertBtnClick}>
        HTML로 삽입
      </Button>
      <Button size="small" variant="contained" onClick={onMarkdownInsertBtnClick}>
        마크다운으로 삽입
      </Button>
      <Button size="small" variant="outlined" sx={{ flexGrow: 1 }} onClick={close}>
        닫기
      </Button>
    </Stack>
  );
});

const getCustomComponentSelector: (registeredComponentList: CustomComponentInfoType[]) => GroupOptions["children"] =
  (registeredComponentList) =>
  ({ close, getState, textApi }) => {
    const componentSelectorRef = useRef<HTMLSelectElement>(null);

    const onInsertBtnClick = () => {
      if (!textApi || !getState || !registeredComponentList?.length || !componentSelectorRef.current) return undefined;

      const selectedComponentData = registeredComponentList.find(({ k }) => k === componentSelectorRef?.current?.value);
      if (!selectedComponentData) return undefined;

      insertText(`<${selectedComponentData.k} />`, getState, textApi);
      close();
    };

    return (
      <Stack spacing={1} sx={{ p: 1, flexGrow: 1, minWidth: 200 }}>
        <Typography variant="subtitle1" color="text.secondary">
          컴포넌트 삽입
        </Typography>
        <Select inputRef={componentSelectorRef} defaultValue="" size="small" fullWidth>
          {registeredComponentList.map(({ k, n }) => (
            <MenuItem key={k} value={k}>
              {n}
            </MenuItem>
          ))}
        </Select>
        <Button size="small" variant="contained" onClick={onInsertBtnClick}>
          삽입
        </Button>
        <Button size="small" variant="outlined" sx={{ flexGrow: 1 }} onClick={close}>
          닫기
        </Button>
      </Stack>
    );
  };

export const MDXEditor: FC<MDXEditorProps> = ({ disabled, defaultValue, onChange, extraCommands }) => {
  const { mdxComponents } = Common.useCommonContext();

  const registeredComponentList: CustomComponentInfoType[] = [
    { k: "", n: "", v: undefined },
    ...Object.entries(mdxComponents ?? {}).map(([k, v]) => {
      const splicedKey = k.replace(/__/g, ".").split(".");
      const n = [...splicedKey.slice(0, -1).map((word) => word.toLowerCase()), splicedKey[splicedKey.length - 1]].join(".");
      return { k, n, v };
    }),
  ];

  return (
    <Stack direction="column" spacing={2} sx={{ width: "100%", height: "100%", maxWidth: "100%" }}>
      <MDEditor
        data-color-mode="light"
        textareaProps={{ disabled }}
        preview="edit"
        highlightEnable={true}
        height="none"
        minHeight={0}
        value={defaultValue}
        onChange={onChange}
        commands={[
          commands.group([commands.title1, commands.title2, commands.title3, commands.title4, commands.title5, commands.title6], {
            name: "title",
            groupName: "title",
            buttonProps: { "aria-label": "Insert title" },
          }),
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.code,
          commands.link,
          commands.divider,
          commands.quote,
          commands.codeBlock,
          commands.table,
          commands.hr,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
          commands.checkedListCommand,
          commands.divider,
          commands.group([], {
            name: "custom components",
            groupName: "custom components",
            icon: <Apps style={{ fontSize: 12 }} />,
            children: getCustomComponentSelector(registeredComponentList),
            buttonProps: { "aria-label": "Insert custom component" },
          }),
          commands.group([], {
            name: "image selector",
            groupName: "image selector",
            icon: <AddPhotoAlternate style={{ fontSize: 12 }} />,
            children: (props) => <ImageSelector {...props} />,
            buttonProps: { "aria-label": "Insert image" },
          }),
          commands.divider,
          commands.help,
        ]}
        extraCommands={extraCommands}
        style={TextEditorStyle}
      />
    </Stack>
  );
};
