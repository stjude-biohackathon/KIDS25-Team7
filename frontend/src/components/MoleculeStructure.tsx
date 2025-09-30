import React, { useRef, useEffect, useState } from "react";
import { isEmpty } from "lodash";
import type { JSMol, RDKitModule } from "@rdkit/rdkit";

interface MoleculeDetails {
  width: number;
  height: number;
  bondLineWidth: number;
  addStereoAnnotation: boolean;
  atoms?: number[];
  bonds?: number[];
  [key: string]: unknown;
}

interface SubstructMatch {
  atoms: number[];
  bonds: number[];
}

export interface MoleculeStructureProps {
  id: string;
  molName?: string;
  rdkit: RDKitModule | null;
  error: boolean;
  className?: string;
  svgMode?: boolean;
  width?: number;
  height?: number;
  structure: string;
  rdkMol?: JSMol;
  subStructure?: string;
  extraDetails?: Partial<MoleculeDetails>;
  drawingDelay?: number;
}

const defaultProps: Required<Pick<MoleculeStructureProps, 'subStructure' | 'className' | 'width' | 'height' | 'svgMode' | 'extraDetails'>> = {
  subStructure: "",
  className: "",
  width: 250,
  height: 200,
  svgMode: false,
  extraDetails: {},
};

const MoleculeStructure: React.FC<MoleculeStructureProps> = (props) => {
  const {
    id,
    molName,
    rdkit,
    error,
    className,
    svgMode,
    width,
    height,
    structure,
    rdkMol,
    subStructure,
    extraDetails,
    drawingDelay,
  } = { ...defaultProps, ...props };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svg, setSvg] = useState<string>("");

  const MOL_DETAILS: MoleculeDetails = {
    width,
    height,
    bondLineWidth: 1,
    addStereoAnnotation: true,
    ...extraDetails,
  };

  const isValidMol = (mol: JSMol | null): mol is JSMol => {
    return mol !== null;
  };

  const getMolDetails = (mol: JSMol, qmol: JSMol | null): string => {
    if (isValidMol(mol) && isValidMol(qmol)) {
      try {
        const subStructHighlightDetails: SubstructMatch[] = JSON.parse(
          mol.get_substruct_matches(qmol)
        );

        const subStructHighlightDetailsMerged: Partial<SubstructMatch> = !isEmpty(
          subStructHighlightDetails
        )
          ? subStructHighlightDetails.reduce(
              (acc: SubstructMatch, { atoms, bonds }: SubstructMatch): SubstructMatch => ({
                atoms: [...acc.atoms, ...atoms],
                bonds: [...acc.bonds, ...bonds],
              }),
              { bonds: [], atoms: [] }
            )
          : {};

        return JSON.stringify({
          ...MOL_DETAILS,
          ...subStructHighlightDetailsMerged,
        });
      } catch (parseError) {
        console.warn('Failed to parse substructure matches:', parseError);
        return JSON.stringify(MOL_DETAILS);
      }
    } else {
      return JSON.stringify(MOL_DETAILS);
    }
  };

  useEffect(() => {
    if (!rdkit || error) return;

    const draw = (): void => {
      const mol = (rdkMol ? rdkMol : rdkit.get_mol(structure || "invalid"));
      const qmol = rdkit.get_qmol(subStructure || "invalid");
      const valid = isValidMol(mol);

      try {
        if (svgMode && valid) {
          const svgStr = mol.get_svg_with_highlights(getMolDetails(mol, qmol));
          setSvg(svgStr);
        } else if (valid && canvasRef.current) {
          mol.draw_to_canvas_with_highlights(
            canvasRef.current,
            getMolDetails(mol, qmol)
          );
        }
      } catch (drawError) {
        console.error('Failed to draw molecule:', drawError);
      } finally {
        // Clean up resources
        mol?.delete();
        qmol?.delete();
      }
    };

    if (drawingDelay && drawingDelay > 0) {
      const timeout = setTimeout(draw, drawingDelay);
      return () => clearTimeout(timeout);
    } else {
      draw();
    }
  }, [
    rdkit,
    error,
    structure,
    rdkMol,
    subStructure,
    svgMode,
    width,
    height,
    JSON.stringify(extraDetails),
    drawingDelay,
  ]);

  if (error) {
    return <span role="alert">Error loading renderer.</span>;
  }

  if (!rdkit) {
    return <span>Loading renderer...</span>;
  }

  const mol = (rdkMol ? rdkMol : rdkit.get_mol(structure || "invalid"));
  const valid = isValidMol(mol);
  mol?.delete();

  if (!valid) {
    return (
      <span
        title={`Cannot render structure: ${structure}`}
        role="alert"
      >
        Render Error.
      </span>
    );
  }

  if (svgMode) {
    return (
      <div
        title={molName ? molName: structure}
        className={`molecule-structure-svg ${className}`}
        style={{ width, height }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <div className={`molecule-canvas-container ${className}`}>
      <canvas
        ref={canvasRef}
        title={molName ? molName: structure}
        id={id}
        width={width}
        height={height}
      />
    </div>
  );
};

export default MoleculeStructure;