export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      userdata: {
        Row: {
          id: string
          created_at?: string
          UID: string
          'news-terms': string
        }
        Insert: {
          id?: string
          created_at?: string
          UID: string
          'news-terms': string
        }
        Update: {
          id?: string
          created_at?: string
          UID?: string
          'news-terms'?: string
        }
      }
      users: {
        Row: {
          email: string
          news_items?: {
            title: string
            description: string
            url: string
          }[]
        }
      }
    }
  }
} 