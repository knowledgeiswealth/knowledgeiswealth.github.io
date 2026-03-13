const inputs = {
  vehicleHeight: document.getElementById("vehicleHeight"),
  mastRise: document.getElementById("mastRise"),
  lidarHeight: document.getElementById("lidarHeight"),
  cameraHeight: document.getElementById("cameraHeight"),
  tilt: document.getElementById("tilt"),
  buildingOffset: document.getElementById("buildingOffset"),
  targetHeight: document.getElementById("targetHeight"),
  roadWidth: document.getElementById("roadWidth"),
};

const outputs = {
  rigHeightMetric: document.getElementById("rigHeightMetric"),
  heightMessage: document.getElementById("heightMessage"),
  groundHitMetric: document.getElementById("groundHitMetric"),
  facadeWindowMetric: document.getElementById("facadeWindowMetric"),
  cameraRangeMetric: document.getElementById("cameraRangeMetric"),
  cameraMessage: document.getElementById("cameraMessage"),
  lidarInsights: document.getElementById("lidarInsights"),
  roadInsights: document.getElementById("roadInsights"),
  roofDimLabel: document.getElementById("roofDimLabel"),
  targetDimLabel: document.getElementById("targetDimLabel"),
};

const svg = {
  buildingRect: document.getElementById("buildingRect"),
  buildingWindows: document.getElementById("buildingWindows"),
  facadeLabel: document.getElementById("facadeLabel"),
  beamUpper: document.getElementById("beamUpper"),
  beamLower: document.getElementById("beamLower"),
  centerBeam: document.getElementById("centerBeam"),
  lidarTick: document.getElementById("lidarTick"),
  cameraTick: document.getElementById("cameraTick"),
  lidarHeightLabel: document.getElementById("lidarHeightLabel"),
  cameraHeightLabel: document.getElementById("cameraHeightLabel"),
  offsetLine: document.getElementById("offsetLine"),
  offsetLabel: document.getElementById("offsetLabel"),
  lidarLeft: document.getElementById("lidarLeft"),
  lidarRight: document.getElementById("lidarRight"),
  cameraPod: document.getElementById("cameraPod"),
  mastBody: document.getElementById("mastBody"),
  truckBody: document.getElementById("truckBody"),
  truckCab: document.getElementById("truckCab"),
  truckWindow: document.getElementById("truckWindow"),
  truckBed: document.getElementById("truckBed"),
  rigDeck: document.getElementById("rigDeck"),
  towerLeftFront: document.getElementById("towerLeftFront"),
  towerLeftRear: document.getElementById("towerLeftRear"),
  towerRightFront: document.getElementById("towerRightFront"),
  towerRightRear: document.getElementById("towerRightRear"),
  rigRailLeft: document.getElementById("rigRailLeft"),
  rigRailRight: document.getElementById("rigRailRight"),
  wheelFrontOuter: document.getElementById("wheelFrontOuter"),
  wheelFrontInner: document.getElementById("wheelFrontInner"),
  wheelRearOuter: document.getElementById("wheelRearOuter"),
  wheelRearInner: document.getElementById("wheelRearInner"),
  truckLabel: document.getElementById("truckLabel"),
  lidarLeftLabel: document.getElementById("lidarLeftLabel"),
  lidarRightLabel: document.getElementById("lidarRightLabel"),
  cameraPodLabel: document.getElementById("cameraPodLabel"),
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const toRad = (degrees) => degrees * Math.PI / 180;
const fmt = (value, digits = 1) => `${value.toFixed(digits)} m`;

function verticalHit(height, offset, angleDeg) {
  return height + Math.tan(toRad(angleDeg)) * offset;
}

function setList(node, items) {
  node.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function updateVisuals(state) {
  const originX = 500;
  const groundY = 620;
  const scaleX = clamp(620 / Math.max(state.buildingOffset, 8), 16, 54);
  const scaleY = 116;
  const buildingX = originX + state.buildingOffset * scaleX;
  const lidarY = groundY - state.lidarHeight * scaleY;
  const cameraY = groundY - state.cameraHeight * scaleY;
  const roofY = groundY - state.vehicleHeight * scaleY;
  const mastTopY = groundY - (state.vehicleHeight + state.mastRise) * scaleY;
  const buildingHeightPx = clamp(state.targetHeight * scaleY, 180, 460);

  svg.buildingRect.setAttribute("x", String(buildingX));
  svg.buildingRect.setAttribute("y", String(groundY - buildingHeightPx));
  svg.buildingRect.setAttribute("height", String(buildingHeightPx));
  svg.buildingWindows.setAttribute("transform", `translate(${buildingX + 18} ${groundY - buildingHeightPx + 26})`);
  svg.facadeLabel.setAttribute("x", String(buildingX));
  svg.facadeLabel.setAttribute("y", String(groundY - buildingHeightPx - 10));

  svg.lidarTick.setAttribute("y1", String(lidarY));
  svg.lidarTick.setAttribute("y2", String(lidarY));
  svg.cameraTick.setAttribute("y1", String(cameraY));
  svg.cameraTick.setAttribute("y2", String(cameraY));
  svg.lidarHeightLabel.setAttribute("y", String(lidarY + 4));
  svg.cameraHeightLabel.setAttribute("y", String(cameraY + 4));
  svg.lidarHeightLabel.textContent = `LiDAR ${state.lidarHeight.toFixed(2)} m`;
  svg.cameraHeightLabel.textContent = `Camera ${state.cameraHeight.toFixed(2)} m`;

  svg.offsetLine.setAttribute("x1", String(originX));
  svg.offsetLine.setAttribute("x2", String(buildingX));
  svg.offsetLabel.setAttribute("x", String((originX + buildingX) / 2 - 48));
  svg.offsetLabel.textContent = `Offset ${state.buildingOffset.toFixed(1)} m`;

  const upperAngle = 15 - state.tilt;
  const lowerAngle = -15 - state.tilt;
  const centerAngle = -state.tilt;
  const upperY = clamp(groundY - verticalHit(state.lidarHeight, state.buildingOffset, upperAngle) * scaleY, 40, groundY);
  const lowerY = clamp(groundY - verticalHit(state.lidarHeight, state.buildingOffset, lowerAngle) * scaleY, 40, groundY);
  const centerY = clamp(groundY - verticalHit(state.lidarHeight, state.buildingOffset, centerAngle) * scaleY, 40, groundY);

  const spread = 18;
  svg.beamUpper.setAttribute(
    "d",
    `M ${originX} ${lidarY - spread} L ${buildingX} ${upperY} L ${buildingX} ${centerY} L ${originX} ${lidarY}`
  );
  svg.beamLower.setAttribute(
    "d",
    `M ${originX} ${lidarY} L ${buildingX} ${centerY} L ${buildingX} ${lowerY} L ${originX} ${lidarY + spread}`
  );
  svg.centerBeam.setAttribute("x1", String(originX));
  svg.centerBeam.setAttribute("y1", String(lidarY));
  svg.centerBeam.setAttribute("x2", String(buildingX));
  svg.centerBeam.setAttribute("y2", String(centerY));

  svg.mastBody.setAttribute("y", String(mastTopY));
  svg.mastBody.setAttribute("height", String(Math.max(40, 498 - mastTopY)));
  svg.cameraPod.setAttribute("y", String(cameraY - 18));
  svg.cameraPodLabel.setAttribute("x", String(544));
  svg.cameraPodLabel.setAttribute("y", String(cameraY + 4));
  svg.lidarLeft.setAttribute("y", String(lidarY - 12));
  svg.lidarRight.setAttribute("y", String(lidarY - 12));
  svg.lidarLeftLabel.setAttribute("y", String(lidarY - 18));
  svg.lidarRightLabel.setAttribute("y", String(lidarY - 18));

  const rotation = -state.tilt;
  svg.lidarLeft.setAttribute("transform", `rotate(${rotation} 380 ${lidarY})`);
  svg.lidarRight.setAttribute("transform", `rotate(${rotation} 620 ${lidarY})`);

  const bodyY = roofY + 292;
  const cabY = roofY + 190;
  const deckY = roofY + 272;
  const towerY = roofY + 124;
  const towerHeight = bodyY - towerY;
  const wheelY = roofY + 388;

  svg.truckBody.setAttribute("y", String(bodyY));
  svg.truckCab.setAttribute("y", String(cabY));
  svg.truckWindow.setAttribute("y", String(cabY + 14));
  svg.truckBed.setAttribute("y", String(cabY + 14));
  svg.rigDeck.setAttribute("y", String(deckY));
  svg.towerLeftFront.setAttribute("y", String(towerY));
  svg.towerLeftRear.setAttribute("y", String(towerY));
  svg.towerRightFront.setAttribute("y", String(towerY));
  svg.towerRightRear.setAttribute("y", String(towerY));
  svg.towerLeftFront.setAttribute("height", String(towerHeight));
  svg.towerLeftRear.setAttribute("height", String(towerHeight));
  svg.towerRightFront.setAttribute("height", String(towerHeight));
  svg.towerRightRear.setAttribute("height", String(towerHeight));
  svg.rigRailLeft.setAttribute("y", String(roofY + 152));
  svg.rigRailRight.setAttribute("y", String(roofY + 190));
  svg.wheelFrontOuter.setAttribute("cy", String(wheelY));
  svg.wheelFrontInner.setAttribute("cy", String(wheelY));
  svg.wheelRearOuter.setAttribute("cy", String(wheelY));
  svg.wheelRearInner.setAttribute("cy", String(wheelY));
  svg.truckLabel.setAttribute("y", String(roofY + 92));
  outputs.roofDimLabel.textContent = `${state.vehicleHeight.toFixed(2)} m`;
  outputs.targetDimLabel.textContent = `${state.targetHeight.toFixed(1)} m`;
}

function calculate() {
  const state = Object.fromEntries(
    Object.entries(inputs).map(([key, node]) => [key, Number.parseFloat(node.value)])
  );

  state.tilt = clamp(state.tilt, -15, 15);

  const totalRigHeight = Math.max(state.vehicleHeight + state.mastRise, state.cameraHeight, state.lidarHeight);
  const bottomBeamAngle = -15 - state.tilt;
  const topBeamAngle = 15 - state.tilt;
  const centerAngle = -state.tilt;
  const nearGroundHit = bottomBeamAngle < 0
    ? state.lidarHeight / Math.tan(toRad(Math.abs(bottomBeamAngle)))
    : Number.POSITIVE_INFINITY;
  const a = verticalHit(state.lidarHeight, state.buildingOffset, bottomBeamAngle);
  const b = verticalHit(state.lidarHeight, state.buildingOffset, topBeamAngle);
  const lowFacade = Math.max(0, Math.min(a, b));
  const highFacade = Math.max(0, Math.max(a, b));
  const targetClear = state.targetHeight >= lowFacade && state.targetHeight <= highFacade;
  const practicalLidar = state.buildingOffset <= 30 ? "10 m to 60 m" : state.buildingOffset <= 50 ? "20 m to 70 m" : "30 m to 100 m";
  const cameraBand = state.buildingOffset <= 15 ? "5 m to 30 m" : state.buildingOffset <= 30 ? "10 m to 40 m" : "20 m to 50 m";

  outputs.rigHeightMetric.textContent = fmt(totalRigHeight, 2);
  outputs.groundHitMetric.textContent = Number.isFinite(nearGroundHit) ? fmt(nearGroundHit, 1) : "No ground hit";
  outputs.facadeWindowMetric.textContent = `${fmt(lowFacade, 1)} to ${fmt(highFacade, 1)}`;
  outputs.cameraRangeMetric.textContent = cameraBand;

  if (totalRigHeight <= 2.9) {
    outputs.heightMessage.textContent = "Good operational envelope for Indian urban roads with margin for branches and low cables.";
  } else if (totalRigHeight <= 3.0) {
    outputs.heightMessage.textContent = "Usable, but the mast is getting tall for dense streets. Route checks become important.";
  } else {
    outputs.heightMessage.textContent = "High-risk height for mini-truck deployment in Indian streets. Reduce mast rise if possible.";
  }

  if (state.buildingOffset <= 15) {
    outputs.cameraMessage.textContent = "Strong visual context for facade materials, signage, stains, and surface defects.";
  } else if (state.buildingOffset <= 30) {
    outputs.cameraMessage.textContent = "Good for semantic labeling and broad facade interpretation, but not fine defect measurement.";
  } else {
    outputs.cameraMessage.textContent = "Beyond 30 m the 360 camera is mostly contextual. Depend on LiDAR for geometry.";
  }

  const lidarInsights = [
    state.tilt >= 0
      ? `At ${state.tilt.toFixed(0)}° downward tilt, the lowest beam reaches the road at about ${Number.isFinite(nearGroundHit) ? fmt(nearGroundHit, 1) : "no intersection"} from the vehicle.`
      : `At ${Math.abs(state.tilt).toFixed(0)}° upward tilt, the scan is biased toward higher facade zones and may miss the road near the truck.`,
    `At a facade offset of ${fmt(state.buildingOffset, 1)}, the VLP-16 intersects roughly ${fmt(lowFacade, 1)} to ${fmt(highFacade, 1)} in height.`,
    centerAngle > 0
      ? `The scan centerline points ${centerAngle.toFixed(0)}° upward, which helps upper floors but expands the blind zone near the vehicle.`
      : `The scan centerline points ${Math.abs(centerAngle).toFixed(0)}° downward, which favors close roadside and lower-facade capture.`,
    `For this setup, a practical building-survey LiDAR band is ${practicalLidar}, although the sensor's published maximum is 100 m.`,
    targetClear
      ? `The selected target facade height of ${fmt(state.targetHeight, 1)} sits inside the current LiDAR window.`
      : `The selected target facade height of ${fmt(state.targetHeight, 1)} is outside the current LiDAR window at this offset.`,
  ];

  const roadInsights = [
    state.roadWidth <= 6
      ? "Street width is tight. Favor 10-15 km/h and use stronger downward tilt to capture curbs and lower facades."
      : "Street width is moderate. Corridor mapping at 15-20 km/h is feasible if traffic remains controlled.",
    totalRigHeight > 2.9
      ? "The mast may clash with branches, hanging cables, or sign frames common on Indian local roads."
      : "The rig height stays in a safer practical band for Indian urban and campus routes.",
    state.buildingOffset <= 8
      ? "Close facades will be sampled densely, which helps encroachment, frontage, and as-built elevation studies."
      : "With larger facade offsets, geometry remains useful, but lower details will thin out unless speed is reduced.",
    state.tilt < 5
      ? "Low or upward tilt favors farther facades, but increases the blind zone near the truck."
      : "Mid to high downward tilt reduces the near-ground blind zone and better suits narrow Indian roadside environments.",
  ];

  setList(outputs.lidarInsights, lidarInsights);
  setList(outputs.roadInsights, roadInsights);
  updateVisuals(state);
}

Object.values(inputs).forEach((node) => {
  node.addEventListener("input", calculate);
});

calculate();
