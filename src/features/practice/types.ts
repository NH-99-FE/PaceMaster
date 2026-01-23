export type PracticeItem = {
  id: string;
  label: string;
  questionCount: number;
  plannedTime: number;
};

export type QuestionGridItem = {
  number: number;
  typeIndex: number;
  label: string;
  templateItemId: string;
};
