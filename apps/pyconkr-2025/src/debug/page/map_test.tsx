import { Box, Button, FormControlLabel, Stack, Switch, TextField } from "@mui/material";
import { FC, useRef, useState } from "react";

import { Map as MDXMap, MapPropType } from "@frontend/common/components/mdx_components";
import { getFormValue, isFormValid } from "@frontend/common/utils";
type MapTestPageStateType = {
  checked: boolean;
  mapProps: MapPropType;
};

const INITIAL_DATA: MapPropType = {
  geo: { lat: 37.5580918, lng: 126.9982178 },
  placeName: {
    ko: "동국대학교 신공학관",
    en: "Dongguk University\nNew Engineering Building",
  },
  placeCode: {
    kakao: "17579989",
    google: "gryFHrZub6tsXdwb9",
    naver: "5IieESq8",
  },
  googleMapIframeSrc:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.871473157695!2d126.99821779999999!3d37.5580918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca302befa0c31%3A0xbc66c66731962172!2z64-Z6rWt64yA7ZWZ6rWQIOyLoOqzte2Vmeq0gA!5e0!3m2!1sko!2sen!4v1748768615566!5m2!1sko!2sen",
};

export const MapTestPage: FC = () => {
  const geoFormRef = useRef<HTMLFormElement>(null);
  const placeNameFormRef = useRef<HTMLFormElement>(null);
  const placeCodeFormRef = useRef<HTMLFormElement>(null);
  const gMapIframeUrlInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<MapTestPageStateType>({ checked: false, mapProps: INITIAL_DATA });
  const setChecked = (checked: boolean) => setState((ps) => ({ ...ps, checked }));
  const language = state.checked ? "en" : "ko";

  const onApply = () => {
    const geoForm = geoFormRef.current;
    const pNameForm = placeNameFormRef.current;
    const pCodeForm = placeCodeFormRef.current;
    const gMapIframeUrl = gMapIframeUrlInputRef.current;

    [geoForm, pNameForm, pCodeForm, gMapIframeUrl].forEach((formOrInput, index) => {
      if (!formOrInput) throw new Error(`${formOrInput}[${index}] is not defined.`);

      if (formOrInput instanceof HTMLFormElement && !isFormValid(formOrInput)) throw new Error(`${formOrInput}[${index}] is not valid.`);

      if (formOrInput instanceof HTMLInputElement && !formOrInput.checkValidity()) throw new Error(`${formOrInput}[${index}] is not valid.`);
    });
    if (!(geoForm && pNameForm && pCodeForm && gMapIframeUrl)) return;

    const strGeo = getFormValue<{ lat: string; lng: string }>({ form: geoForm });
    if (!strGeo.lat || !strGeo.lng || isNaN(parseFloat(strGeo.lat)) || isNaN(parseFloat(strGeo.lng))) {
      alert("위도와 경도를 올바르게 입력해주세요.");
      return;
    }
    const geo = { lat: parseFloat(strGeo.lat), lng: parseFloat(strGeo.lng) };
    const googleMapIframeSrc = gMapIframeUrl.value.trim();
    const placeCode = getFormValue<{ kakao: string; naver: string; google: string }>({ form: pCodeForm });
    const placeName = getFormValue<{ ko: string; en: string }>({ form: pNameForm });
    placeName.ko = placeName.ko.trim().replace("\\n", "\n");
    placeName.en = placeName.en.trim().replace("\\n", "\n");

    setState((ps) => ({ ...ps, mapProps: { language, geo, placeCode, placeName, googleMapIframeSrc } }));
  };

  return (
    <Stack direction="row" spacing={2} sx={{ p: 2 }}>
      <Stack spacing={2} sx={{ width: "50%", maxWidth: "50%" }}>
        <FormControlLabel control={<Switch checked={state.checked} onChange={(e) => setChecked(e.target.checked)} />} label={language} />
        <form ref={geoFormRef}>
          <Stack spacing={1}>
            <TextField label="Latitude" name="lat" defaultValue={state.mapProps.geo.lat} />
            <TextField label="Longitude" name="lng" defaultValue={state.mapProps.geo.lng} />
          </Stack>
        </form>
        <form ref={placeNameFormRef}>
          <Stack spacing={1}>
            <TextField label="명칭 (KR)" name="ko" defaultValue={state.mapProps.placeName.ko} />
            <TextField label="명칭 (EN)" name="en" defaultValue={state.mapProps.placeName.en} />
          </Stack>
        </form>
        <form ref={placeCodeFormRef}>
          <Stack spacing={1}>
            <TextField label="Kakaomap Code" name="kakao" defaultValue={state.mapProps.placeCode.kakao} />
            <TextField label="Google Maps Code" name="google" defaultValue={state.mapProps.placeCode.google} />
            <TextField label="Naver Shortened URL Code" name="naver" defaultValue={state.mapProps.placeCode.naver} />
          </Stack>
        </form>
        <TextField label="Google Map Iframe URL" type="url" inputRef={gMapIframeUrlInputRef} defaultValue={state.mapProps.googleMapIframeSrc} />
        <Button onClick={onApply}>적용</Button>
      </Stack>
      <Box sx={{ width: "50%", maxWidth: "50%" }}>
        <MDXMap {...state.mapProps} />
      </Box>
    </Stack>
  );
};
