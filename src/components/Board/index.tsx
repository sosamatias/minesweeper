import useMinesweeper, { LEVEL_EASY, SYMBOL_NOT_REVEALED } from '../../hooks/useMinesweeper';

export default function Board() {
    const { game, selectCell } = useMinesweeper(LEVEL_EASY);

    function btnEmoji(): string {
        if (game.finish) {
            if (game.win) {
                return "btn-emoji-win";
            }
            return "btn-emoji-lose";
        }
        return "btn-emoji";
    }

    function isDisabled(val: string) {
        return game.finish !== null || val !== SYMBOL_NOT_REVEALED;
    }

    return (
        <>
            <button className={btnEmoji()} onClick={() => window.location.reload()}></button>
            <div className="flex-table">
                {game.userView.map(function (row, rowIndex) {
                    return (
                        <div className="flex-row" key={rowIndex}>
                            {row.map(function (val, colIndex) {
                                return (
                                    <div key={`td${rowIndex}-${colIndex}`}>
                                        <button className={`btn-cell btn-${val}`} onClick={() => selectCell(rowIndex, colIndex)} disabled={isDisabled(val)}></button>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div >
        </>
    );
}
