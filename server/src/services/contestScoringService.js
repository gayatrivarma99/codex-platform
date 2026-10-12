/**
 * Calculates contest participant score and penalty based on problem submissions.
 * Follows standard competitive programming rules:
 * - Solved problem grants problem points.
 * - Penalty is minutes from start to accepted submission + 20 minutes per failed attempt prior to accepted.
 */
function calculateParticipantScore(contestStartTime, submissions = []) {
  let totalScore = 0;
  let totalPenalty = 0;
  const startTime = new Date(contestStartTime).getTime();

  for (const sub of submissions) {
    if (sub.status === 'Accepted') {
      totalScore += sub.points || 0;
      const solvedTimeMs = new Date(sub.solvedAt || Date.now()).getTime();
      const minutesFromStart = Math.max(0, Math.floor((solvedTimeMs - startTime) / 60000));
      const penaltyTime = minutesFromStart + (sub.attempts || 0) * 20;
      totalPenalty += penaltyTime;
    }
  }

  return { totalScore, totalPenalty };
}

module.exports = { calculateParticipantScore };
