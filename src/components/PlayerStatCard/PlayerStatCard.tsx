import type { PlayerStatistics, PlayerFrameStatistics } from "@/features/statistics/useStatisticsHooks";
import "./PlayerStatCard.css";

interface PlayerStatCardProps {
    stats: PlayerStatistics | PlayerFrameStatistics;
}

export function PlayerStatCard({ stats }: PlayerStatCardProps) {
    const isMatchStats = "totalFouls" in stats;
    const foulCount = isMatchStats ? stats.totalFouls : stats.foulCount;

    return (
        <div className="statistics__player-card">
            <h4 className="statistics__player-name">{stats.playerName}</h4>
            <div className="statistics__player-stats">
                <div className="statistics__player-stat">
                    <span className="statistics__player-stat-label">Points</span>
                    <span className="statistics__player-stat-value">{stats.totalPoints}</span>
                </div>
                <div className="statistics__player-stat">
                    <span className="statistics__player-stat-label">Highest Break</span>
                    <span className="statistics__player-stat-value">{stats.highestBreak}</span>
                </div>
                <div className="statistics__player-stat">
                    <span className="statistics__player-stat-label">Fouls</span>
                    <span className="statistics__player-stat-value">{foulCount}</span>
                </div>
                <div className="statistics__player-stat">
                    <span className="statistics__player-stat-label">Centuries</span>
                    <span className="statistics__player-stat-value">{stats.centuryCount}</span>
                </div>
            </div>
        </div>
    );
}
