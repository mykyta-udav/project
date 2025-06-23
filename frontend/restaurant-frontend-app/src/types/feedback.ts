export interface Feedback {
  id: string;
  rate: string;
  comment: string;
  userName: string;
  userAvatarUrl: string;
  date: string;
  type: string;
  locationId: string;
}

export interface FeedbackSort {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface FeedbackPageable {
  offset: number;
  sort: FeedbackSort[];
  paged: boolean;
  pageSize: number;
  pageNumber: number;
  unpaged: boolean;
}

export interface FeedbackResponse {
  totalPages: number;
  totalElements: number;
  size: number;
  content: Feedback[];
  number: number;
  sort: FeedbackSort[];
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: FeedbackPageable;
  empty: boolean;
}

export enum FeedbackType {
  SERVICE_QUALITY = 'SERVICE_QUALITY',
  CUISINE_EXPERIENCE = 'CUISINE_EXPERIENCE'
} 