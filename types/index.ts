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
  | 'Game Theory';

export interface Connection {
  id: string;
  field: Discipline;
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
