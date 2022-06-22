import { useState } from "react";

export default function useMinesweeper(config: Config) {
    const [game, setGame] = useState(new Minesweeper(config));
    const [render, setRender] = useState(0);
    function selectCell(rowIndex: number, colIndex: number) {
        if (game.finish === null) {
            game.select(rowIndex, colIndex);
            setGame(game);
            setRender(render + 1);
        }
    }
    return {
        game,
        selectCell,
    };
}

interface IConfig {
    rows: number;
    columns: number;
    mines: number;
}

export class Config {
    rows = 0;
    columns = 0;
    mines = 0;
    constructor(params: IConfig) {
        this.rows = params.rows;
        this.columns = params.columns;
        this.mines = params.mines;
    }
}

interface IPosition {
    rowIndex: number;
    colIndex: number;
}

export class Position {
    rowIndex = 0;
    colIndex = 0;
    constructor(params: IPosition) {
        this.rowIndex = params.rowIndex;
        this.colIndex = params.colIndex;
    }
    neighbors(board: string[][]): (Position | null)[] {
        return [
            this.up(),
            this.upLeft(board),
            this.upRight(board),
            this.down(board),
            this.downLeft(board),
            this.downRight(board),
            this.left(board),
            this.right(board),
        ];
    }
    up(): Position | null {
        if (this.upExists()) {
            return new Position({ rowIndex: this.rowIndex - 1, colIndex: this.colIndex });
        }
        return null;
    }
    upLeft(board: string[][]): Position | null {
        if (this.upExists() && this.leftExists(board)) {
            return new Position({ rowIndex: this.rowIndex - 1, colIndex: this.colIndex - 1 });
        }
        return null;
    }
    upRight(board: string[][]): Position | null {
        if (this.upExists() && this.rightExists(board)) {
            return new Position({ rowIndex: this.rowIndex - 1, colIndex: this.colIndex + 1 });
        }
        return null;
    }
    down(board: string[][]): Position | null {
        if (this.downExists(board)) {
            return new Position({ rowIndex: this.rowIndex + 1, colIndex: this.colIndex });
        }
        return null;
    }
    downLeft(board: string[][]): Position | null {
        if (this.downExists(board) && this.leftExists(board)) {
            return new Position({ rowIndex: this.rowIndex + 1, colIndex: this.colIndex - 1 });
        }
        return null;
    }
    downRight(board: string[][]): Position | null {
        if (this.downExists(board) && this.rightExists(board)) {
            return new Position({ rowIndex: this.rowIndex + 1, colIndex: this.colIndex + 1 });
        }
        return null;
    }
    left(board: string[][]): Position | null {
        if (this.leftExists(board)) {
            return new Position({ rowIndex: this.rowIndex, colIndex: this.colIndex - 1 });
        }
        return null;
    }
    right(board: string[][]): Position | null {
        if (this.rightExists(board)) {
            return new Position({ rowIndex: this.rowIndex, colIndex: this.colIndex + 1 });
        }
        return null;
    }
    upExists(): boolean {
        return this.rowIndex !== 0;
    }
    leftExists(board: string[][]): boolean {
        return this.colIndex !== 0;
    }
    rightExists(board: string[][]): boolean {
        return this.colIndex !== board[this.rowIndex].length - 1;
    }
    downExists(board: string[][]): boolean {
        return this.rowIndex !== board.length - 1;
    }
    toString(): string {
        return `row[${this.rowIndex}]:col[${this.colIndex}]`;
    }
}

