import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/constants";
import { useLatestGame } from "@/features/game/useGameHooks";
import { useGameFrames } from "@/features/frame/useFrameHooks";
import { usePlayers } from "@/features/player/usePlayerHooks";
import { getShotsByFrame } from "@/features/shot/operations";
import type { Shot } from "@/types";



export interface PlayerStatistics {
    playerId: number;
    playerName: string;
    totalPoints: number;
    highestBreak: number;
    totalFouls: number;
    centuryCount: number;
}

export interface FrameStatistics {
    frameNumber: number;
    frameId: number;
    totalPoints: number;
    totalBallsPotted: number;
    highestBreak: number;
    playerOneStats: PlayerFrameStatistics;
    playerTwoStats: PlayerFrameStatistics;
}

export interface PlayerFrameStatistics {
    playerId: number;
    playerName: string;
    totalPoints: number;
    highestBreak: number;
    foulCount: number;
    centuryCount: number;
}

export interface MatchStatistics {
    totalPoints: number;
    totalBallsPotted: number;
    highestBreak: number;
    centuryCount: number;
    playerOneStats: PlayerStatistics;
    playerTwoStats: PlayerStatistics;
    frameStatistics: FrameStatistics[];
    redsCount: number;
    totalFramesConfigured: number;
    framesPlayed: number;
}




function calculateBreaksForPlayer(shots: Shot[], playerId: number): number[] {
    const breaks: number[] = [];
    let currentBreak = 0;

    for (const shot of shots) {
        if (shot.playerId === playerId && !shot.isFoul) {
            currentBreak += shot.points;
        } else if (shot.playerId === playerId && shot.isFoul) {
            if (currentBreak > 0) {
                breaks.push(currentBreak);
                currentBreak = 0;
            }
        } else if (shot.playerId !== playerId) {
            if (currentBreak > 0) {
                breaks.push(currentBreak);
                currentBreak = 0;
            }
        }
    }

    if (currentBreak > 0) {
        breaks.push(currentBreak);
    }

    return breaks;
}


function getHighestBreak(breaks: number[]): number {
    return breaks.length > 0 ? Math.max(...breaks) : 0;
}


function countCenturies(breaks: number[]): number {
    return breaks.filter((b) => b >= 100).length;
}


function countFouls(shots: Shot[], playerId: number): number {
    return shots.filter((shot) => shot.playerId === playerId && shot.isFoul).length;
}


function countBallsPotted(shots: Shot[]): number {
    return shots.filter((shot) => !shot.isFoul).length;
}


