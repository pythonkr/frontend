import { Fieldset, MDXRenderer, MarkdownEditor } from "@frontend/common/components";
import {
  useBackendAdminClient,
  useCreateMutation,
  useFieldSelectablesQuery,
  useListPaginatedQuery,
  useRemovePreparedMutation,
  useSchemaQuery,
  useUpdatePreparedMutation,
} from "@frontend/common/hooks/useAdminAPI";
import { useCommonContext } from "@frontend/common/hooks/useCommonContext";
import { Autocomplete, Box, Button, Card, CardContent, CircularProgress, Stack, styled, Tab, Tabs, TextField, Typography } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { DateTime } from "luxon";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { FC, ReactNode, SyntheticEvent, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { AdminEditor } from "@apps/pyconkr-admin/components/layouts/admin_editor";

const DUMMY_UUID = "00000000-0000-4000-8000-000000000000";

type enumItemType = { const: string | null; title: string };

type SpeakerSchemaType = {
  schema: {
    type: "object";
    properties: {
      id: { type: ["string", "null"]; format: "uuid"; readOnly: true };
      str_repr: { type: "string"; readOnly: true };
      user: { type: "integer"; oneOf: enumItemType[] };
      image: { type: ["string", "null"]; oneOf: enumItemType[] };
      biography_ko?: { type: ["string", "null"] };
      biography_en?: { type: ["string", "null"] };
    };
    required?: string[];
    $schema?: string;
  };
  ui_schema?: Record<string, { "ui:widget"?: string; "ui:field"?: string }>;
  translation_fields?: string[];
};

type OnMemoeryPresentationSpeaker = {
  id?: string;
  trackId: string;
  presentation: string;
  user: string | null;
  image: string | null;
  biography_ko: string;
  biography_en: string;
};

type PresentationSpeaker = Omit<OnMemoeryPresentationSpeaker, "trackId"> & {
  id: string;
  user: string;
};

const MUIStyledFieldset = styled("fieldset")(({ theme }) => ({
  color: theme.palette.text.secondary,
  margin: 0,

  border: `1px solid ${theme.palette.info}`,
  borderRadius: theme.shape.borderRadius,
}));

const MDXRendererContainer = styled(Box)(({ theme }) => ({
  width: "50%",
  maxWidth: "50%",

  "& .markdown-body": {
    width: "100%",
    p: { margin: theme.spacing(2, 0) },
    a: { color: theme.palette.primary.main },
  },
}));

type PresentationSpeakerFormPropType = {
  schema: SpeakerSchemaType;
  disabled?: boolean;
  speaker: OnMemoeryPresentationSpeaker;
  onChange: (speaker: OnMemoeryPresentationSpeaker) => void;
  onRemove: (speaker: OnMemoeryPresentationSpeaker) => void;
};

type PresentationSpeakerFormStateType = {
  tab: "ko" | "en";
};

type AutoCompleteType = {
  name: string;
  value: string | null;
  label: string;
};

const PresentationSpeakerForm: FC<PresentationSpeakerFormPropType> = ({ disabled, schema, speaker, onChange, onRemove }) => {
  const { baseUrl, mdxComponents } = useCommonContext();
  const [formState, setFormState] = useState<PresentationSpeakerFormStateType>({ tab: "ko" });
  const setLanguage = (_: SyntheticEvent, tab: "ko" | "en") => setFormState((ps) => ({ ...ps, tab }));

  const userOptions: AutoCompleteType[] = schema.schema.properties.user.oneOf.map((item) => ({
    name: "user",
    value: item.const || "",
    label: item.title,
  }));
  const currentSelectedUser = userOptions.find((u) => u.value === speaker.user?.toString());
  const imageOptions: AutoCompleteType[] = schema.schema.properties.image.oneOf.map((item) => ({
    name: "image",
    value: item.const || "",
    label: item.title,
  }));
  const currentSelectedImage = imageOptions.find((u) => u.value === speaker.image?.toString());

  const bioField = formState.tab === "ko" ? "biography_ko" : "biography_en";
  const onSpeakerBioChange = (value?: string) => onChange({ ...speaker, [bioField]: value || "" });
  const onSpeakerChange = (fieldName: string) => (_: SyntheticEvent, selected: AutoCompleteType | null) => {
    onChange({ ...speaker, [fieldName]: selected?.value || "" });
  };
  const onSpeakerRemove = () => {
    if (window.confirm("발표자를 삭제하시겠습니까?")) onRemove(speaker);
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Autocomplete
            fullWidth
            defaultValue={currentSelectedUser}
            value={currentSelectedUser}
            onChange={onSpeakerChange("user")}
            // inputValue={currentSelectedUser?.label || ""}
            options={userOptions}
            renderInput={(params) => <TextField {...params} label="발표자" />}
          />
          <Autocomplete
            fullWidth
            defaultValue={currentSelectedImage}
            value={currentSelectedImage}
            // inputValue={currentSelectedImage?.label || ""}
            options={imageOptions}
            renderInput={(params) => <TextField {...params} label="발표자 이미지" />}
            onChange={onSpeakerChange("image")}
          />
          <Stack direction="row" spacing={2}>
            <Tabs orientation="vertical" onChange={setLanguage} value={formState.tab} scrollButtons={false}>
              <Tab value="ko" label="한국어" />
              <Tab value="en" label="영어" />
            </Tabs>
            <Stack direction="column" spacing={2} sx={{ width: "100%", maxWidth: "100%" }}>
              <MUIStyledFieldset>
                <Typography variant="subtitle2" component="legend" children="발표자 소개" />
                <Stack direction="row" spacing={2}>
                  <Box sx={{ width: "50%", maxWidth: "50%" }}>
                    <MarkdownEditor disabled={disabled} value={speaker[bioField]} name={bioField} onChange={onSpeakerBioChange} />
                  </Box>
                  <MDXRendererContainer>
                    <MDXRenderer text={speaker[bioField]} format="md" baseUrl={baseUrl} mdxComponents={mdxComponents} />
                  </MDXRendererContainer>
                </Stack>
              </MUIStyledFieldset>
            </Stack>
          </Stack>
          <Button variant="outlined" color="error" onClick={onSpeakerRemove} children="발표자 삭제" />
        </Stack>
      </CardContent>
    </Card>
  );
};

type ScheduleSchemaType = {
  schema: {
    type: "object";
    properties: {
      room: { type: "string"; oneOf: enumItemType[] };
      presentation: { type: "string"; oneOf: enumItemType[] };
      start_at: { type: "string"; format: "date-time" };
      end_at: { type: "string"; format: "date-time" };
    };
    required?: string[];
    $schema?: string;
  };
  ui_schema?: Record<string, { "ui:widget"?: string; "ui:field"?: string }>;
  translation_fields?: string[];
};

type OnMemorySchedule = {
  id?: string;
  trackId: string; // Unique identifier for the schedule item, used for local state management
  room: string;
  presentation: string;
  start_at: string; // ISO 8601 date-time string
  end_at: string; // ISO 8601 date-time string
};

type Schedule = Omit<OnMemorySchedule, "trackId"> & { id: string };

type ScheduleFormPropType = {
  schema: ScheduleSchemaType;
  disabled?: boolean;
  schedule: OnMemorySchedule;
  onChange: (schedule: OnMemorySchedule) => void;
  onRemove: (schedule: OnMemorySchedule) => void;
};

const PresentationScheduleForm: FC<ScheduleFormPropType> = ({ schema, disabled, schedule, onChange, onRemove }) => {
  const roomOptions: AutoCompleteType[] = schema.schema.properties.room.oneOf.map((item) => ({
    name: "room",
    value: item.const || "",
    label: item.title,
  }));
  const currentSelectedRoom = roomOptions.find((r) => r.value === schedule.room?.toString());

  const onSelectChange = (fieldName: string) => (_: SyntheticEvent, selected: AutoCompleteType | null) => {
    onChange({ ...schedule, [fieldName]: selected?.value || "" });
  };

  const onScheduleTimeChange = (fieldName: string) => (value: PickerValue) => {
    if (!value || !DateTime.isDateTime(value)) {
      console.warn(`Invalid date-time value for ${fieldName}:`, value);
      return;
    }
    onChange({ ...schedule, [fieldName]: value.toISO({ includeOffset: false }) });
  };
  const onScheduleRemove = () => window.confirm("스케줄을 삭제하시겠습니까?") && onRemove(schedule);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Autocomplete
            fullWidth
            defaultValue={currentSelectedRoom}
            value={currentSelectedRoom}
            onChange={onSelectChange("room")}
            options={roomOptions}
            disabled={disabled}
            renderInput={(params) => <TextField {...params} label="발표 장소" />}
          />
          <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="ko-kr">
            <DateTimePicker
              disabled={disabled}
              name="start_at"
              label="시작 시각"
              value={DateTime.fromISO(schedule.start_at)}
              onChange={onScheduleTimeChange("start_at")}
              minDateTime={DateTime.local(2000, 1, 1, 0, 0, 0)}
              maxDateTime={DateTime.local(2100, 12, 31, 23, 59, 59)}
              disablePast
            />
            <DateTimePicker
              disabled={disabled}
              name="end_at"
              label="종료 시각"
              value={DateTime.fromISO(schedule.end_at)}
              onChange={onScheduleTimeChange("end_at")}
              minDateTime={DateTime.local(2000, 1, 1, 0, 0, 0)}
              maxDateTime={DateTime.local(2100, 12, 31, 23, 59, 59)}
              disablePast
            />
          </LocalizationProvider>
          <Button variant="outlined" color="error" onClick={onScheduleRemove} children="스케줄 삭제" />
        </Stack>
      </CardContent>
    </Card>
  );
};

