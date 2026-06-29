// 알림 채널별 admin 라우트 설정. 라우트 컨벤션(<app>/<model_name>)에 따라 app 은 모두 "notification",
// resource 는 채널·종류별 모델명을 사용한다.
export type NotificationChannelKind = "email" | "kakao" | "sms";

export type NotificationChannel = {
  app: string;
  kind: NotificationChannelKind;
  templateResource: string;
  historyResource: string;
};

export const EMAIL_CHANNEL: NotificationChannel = {
  app: "notification",
  kind: "email",
  templateResource: "emailnotificationtemplate",
  historyResource: "emailnotificationhistory",
};

export const KAKAO_CHANNEL: NotificationChannel = {
  app: "notification",
  kind: "kakao",
  templateResource: "nhncloudkakaoalimtalknotificationtemplate",
  historyResource: "nhncloudkakaoalimtalknotificationhistory",
};

export const SMS_CHANNEL: NotificationChannel = {
  app: "notification",
  kind: "sms",
  templateResource: "nhncloudsmsnotificationtemplate",
  historyResource: "nhncloudsmsnotificationhistory",
};
