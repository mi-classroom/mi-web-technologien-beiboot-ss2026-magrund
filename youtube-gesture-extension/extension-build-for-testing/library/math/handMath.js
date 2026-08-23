export function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z ?? 0) - (b.z ?? 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
export function isFingerExtended(landmarks, tipIndex, pipIndex) {
    const tip = landmarks[tipIndex];
    const pip = landmarks[pipIndex];
    const wrist = landmarks[0];
    if (!tip || !pip || !wrist) {
        return false;
    }
    return distance(tip, wrist) > distance(pip, wrist);
}
export function isThumbUp(landmarks) {
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const thumbMcp = landmarks[2];
    if (!thumbTip || !thumbIp || !thumbMcp) {
        return false;
    }
    return thumbTip.y < thumbIp.y && thumbIp.y < thumbMcp.y;
}
export function isThumbExtended(landmarks) {
    const thumbTip = landmarks[4];
    const thumbMcp = landmarks[2];
    const wrist = landmarks[0];
    if (!thumbTip || !thumbMcp || !wrist) {
        return false;
    }
    return distance(thumbTip, wrist) > distance(thumbMcp, wrist);
}
export function getHorizontalDirection(landmarks) {
    const indexMcp = landmarks[5];
    const middleMcp = landmarks[9];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    if (!indexMcp || !middleMcp || !indexTip || !middleTip) {
        return "";
    }
    const tipCenterX = (indexTip.x + middleTip.x) / 2;
    const baseCenterX = (indexMcp.x + middleMcp.x) / 2;
    const deltaX = tipCenterX - baseCenterX;
    if (Math.abs(deltaX) < 0.04) {
        return "";
    }
    return deltaX > 0 ? "Back" : "Forward";
}
export function areFingertipsClose(landmarks) {
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const wrist = landmarks[0];
    const middleMcp = landmarks[9];
    if (!indexTip || !middleTip || !wrist || !middleMcp) {
        return false;
    }
    const handScale = distance(wrist, middleMcp);
    return distance(indexTip, middleTip) <= handScale * 0.35;
}
export function isFingerPointingUp(landmarks, tipIndex, pipIndex) {
    const tip = landmarks[tipIndex];
    const pip = landmarks[pipIndex];
    if (!tip || !pip) {
        return false;
    }
    return tip.y < pip.y;
}
export function isFingerPointingDown(landmarks, tipIndex, pipIndex) {
    const tip = landmarks[tipIndex];
    const pip = landmarks[pipIndex];
    if (!tip || !pip) {
        return false;
    }
    return tip.y > pip.y;
}
export function segmentsIntersect(a1, a2, b1, b2) {
    const cross = (p1, p2, p3) => (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    const d1 = cross(a1, a2, b1);
    const d2 = cross(a1, a2, b2);
    const d3 = cross(b1, b2, a1);
    const d4 = cross(b1, b2, a2);
    return d1 * d2 < 0 && d3 * d4 < 0;
}
//# sourceMappingURL=handMath.js.map