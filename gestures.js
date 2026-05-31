function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function isFingerExtended(landmarks, tipIndex, pipIndex) {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];
  const wrist = landmarks[0];

  return distance(tip, wrist) > distance(pip, wrist);
}

function isThumbUp(landmarks) {
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];

  return thumbTip.y < thumbIp.y && thumbIp.y < thumbMcp.y;
}

function getHorizontalDirection(landmarks) {
  const indexMcp = landmarks[5];
  const middleMcp = landmarks[9];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];

  const tipCenterX = (indexTip.x + middleTip.x) / 2;
  const baseCenterX = (indexMcp.x + middleMcp.x) / 2;
  const deltaX = tipCenterX - baseCenterX;

  if (Math.abs(deltaX) < 0.04) {
    return "";
  }

  return deltaX > 0 ? "rechts" : "links";
}

function areFingertipsClose(landmarks) {
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const handScale = distance(landmarks[0], landmarks[9]);

  return distance(indexTip, middleTip) <= handScale * 0.35;
}

function classifyHandGesture(landmarks) {
  const thumbExtended = isThumbUp(landmarks);
  const indexExtended = isFingerExtended(landmarks, 8, 6);
  const middleExtended = isFingerExtended(landmarks, 12, 10);
  const ringExtended = isFingerExtended(landmarks, 16, 14);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18);
  const fingertipsClose = areFingertipsClose(landmarks);

  if (
    thumbExtended &&
    indexExtended &&
    middleExtended &&
    fingertipsClose &&
    !ringExtended &&
    !pinkyExtended
  ) {
    return "Pistole";
  }

  return "";
}

function describeDirection(landmarks) {
  return getHorizontalDirection(landmarks);
}

export function detectHandGestures(landmarks, handLabel) {
  const gesture = classifyHandGesture(landmarks);

  if (!gesture) {
    return [];
  }

  const direction = describeDirection(landmarks);

  if (!direction) {
    return [];
  }

  const results = [];
  results.push(`${handLabel}: ${gesture} (${direction})`);

  return results;
}