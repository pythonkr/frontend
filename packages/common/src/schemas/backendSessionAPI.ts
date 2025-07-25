namespace BackendSessionAPISchemas {
  export type SessionCategorySchema = {
    id: string;
    name: string;
  };

  export type SessionSpeakerSchema = {
    id: string;
    nickname: string;
    biography: string;
    image: string;
  };

  export type RoomScheduleSchema = {
    id: string;
    room_name: string;
    event_id: number;
    event_name: string;
    start_at: string;
    end_at: string;
  };

  export type SessionScheduleSchema = {
    id: string;
    presentation_type_name: string;
    start_at: string;
    end_at: string;
    next_call_for_presentation_schedule: string;
  };

  export type SessionSchema = {
    id: string;
    title: string;
    summary: string | null;
    description: string;
    slideshow_url: string;
    image: string;
    categories: SessionCategorySchema[];
    speakers: SessionSpeakerSchema[];
    room_schedules: RoomScheduleSchema[];
    call_for_presentation_schedules: SessionScheduleSchema[];
  };
}

export default BackendSessionAPISchemas;
