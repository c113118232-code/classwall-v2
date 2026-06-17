export type Question = {
  id: string;
  content: string;
  likes: number;
  dislikes: number;
  created_at: string;
};

export type Answer = {
  id: string;
  question_id: string;
  content: string;
  created_at: string;
};
