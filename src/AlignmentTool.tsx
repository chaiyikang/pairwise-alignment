
import React, { useState } from 'react';
import './AlignmentTool.css';
import { needlemanWunsch, smithWaterman, type AlignmentResult, type DPTable } from './alignment';
import DPTableDisplay from './DPTableDisplay';

const AlignmentTool: React.FC = () => {
  const [seq1, setSeq1] = useState('GAATTC');
  const [seq2, setSeq2] = useState('GATTA');
  const [alignmentType, setAlignmentType] = useState('global');
  const [matchScore, setMatchScore] = useState(1);
  const [mismatchScore, setMismatchScore] = useState(-1);
  const [gapPenalty, setGapPenalty] = useState(-1);
  const [substitutionMatrix, setSubstitutionMatrix] = useState('none');
  const [result, setResult] = useState<AlignmentResult | null>(null);

  const handleAlignment = () => {
    let alignmentResult: AlignmentResult;
    if (alignmentType === 'global') {
      alignmentResult = needlemanWunsch(seq1, seq2, matchScore, mismatchScore, gapPenalty, substitutionMatrix);
    } else {
      alignmentResult = smithWaterman(seq1, seq2, matchScore, mismatchScore, gapPenalty, substitutionMatrix);
    }
    setResult(alignmentResult);
  };

  return (
    <div className="alignment-tool">
      <h1>Pairwise Sequence Alignment</h1>
      <div className="input-section">
        <textarea
          placeholder="Enter sequence 1"
          value={seq1}
          onChange={(e) => setSeq1(e.target.value)}
        />
        <textarea
          placeholder="Enter sequence 2"
          value={seq2}
          onChange={(e) => setSeq2(e.target.value)}
        />
      </div>
      <div className="parameters-section">
        <div className="alignment-type">
          <label>
            <input
              type="radio"
              value="global"
              checked={alignmentType === 'global'}
              onChange={() => setAlignmentType('global')}
            />
            Global (Needleman-Wunsch)
          </label>
          <label>
            <input
              type="radio"
              value="local"
              checked={alignmentType === 'local'}
              onChange={() => setAlignmentType('local')}
            />
            Local (Smith-Waterman)
          </label>
        </div>
        <div className="scoring-parameters">
          <label>
            Match Score:
            <input
              type="number"
              value={matchScore}
              onChange={(e) => setMatchScore(Number(e.target.value))}
              disabled={substitutionMatrix !== 'none'}
            />
          </label>
          <label>
            Mismatch Score:
            <input
              type="number"
              value={mismatchScore}
              onChange={(e) => setMismatchScore(Number(e.target.value))}
              disabled={substitutionMatrix !== 'none'}
            />
          </label>
          <label>
            Gap Penalty:
            <input
              type="number"
              value={gapPenalty}
              onChange={(e) => setGapPenalty(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="substitution-matrix">
          <label>
            Substitution Matrix:
            <select
              value={substitutionMatrix}
              onChange={(e) => setSubstitutionMatrix(e.target.value)}
            >
              <option value="none">None</option>
              <option value="BLOSUM50">BLOSUM50</option>
              <option value="BLOSUM62">BLOSUM62</option>
              <option value="PAM40">PAM40</option>
              <option value="PAM120">PAM120</option>
              <option value="PAM250">PAM250</option>
            </select>
          </label>
          {substitutionMatrix !== 'none' && (
            <p className="info-text">Using {substitutionMatrix} for scoring.</p>
          )}
        </div>
      </div>
      <button onClick={handleAlignment}>Align</button>
      <div className="results-section">
        <h2>Results</h2>
        {result && (
          <div>
            <h3>Alignments</h3>
            <pre>{result.alignments.join('\n\n')}</pre>
            <h3>DP Table</h3>
            <DPTableDisplay dpTable={result.dpTable} seq1={seq1} seq2={seq2} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AlignmentTool;

