export interface CompoundOld {
  id: number;
  name: string;
  smiles: string;
}

export interface Compound {
  reg_number: string;
  variant: string | null;
  structure: string;
}

export type SearchMode = 'database' | 'custom'

export interface SearchResults {
  smiles: string
  regNumber: string
  variant: string | null
  index: number
}