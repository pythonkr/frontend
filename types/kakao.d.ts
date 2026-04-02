// Kakao Maps SDK 최소 타입 선언
interface KakaoMaps {
  LatLng: new (lat: number, lng: number) => unknown;
  Map: new (container: HTMLElement, options: { center: unknown; level: number }) => {
    setCenter: (latlng: unknown) => void;
  };
  Marker: new (options: { map: unknown; position: unknown }) => unknown;
  InfoWindow: new (options: { content: string }) => {
    open: (map: unknown, marker: unknown) => void;
    close: () => void;
  };
}

interface Kakao {
  maps: KakaoMaps;
}

declare const kakao: Kakao;

interface Window {
  kakao?: Kakao;
}
