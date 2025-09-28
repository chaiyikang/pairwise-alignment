import React from 'react';
import type { DPTable } from './alignment';
import './DPTableDisplay.css';

interface DPTableDisplayProps {
  dpTable: DPTable;
  seq1: string;
  seq2: string;
}

const DPTableDisplay: React.FC<DPTableDisplayProps> = ({ dpTable, seq1, seq2 }) => {
  return (
    <div className="dp-table-container">
      <table className="dp-table">
        <thead>
          <tr>
            <th></th>
            <th></th>
            {seq2.split('').map((char, index) => (
              <th key={index}>{char}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dpTable.map((row, i) => (
            <tr key={i}>
              <th>{i > 0 ? seq1[i - 1] : ''}</th>
              {row.map((cell, j) => (
                <td key={j}>
                  <div className="cell-content">
                    <span className="score">{cell.score}</span>
                    {cell.prev && (
                      <svg className="arrow-svg">
                        {cell.prev.map((p, index) => {
                          const dx = j - p.j;
                          const dy = i - p.i;
                          const className = p.isOptimal ? "arrow optimal" : "arrow";
                          if (dx === 1 && dy === 1) {
                            return <line key={index} x1="50%" y1="50%" x2="-50%" y2="-50%" className={className} />;
                          }
                          if (dx === 0 && dy === 1) {
                            return <line key={index} x1="50%" y1="50%" x2="50%" y2="-50%" className={className} />;
                          }
                          if (dx === 1 && dy === 0) {
                            return <line key={index} x1="50%" y1="50%" x2="-50%" y2="50%" className={className} />;
                          }
                          return null;
                        })}
                      </svg>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DPTableDisplay;
