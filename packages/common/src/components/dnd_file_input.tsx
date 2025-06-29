import { Cancel, PermMedia } from "@mui/icons-material";
import { Box, Button, Input, Stack, styled } from "@mui/material";
import { enqueueSnackbar, OptionsObject } from "notistack";
import * as React from "react";

import { useCommonContext } from "../hooks/useCommonContext";

const ignoreEvent = (e: React.BaseSyntheticEvent | Event) => {
  e.preventDefault();
  e.stopPropagation();
};

const FileDragBox = styled(Box)<{ isMouseHover?: boolean }>(({ theme, isMouseHover }) => ({
  width: "100%",
  minWidth: "20rem",
  flexGrow: 1,

  padding: theme.spacing(2),

  border: "2px dashed #ccc",
  borderRadius: "0.5rem",
  backgroundColor: isMouseHover ? "#ddd" : "#fff",

  transition: "background-color 0.3s ease-in-out",
}));

type DndFileInputProps = {
  onFileChange?: (file: File | null) => void;
};

type DndFileInputState = {
  isMouseHoverOnDragBox?: boolean;
  openSetValueDialog?: boolean;
};

export const DndFileInput: React.FC<DndFileInputProps> = ({ onFileChange }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const fileDragBoxRef = React.useRef<HTMLDivElement>(null);
  const { language } = useCommonContext();
  const [state, setState] = React.useState<DndFileInputState>({});
  const [, forceRender] = React.useReducer((x) => x + 1, 0);

  const selectFileStr = language === "ko" ? "파일 선택" : "Select File";
  const resetSelectStr = language === "ko" ? "파일 선택 초기화" : "Reset File Selection";
  const fileNotSelectedStr = language === "ko" ? "파일을 선택하지 않았습니다." : "No file selected.";
  const fileNotInClipboardStr = language === "ko" ? "클립보드에 파일이 없습니다." : "No file in clipboard.";
  const imageFileNotInClipboardStr = language === "ko" ? "클립보드에 이미지 파일이 없습니다." : "No image file in clipboard.";
  const fileIsEmptyStr = language === "ko" ? "파일을 찾을 수 없거나, 파일 크기가 0입니다." : "File not found or file is empty.";
  const fileIsNotImageStr = language === "ko" ? "이미지 파일만 업로드가 가능합니다." : "Only image file can be uploaded.";
  const fileReadErrorStr = language === "ko" ? "파일을 읽는 중 오류가 발생했습니다." : "An error occurred while reading the file.";

  const selectedFile = (fileInputRef.current?.files?.length && fileInputRef.current.files[0]) || null;
  const selectedFilePreview = selectedFile && (
    <Stack justifyContent="center" alignItems="center">
      <img src={URL.createObjectURL(selectedFile)} alt="Preview" style={{ maxWidth: "100%" }} />
    </Stack>
  );
  const content =
    language === "ko" ? (
      <>
        아래 <kbd children={selectFileStr} /> 버튼을 눌러 사진을 선택하거나,
        <br />
        이 상자에 직접 파일을 드래그 앤 드롭하여 업로드하거나,
        <br />
        또는 <kbd>Ctrl</kbd>+<kbd>V</kbd>로 사진을 붙여넣어 주세요!
        <br />
        <ul>
          <li>이미지 파일만 업로드가 가능합니다.</li>
          <li>업로드 후에는 파일을 수정할 수 없습니다.</li>
          <li>파일은 공개적으로 접근 가능한 URL로 제공됩니다.</li>
        </ul>
        {selectedFilePreview}
        <br />
        현재 선택된 파일 : {(selectedFile && selectedFile.name) || "없음"}
      </>
    ) : (
      <>
        Click the <kbd children={selectFileStr} /> button below to select a photo, or drag and drop a file directly into this box to upload it, or
        paste a photo using <kbd>Ctrl</kbd>+<kbd>V</kbd>!
        <br />
        <ul>
          <li>Only image files can be uploaded.</li>
          <li>You cannot modify the file after uploading.</li>
          <li>The file will be provided as a publicly accessible URL.</li>
        </ul>
        {selectedFilePreview}
        <br />
        Currently selected file: {(selectedFile && selectedFile.name) || "None"}
      </>
    );

  const addSnackbar = (c: string | React.ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    ignoreEvent(e);
    setState((ps) => ({ ...ps, isMouseHoverOnDragBox: true }));
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // onDragLeave 이벤트는 자식 요소에 마우스가 들어갈 때도 발생합니다.
    // 따라서, 드래그 박스에 마우스가 있는지 확인하기 위해 마우스 위치를 확인하여 실제 onDragLeave 이벤트가 트리거되어야 하는지 확인합니다.
    // (e.relatedTarget는 Safari에서 지원되지 않아 사용할 수 없습니다.)
    ignoreEvent(e);
    if (!fileDragBoxRef.current) return;

    const x = e.clientX;
    const y = e.clientY;
    const currentHoveredElement = document.elementFromPoint(x, y);

    if (!fileDragBoxRef.current.contains(currentHoveredElement) || (x === 0 && y === 0)) setState((ps) => ({ ...ps, isMouseHoverOnDragBox: false }));
  };

  const resetFileSelect = React.useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // 파일 선택 초기화
      fileInputRef.current.files = null; // 파일 목록 초기화
      forceRender();
    }
  }, [forceRender]);

  const handleFile = React.useCallback(
    (file: File) => {
      if (!file || file.size === 0) {
        addSnackbar(fileIsEmptyStr, "error");
        return;
      } else if (!file.type.startsWith("image/")) {
        addSnackbar(fileIsNotImageStr, "error");
        return;
      }

      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (fileInputRef.current && event.target?.result) {
          addSnackbar(language === "ko" ? `파일 ${file.name} 선택 완료` : `File ${file.name} selected successfully`, "info");

          const list = new DataTransfer();
          list.items.add(file);
          fileInputRef.current.files = list.files;
          onFileChange?.(file);
          forceRender();
        } else {
          addSnackbar(fileReadErrorStr, "error");
          console.error("파일 읽기 오류:", event);
        }
      };
      fileReader.onerror = (error) => {
        addSnackbar(`${fileReadErrorStr}: ${error}`, "error");
        console.error("파일 읽기 중 오류 발생:", error);
      };
      fileReader.readAsDataURL(file);
    },
    [forceRender, onFileChange, fileIsEmptyStr, fileIsNotImageStr, fileReadErrorStr, language]
  );

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    ignoreEvent(e);
    setState((prev) => ({ ...prev, isMouseHoverOnDragBox: false }));

    const files = e.target.files;
    if (!files || files.length === 0) {
      addSnackbar(fileNotSelectedStr, "error");
      resetFileSelect();
      return;
    }

    const file = files[0];
    if (file.size === 0) {
      addSnackbar(fileIsEmptyStr, "error");
      resetFileSelect();
      return;
    } else if (!file.type.startsWith("image/")) {
      addSnackbar(fileIsNotImageStr, "error");
      resetFileSelect();
      return;
    }

    handleFile(file);
  };

  const onFileSelectButtonClick: React.MouseEventHandler = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      addSnackbar("파일 선택 버튼을 찾을 수 없습니다.", "error");
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    ignoreEvent(event);
    setState((prev) => ({ ...prev, isMouseOnDragBox: false }));

    const items = event.dataTransfer.files;
    if (!items || items.length === 0) {
      addSnackbar(fileNotSelectedStr, "error");
      return;
    }

    handleFile(items[0]);
  };

  const onClipboardPaste = React.useCallback(
    (event: DocumentEventMap["paste"]) => {
      ignoreEvent(event);
      setState((prev) => ({ ...prev, isMouseOnDragBox: false }));

      const items = event.clipboardData?.items;
      if (!items || items.length === 0) {
        addSnackbar(fileNotInClipboardStr, "error");
        return;
      }

      if (items instanceof DataTransferItemList) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === "file") {
            const file = items[i].getAsFile();
            if (!file || !file.size || !file.type.startsWith("image/")) continue;

            handleFile(file);
            return;
          }
        }
        addSnackbar(imageFileNotInClipboardStr, "error");
      }
    },
    [handleFile, fileNotInClipboardStr, imageFileNotInClipboardStr]
  );

  React.useEffect(() => {
    document.addEventListener("paste", onClipboardPaste);
    return () => document.removeEventListener("paste", onClipboardPaste);
  }, [onClipboardPaste, state.isMouseHoverOnDragBox]);

  return (
    <Stack spacing={2}>
      <Input inputRef={fileInputRef} onChange={onFileSelect} type="file" name="file" sx={{ display: "none" }} />
      <FileDragBox
        ref={fileDragBoxRef}
        onDragOver={ignoreEvent}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        isMouseHover={state.isMouseHoverOnDragBox}
        children={content}
      />
      <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
        <Button
          fullWidth
          disabled={!selectedFile}
          variant="outlined"
          color="error"
          startIcon={<Cancel />}
          onClick={resetFileSelect}
          children={resetSelectStr}
        />
        <Button
          fullWidth
          disabled={!!selectedFile}
          variant="contained"
          color="info"
          startIcon={<PermMedia />}
          onClick={onFileSelectButtonClick}
          children={selectFileStr}
        />
      </Stack>
    </Stack>
  );
};
