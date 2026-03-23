import type { MessageBlock } from "../types";

type ResponseRendererProps = {
  blocks?: MessageBlock[];
};

const ChartBlock = ({
  title,
  series
}: {
  title?: string;
  series: { label: string; value: number }[];
}) => {
  const maxValue = Math.max(...series.map((item) => item.value), 1);

  return (
    <div className="chart-block">
      {title ? <h4>{title}</h4> : null}
      <div className="chart-bars" role="img" aria-label={title || "Chart"}>
        {series.map((item) => (
          <div key={item.label} className="chart-row">
            <span className="chart-label">{item.label}</span>
            <div className="chart-track">
              <div
                className="chart-bar"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="chart-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResponseRenderer = ({ blocks }: ResponseRendererProps) => {
  if (!blocks?.length) {
    return null;
  }

  return (
    <div className="response-blocks">
      {blocks.map((block, index) => {
        if (block.type === "text") {
          return (
            <p key={`${block.type}-${index}`} className="message-paragraph">
              {block.text}
            </p>
          );
        }

        if (block.type === "code") {
          return (
            <pre key={`${block.type}-${index}`} className="code-block">
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.type === "table") {
          return (
            <div key={`${block.type}-${index}`} className="table-wrapper">
              <table className="result-table">
                <thead>
                  <tr>
                    {block.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={`${rowIndex}-${row.join("-")}`}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <ChartBlock
            key={`${block.type}-${index}`}
            title={block.title}
            series={block.series}
          />
        );
      })}
    </div>
  );
};
