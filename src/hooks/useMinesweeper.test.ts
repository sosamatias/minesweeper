import { Minesweeper, Config, Position, SYMBOL_FATAL_MINE, SYMBOL_MINE } from './useMinesweeper';

test('New game', () => {
    const config = new Config({ rows: 4, columns: 4, mines: 10 });
    const minesweeper = new Minesweeper(config);
    const boardExpected = [
        ["0", "0", "0", "0"],
        ["0", "0", "0", "0"],
        ["0", "0", "0", "0"],
        ["0", "0", "0", "0"],
    ];
    const userViewExpected = [
        ["X", "X", "X", "X"],
        ["X", "X", "X", "X"],
        ["X", "X", "X", "X"],
        ["X", "X", "X", "X"],
    ];
    expect(minesweeper.board).toStrictEqual(boardExpected);
    expect(minesweeper.userView).toStrictEqual(userViewExpected);
});

test('New game not valid configurations', () => {
    const cases = [
        { rows: 0, columns: 10, mines: 10 },
        { rows: 101, columns: 10, mines: 10 },
        { rows: 10, columns: 0, mines: 10 },
        { rows: 10, columns: 101, mines: 10 },
        { rows: 10, columns: 10, mines: 0 },
        { rows: 10, columns: 10, mines: 101 },
    ];
    for (const config of cases) {
        expect(() => { new Minesweeper(config); }).toThrow(Error);
    }
});

test('Select - lose case', () => {
    const config = new Config({ rows: 4, columns: 4, mines: 1 });
    const selected = new Position({ rowIndex: 2, colIndex: 3 });
    const minesweeper = new Minesweeper(config);
    minesweeper.select(0, 0);
    minesweeper.mines.push(selected); // override random mine
    minesweeper.board = [
        ["0", "0", "0", "0"],
        ["0", "0", "1", "1"],
        ["0", "0", "1", "M"],
        ["0", "0", "1", "1"],
    ];
    minesweeper.select(selected.rowIndex, selected.colIndex);
    expect(minesweeper.win).toBeFalsy();
    expect(minesweeper.finish).not.toBeNull();
    expect(minesweeper.userView[selected.rowIndex][selected.colIndex]).toBe(SYMBOL_FATAL_MINE);
});

test('Select - win case', () => {
    const config = new Config({ rows: 4, columns: 4, mines: 1 });
    const minesweeper = new Minesweeper(config);
    minesweeper.select(0, 0);
    expect(minesweeper.win).toBeFalsy();
    // override random mines
    minesweeper.board = [
        ["0", "0", "0", "0"],
        ["0", "1", "1", "1"],
        ["0", "1", "M", "1"],
        ["0", "1", "1", "1"],
    ];
    minesweeper.userView = [
        ["0", "0", "0", "0"],
        ["0", "1", "1", "1"],
        ["0", "1", "X", "X"],
        ["0", "1", "X", "X"],
    ];
    minesweeper.mines.push(new Position({ rowIndex: 2, colIndex: 2 }));
    // select again
    minesweeper.select(3, 2);
    minesweeper.select(2, 3);
    expect(minesweeper.win).toBeFalsy();
    // finish game
    minesweeper.select(3, 3);
    expect(minesweeper.win).toBeTruthy();
    expect(minesweeper.finish).not.toBeNull();
});

test('Set mines', () => {
    const config = new Config({ rows: 8, columns: 8, mines: 10 });
    const minesweeper = new Minesweeper(config);
    const pos = new Position({ rowIndex: 1, colIndex: 2 });
    minesweeper.setMinesAvoidingSelected(pos);
    let counter = 0;
    for (const row of minesweeper.board) {
        for (const val of row) {
            if (val === SYMBOL_MINE) {
                counter++;
            }
        }
    }
    expect(counter).toBe(minesweeper.config.mines);
    expect(minesweeper.board[pos.rowIndex][pos.colIndex]).not.toBe(SYMBOL_MINE);
});

