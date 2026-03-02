import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
    generateHeart,
    generateSaturn,
    generateDNA,
    generateSpiral,
    generateScatter,
} from './shapeGenerators';

const PARTICLE_COUNT = 10000;   // 인터랙티브 파티클
const STAR_COUNT = 18000;       // 배경 별
const SHOOTING_STAR_COUNT = 8;  // 유성
const RING_COUNT = 3;           // 코스믹 링

const SHAPE_MAP = {
    scatter: generateScatter,
    heart: generateHeart,
    saturn: generateSaturn,
    dna: generateDNA,
    spiral: generateSpiral,
};

export default function ThreeScene({ handPos, activeShape = 'scatter', gesture = 'none' }) {
    const mountRef = useRef(null);
    const handWorldRef = useRef(new THREE.Vector3(0, 0, 0));
    const handActiveRef = useRef(false);
    const targetPositionsRef = useRef(null);
    const targetColorsRef = useRef(null);
    const currentShapeRef = useRef('scatter');
    const gestureRef = useRef('none');

    useEffect(() => { gestureRef.current = gesture; }, [gesture]);

    useEffect(() => {
        if (handPos && handPos.x > 0 && handPos.y > 0) {
            handActiveRef.current = true;
            handWorldRef.current.set(
                ((1 - handPos.x / window.innerWidth) - 0.5) * 30,
                (0.5 - handPos.y / window.innerHeight) * 20, 0
            );
        } else { handActiveRef.current = false; }
    }, [handPos]);

    useEffect(() => {
        if (SHAPE_MAP[activeShape]) {
            const result = SHAPE_MAP[activeShape](PARTICLE_COUNT);
            targetPositionsRef.current = result.positions;
            targetColorsRef.current = result.colors;
            currentShapeRef.current = activeShape;
        }
    }, [activeShape]);

    // ===== 메인 Three.js =====
    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const W = window.innerWidth;
        const H = window.innerHeight;

        // 렌더러
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x020510, 1);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x020510, 0.006);

        const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 2000);
        camera.position.z = 40;

        // ================================================
        // 1. 배경 별 (18000개 - 항상 고정, 우주 느낌)
        // ================================================
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(STAR_COUNT * 3);
        const starCol = new Float32Array(STAR_COUNT * 3);
        const starSizes = new Float32Array(STAR_COUNT);

        const starColors = [
            new THREE.Color(0xffffff),
            new THREE.Color(0xcce8ff),
            new THREE.Color(0xffeedd),
            new THREE.Color(0xaaccff),
            new THREE.Color(0xffccdd),
        ];

        for (let i = 0; i < STAR_COUNT; i++) {
            const r = 50 + Math.random() * 400;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starPos[i * 3 + 2] = r * Math.cos(phi);
            const sc = starColors[Math.floor(Math.random() * starColors.length)];
            starCol[i * 3] = sc.r;
            starCol[i * 3 + 1] = sc.g;
            starCol[i * 3 + 2] = sc.b;
            starSizes[i] = Math.random() < 0.05 ? 1.5 + Math.random() * 2 : 0.2 + Math.random() * 0.8;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));

        // 별 글로우 텍스처
        const starCnv = document.createElement('canvas');
        starCnv.width = 32; starCnv.height = 32;
        const sCtx = starCnv.getContext('2d');
        const sGrd = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        sGrd.addColorStop(0, 'rgba(255,255,255,1)');
        sGrd.addColorStop(0.15, 'rgba(255,255,255,0.7)');
        sGrd.addColorStop(0.5, 'rgba(255,255,255,0.15)');
        sGrd.addColorStop(1, 'rgba(255,255,255,0)');
        sCtx.fillStyle = sGrd;
        sCtx.fillRect(0, 0, 32, 32);
        const starTex = new THREE.CanvasTexture(starCnv);

        const starMat = new THREE.PointsMaterial({
            size: 0.5, map: starTex, vertexColors: true,
            blending: THREE.AdditiveBlending, transparent: true, opacity: 0.9,
            depthWrite: false, sizeAttenuation: true,
        });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // ================================================
        // 2. 네뷸라 구름 (제거됨)
        // ================================================

        // ================================================
        // 3. 코스믹 링 (궤도 경로 - 와이어프레임)
        // ================================================
        const rings = [];
        const ringColors = [0x38bdf8, 0xa78bfa, 0x22d3ee];
        for (let i = 0; i < RING_COUNT; i++) {
            const ringGeo = new THREE.TorusGeometry(15 + i * 8, 0.03, 8, 120);
            const ringMat = new THREE.MeshBasicMaterial({
                color: ringColors[i], transparent: true, opacity: 0.15,
                wireframe: false,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI * 0.3 + i * 0.3;
            ring.rotation.y = i * 0.5;
            scene.add(ring);
            rings.push(ring);
        }

        // ================================================
        // 4. 유성 (Shooting Stars - 제거됨)
        // ================================================

        // ================================================
        // 5. 중앙 에너지 코어 (글로우 구체)
        // ================================================
        const coreCnv = document.createElement('canvas');
        coreCnv.width = 128; coreCnv.height = 128;
        const cCtx = coreCnv.getContext('2d');
        const cGrd = cCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        cGrd.addColorStop(0, 'rgba(56,189,248,0.8)');
        cGrd.addColorStop(0.2, 'rgba(167,139,250,0.4)');
        cGrd.addColorStop(0.5, 'rgba(34,211,238,0.1)');
        cGrd.addColorStop(1, 'rgba(0,0,0,0)');
        cCtx.fillStyle = cGrd;
        cCtx.fillRect(0, 0, 128, 128);
        const coreTex = new THREE.CanvasTexture(coreCnv);
        const coreMat = new THREE.SpriteMaterial({
            map: coreTex, blending: THREE.AdditiveBlending,
            transparent: true, opacity: 0.4, depthWrite: false, depthTest: false
        });
        const coreSprite = new THREE.Sprite(coreMat);
        coreSprite.scale.set(8, 8, 1);
        scene.add(coreSprite);

        // ================================================
        // 6. 인터랙티브 파티클 (10000개)
        // ================================================
        const pGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const scatterResult = generateScatter(PARTICLE_COUNT);
        const basePos = scatterResult.positions;
        const baseCol = scatterResult.colors;
        targetPositionsRef.current = new Float32Array(basePos);
        targetColorsRef.current = new Float32Array(baseCol);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            positions[i * 3] = basePos[i * 3];
            positions[i * 3 + 1] = basePos[i * 3 + 1];
            positions[i * 3 + 2] = basePos[i * 3 + 2];
            colors[i * 3] = baseCol[i * 3];
            colors[i * 3 + 1] = baseCol[i * 3 + 1];
            colors[i * 3 + 2] = baseCol[i * 3 + 2];
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const pCnv = document.createElement('canvas');
        pCnv.width = 64; pCnv.height = 64;
        const pCtx = pCnv.getContext('2d');
        const pGrd = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        pGrd.addColorStop(0, 'rgba(255,255,255,1)');
        pGrd.addColorStop(0.15, 'rgba(255,255,255,0.9)');
        pGrd.addColorStop(0.4, 'rgba(255,255,255,0.4)');
        pGrd.addColorStop(1, 'rgba(255,255,255,0)');
        pCtx.fillStyle = pGrd;
        pCtx.fillRect(0, 0, 64, 64);
        const pTex = new THREE.CanvasTexture(pCnv);

        const pMat = new THREE.PointsMaterial({
            size: 0.4, map: pTex, vertexColors: true,
            blending: THREE.AdditiveBlending, transparent: true,
            opacity: 0.95, depthWrite: false, sizeAttenuation: true,
        });
        const particles = new THREE.Points(pGeo, pMat);
        scene.add(particles);

        // (3D 트래킹 빛 삭제됨 - HTML 2D 커서로 대체)

        // ===== 이벤트 =====
        const mouseW = new THREE.Vector3();
        function onMouseMove(e) {
            mouseW.set(
                ((e.clientX / window.innerWidth) - 0.5) * 30,
                (0.5 - (e.clientY / window.innerHeight)) * 20, 0
            );
            if (!handActiveRef.current) handWorldRef.current.copy(mouseW);
        }
        window.addEventListener('mousemove', onMouseMove);

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onResize);

        let lastShape = 'scatter';

        // 제스처 파라미터 (자연스러운 속도)
        let gestureScale = 1.0;
        let morphSpeed = 0.05;
        let handInfluence = 25;
        let handStrength = 0.12;
        let coreGlow = 0.4;
        let ringPulse = 0;
        let swirlForce = 0;

        const clock = new THREE.Clock();
        let animId;
        const tempVec = new THREE.Vector3();

        function animate() {
            animId = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();
            const dt = clock.getDelta();
            const posArr = pGeo.attributes.position.array;
            const colArr = pGeo.attributes.color.array;
            const target = targetPositionsRef.current;
            const targetCol = targetColorsRef.current;
            const handW = handWorldRef.current;
            const g = gestureRef.current;

            // ========================================
            // 제스처 파라미터 (모양 유지, 자연스러운 속도)
            // ========================================
            let currentTarget = target;
            if (g === 'fist') {
                currentTarget = target;
                gestureScale += (1.15 - gestureScale) * 0.1;
                morphSpeed += (0.08 - morphSpeed) * 0.1;
                handInfluence += (40 - handInfluence) * 0.1;
                handStrength += (0.3 - handStrength) * 0.1;
                pMat.size += (0.48 - pMat.size) * 0.1; // Too much size caused additive blending to wash out colors
                coreGlow += (0.4 - coreGlow) * 0.1; // Too much glow hid the shape behind a glowing blob
                ringPulse += (1 - ringPulse) * 0.1;
                swirlForce *= 0.8;
            } else if (g === 'open') {
                currentTarget = basePos;
                gestureScale += (1.0 - gestureScale) * 0.1;
                morphSpeed += (0.03 - morphSpeed) * 0.1;
                handInfluence += (15 - handInfluence) * 0.1;
                handStrength += (-0.08 - handStrength) * 0.1;
                pMat.size += (0.55 - pMat.size) * 0.1;
                coreGlow += (0.15 - coreGlow) * 0.1;
                ringPulse += (0 - ringPulse) * 0.1;
                swirlForce *= 0.8;
            } else if (g === 'peace') {
                currentTarget = basePos;
                gestureScale += (1.0 - gestureScale) * 0.1;
                morphSpeed += (0.01 - morphSpeed) * 0.1;
                handInfluence += (50 - handInfluence) * 0.1;
                handStrength += (0.08 - handStrength) * 0.1;
                pMat.size += (0.4 - pMat.size) * 0.1;
                coreGlow += (0.8 - coreGlow) * 0.1;
                ringPulse += (2.0 - ringPulse) * 0.1;
                swirlForce += (3.5 - swirlForce) * 0.1;
            } else if (g === 'point') {
                currentTarget = basePos;
                gestureScale += (1.0 - gestureScale) * 0.1;
                morphSpeed += (0.0 - morphSpeed) * 0.2;
                handInfluence += (200 - handInfluence) * 0.2;
                handStrength += (0.8 - handStrength) * 0.1;
                pMat.size += (0.6 - pMat.size) * 0.1;
                coreGlow += (0.2 - coreGlow) * 0.1;
                ringPulse += (0 - ringPulse) * 0.1;
                swirlForce += (0.4 - swirlForce) * 0.1;
            } else {
                currentTarget = target;
                gestureScale += (1.0 - gestureScale) * 0.08;
                morphSpeed += (0.05 - morphSpeed) * 0.08;
                handInfluence += (25 - handInfluence) * 0.08;
                handStrength += (0.12 - handStrength) * 0.08;
                pMat.size += (0.45 - pMat.size) * 0.05;
                coreGlow += (0.4 - coreGlow) * 0.05;
                ringPulse += (0 - ringPulse) * 0.05;
                swirlForce *= 0.9;
            }

            // 색상 전환 (타깃 색상 배열에서 부드럽게 보간)
            if (targetCol) {
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    colArr[i * 3] += (targetCol[i * 3] - colArr[i * 3]) * 0.03;
                    colArr[i * 3 + 1] += (targetCol[i * 3 + 1] - colArr[i * 3 + 1]) * 0.03;
                    colArr[i * 3 + 2] += (targetCol[i * 3 + 2] - colArr[i * 3 + 2]) * 0.03;
                }
            }

            // ========================================
            // 파티클 물리
            // ========================================
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const ix = i * 3, iy = ix + 1, iz = ix + 2;

                // 흩뿌리기 (open) 모드 시 생동감 넘치는 우주 비행(Warp) 효과
                if (g === 'open') {
                    // basePos(산개 타깃) 자체를 카메라 방향으로 이동
                    const speed = 0.8 + (i % 10) * 0.15; // 파티클마다 속도 다름 (입체감 증대)
                    basePos[iz] += speed;

                    // 카메라 뒤쪽(Z > 60)으로 넘어가면 저 멀리 심우주(-100 이하)로 워프 (재설정)
                    if (basePos[iz] > 60) {
                        basePos[iz] = -150 - Math.random() * 100;
                        const r = 5 + Math.random() * 140; // 폭넓게 퍼지도록
                        const angle = Math.random() * Math.PI * 2;
                        basePos[ix] = Math.cos(angle) * r;
                        basePos[iy] = Math.sin(angle) * r;

                        // 화면 횡단을 방지하기 위해 실제 위치도 즉시 순간이동
                        posArr[ix] = basePos[ix];
                        posArr[iy] = basePos[iy];
                        posArr[iz] = basePos[iz];
                    }
                }

                if (currentTarget) {
                    const tx = currentTarget[ix] * gestureScale;
                    const ty = currentTarget[iy] * gestureScale;
                    const tz = currentTarget[iz] * gestureScale;
                    posArr[ix] += (tx - posArr[ix]) * morphSpeed;
                    posArr[iy] += (ty - posArr[iy]) * morphSpeed;
                    posArr[iz] += (tz - posArr[iz]) * morphSpeed;
                }

                // 손 인력/반발
                tempVec.set(handW.x - posArr[ix], handW.y - posArr[iy], handW.z - posArr[iz]);
                const dist = tempVec.length();
                if (dist < handInfluence && dist > 0.1) {
                    const force = (1 - dist / handInfluence) * handStrength;
                    posArr[ix] += tempVec.x * force;
                    posArr[iy] += tempVec.y * force;
                    posArr[iz] += tempVec.z * force;
                }

                // 회전력 (소용돌이)
                if (swirlForce > 0.01) {
                    const dx = posArr[ix] - handW.x;
                    const dy = posArr[iy] - handW.y;
                    const d2 = Math.sqrt(dx * dx + dy * dy) || 1;
                    // 직교 벡터(-dy, dx) 로 접선 방향 힘
                    const f = swirlForce * (1.2 - Math.min(dist / 40, 1.0));
                    posArr[ix] += (-dy / d2) * f;
                    posArr[iy] += (dx / d2) * f;
                    posArr[iz] += (handW.z - posArr[iz]) * 0.03 * swirlForce;
                }

                // 흔들림
                posArr[iy] += Math.sin(elapsed * 0.8 + i * 0.002) * 0.008;
                posArr[ix] += Math.cos(elapsed * 0.5 + i * 0.003) * 0.006;
                posArr[iz] += Math.sin(elapsed * 0.4 + i * 0.004) * 0.005;
            }

            pGeo.attributes.position.needsUpdate = true;
            pGeo.attributes.color.needsUpdate = true;

            // 모양이 뒤집히지 않고 제자리를 유지하며 떠있는 듯한 느낌만 줌 (아래에서 마우스 회전에 합산됨)
            // particles.rotation.y = Math.sin(elapsed * 0.1) * 0.08;
            // particles.rotation.x = Math.sin(elapsed * 0.05) * 0.05;

            // ========================================
            // 배경 별 반짝임
            // ========================================
            const sArr = starGeo.attributes.position.array;
            for (let i = 0; i < STAR_COUNT; i++) {
                sArr[i * 3 + 1] += Math.sin(elapsed * 0.3 + i * 0.01) * 0.003;
            }
            starGeo.attributes.position.needsUpdate = true;
            stars.rotation.y = elapsed * 0.002;
            stars.rotation.x = Math.sin(elapsed * 0.001) * 0.01;

            // ========================================
            // 네뷸라 움직임 (제거됨)
            // ========================================

            // ========================================
            // 코스믹 링 회전 + 펄스
            // ========================================
            rings.forEach((ring, i) => {
                ring.rotation.z = elapsed * (0.05 + i * 0.02) + ringPulse * elapsed * 2.0;
                ring.rotation.x = Math.PI * 0.3 + i * 0.3 + Math.sin(elapsed * 0.1) * 0.1;
                const baseOp = 0.12 + ringPulse * 0.3;
                ring.material.opacity = baseOp + Math.sin(elapsed * 0.5 + i) * 0.05;
                const s = 1 + ringPulse * 0.4;
                ring.scale.set(s, s, s);
            });

            // ========================================
            // 에너지 코어 펄스
            // ========================================
            const coreScale = 6 + Math.sin(elapsed * 1.5) * 2 + coreGlow * 8;
            coreSprite.scale.set(coreScale, coreScale, 1);
            coreMat.opacity = coreGlow * (0.3 + Math.sin(elapsed * 2) * 0.15);

            // (3D 트래킹 빛 애니메이션 삭제됨)

            // ========================================
            // 유성 (제거됨)
            // ========================================

            // ========================================
            // 카메라 및 파티클 회전 (마우스 반응 강조)
            // ========================================
            const tz = g === 'fist' ? 32 : g === 'open' ? 45 : g === 'peace' ? 40 : g === 'point' ? 55 : 42;
            camera.position.z += (tz - camera.position.z) * 0.02;

            // 마우스 위치(handW가 실제로는 마우스 좌표도 받음)를 활용해 화면을 둘러보는 느낌 효과
            camera.position.x += (handW.x * 0.15 - camera.position.x) * 0.05;
            camera.position.y += (handW.y * 0.15 - camera.position.y) * 0.05;

            // 약간의 자동 유영
            camera.position.x += Math.sin(elapsed * 0.1) * 0.02;
            camera.position.y += Math.cos(elapsed * 0.08) * 0.015;
            camera.lookAt(0, 0, 0);

            // 모양 자체가 마우스를 따라 부드럽게 돌아가도록 추가
            particles.rotation.y = (handW.x * 0.03) + Math.sin(elapsed * 0.1) * 0.08;
            particles.rotation.x = (-handW.y * 0.03) + Math.sin(elapsed * 0.05) * 0.05;

            renderer.render(scene, camera);
        }

        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            pGeo.dispose(); pMat.dispose(); pTex.dispose();
            starGeo.dispose(); starMat.dispose(); starTex.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef} className="three-scene" />;
}
