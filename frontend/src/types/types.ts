export interface CompoundVariant {
  full_variant: string;
  variant: string;
  fragments: string[];
}

export interface CompoundDetail {
  reg_internal_id: number;
  reg_number: string;
  structure: string;
  iupac_name: string;
  base_formula: string;
  base_formula_weight: number;
  variants: CompoundVariant[];
  synonyms: string[];
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