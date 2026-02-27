/**
 * Type definitions for NextDNS Skills rules
 */

export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type RuleType = 'capability' | 'efficiency';

export interface CodeExample {
  label: string; // e.g., "Incorrect", "Correct", "Example"
  description?: string; // Optional description before code
  code: string;
  language?: string; // Default: 'bash' or 'typescript'
  additionalText?: string; // Optional text after code block (explanations, reasons)
}

export interface Rule {
  id: string; // e.g., "1.1", "2.3"
  title: string;
  section: number; // Main section number
  subsection?: number; // Subsection number within section
  type?: RuleType; // capability or efficiency
  impact: ImpactLevel;
  impactDescription?: string; // e.g., "Authenticate all API requests"
  explanation: string;
  examples: CodeExample[];
  references?: string[]; // URLs or citations
  tags?: string[]; // For categorization/search
}

export interface Section {
  number: number;
  title: string;
  impact: ImpactLevel;
  impactDescription?: string;
  introduction?: string;
  rules: Rule[];
}

export interface GuidelinesDocument {
  version: string;
  organization: string;
  date: string;
  abstract: string;
  sections: Section[];
  references?: string[];
}

export interface TestCase {
  ruleId: string;
  ruleTitle: string;
  type: 'bad' | 'good';
  code: string;
  language: string;
  description?: string;
}
