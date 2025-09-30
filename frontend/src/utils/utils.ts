import { useEffect, useState } from "react";
import type { RDKitModule, SubstructLibrary } from "@rdkit/rdkit";

export const EXAMPLE_SMILES = [
  'CC(=O)OCC[N+](C)(C)C	Acetylcholine',
  'CC(C[N+](C)(C)C)OC(=O)C	Metacholine',
  'O=C1CCCN1CC#CC[N+](C)(C)C	OxotremorineM',
  'NC(=O)OCC[N+](C)(C)C	Carbachol',
  'CC(C[N+](C)(C)C)OC(=O)N	Bethanechol',
  'Cc1ccc(o1)C[N+](C)(C)C Methylfurmethide',
  'COC(=O)C1=CCCN(C1)C Arecoline',
  'O=C1CCCN1CC#CCN1CCCC1	Oxotremorine',
  'CON=CC1=CCCN(C1)C	Milameline',
  'CN1CC(=CCC1)C(=O)OCC#C	Arecaidine-propargyl-ester',
  'CCC1C(=O)OCC1Cc1cncn1C	Pilocarpine',
  'CC(=O)OC1C[NH+]2CCC1CC2	Aceclidine',
  'C1CC(=O)NC(=O)C1N2C(=O)C3=CC=CC=C3C2=O	Thalidomide',
  'C1CC(=O)NC(=O)C1N2CC3=C(C2=O)C=CC=C3N	Lenalidomide',
  'C1=CC=C2C(=C1)C(=O)N(C2=O)CC(=O)N 	2-Phthalimidoacetamide',
  'C1CC(C(=O)NC1)N2CC3=CC=CC=C3C2=O	Phthalimidine',
  'C1CC(=O)NC(=O)C1N2CC3=C(C2=O)C=C4CNCC4=C3.Cl	WLZ4187',
  'C1CC(=O)NC(=O)C1N2C(=O)C3=C(C2=O)C(=CC=C3)N	Pomalidomide',
  'CCOC1=C(C=CC(=C1)[C@@H](CS(=O)(=O)C)N2C(=O)C3=C(C2=O)C(=CC=C3)NC(=O)C)OC	Apremilast',
  'CC1([C@@H](N2[C@H](S1)[C@@H](C2=O)NC(=O)C3=C(C=CC=C3OC)OC)C(=O)O)C	Methicillin'
]

interface MoleculeData {
  smiles: string;
  name: string | null;
  index: number;
}

export function cleanSmiles(rawSmiles: string): {smiles: string, name: string | null} {
    const trimmed = rawSmiles.trim();
    if (trimmed.includes('\t')) {
        const parts = trimmed.split('\t', 2);
        return {
            smiles: parts[0].trim(),
            name: parts[1]?.trim() || null
        };
    } else if (trimmed.includes(';')) {
        const parts = trimmed.split(';', 2);
        return {
            smiles: parts[0].trim(),
            name: parts[1]?.trim() || null
        };
    } else if (trimmed.includes(' ')) {
        const parts = trimmed.split(' ', 2);
        return {
            smiles: parts[0].trim(),
            name: parts[1]?.trim() || null
        };
    } else {
        return { smiles: trimmed, name: null };
    }
}

export const useRDKit = () => {
  const [RDKit, setRDKit] = useState<RDKitModule | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if ((window as any).RDKit) {
      setRDKit((window as any).RDKit);
    } else {
      const checkRDKit = setInterval(() => {
        if ((window as any).RDKit) {
          setRDKit((window as any).RDKit);
          clearInterval(checkRDKit);
        }
      }, 100);

      const timeout = setTimeout(() => {
        if (!(window as any).RDKit) {
          setError(true);
        }
      }, 10000);

      return () => {
        clearInterval(checkRDKit);
        clearTimeout(timeout);
      };
    }
  }, []);

  return { RDKit, error };
};

export function buildLibraryAndGetMolecules(
  RDKit: RDKitModule | null,
  smilesArray: Array<{ smiles: string, name: string | null }>
): { library: SubstructLibrary | null, molecules: MoleculeData[] } {
  if (!RDKit || smilesArray.length === 0) {
    return { library: null, molecules: [] };
  }

  try {
    const lib = new RDKit.SubstructLibrary();
    const validMolecules: MoleculeData[] = [];

    smilesArray.forEach((molData, _) => {
      if (molData.smiles && molData.smiles.length > 0) {
        try {
          const molIndex = lib.add_smiles(molData.smiles);
          if (molIndex >= 0) {
            validMolecules.push({
              smiles: molData.smiles,
              name: molData.name,
              index: molIndex
            });
          }
        } catch (e) {
          console.warn(`Failed to add SMILES ${molData.smiles}:`, e);
        }
      }
    });

    return { library: lib, molecules: validMolecules };
  } catch (e) {
    console.error('Failed to create SubstructLibrary:', e);
    return { library: null, molecules: [] };
  }
}

export function filterBySubstructure(
  RDKit: RDKitModule,
  library: SubstructLibrary,
  molecules: MoleculeData[],
  searchQuery: string
): MoleculeData[] {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return molecules;
  }

  const qmol = RDKit.get_qmol(searchQuery);
  if (!qmol) {
    return molecules;
  }

  try {
    const matchesJson = library.get_matches(qmol);
    const matchIndices: number[] = JSON.parse(matchesJson);

    return molecules.filter(mol => matchIndices.includes(mol.index));
  } catch (e) {
    console.error('Failed to get matches:', e);
    return molecules;
  } finally {
    qmol.delete();
  }
}