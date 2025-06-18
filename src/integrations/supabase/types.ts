export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages_new: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          reply_to: string | null
          room_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          reply_to?: string | null
          room_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          reply_to?: string | null
          room_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_new_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "chat_messages_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_new_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_new_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: []
      }
      daily_streak_collections: {
        Row: {
          collected_at: string | null
          id: string
          streak_day: number
          streak_start_date: string
          user_id: string
        }
        Insert: {
          collected_at?: string | null
          id?: string
          streak_day: number
          streak_start_date: string
          user_id: string
        }
        Update: {
          collected_at?: string | null
          id?: string
          streak_day?: number
          streak_start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_streak_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_visits: {
        Row: {
          id: string
          user_id: string
          visit_date: string
        }
        Insert: {
          id?: string
          user_id: string
          visit_date: string
        }
        Update: {
          id?: string
          user_id?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      material_downloads: {
        Row: {
          downloaded_at: string | null
          id: string
          ip_address: string | null
          material_id: string
          user_id: string | null
        }
        Insert: {
          downloaded_at?: string | null
          id?: string
          ip_address?: string | null
          material_id: string
          user_id?: string | null
        }
        Update: {
          downloaded_at?: string | null
          id?: string
          ip_address?: string | null
          material_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_downloads_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "study_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          is_read: boolean
          receiver_id: string
          reply_to: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_read?: boolean
          receiver_id: string
          reply_to?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_read?: boolean
          receiver_id?: string
          reply_to?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      motivational_quotes: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          quote: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          quote: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          quote?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          created_at: string | null
          id: string
          points: number
          related_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points: number
          related_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number
          related_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          class: string | null
          created_at: string | null
          discord: string | null
          display_name: string | null
          education: string | null
          exam_prep: string | null
          followers_count: number | null
          following_count: number | null
          hobbies: string | null
          id: string
          instagram: string | null
          mutual_sparks_count: number | null
          points: number | null
          spark_count: number | null
          stream: string | null
          uid: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          class?: string | null
          created_at?: string | null
          discord?: string | null
          display_name?: string | null
          education?: string | null
          exam_prep?: string | null
          followers_count?: number | null
          following_count?: number | null
          hobbies?: string | null
          id: string
          instagram?: string | null
          mutual_sparks_count?: number | null
          points?: number | null
          spark_count?: number | null
          stream?: string | null
          uid?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          class?: string | null
          created_at?: string | null
          discord?: string | null
          display_name?: string | null
          education?: string | null
          exam_prep?: string | null
          followers_count?: number | null
          following_count?: number | null
          hobbies?: string | null
          id?: string
          instagram?: string | null
          mutual_sparks_count?: number | null
          points?: number | null
          spark_count?: number | null
          stream?: string | null
          uid?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      qstories: {
        Row: {
          bookmark_count: number
          description: string | null
          id: string
          likes_count: number
          pdf_file: string
          status: string
          title: string
          upload_date: string
          uploader_id: string
        }
        Insert: {
          bookmark_count?: number
          description?: string | null
          id?: string
          likes_count?: number
          pdf_file: string
          status?: string
          title: string
          upload_date?: string
          uploader_id: string
        }
        Update: {
          bookmark_count?: number
          description?: string | null
          id?: string
          likes_count?: number
          pdf_file?: string
          status?: string
          title?: string
          upload_date?: string
          uploader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qstories_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      qstory_bookmarks: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: []
      }
      qstory_likes: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: []
      }
      sparked_friends: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sparked_friends_friend"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sparked_friends_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_badges: {
        Row: {
          awarded_at: string
          badge_type: string
          id: string
          student_id: string
          week: string
        }
        Insert: {
          awarded_at?: string
          badge_type: string
          id?: string
          student_id: string
          week: string
        }
        Update: {
          awarded_at?: string
          badge_type?: string
          id?: string
          student_id?: string
          week?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_badges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_materials: {
        Row: {
          created_at: string | null
          description: string | null
          downloads: number | null
          file_path: string
          flagged: boolean | null
          format: string
          id: string
          subject: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          file_path: string
          flagged?: boolean | null
          format: string
          id?: string
          subject: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          file_path?: string
          flagged?: boolean | null
          format?: string
          id?: string
          subject?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_study_materials_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_questions: {
        Row: {
          author_id: string
          choices: string[]
          correct_index: number
          created_at: string
          grade: number
          id: string
          question: string
          stream: string | null
          subject: string
          submission_deadline: string | null
          time_limit_sec: number | null
        }
        Insert: {
          author_id: string
          choices: string[]
          correct_index: number
          created_at?: string
          grade: number
          id?: string
          question: string
          stream?: string | null
          subject: string
          submission_deadline?: string | null
          time_limit_sec?: number | null
        }
        Update: {
          author_id?: string
          choices?: string[]
          correct_index?: number
          created_at?: string
          grade?: number
          id?: string
          question?: string
          stream?: string | null
          subject?: string
          submission_deadline?: string | null
          time_limit_sec?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "study_questions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_submissions: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_index: number
          student_id: string
          time_taken_sec: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_index: number
          student_id: string
          time_taken_sec: number
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_index?: number
          student_id?: string
          time_taken_sec?: number
        }
        Relationships: [
          {
            foreignKeyName: "study_submissions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "study_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_test_questions: {
        Row: {
          correct_option: string
          created_at: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          test_id: string | null
        }
        Insert: {
          correct_option: string
          created_at?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          test_id?: string | null
        }
        Update: {
          correct_option?: string
          created_at?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question_text?: string
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "study_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      study_test_submissions: {
        Row: {
          answers: Json
          correct_count: number
          id: string
          incorrect_count: number
          student_class: string
          student_id: string
          student_stream: string
          submitted_at: string | null
          test_id: string | null
          total_score: number
        }
        Insert: {
          answers: Json
          correct_count: number
          id?: string
          incorrect_count: number
          student_class: string
          student_id: string
          student_stream: string
          submitted_at?: string | null
          test_id?: string | null
          total_score: number
        }
        Update: {
          answers?: Json
          correct_count?: number
          id?: string
          incorrect_count?: number
          student_class?: string
          student_id?: string
          student_stream?: string
          submitted_at?: string | null
          test_id?: string | null
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "study_test_submissions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "study_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      study_tests: {
        Row: {
          class: string
          created_at: string | null
          created_by: string
          expiry_at: string
          id: string
          stream: string
          subject: string
          title: string
          total_time_min: number
        }
        Insert: {
          class: string
          created_at?: string | null
          created_by: string
          expiry_at: string
          id?: string
          stream: string
          subject: string
          title: string
          total_time_min: number
        }
        Update: {
          class?: string
          created_at?: string | null
          created_by?: string
          expiry_at?: string
          id?: string
          stream?: string
          subject?: string
          title?: string
          total_time_min?: number
        }
        Relationships: []
      }
      tbh_answers: {
        Row: {
          answer_text: string
          created_at: string | null
          id: string
          is_best: boolean
          question_id: string
          user_id: string
        }
        Insert: {
          answer_text: string
          created_at?: string | null
          id?: string
          is_best?: boolean
          question_id: string
          user_id: string
        }
        Update: {
          answer_text?: string
          created_at?: string | null
          id?: string
          is_best?: boolean
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tbh_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "tbh_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbh_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tbh_questions: {
        Row: {
          best_answer_id: string | null
          created_at: string | null
          end_at: string
          id: string
          question: string
          start_at: string
          status: string
        }
        Insert: {
          best_answer_id?: string | null
          created_at?: string | null
          end_at: string
          id?: string
          question: string
          start_at: string
          status?: string
        }
        Update: {
          best_answer_id?: string | null
          created_at?: string | null
          end_at?: string
          id?: string
          question?: string
          start_at?: string
          status?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          login_streak: number | null
          quiz_points: number | null
          spark_points: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          login_streak?: number | null
          quiz_points?: number | null
          spark_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          login_streak?: number | null
          quiz_points?: number | null
          spark_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      study_leaderboard_daily: {
        Row: {
          correct_count: number | null
          grade: number | null
          quiz_date: string | null
          score: number | null
          stream: string | null
          student_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_leaderboard_weekly: {
        Row: {
          correct_count: number | null
          grade: number | null
          quiz_week: string | null
          score: number | null
          stream: string | null
          student_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      decrement: {
        Args: { value: number }
        Returns: number
      }
      get_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          student_id: string
          display_name: string
          total_score: number
          correct_count: number
          incorrect_count: number
          student_class: string
          student_stream: string
          test_id: string
        }[]
      }
      has_role: {
        Args: { user_id: string; role_name: string }
        Returns: boolean
      }
      increment: {
        Args: { row_id: string } | { value: number }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "volunteer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "volunteer"],
    },
  },
} as const