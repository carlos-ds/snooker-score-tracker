import type { FrameStatistics } from "@/features/statistics/useStatisticsHooks";
import { PlayerStatCard } from "../PlayerStatCard/PlayerStatCard";
import "./FrameStatCard.css";

interface FrameStatCardProps {
    frameStat: FrameStatistics;
}

export function FrameStatCard({ frameStat }: FrameStatCardProps) {
    return (
        <details className="statistics__frame-card">
            <summary className="statistics__frame-header">
                <h3 className="statistics__frame-title">Frame {frameStat.frameNumber}</h3>
                <div className="statistics__frame-toggle-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </summary>

            <div className="statistics__frame-content">
                <div className="statistics__frame-overview">
                    <div className="statistics__frame-stat">
                        <div className="statistics__frame-stat-value">{frameStat.totalPoints}</div>
                        <div className="statistics__frame-stat-label">Total Points</div>
                    </div>
                    <div className="statistics__frame-stat">
                        <div className="statistics__frame-stat-value">{frameStat.totalBallsPotted}</div>
                        <div className="statistics__frame-stat-label">Balls Potted</div>
                    </div>
                    <div className="statistics__frame-stat">
                        <div className="statistics__frame-stat-value">{frameStat.highestBreak}</div>
                        <div className="statistics__frame-stat-label">Highest Break</div>
                    </div>
                </div>

                <div className="statistics__players-row">
                    <PlayerStatCard stats={frameStat.playerOneStats} />
                    <PlayerStatCard stats={frameStat.playerTwoStats} />
                </div>
            </div>
        </details>
    );
}
