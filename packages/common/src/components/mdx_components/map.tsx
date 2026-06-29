import { Box, Button, Stack, Tab, Tabs } from "@mui/material";
import { CSSProperties, FC, SyntheticEvent, useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { useCommonContext } from "@frontend/common/hooks/useCommonContext";

type SupportedMapType = "kakao" | "google" | "naver";
const MAP_TYPES: SupportedMapType[] = ["kakao", "google", "naver"];

type LangType = "ko" | "en";

export type MapPropType = {
  /** 지도 중심 좌표. `lat`=위도, `lng`=경도. */
  geo: {
    lat: number;
    lng: number;
  };
  /** 장소 이름. 언어별(`ko`/`en`)로 지정하며 카카오맵 마커 안내에 표시된다. */
  placeName: { [key in LangType]: string };
  /** 각 지도 서비스의 장소 코드. `kakao`/`google`/`naver` 별 '열기' 링크를 만드는 데 사용한다. */
  placeCode: { [key in SupportedMapType]: string };
  /** 구글 지도 탭에 임베드할 iframe 의 src URL. */
  googleMapIframeSrc: string;
};

type MapStateType = {
  tab: number;
};

export type MapDataType = {
  title: {
    ko: string;
    en: string;
  };
  color: {
    backgroundColor: CSSProperties["backgroundColor"];
    color: CSSProperties["color"];
  };
  basePlaceInfoUrl: string;
  hideInTabs?: boolean;
};

const MapData: { [key in SupportedMapType]: MapDataType } = {
  kakao: {
    title: { ko: "카카오맵", en: "Kakaomap" },
    color: { backgroundColor: "#fee500", color: "#191919" },
    basePlaceInfoUrl: "https://map.kakao.com/link/map/",
  },
  naver: {
    title: { ko: "네이버 지도", en: "NAVER Map" },
    color: { backgroundColor: "#04c75b", color: "#fff" },
    basePlaceInfoUrl: "https://naver.me/",
    hideInTabs: true,
  },
  google: {
    title: { ko: "구글 지도", en: "Google Maps" },
    color: { backgroundColor: "#4285f4", color: "#fff" },
    basePlaceInfoUrl: "https://maps.app.goo.gl/",
  },
};

/**
 * 카카오맵·구글지도·네이버지도 탭으로 특정 장소를 보여주는 지도 컴포넌트.
 * 각 지도 서비스로 바로 여는 버튼도 함께 렌더하며, 주로 행사장 위치 안내에 사용한다.
 * @example <Common__Components__MDX__Map geo={{ lat: 37.5665, lng: 126.978 }} placeName={{ ko: "서울시청", en: "Seoul City Hall" }} placeCode={{ kakao: "7942135", google: "ChIJ...", naver: "..." }} googleMapIframeSrc="https://www.google.com/maps/embed?pb=..." />
 */
export const Map: FC<MapPropType> = ({ geo, placeName, placeCode, googleMapIframeSrc }) => {
  const { language } = useCommonContext();
  const kakaoMapRef = useRef<HTMLDivElement>(null);
  const [mapState, setMapState] = useState<MapStateType>({ tab: 0 });
  const selectedMapType = MAP_TYPES[mapState.tab] || "kakao";
  const setTab = (_: SyntheticEvent, tab: number) => setMapState((ps) => ({ ...ps, tab }));

  useEffect(() => {
    const kakaoMapDiv = kakaoMapRef.current;
    if (!(window.kakao && window.kakao.maps && kakaoMapDiv)) return;

    const kakaoMapUrl = MapData.kakao.basePlaceInfoUrl + placeCode.kakao;
    const content: string = renderToStaticMarkup(
      <a
        href={kakaoMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          boxSizing: "border-box",
          width: "max-content",
          maxWidth: "240px",
          padding: "8px 12px",
          textAlign: "center",
          fontSize: "20px",
          lineHeight: 1.4,
          whiteSpace: "normal",
          wordBreak: "keep-all",
          color: "#000",
          textDecoration: "none",
        }}
        children={placeName[language]}
      />
    );
    const position = new window.kakao.maps.LatLng(geo.lat, geo.lng);
    const map = new window.kakao.maps.Map(kakaoMapDiv, { center: position, level: 3 });
    const infoWindow = new kakao.maps.InfoWindow({ content });
    infoWindow.open(map, new kakao.maps.Marker({ map, position }));

    return () => {
      if (infoWindow) infoWindow.close();
      if (map) map.setCenter(new kakao.maps.LatLng(geo.lat, geo.lng));
      if (kakaoMapDiv) kakaoMapDiv.innerHTML = ""; // Clear the map container
    };
  }, [mapState.tab, geo, language, placeName, placeCode.kakao]);

  const mapStyle: CSSProperties = { border: 0, width: "100%", aspectRatio: "3/2" };

  return (
    <Box>
      <Tabs value={mapState.tab} onChange={setTab} variant="fullWidth">
        {Object.entries(MapData)
          .filter(([, v]) => !v.hideInTabs)
          .map(([k, d]) => (
            <Tab key={k} label={d.title[language]} sx={{ textTransform: "none" }} />
          ))}
      </Tabs>
      {selectedMapType === "kakao" && <div ref={kakaoMapRef} style={mapStyle} />}
      {selectedMapType === "google" && (
        <iframe title="map" src={googleMapIframeSrc} style={mapStyle} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      )}
      <Stack>
        {Object.entries(MapData).map(([key, data]) => {
          return (
            <Button
              key={key}
              sx={{
                backgroundColor: data.color.backgroundColor,
                color: data.color.color,
                textTransform: "none",
              }}
              href={`${data.basePlaceInfoUrl}${placeCode[key as SupportedMapType]}`}
              target="_blank"
            >
              {language === "ko" ? `${data.title.ko}에서 열기` : `Open in ${data.title.en}`}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
};
