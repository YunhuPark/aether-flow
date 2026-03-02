/**
 * shapeGenerators.js
 * 
 * 각 지정된 파티클 수에 대해 형태 템플릿의 목표 좌표(positions)와 색상(colors)을 생성합니다.
 * 더 뚜렷한 식별을 위해 구조별로 다른 색상을 매핑합니다.
 */
import * as THREE from 'three';

function generateAmbient(positions, colors, startIndex, count) {
    const ambientPalette = [
        new THREE.Color(0xaaccff),
        new THREE.Color(0xddeeff),
        new THREE.Color(0xffffee)
    ];
    for (let i = 0; i < count; i++) {
        const idx = startIndex + i;
        const radius = 20 + Math.random() * 150; // 거대한 우주 공간 전체
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[idx * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[idx * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[idx * 3 + 2] = radius * Math.cos(phi);

        const c = ambientPalette[Math.floor(Math.random() * ambientPalette.length)];
        // 약간 어둡게
        colors[idx * 3] = c.r * 0.4;
        colors[idx * 3 + 1] = c.g * 0.4;
        colors[idx * 3 + 2] = c.b * 0.4;
    }
}

// ===== 기본 산개 (생동감 있는 우주 — 가까운 파티클 포함) =====
export function generateScatter(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // 화려한 컬러 팔레트
    const vividPalette = [
        new THREE.Color(0x38bdf8), // Sky Blue
        new THREE.Color(0xa78bfa), // Purple
        new THREE.Color(0x22d3ee), // Cyan
        new THREE.Color(0xf472b6), // Pink
        new THREE.Color(0xfbbf24), // Gold
        new THREE.Color(0x4ade80), // Green
        new THREE.Color(0xfb7185), // Rose
        new THREE.Color(0x818cf8), // Indigo
    ];

    const nearCount = Math.floor(count * 0.3);   // 30% 가까이 (바로 앞)
    const midCount = Math.floor(count * 0.35);    // 35% 중거리
    const farCount = count - nearCount - midCount; // 35% 원거리

    // 가까운 파티클 (눈앞에 떠다니는 느낌)
    for (let i = 0; i < nearCount; i++) {
        const radius = 3 + Math.random() * 17; // 3~20
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const c = vividPalette[Math.floor(Math.random() * vividPalette.length)];
        const brightness = 0.7 + Math.random() * 0.3; // 밝게!
        colors[i * 3] = c.r * brightness;
        colors[i * 3 + 1] = c.g * brightness;
        colors[i * 3 + 2] = c.b * brightness;
    }

    // 중거리 파티클
    for (let i = 0; i < midCount; i++) {
        const idx = nearCount + i;
        const radius = 20 + Math.random() * 40; // 20~60
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[idx * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[idx * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[idx * 3 + 2] = radius * Math.cos(phi);

        const c = vividPalette[Math.floor(Math.random() * vividPalette.length)];
        const brightness = 0.4 + Math.random() * 0.3;
        colors[idx * 3] = c.r * brightness;
        colors[idx * 3 + 1] = c.g * brightness;
        colors[idx * 3 + 2] = c.b * brightness;
    }

    // 원거리 파티클 (배경 먼지)
    for (let i = 0; i < farCount; i++) {
        const idx = nearCount + midCount + i;
        const radius = 60 + Math.random() * 100; // 60~160
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[idx * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[idx * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[idx * 3 + 2] = radius * Math.cos(phi);

        const c = vividPalette[Math.floor(Math.random() * vividPalette.length)];
        colors[idx * 3] = c.r * 0.3;
        colors[idx * 3 + 1] = c.g * 0.3;
        colors[idx * 3 + 2] = c.b * 0.3;
    }

    return { positions, colors };
}

// ===== 하트 (Volumetric Heart) - 형태 복원 및 심미성 강화 =====
export function generateHeart(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const shapeCount = Math.floor(count * 0.75);
    const ambientCount = count - shapeCount;

    const p1 = new THREE.Color(0xff0055); // Neon Red
    const p2 = new THREE.Color(0xff4d6d); // Light Pink
    const p3 = new THREE.Color(0xffb3c6); // Core Peach/White

    for (let i = 0; i < shapeCount; i++) {
        // 하트 수학 공식 고정 (원래 예뻤던 외곽선 유지)
        const t = Math.random() * Math.PI * 2;
        // 외곽에 집중하면서 내부에 입체감을 주기 위한 스케일
        const rFactor = Math.sqrt(Math.random()) * 0.5 + 0.5; // 분포도 조정

        // 하트 외곽선 유지하면서 부풀어오르는 두께(Z)
        const thicknessFactor = Math.sin((rFactor - 0.5) * 2 * Math.PI);
        const z = (Math.random() - 0.5) * 10 * Math.max(0, thicknessFactor + 0.5);

        // 오리지널 하트 공식
        const scale = 36 * rFactor;
        const x = scale * Math.pow(Math.sin(t), 3);
        const y = 2.2 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * (scale / 35.0) + 7;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        let c;
        if (Math.abs(z) > 2.5 && rFactor < 0.7) c = p3;
        else c = Math.random() > 0.4 ? p1 : p2;

        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }
    generateAmbient(positions, colors, shapeCount, ambientCount);
    return { positions, colors };
}

// ===== 완벽한 스케일과 비례의 토성 (Reference Saturn) =====
export function generateSaturn(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const shapeCount = Math.floor(count * 0.85); // 토성에 집중
    const ambientCount = count - shapeCount;

    // 본체 표면 피버나치 구면(Fibonacci Sphere)으로 빽빽하게 분배
    const planetCount = Math.floor(shapeCount * 0.45);
    const ringCount = shapeCount - planetCount;

    // 행성 띠 색상 (레퍼런스 이미지의 부드러운 베이지/주황/갈색)
    const getPlanetColor = (yNorm) => {
        const absY = Math.abs(yNorm);
        if (absY < 0.15) return new THREE.Color(0xfcd34d); // 적도 (가장 밝은 노란색)
        if (absY < 0.45) return new THREE.Color(0xd97706); // 중위도 (진한 주황)
        if (absY < 0.75) return new THREE.Color(0xb45309); // 고위도 (갈색)
        return new THREE.Color(0x92400e); // 극지방 (어두운 갈색)
    };

    // 고리 색상 (선명한 얼음/먼지색)
    const ringColA = new THREE.Color(0xd1d5db); // 옅은 회색/얼음판
    const ringColB = new THREE.Color(0x9ca3af); // 메인 고리 약간 어두운 부분

    const planetRadius = 18; // 크기 증가

    // 1. 밀도 높은 구형 본체 
    const phi = Math.PI * (3.0 - Math.sqrt(5.0)); // 황금각
    for (let i = 0; i < planetCount; i++) {
        const yNorm = 1 - (i / (planetCount - 1)) * 2; // -1 ~ 1
        const rFactor = Math.sqrt(1 - yNorm * yNorm);

        const theta = phi * i;
        const r = planetRadius + (Math.random() - 0.5); // 매끄러운 표면

        // XY 화면에 정면으로 보이도록 X-Y-Z 축 배분
        positions[i * 3] = r * Math.cos(theta) * rFactor;
        positions[i * 3 + 1] = r * yNorm * 0.9; // Y축(극) 살짝 압축
        positions[i * 3 + 2] = r * Math.sin(theta) * rFactor; // Z축 (깊이)

        const c = getPlanetColor(yNorm);
        colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }

    // 2. 납작하고 넓은 2중 고리 (Cassini Division 강조)
    const ringInnerStart = 24;
    const ringInnerEnd = 36;

    const ringOuterStart = 39; // 36~39 카시니 간극
    const ringOuterEnd = 54;

    for (let i = 0; i < ringCount; i++) {
        const idx = planetCount + i;
        let radius;
        let isInner = Math.random() < 0.65; // 안쪽 고리가 훨씬 빽빽함

        if (isInner) {
            radius = ringInnerStart + Math.random() * (ringInnerEnd - ringInnerStart);
        } else {
            radius = ringOuterStart + Math.random() * (ringOuterEnd - ringOuterStart);
        }

        const angle = Math.random() * Math.PI * 2;

        // 고리 기울기 각도 (레퍼런스 이미지처럼 화면상으로 살짝 기울어져 보이게 세팅)
        const tiltAngleX = Math.PI * 0.15; // 앞으로 비스듬히 기울임 
        const tiltAngleZ = Math.PI * -0.05; // 옆으로 아주 살짝 틀어줌

        // 평면 원(XZ) 계산 후 회전 행렬 적용
        let x0 = Math.cos(angle) * radius;
        let y0 = (Math.random() - 0.5) * 0.4; // 고리는 종잇장처럼 완벽히 얇게
        let z0 = Math.sin(angle) * radius;

        // X축 회전
        let x1 = x0;
        let y1 = y0 * Math.cos(tiltAngleX) - z0 * Math.sin(tiltAngleX);
        let z1 = y0 * Math.sin(tiltAngleX) + z0 * Math.cos(tiltAngleX);

        // Z축 회전
        let x2 = x1 * Math.cos(tiltAngleZ) - y1 * Math.sin(tiltAngleZ);
        let y2 = x1 * Math.sin(tiltAngleZ) + y1 * Math.cos(tiltAngleZ);
        let z2 = z1;

        positions[idx * 3] = x2;
        positions[idx * 3 + 1] = y2;
        positions[idx * 3 + 2] = z2;

        const c = isInner ? ringColA : ringColB;

        // 고리 가장자리는 부드럽게 페이드 아웃
        let opacity = 1.0;
        if (radius > ringInnerEnd - 2 && radius <= ringInnerEnd) opacity = 0.5;
        if (radius >= ringOuterStart && radius < ringOuterStart + 2) opacity = 0.5;
        if (radius >= ringOuterEnd - 3) opacity = 0.3;

        colors[idx * 3] = c.r * opacity;
        colors[idx * 3 + 1] = c.g * opacity;
        colors[idx * 3 + 2] = c.b * opacity;
    }
    generateAmbient(positions, colors, shapeCount, ambientCount);
    return { positions, colors };
}

// ===== 촘촘한 이중 나선 (Volumetric DNA) =====
export function generateDNA(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const shapeCount = Math.floor(count * 0.75);
    const ambientCount = count - shapeCount;

    const strandCol1 = new THREE.Color(0x06b6d4); // Cyan
    const strandCol2 = new THREE.Color(0xec4899); // Pink
    const bridgeCols = [new THREE.Color(0xfef08a), new THREE.Color(0xa78bfa), new THREE.Color(0x22c55e)]; // Yellow, Purple, Green pairs

    const height = 120; // 긴 나선
    const turns = 4.5; // 꼬이는 횟수
    const radius = 14; // 나선 반지름
    const thickness = 2.5; // 가닥의 튜브 같은 두께 볼륨

    for (let i = 0; i < shapeCount; i++) {
        // 염기쌍(브릿지) vs 코어 가닥 비율 (30%는 연결부)
        const isLink = Math.random() < 0.3;
        const yStr = (Math.random() - 0.5) * height;
        const angle = (yStr / height) * Math.PI * 2 * turns;

        if (isLink) {
            // 두 가닥 사이를 잇는 징검다리
            const linkPos = Math.random() * 2 - 1; // -1 to 1 거리 비율
            // 염기쌍 두께 (원통형으로)
            const spreadX = (Math.random() - 0.5) * 1.5;
            const spreadY = (Math.random() - 0.5) * 1.5;

            positions[i * 3] = Math.cos(angle) * (radius * linkPos) + spreadX;
            positions[i * 3 + 1] = yStr + spreadY;
            // 반대쪽 가닥은 각도가 PI 떨어져 있으므로, Z축 계산시 보간
            positions[i * 3 + 2] = Math.sin(angle) * (radius * Math.abs(linkPos));

            // 염기쌍 색깔 (단면의 위치에 따라 색상 매칭 - A:T, G:C 느낌)
            const c = linkPos > 0 ? bridgeCols[0] : bridgeCols[1];
            colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
        } else {
            // 메인 뼈대 두 가닥 (볼륨감 있는 튜브형태)
            const isStrand1 = Math.random() > 0.5;
            const strandAngle = isStrand1 ? angle : angle + Math.PI;

            // 튜브 내의 무작위 위치 (원형 분포)
            const ptAngle = Math.random() * Math.PI * 2;
            const ptRadius = Math.random() * thickness;
            const spreadX = Math.cos(ptAngle) * ptRadius;
            const spreadZ = Math.sin(ptAngle) * ptRadius;

            positions[i * 3] = Math.cos(strandAngle) * radius + spreadX;
            positions[i * 3 + 1] = yStr;
            positions[i * 3 + 2] = Math.sin(strandAngle) * radius + spreadZ;

            const c = isStrand1 ? strandCol1 : strandCol2;
            const bright = 0.5 + 0.5 * (1 - ptRadius / thickness); // 튜브 중심일수록 밝게
            colors[i * 3] = c.r * bright;
            colors[i * 3 + 1] = c.g * bright;
            colors[i * 3 + 2] = c.b * bright;
        }
    }
    generateAmbient(positions, colors, shapeCount, ambientCount);
    return { positions, colors };
}

// ===== 확실한 형태의 나선 은하 (Clear Spiral Galaxy) =====
export function generateSpiral(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const shapeCount = Math.floor(count * 0.85);
    const ambientCount = count - shapeCount;

    const arms = 4; // 더 선명한 4개의 팔
    const armCol = [new THREE.Color(0x38bdf8), new THREE.Color(0xa78bfa), new THREE.Color(0x4ade80), new THREE.Color(0xef4444)];
    const coreColInner = new THREE.Color(0xffffff);
    const coreColOuter = new THREE.Color(0xfef08a);

    for (let i = 0; i < shapeCount; i++) {
        // 코어와 팔의 분포를 명확하게 분리 (초거대 스케일 반경 90)
        let isCore = false;
        let r;
        if (Math.random() < 0.15) {
            isCore = true;
            r = Math.random() * 12; // 작고 빽빽한 코어
        } else {
            r = 12 + Math.pow(Math.random(), 1.5) * 80; // 은하 팔 영역
        }

        if (isCore) {
            // 은하 코어 (구형 타원체)
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;

            // XY 평면 중앙
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.cos(phi);
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.7; // Z 깊이 수축 (은하핵)

            const c = r < 4 ? coreColInner : coreColOuter;
            const intensity = 1.2 - (r / 12);
            colors[i * 3] = c.r * intensity;
            colors[i * 3 + 1] = c.g * intensity;
            colors[i * 3 + 2] = c.b * intensity;
        } else {
            // 선명한 나선 팔 (Winding Angle)
            const armIndex = i % arms; // 균등하게 팔에 배분
            const armOffset = (armIndex / arms) * Math.PI * 2;

            // 핵심: 소용돌이가 크고 분명하게 보이도록 돌림
            const winding = -r * 0.15;
            const angle = armOffset + winding;

            // 선명도를 위해 퍼짐도 조절
            const spreadThickness = (r / 92) * 8; // 바깥으로 갈수록 선 모양 유지하며 약간 굵어짐
            const spreadAngle = (Math.random() - 0.5) * (spreadThickness / r);
            const zDist = Math.random() - 0.5;
            // Z축 깊이감 (얇은 디스크 형태를 유지하여 위장되지 않도록)
            const zSpread = zDist * (5 + r * 0.05);

            // XY 평면(정면)에 나선 전개
            positions[i * 3] = Math.cos(angle + spreadAngle) * r;
            positions[i * 3 + 1] = Math.sin(angle + spreadAngle) * r;
            positions[i * 3 + 2] = zSpread;

            const baseCol = armCol[armIndex];
            const mixRatio = Math.max(0, 1 - (r - 12) / 25); // 코어의 황금빛이 부드럽게 팔로 번짐

            colors[i * 3] = baseCol.r * (1 - mixRatio) + coreColOuter.r * mixRatio;
            colors[i * 3 + 1] = baseCol.g * (1 - mixRatio) + coreColOuter.g * mixRatio;
            colors[i * 3 + 2] = baseCol.b * (1 - mixRatio) + coreColOuter.b * mixRatio;

            // 외곽부 페이드 아웃 부드럽게
            const dimming = Math.max(0.3, 1.0 - (Math.pow(r / 92, 2)));
            colors[i * 3] *= dimming;
            colors[i * 3 + 1] *= dimming;
            colors[i * 3 + 2] *= dimming;
        }
    }
    generateAmbient(positions, colors, shapeCount, ambientCount);
    return { positions, colors };
}
