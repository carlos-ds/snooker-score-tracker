import './Balls.css';

type BallsProps = {
  amount: number;
};

function Balls({ amount }: BallsProps) {
  const rows: number[][] = [];
  let count = 1;

  let maxRow = 1;
  while ((maxRow * (maxRow + 1)) / 2 < amount) {
    maxRow++;
  }

  for (let i = maxRow; count <= amount && i > 0; i--) {
    const row: number[] = [];
    for (let j = 0; j < i && count <= amount; j++) {
      row.push(count++);
    }
    rows.push(row);
  }

  return (
    <div className="balls">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="balls__row"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${row.length}, var(--ball-size))`,
            justifyContent: 'center',
            marginTop: rowIndex === 0 ? '0' : `calc(var(--ball-size) / -2)`, 
          }}
        >
          {row.map((ball) => (
            <span key={ball} className={`balls__ball`}></span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Balls;
