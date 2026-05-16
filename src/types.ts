export enum UserRole {
  REPORTER = 'reporter',
  VOLUNTEER = 'volunteer',
  VET = 'vet',
  ADMIN = 'admin',
}

export enum AnimalType {
  DOG = 'Dog',
  CAT = 'Cat',
  BIRD = 'Bird',
  COW = 'Cow',
  OTHER = 'Other',
}

export enum ReportPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum ReportStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
}

export interface Report {
  id: string;
  title: string;
  description: string;
  animalType: AnimalType;
  priority: ReportPriority;
  isEmergency: boolean;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  status: ReportStatus;
  reporterId: string;
  assignedVolunteerId?: string;
  requiresMedicalHelp?: boolean;
  imageUrl?: string;
  rescueDetails?: {
    notes: string;
    image?: string;
    freeHelpProvided?: boolean;
    completedAt: any;
  };
  createdAt: any;
  updatedAt: any;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  pointsEarned: number;
  timestamp: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': any;
    }
  }
}
