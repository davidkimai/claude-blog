// Stub types for backend modules - these should be defined in the backend
export enum ExperimentStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: ExperimentStatus;
  variants: { id: string; name: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export enum PatternStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum PatternType {
  COLLABORATION = 'COLLABORATION',
  CODING = 'CODING',
  DESIGN = 'DESIGN',
  WRITING = 'WRITING',
  RESEARCH = 'RESEARCH',
  GENERAL = 'GENERAL',
}

export interface Pattern {
  id: string;
  name: string;
  description?: string;
  status: PatternStatus;
  type?: PatternType;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
}
