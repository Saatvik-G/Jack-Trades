export type Discipline = 
  | 'Science'
  | 'Mathematics'
  | 'Psychology'
  | 'Philosophy'
  | 'History'
  | 'Art'
  | 'Economics'
  | 'Design'
  | 'Biology'
  | 'Music'
  | 'Architecture'
  | 'Game Theory'
  | 'Sociology'
  | 'Engineering'
  | 'Literature'
  | 'Ecology';

export interface Connection {
  id: string;
  field: Discipline | string;
  analogy: string;
  explanation: string;
  funFact: string;
  emoji?: string;
}

export interface ConnectionResponse {
  topic: string;
  connections: Connection[];
}

export type ViewMode = 'serious' | 'playful';
