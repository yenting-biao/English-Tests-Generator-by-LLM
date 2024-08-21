export interface StudentUser {
  id: string;
  gid: number;
  username: string;
  password: string;
}

export interface ClassInfo {
  id: number;
  name: string;
  open: number;
}

export interface assignedTestsTableType {
  testId: string;
  id: string;
  classNumber: number;
  showAnswers: boolean;
  startDate: Date;
  endDate: Date;
}