test('Calculate neighbors', () => {
    // config
    const board = [
        ["M", "0", "0"],
        ["0", "M", "0"],
        ["0", "0", "0"],
        ["0", "0", "M"],
    ];
    const mines = [
        new Position({ rowIndex: 0, colIndex: 0 }),
        new Position({ rowIndex: 1, colIndex: 1 }),
        new Position({ rowIndex: 3, colIndex: 2 }),
    ];
    const expected = [
        ["M", "2", "1"],
        ["2", "M", "1"],
        ["1", "2", "2"],
        ["0", "1", "M"],
    ];
    const config = new Config({ rows: 4, columns: 3, mines: 3 });
    const minesweeper = new Minesweeper(config);
    minesweeper.board = board;
    minesweeper.mines = mines;
    // execute
    minesweeper.calculateNeighbors();
    // assert
    expect(minesweeper.board).toStrictEqual(expected);
});

test('Reveal clues', () => {
    const testCases = [
        {
            board: [
                ["0", "0", "0", "0"],
                ["0", "1", "1", "1"],
                ["0", "1", "M", "1"],
                ["0", "1", "1", "1"],
            ],
            position: new Position({ rowIndex: 1, colIndex: 1 }),
            userViewExpected: [
                ["X", "X", "X", "X"],
                ["X", "1", "X", "X"],
                ["X", "X", "X", "X"],
                ["X", "X", "X", "X"],
            ],
        },
        {
            board: [
                ["0", "0", "0", "0"],
                ["0", "1", "1", "1"],
                ["0", "1", "M", "1"],
                ["0", "1", "1", "1"],
            ],
            position: new Position({ rowIndex: 0, colIndex: 0 }),
            userViewExpected: [
                ["0", "0", "0", "0"],
                ["0", "1", "1", "1"],
                ["0", "1", "X", "X"],
                ["0", "1", "X", "X"],
            ],
        },
        {
            board: [
                ["0", "0", "0", "0", "0", "1", "M"],
                ["0", "1", "1", "1", "0", "1", "1"],
                ["0", "1", "M", "1", "0", "0", "0"],
                ["0", "1", "1", "1", "0", "0", "0"],
                ["0", "0", "0", "0", "0", "0", "0"],
                ["0", "0", "0", "0", "0", "1", "1"],
                ["0", "0", "0", "0", "0", "1", "M"],
            ],
            position: new Position({ rowIndex: 0, colIndex: 0 }),
            userViewExpected: [
                ["0", "0", "0", "0", "0", "1", "X"],
                ["0", "1", "1", "1", "0", "1", "1"],
                ["0", "1", "X", "1", "0", "0", "0"],
                ["0", "1", "1", "1", "0", "0", "0"],
                ["0", "0", "0", "0", "0", "0", "0"],
                ["0", "0", "0", "0", "0", "1", "1"],
                ["0", "0", "0", "0", "0", "1", "X"],
            ],
        },
    ];
    for (const test of testCases) {
        // execute
        const config = new Config({ rows: test.board.length, columns: test.board[0].length, mines: 1 });
        const minesweeper = new Minesweeper(config);
        minesweeper.board = test.board;
        minesweeper.revealClues(test.position);
        // assert
        expect(minesweeper.userView).toStrictEqual(test.userViewExpected);
    }
});

test('Position', () => {
    const pos = new Position({ rowIndex: 0, colIndex: 0 });
    const board = [
        ["0", "0", "0", "0"],
        ["0", "1", "1", "1"],
        ["0", "1", "M", "1"],
        ["0", "1", "1", "1"],
    ];
    expect(pos.up()).toBeNull();
    expect(pos.upLeft(board)).toBeNull();
    expect(pos.upRight(board)).toBeNull();
    expect(pos.left(board)).toBeNull();
    expect(pos.downLeft(board)).toBeNull();
    expect(pos.right(board)?.rowIndex !== 0 || pos.right(board)?.colIndex !== 1).toBeFalsy();
    expect(pos.down(board)?.rowIndex !== 1 || pos.down(board)?.colIndex !== 0).toBeFalsy();
    expect(pos.downRight(board)?.rowIndex !== 1 || pos.downRight(board)?.colIndex !== 1).toBeFalsy();
});
