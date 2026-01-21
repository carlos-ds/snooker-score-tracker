import { Link } from "@tanstack/react-router";
import { useMatchStatistics } from "@/features/statistics/useStatisticsHooks";


import "./Statistics.css";

import { StatItem } from "@/components/StatItem/StatItem";
import { PlayerStatCard } from "@/components/PlayerStatCard/PlayerStatCard";
import { FrameStatCard } from "@/components/FrameStatCard/FrameStatCard";


function Statistics() {
    const { data: stats, isLoading } = useMatchStatistics();

    if (isLoading) {
        return (
            <div className="statistics">
                <div className="statistics__loading">Loading statistics...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="statistics">
                <div className="statistics__empty">
                    <p className="statistics__empty-text">No match data available</p>
                    <Link to="/" className="statistics__empty-link">
                        return to Start
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="statistics">
            <header className="statistics__header">
                <Link to="/" className="statistics__back-link">
                    ← Back to Start
                </Link>
                <h1 className="statistics__title">Match Statistics</h1>
            </header>

            {/* Match Statistics Section */}
            <section className="statistics__section">
                <h2 className="statistics__section-title">Match Overview</h2>

                <div className="statistics__card">
                    <h3 className="statistics__card-title">Combined Statistics</h3>
                    <div className="statistics__grid">
                        <StatItem label="Reds" value={stats.redsCount} />
                        <StatItem label="Frames" value={`${stats.framesPlayed} / ${stats.totalFramesConfigured}`} />
                        <StatItem label="Total Points" value={stats.totalPoints} />
                        <StatItem label="Balls Potted" value={stats.totalBallsPotted} />
                        <StatItem label="Highest Break" value={stats.highestBreak} />
                        <StatItem label="Centuries" value={stats.centuryCount} />
                    </div>

                    <div className="statistics__players-row">
                        <PlayerStatCard stats={stats.playerOneStats} />
                        <PlayerStatCard stats={stats.playerTwoStats} />
                    </div>
                </div>

            </section>

            {/* Frame Statistics Section */}
            <section className="statistics__section">
                <h2 className="statistics__section-title">Frame Breakdown</h2>

                {stats.frameStatistics.length === 0 ? (
                    <p className="statistics__empty-text">No frames played yet</p>
                ) : (
                    stats.frameStatistics.map((frameStat) => (
                        <FrameStatCard key={frameStat.frameId} frameStat={frameStat} />
                    ))
                )}
            </section>
        </div>
    );
}

export default Statistics;