export function useMatchStatistics() {
    const { data: latestGame, isLoading: isGameLoading } = useLatestGame();
    const { data: frames, isLoading: isFramesLoading } = useGameFrames(latestGame?.id);
    const { data: players, isLoading: isPlayersLoading } = usePlayers();

    return useQuery({
        queryKey: [...QUERY_KEYS.SHOTS, "statistics", latestGame?.id],
        queryFn: async (): Promise<MatchStatistics | null> => {
            if (!latestGame || !frames || frames.length === 0 || !players) {
                return null;
            }

            const playerOne = players.find((p) => p.id === latestGame.playerOneId);
            const playerTwo = players.find((p) => p.id === latestGame.playerTwoId);

            if (!playerOne || !playerTwo) {
                return null;
            }


            const framesShotsMap = new Map<number, Shot[]>();
            for (const frame of frames) {
                if (frame.id) {
                    const shots = await getShotsByFrame(frame.id);
                    framesShotsMap.set(frame.id, shots);
                }
            }


            const frameStatistics: FrameStatistics[] = frames
                .filter((frame) => frame.id !== undefined)
                .sort((a, b) => a.frameNumber - b.frameNumber)
                .map((frame) => {
                    const shots = framesShotsMap.get(frame.id!) || [];

                    const playerOneBreaks = calculateBreaksForPlayer(shots, playerOne.id!);
                    const playerTwoBreaks = calculateBreaksForPlayer(shots, playerTwo.id!);

                    const playerOneHighest = getHighestBreak(playerOneBreaks);
                    const playerTwoHighest = getHighestBreak(playerTwoBreaks);

                    return {
                        frameNumber: frame.frameNumber,
                        frameId: frame.id!,
                        totalPoints: frame.playerOneScore + frame.playerTwoScore,
                        totalBallsPotted: countBallsPotted(shots),
                        highestBreak: Math.max(playerOneHighest, playerTwoHighest),
                        playerOneStats: {
                            playerId: playerOne.id!,
                            playerName: playerOne.name,
                            totalPoints: frame.playerOneScore,
                            highestBreak: playerOneHighest,
                            foulCount: countFouls(shots, playerOne.id!),
                            centuryCount: countCenturies(playerOneBreaks),
                        },
                        playerTwoStats: {
                            playerId: playerTwo.id!,
                            playerName: playerTwo.name,
                            totalPoints: frame.playerTwoScore,
                            highestBreak: playerTwoHighest,
                            foulCount: countFouls(shots, playerTwo.id!),
                            centuryCount: countCenturies(playerTwoBreaks),
                        },
                    };
                });


            let matchTotalPoints = 0;
            let matchTotalBallsPotted = 0;
            let matchHighestBreak = 0;
            let matchCenturyCount = 0;

            let playerOneTotalPoints = 0;
            let playerOneHighestBreak = 0;
            let playerOneTotalFouls = 0;
            let playerOneCenturies = 0;

            let playerTwoTotalPoints = 0;
            let playerTwoHighestBreak = 0;
            let playerTwoTotalFouls = 0;
            let playerTwoCenturies = 0;

            for (const frameStat of frameStatistics) {
                matchTotalPoints += frameStat.totalPoints;
                matchTotalBallsPotted += frameStat.totalBallsPotted;
                matchHighestBreak = Math.max(matchHighestBreak, frameStat.highestBreak);
                matchCenturyCount += frameStat.playerOneStats.centuryCount + frameStat.playerTwoStats.centuryCount;

                playerOneTotalPoints += frameStat.playerOneStats.totalPoints;
                playerOneHighestBreak = Math.max(playerOneHighestBreak, frameStat.playerOneStats.highestBreak);
                playerOneTotalFouls += frameStat.playerOneStats.foulCount;
                playerOneCenturies += frameStat.playerOneStats.centuryCount;

                playerTwoTotalPoints += frameStat.playerTwoStats.totalPoints;
                playerTwoHighestBreak = Math.max(playerTwoHighestBreak, frameStat.playerTwoStats.highestBreak);
                playerTwoTotalFouls += frameStat.playerTwoStats.foulCount;
                playerTwoCenturies += frameStat.playerTwoStats.centuryCount;
            }

            return {
                totalPoints: matchTotalPoints,
                totalBallsPotted: matchTotalBallsPotted,
                highestBreak: matchHighestBreak,
                centuryCount: matchCenturyCount,
                playerOneStats: {
                    playerId: playerOne.id!,
                    playerName: playerOne.name,
                    totalPoints: playerOneTotalPoints,
                    highestBreak: playerOneHighestBreak,
                    totalFouls: playerOneTotalFouls,
                    centuryCount: playerOneCenturies,
                },
                playerTwoStats: {
                    playerId: playerTwo.id!,
                    playerName: playerTwo.name,
                    totalPoints: playerTwoTotalPoints,
                    highestBreak: playerTwoHighestBreak,
                    totalFouls: playerTwoTotalFouls,
                    centuryCount: playerTwoCenturies,
                },
                frameStatistics,
                redsCount: latestGame.redsCount,
                totalFramesConfigured: latestGame.bestOfFrames,
                framesPlayed: frameStatistics.length,
            };
        },
        enabled: !!latestGame && !isGameLoading && !isFramesLoading && !isPlayersLoading,
    });
}
