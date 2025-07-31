export type GuidelineStatus = 'STANDBY' | 'APPROVED' | 'PENDING' | 'REJECTED';

export type Guideline = {
  id: string;
  name: string;
  description: string;
  code: string;
  image: string;
  imageDesc: string;
  deficiences: Deficiency[];
  statusCode: GuidelineStatus;
  statusMsg: string;
};
