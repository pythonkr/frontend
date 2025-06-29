namespace BackendParticipantPortalAPISchemas {
  export type EmptyObject = Record<string, never>;

  export type DetailedErrorSchema = {
    code: string;
    detail: string;
    attr: string | null;
  };

  export type ErrorResponseSchema = {
    type: string;
    errors: DetailedErrorSchema[];
  };

  export type UserSchema = {
    id: number;
    email: string;
    username: string;
    nickname: string | null;
    nickname_ko: string | null;
    nickname_en: string | null;
    image: string | null; // PK of the user's profile image
    profile_image: string | null; // URL to the user's profile image
  };

  export type UserUpdateSchema = {
    nickname_ko: string | null;
    nickname_en: string | null;
    image?: string | null; // PK of the user's profile image
  };

  export type UserSignInSchema = {
    identity: string; // email
    password: string;
  };

  export type UserChangePasswordSchema = {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  };

  export type PublicFileSchema = {
    id: string; // UUID
    file: string; // URL to the public file
    name: string; // Name of the public file
  };

  export type PresentationRetrieveSchema = {
    id: string; // UUID
    title: string; // Title of the presentation, translated to the current language
    title_ko: string; // Title in Korean
    title_en: string; // Title in English
    summary: string; // Summary of the presentation, translated to the current language
    summary_ko: string; // Summary in Korean
    summary_en: string; // Summary in English
    description: string; // Description of the presentation, translated to the current language
    description_ko: string; // Description in Korean
    description_en: string; // Description in English
    image: string | null; // PK of the presentation's image
    speakers: {
      id: string; // UUID of the speaker
      biography_ko: string; // Biography in Korean
      biography_en: string; // Biography in English
      image: string | null; // PK of the speaker's image
    }[];
  };

  export type PresentationUpdateSchema = {
    id: string;
    title_ko: string;
    title_en: string;
    summary_ko: string;
    summary_en: string;
    description_ko: string;
    description_en: string;
    image: string | null;
  };
}

export default BackendParticipantPortalAPISchemas;