type PresentationEditorStateType = {
  speakers: OnMemoeryPresentationSpeaker[];
  schedules: OnMemorySchedule[];
};

export const AdminPresentationEditor: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const { id } = useParams<{ id?: string }>();

    const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
      enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

    const backendAdminAPIClient = useBackendAdminClient();
    const speakerQueryParams = [backendAdminAPIClient, "event", "presentationspeaker"] as const;
    const presentation = id || DUMMY_UUID;
    const speakerCreateMutation = useCreateMutation<OnMemoeryPresentationSpeaker>(...speakerQueryParams);
    const speakerUpdateMutation = useUpdatePreparedMutation<PresentationSpeaker>(...speakerQueryParams);
    const speakerDeleteMutation = useRemovePreparedMutation(...speakerQueryParams);
    const { data: speakerJsonSchema } = useSchemaQuery(...speakerQueryParams);
    const speakerChoices = useFieldSelectablesQuery(...speakerQueryParams);
    const {
      data: { results: speakerInitialData },
    } = useListPaginatedQuery<PresentationSpeaker>(...speakerQueryParams, { presentation });
    const speakers = speakerInitialData.map((s) => ({ ...s, trackId: s.id || Math.random().toString(36).substring(2, 15) }));

    const scheduleQueryParams = [backendAdminAPIClient, "event", "roomschedule"] as const;
    const scheduleCreateMutation = useCreateMutation<OnMemorySchedule>(...scheduleQueryParams);
    const scheduleUpdateMutation = useUpdatePreparedMutation<Schedule>(...scheduleQueryParams);
    const scheduleDeleteMutation = useRemovePreparedMutation(...scheduleQueryParams);
    const { data: scheduleJsonSchema } = useSchemaQuery(...scheduleQueryParams);
    const scheduleChoices = useFieldSelectablesQuery(...scheduleQueryParams);
    const {
      data: { results: scheduleInitialData },
    } = useListPaginatedQuery<Schedule>(...scheduleQueryParams, { presentation });
    const schedules = scheduleInitialData.map((s) => ({ ...s, trackId: s.id || Math.random().toString(36).substring(2, 15) }));

    useMemo(() => {
      const mergeChoices = (
        schema: { schema?: { properties?: Record<string, { oneOf?: enumItemType[] }> } },
        choices: Record<string, enumItemType[]>
      ) => {
        if (!schema?.schema?.properties || !choices) return;
        for (const [fieldName, items] of Object.entries(choices)) {
          const prop = schema.schema.properties[fieldName];
          if (!prop) continue;
          prop.oneOf = items;
        }
      };
      mergeChoices(speakerJsonSchema as never, speakerChoices);
      mergeChoices(scheduleJsonSchema as never, scheduleChoices);
    }, [speakerJsonSchema, speakerChoices, scheduleJsonSchema, scheduleChoices]);

    const createEmptySpeaker = (): OnMemoeryPresentationSpeaker => ({
      trackId: Math.random().toString(36).substring(2, 15),
      presentation,
      user: null,
      image: null,
      biography_ko: "",
      biography_en: "",
    });

    const createEmptySchedule = (): OnMemorySchedule => ({
      trackId: Math.random().toString(36).substring(2, 15),
      room: "",
      presentation,
      start_at: DateTime.now().toISO({ includeOffset: false }),
      end_at: DateTime.now().plus({ hours: 1 }).toISO({ includeOffset: false }),
    });

    const [editorState, setEditorState] = useState<PresentationEditorStateType>({ speakers, schedules });
    const onSpeakerCreate = () => setEditorState((ps) => ({ ...ps, speakers: [...ps.speakers, createEmptySpeaker()] }));
    const onSpeakerRemove = (oldSpeaker: OnMemoeryPresentationSpeaker) =>
      setEditorState((ps) => ({ ...ps, speakers: ps.speakers.filter((s) => s.trackId !== oldSpeaker.trackId) }));
    const onSpeakerChange = (newSpeaker: OnMemoeryPresentationSpeaker) =>
      setEditorState((ps) => ({ ...ps, speakers: ps.speakers.map((s) => (s.trackId === newSpeaker.trackId ? newSpeaker : s)) }));

    const onScheduleCreate = () => setEditorState((ps) => ({ ...ps, schedules: [...ps.schedules, createEmptySchedule()] }));
    const onScheduleRemove = (oldSchedule: OnMemorySchedule) =>
      setEditorState((ps) => ({ ...ps, schedules: ps.schedules.filter((s) => s.trackId !== oldSchedule.trackId) }));
    const onScheduleChange = (newSchedule: OnMemorySchedule) =>
      setEditorState((ps) => ({
        ...ps,
        schedules: ps.schedules.map((s) => (s.trackId === newSchedule.trackId ? newSchedule : s)),
      }));

    const onSpeakerSubmit = () => {
      if (!id) return;

      addSnackbar("발표자 정보를 저장하는 중입니다...", "info");
      const newSpeakers = editorState.speakers;
      const editorSpeakerIds = newSpeakers.filter((s) => s.id).map((s) => s.id!);
      const deletedSpeakerIds = speakerInitialData.filter((s) => !editorSpeakerIds.includes(s.id)).map((s) => s.id!);

      const deleteMut = deletedSpeakerIds.map((id) => speakerDeleteMutation.mutateAsync(id));
      const createMut = newSpeakers.filter((s) => s.id === undefined).map((s) => speakerCreateMutation.mutateAsync(s));
      const updateMut = newSpeakers.filter((s) => s.id !== undefined).map((s) => speakerUpdateMutation.mutateAsync(s as PresentationSpeaker));
      return Promise.all([...deleteMut, ...createMut, ...updateMut]).then(() => addSnackbar("발표자 정보가 저장되었습니다.", "success"));
    };

    const onScheduleSubmit = () => {
      if (!id) return;

      addSnackbar("스케줄 정보를 저장하는 중입니다...", "info");
      const newSchedules = editorState.schedules;
      const editorScheduleIds = newSchedules.filter((s) => s.id).map((s) => s.id!);
      const deletedScheduleIds = scheduleInitialData.filter((s) => !editorScheduleIds.includes(s.id)).map((s) => s.id!);

      const deleteMut = deletedScheduleIds.map((id) => scheduleDeleteMutation.mutateAsync(id));
      const createMut = newSchedules.filter((s) => s.id === undefined).map((s) => scheduleCreateMutation.mutateAsync(s));
      const updateMut = newSchedules.filter((s) => s.id !== undefined).map((s) => scheduleUpdateMutation.mutateAsync(s as Schedule));
      return Promise.all([...deleteMut, ...createMut, ...updateMut]).then(() => addSnackbar("스케줄 정보가 저장되었습니다.", "success"));
    };

    const onPresentationSubmit = () => {
      if (!id) return;
      addSnackbar("발표 정보를 저장하는 중입니다...", "info");
      return Promise.all([onSpeakerSubmit(), onScheduleSubmit()]).then(() => addSnackbar("발표 정보가 저장되었습니다.", "success"));
    };

    return (
      <AdminEditor app="event" resource="presentation" id={id} afterSubmit={onPresentationSubmit}>
        {id ? (
          <Stack sx={{ mb: 2 }} spacing={2}>
            <Fieldset legend="스케줄 정보">
              <Typography variant="h6">스케줄 정보</Typography>
              <Stack spacing={2}>
                {editorState.schedules.map((s) => (
                  <PresentationScheduleForm
                    key={s.trackId}
                    schema={scheduleJsonSchema as ScheduleSchemaType}
                    schedule={s}
                    onChange={onScheduleChange}
                    onRemove={onScheduleRemove}
                  />
                ))}
                <Button variant="outlined" onClick={onScheduleCreate} children="스케줄 추가" />
              </Stack>
            </Fieldset>
            <Fieldset legend="발표자 정보">
              <Typography variant="h6">발표자 정보</Typography>
              <Stack spacing={2}>
                {editorState.speakers.map((s) => (
                  <PresentationSpeakerForm
                    key={s.id}
                    schema={speakerJsonSchema as SpeakerSchemaType}
                    speaker={s}
                    onChange={onSpeakerChange}
                    onRemove={onSpeakerRemove}
                  />
                ))}
                <Button variant="outlined" onClick={onSpeakerCreate} children="발표자 추가" />
              </Stack>
            </Fieldset>
          </Stack>
        ) : (
          <Stack>
            <Typography variant="h6">발표자 & 스케줄 정보</Typography>
            <Typography variant="body1">발표자나 스케줄 정보를 추가하려면 발표를 먼저 저장하세요.</Typography>
          </Stack>
        )}
      </AdminEditor>
    );
  })
);
