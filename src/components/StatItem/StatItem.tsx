import "./StatItem.css";

interface StatItemProps {
    label: string;
    value: string | number;
    highlight?: boolean;
}

export function StatItem({ label, value, highlight }: StatItemProps) {
    return (
        <div className={`statistics__stat-item ${highlight ? "statistics__stat-item--highlight" : ""}`}>
            <span className="statistics__stat-label">{label}</span>
            <span className="statistics__stat-value">{value}</span>
        </div>
    );
}
