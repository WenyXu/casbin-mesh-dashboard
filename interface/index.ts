export type ProcessedPolicy = {
  rawKey: string;
  rawValue: string;
  type?: string;
  value: string[];
  modified: boolean;
  editing: boolean;
  onEdit?: () => void;
};
