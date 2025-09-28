import { substitutionMatrices } from "./matrices";

export interface Cell {
	score: number;
	prev: Array<{ i: number; j: number; isOptimal?: boolean }> | null;
}

export type DPTable = Cell[][];

export interface AlignmentResult {
	alignments: string[];
	dpTable: DPTable;
}

const getScore = (seq1: string, seq2: string, i: number, j: number, matchScore: number, mismatchScore: number, substitutionMatrix: string) => {
	if (substitutionMatrix !== "none") {
		const matrix = substitutionMatrices[substitutionMatrix];
		const char1 = seq1[i - 1].toUpperCase();
		const char2 = seq2[j - 1].toUpperCase();
		if (matrix && matrix[char1] && matrix[char1][char2] !== undefined) {
			return matrix[char1][char2];
		}
	}
	return seq1[i - 1] === seq2[j - 1] ? matchScore : mismatchScore;
};

export const needlemanWunsch = (seq1: string, seq2: string, matchScore: number, mismatchScore: number, gapPenalty: number, substitutionMatrix: string): AlignmentResult => {
	const n = seq1.length;
	const m = seq2.length;

	const dpTable: DPTable = Array(n + 1)
		.fill(null)
		.map(() =>
			Array(m + 1)
				.fill(null)
				.map(() => ({ score: 0, prev: null }))
		);

	for (let i = 0; i <= n; i++) {
		dpTable[i][0] = { score: i * gapPenalty, prev: i > 0 ? [{ i: i - 1, j: 0 }] : null };
	}

	for (let j = 0; j <= m; j++) {
		dpTable[0][j] = { score: j * gapPenalty, prev: j > 0 ? [{ i: 0, j: j - 1 }] : null };
	}

	for (let i = 1; i <= n; i++) {
		for (let j = 1; j <= m; j++) {
			const score = getScore(seq1, seq2, i, j, matchScore, mismatchScore, substitutionMatrix);
			const match = dpTable[i - 1][j - 1].score + score;
			const del = dpTable[i - 1][j].score + gapPenalty;
			const insert = dpTable[i][j - 1].score + gapPenalty;

			const maxScore = Math.max(match, del, insert);
			dpTable[i][j].score = maxScore;
			dpTable[i][j].prev = [];

			if (maxScore === match) {
				dpTable[i][j].prev?.push({ i: i - 1, j: j - 1 });
			}
			if (maxScore === del) {
				dpTable[i][j].prev?.push({ i: i - 1, j: j });
			}
			if (maxScore === insert) {
				dpTable[i][j].prev?.push({ i: i, j: j - 1 });
			}
		}
	}

	const alignments: string[] = [];
	const traceback = (i: number, j: number, alignedSeq1: string, alignedSeq2: string): boolean => {
		if (i === 0 && j === 0) {
			alignments.push(`${alignedSeq1}\n${alignedSeq2}`);
			return true;
		}

		const prevCells = dpTable[i][j].prev;
		let foundPath = false;
		if (prevCells) {
			for (const prevCell of prevCells) {
				let currentPathLeadsToSolution = false;
				if (prevCell.i === i - 1 && prevCell.j === j - 1) {
					currentPathLeadsToSolution = traceback(i - 1, j - 1, seq1[i - 1] + alignedSeq1, seq2[j - 1] + alignedSeq2);
				} else if (prevCell.i === i - 1 && prevCell.j === j) {
					currentPathLeadsToSolution = traceback(i - 1, j, seq1[i - 1] + alignedSeq1, "-" + alignedSeq2);
				} else if (prevCell.i === i && prevCell.j === j - 1) {
					currentPathLeadsToSolution = traceback(i, j - 1, "-" + alignedSeq1, seq2[j - 1] + alignedSeq2);
				}

				if (currentPathLeadsToSolution) {
					prevCell.isOptimal = true;
					foundPath = true;
				}
			}
		}
		return foundPath;
	};

	traceback(n, m, "", "");

	return {
		alignments: [...new Set(alignments)], // Remove duplicates
		dpTable,
	};
};

export const smithWaterman = (seq1: string, seq2: string, matchScore: number, mismatchScore: number, gapPenalty: number, substitutionMatrix: string): AlignmentResult => {
	const n = seq1.length;
	const m = seq2.length;

	const dpTable: DPTable = Array(n + 1)
		.fill(null)
		.map(() =>
			Array(m + 1)
				.fill(null)
				.map(() => ({ score: 0, prev: null }))
		);

	let maxScore = 0;
	let maxScoreCells: Array<{ i: number; j: number }> = [];

	for (let i = 1; i <= n; i++) {
		for (let j = 1; j <= m; j++) {
			const scoreValue = getScore(seq1, seq2, i, j, matchScore, mismatchScore, substitutionMatrix);
			const match = dpTable[i - 1][j - 1].score + scoreValue;
			const del = dpTable[i - 1][j].score + gapPenalty;
			const insert = dpTable[i][j - 1].score + gapPenalty;

			const score = Math.max(0, match, del, insert);
			dpTable[i][j].score = score;

			if (score > 0) {
				dpTable[i][j].prev = [];
				if (score === match) {
					dpTable[i][j].prev?.push({ i: i - 1, j: j - 1 });
				}
				if (score === del) {
					dpTable[i][j].prev?.push({ i: i - 1, j: j });
				}
				if (score === insert) {
					dpTable[i][j].prev?.push({ i: i, j: j - 1 });
				}
			}

			if (score > maxScore) {
				maxScore = score;
				maxScoreCells = [{ i, j }];
			} else if (score === maxScore) {
				maxScoreCells.push({ i, j });
			}
		}
	}

	const alignments: string[] = [];
	const traceback = (i: number, j: number, alignedSeq1: string, alignedSeq2: string): boolean => {
		if (dpTable[i][j].score === 0) {
			alignments.push(`${alignedSeq1}\n${alignedSeq2}`);
			return true;
		}

		const prevCells = dpTable[i][j].prev;
		let foundPath = false;
		if (prevCells) {
			for (const prevCell of prevCells) {
				let currentPathLeadsToSolution = false;
				if (prevCell.i === i - 1 && prevCell.j === j - 1) {
					currentPathLeadsToSolution = traceback(i - 1, j - 1, seq1[i - 1] + alignedSeq1, seq2[j - 1] + alignedSeq2);
				} else if (prevCell.i === i - 1 && prevCell.j === j) {
					currentPathLeadsToSolution = traceback(i - 1, j, seq1[i - 1] + alignedSeq1, "-" + alignedSeq2);
				} else if (prevCell.i === i && prevCell.j === j - 1) {
					currentPathLeadsToSolution = traceback(i, j - 1, "-" + alignedSeq1, seq2[j - 1] + alignedSeq2);
				}

				if (currentPathLeadsToSolution) {
					prevCell.isOptimal = true;
					foundPath = true;
				}
			}
		}
		return foundPath;
	};

	for (const cell of maxScoreCells) {
		traceback(cell.i, cell.j, "", "");
	}

	return {
		alignments: [...new Set(alignments)], // Remove duplicates
		dpTable,
	};
};
