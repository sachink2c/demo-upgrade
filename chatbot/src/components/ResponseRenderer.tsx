import type { MessageBlock } from "../types";

type ResponseRendererProps = {
  blocks?: MessageBlock[];
};

const renderInlineText = (text: string) => {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);

  return segments.map((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return <strong key={`${segment}-${index}`}>{segment.slice(2, -2)}</strong>;
    }

    return segment;
  });
};

const FormattedTextBlock = ({ text }: { text: string }) => {
  const sections = text
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean);

  return (
    <>
      {sections.map((section, index) => {
        const lines = section.split("\n").map((line) => line.trim());

        if (lines.length === 1) {
          const headingMatch = lines[0].match(/^(#{1,6})\s+(.+)$/);

          if (headingMatch) {
            return (
              <h4 key={`heading-${index}`} className="formatted-heading">
                {renderInlineText(headingMatch[2])}
              </h4>
            );
          }
        }

        if (lines.every((line) => /^[-*•]\s+/.test(line))) {
          return (
            <ul key={`unordered-${index}`} className="formatted-list">
              {lines.map((line, lineIndex) => (
                <li key={`unordered-${index}-${lineIndex}`}>
                  {renderInlineText(line.replace(/^[-*•]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        if (lines.every((line) => /^\d+\.\s+/.test(line))) {
          return (
            <ol key={`ordered-${index}`} className="formatted-list formatted-list-ordered">
              {lines.map((line, lineIndex) => (
                <li key={`ordered-${index}-${lineIndex}`}>
                  {renderInlineText(line.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="message-paragraph">
            {lines.map((line, lineIndex) => (
              <span key={`line-${index}-${lineIndex}`}>
                {lineIndex > 0 ? <br /> : null}
                {renderInlineText(line)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
};

const formatChartValue = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }

  return value.toString();
};

const ChartBlock = ({
  title,
  variant = "bar",
  series
}: {
  title?: string;
  variant?: "bar" | "pie";
  series: { label: string; value: number }[];
}) => {
  if (variant === "pie") {
    const total = series.reduce((sum, item) => sum + item.value, 0) || 1;
    let currentAngle = -90;
    const palette = ["#0f766e", "#2563eb", "#14b8a6", "#f59e0b", "#ef4444"];

    const segments = series
      .map((item, index) => {
        const angle = (item.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const startX = 50 + 40 * Math.cos((Math.PI * startAngle) / 180);
        const startY = 50 + 40 * Math.sin((Math.PI * startAngle) / 180);
        const endX = 50 + 40 * Math.cos((Math.PI * endAngle) / 180);
        const endY = 50 + 40 * Math.sin((Math.PI * endAngle) / 180);
        const largeArc = angle > 180 ? 1 : 0;

        return {
          color: palette[index % palette.length],
          label: item.label,
          value: item.value,
          path: `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`
        };
      })
      .filter((segment) => segment.value > 0);

    return (
      <div className="chart-block">
        {title ? <h4>{title}</h4> : null}
        <div className="pie-chart-layout">
          <svg
            viewBox="0 0 100 100"
            className="pie-chart"
            role="img"
            aria-label={title || "Pie chart"}
          >
            {segments.map((segment) => (
              <path key={segment.label} d={segment.path} fill={segment.color} />
            ))}
          </svg>
          <div className="pie-chart-legend">
            {segments.map((segment) => (
              <div key={segment.label} className="pie-legend-row">
                <span
                  className="pie-legend-swatch"
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true"
                />
                <span className="pie-legend-label">{segment.label}</span>
                <span className="pie-legend-value">
                  {Math.round((segment.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            <span className="chart-value">{formatChartValue(item.value)}</span>
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
          return <FormattedTextBlock key={`${block.type}-${index}`} text={block.text} />;
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
            variant={block.variant}
            series={block.series}
          />
        );
      })}
    </div>
  );
};
