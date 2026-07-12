import { isArray, isPlainObject, isString } from "remeda";
export type EmptyObject = Record<string, never>;

export type SocialSignInProvider = "google" | "naver" | "kakao";
export type SocialSignInRequest = {
  provider: SocialSignInProvider;
  callback_url: string;
};

export type SocialSessionStatus = {
  meta: { is_authenticated: boolean };
  data: { user?: { username?: string; display?: string } };
};

export type DetailedErrorSchema = {
  code: string;
  detail: string;
  attr: string | null;
};

export type ErrorResponseSchema = {
  type: string;
  errors: DetailedErrorSchema[];
};

export type FlattenedSiteMapSchema = {
  id: string;
  route_code: string;
  name: string;
  order: number;
  parent_sitemap: string | null;
  hide: boolean;
  page: string | null;
  external_link: string | null;
};

export type NestedSiteMapSchema = {
  id: string;
  route_code: string;
  name: string;
  order: number;
  hide: boolean;
  parent_sitemap: string | null;
  children: NestedSiteMapSchema[];
  page: string | null;
  external_link: string | null;
};

export type SectionSchema = {
  id: string;
  css: string;

  order: number;
  body: string;
};

export type PageSchema = {
  id: string;
  css: string;
  title: string;
  subtitle: string;

  show_top_title_banner: boolean;
  show_bottom_sponsor_banner: boolean;

  sections: SectionSchema[];
};

export type SponsorTierSchema = {
  id: string;
  name: string;
  order: number;
  sponsors: {
    id: string;
    name: string;
    logo: string;
    description: string;
    tags: string[];
  }[];
};

export type EventSchema = {
  id: string;
  name: string;
  slogan: string | null;
  description: string | null;
  event_start_at: string | null;
  event_end_at: string | null;
  logo: string | null;
};

export type SponsorQueryParameterSchema = {
  event?: string;
};

export type SessionQueryParameterSchema = {
  event?: string;
  types?: string;
};

export type SessionSchema = {
  id: string;
  presentation_type: {
    id: string;
    name: string;
    event: EventSchema;
  };
  title: string;
  summary: string | null;
  description: string;
  slideshow_url: string | null;
  public_slideshow_file: string | null;
  image: string | null;
  categories: {
    id: string;
    name: string;
  }[];
  speakers: {
    id: string;
    nickname: string;
    biography: string;
    image: string | null;
  }[];
  room_schedules: {
    id: string;
    room_name: string;
    room_order: number;
    start_at: string;
    end_at: string;
  }[];
};

export const isObjectErrorResponseSchema = (obj?: unknown): obj is ErrorResponseSchema => {
  return (
    isPlainObject(obj) &&
    isString(obj.type) &&
    isArray(obj.errors) &&
    obj.errors.every((error) => {
      return isPlainObject(error) && isString(error.code) && isString(error.detail) && (error.attr === null || isString(error.attr));
    })
  );
};
