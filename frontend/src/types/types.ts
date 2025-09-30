export interface CompoundOld {
  id: number;
  name: string;
  smiles: string;
}

export interface Compound {
  reg_number: string;
  variant: string | null;
  smiles: string;
}