export class Minesweeper {
    start: Date | null = null;
    finish: Date | null = null;
    win: boolean = false;
    userView: string[][] = [];
    board: string[][] = [];
    mines: Position[] = [];
    config: Config;
    constructor(config: Config) {
        this.checkLimits(config);
        this.config = config;
        this.win = false;
        this.board = this.makeMatrix(config.rows, config.columns, SYMBOL_NO_MINES_NEAR);
        this.userView = this.makeMatrix(config.rows, config.columns, SYMBOL_NOT_REVEALED);
    }
    select(rowIndex: number, colIndex: number) {
        const selected = new Position({ rowIndex: rowIndex, colIndex: colIndex });
        if (this.isFirstMove()) {
            this.start = new Date();
            this.setMinesAvoidingSelected(selected);
            this.calculateNeighbors();
            this.revealClues(selected);
            if (this.isWin()) {
                this.finish = new Date();
                this.win = true;
            }
            return;
        }
        if (this.isLose(selected)) {
            this.finish = new Date();
            this.revealMines(selected);
            return;
        }
        this.revealClues(selected);
        if (this.isWin()) {
            this.finish = new Date();
            this.win = true;
        }
    }
    isFirstMove(): boolean {
        return this.start === null;
    }
    isLose(selected: Position): boolean {
        return this.board[selected.rowIndex][selected.colIndex] === SYMBOL_MINE;
    }
    isWin(): boolean {
        return this.cellsNotRevealedYet() === this.config.mines;
    }
    checkLimits(config: Config): void {
        const err: string[] = [];
        if (config.columns < 1) {
            err.push("columns should be greater than 0");
        }
        if (config.rows < 1) {
            err.push("rows should be greater than 0");
        }
        if (config.mines < 1) {
            err.push("mines should be greater than 0");
        }
        if (config.columns > 100) {
            err.push("columns should not be greater than 100");
        }
        if (config.rows > 100) {
            err.push("rows should not be greater than 100");
        }
        if (config.mines > 100) {
            err.push("mines should not be greater than 100");
        }
        if (err.length !== 0) {
            throw new Error(err.join(" - "));
        }
    }
    makeMatrix(rows: number, columns: number, initValue: string): string[][] {
        const newMatrix = [];
        for (let i = 0; i < rows; i++) {
            newMatrix[i] = this.makeRow(columns, initValue);
        }
        return newMatrix;
    }
    makeRow(columns: number, initValue: string): string[] {
        const row = [];
        for (let i = 0; i < columns; i++) {
            row[i] = initValue;
        }
        return row;
    }
    setMinesAvoidingSelected(selected: Position) {
        let placedMines = 0;
        while (placedMines < this.config.mines) {
            const randomRow = Math.floor(Math.random() * this.config.rows);
            const randomCol = Math.floor(Math.random() * this.config.columns);
            const isSamePosition = randomRow === selected.rowIndex && randomCol === selected.colIndex;
            if (!isSamePosition && this.board[randomRow][randomCol] !== SYMBOL_MINE) {
                this.board[randomRow][randomCol] = SYMBOL_MINE;
                this.mines.push(new Position({ rowIndex: randomRow, colIndex: randomCol }));
                placedMines++;
            }
        }
    }
    calculateNeighbors() {
        for (const position of this.mines) {
            this.increaseNeighborsCounters(position);
        }
    }
    increaseNeighborsCounters(p: Position) {
        for (const pos of p.neighbors(this.board)) {
            this.increaseIfNotMine(pos);
        }
    }
    increaseIfNotMine(p: Position | null) {
        if (p != null) {
            const cell = this.board[p.rowIndex][p.colIndex];
            if (cell !== SYMBOL_MINE) {
                const newVal = (parseInt(cell) + 1).toString();
                this.board[p.rowIndex][p.colIndex] = newVal;
            }
        }
    }
    revealMines(selected: Position) {
        for (const minePosition of this.mines) {
            this.userView[minePosition.rowIndex][minePosition.colIndex] = SYMBOL_MINE;
        }
        this.userView[selected.rowIndex][selected.colIndex] = SYMBOL_FATAL_MINE;
    }
    showValue(selected: Position) {
        this.userView[selected.rowIndex][selected.colIndex] = this.board[selected.rowIndex][selected.colIndex];
    }
    // // revealClues shows adjacent cells free of mines if selected position has the value 0
    // // otherwise it reveals how many mines there are near.
    revealClues(selected: Position) {
        const visited: Set<string> = new Set();
        const toVisit: Position[] = [selected];
        while (toVisit.length > 0) {
            const current = toVisit[0];
            toVisit.shift(); // remove current from list toVisit
            visited.add(current.toString());
            this.showValue(current);
            if (this.board[current.rowIndex][current.colIndex] === SYMBOL_NO_MINES_NEAR) {
                for (const newPos of current.neighbors(this.board)) {
                    if (newPos != null) {
                        const wasVisited = visited.has(newPos.toString());
                        if (!wasVisited) {
                            toVisit.push(newPos);
                        }
                    }
                }
            }
        }
    }
    cellsNotRevealedYet(): number {
        let result = 0;
        for (const row of this.userView) {
            for (const value of row) {
                if (value === SYMBOL_NOT_REVEALED) {
                    result++;
                }
            }
        }
        return result;
    }
}

export const LEVEL_EASY = new Config({ rows: 9, columns: 9, mines: 10 });
export const LEVEL_MEDIUM = new Config({ rows: 16, columns: 16, mines: 40 });
export const LEVEL_HARD = new Config({ rows: 24, columns: 16, mines: 70 });
export const LEVEL_EXPERT = new Config({ rows: 30, columns: 16, mines: 99 });

export const SYMBOL_MINE = "M";
export const SYMBOL_NO_MINES_NEAR = "0";
export const SYMBOL_FATAL_MINE = "F";
export const SYMBOL_NOT_REVEALED = "X";
