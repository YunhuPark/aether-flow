import { useEffect, useRef } from 'react';

// ===== 유틸: 유클리드 거리 =====
function getDistance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// ===== 핀치 감지 (엄지+검지 맞닿기) =====
function isPinching(landmarks) {
    const dist = getDistance(landmarks[4], landmarks[8]);
    return dist < 0.05;
}

// ===== 주먹 감지 (손가락 접힘) =====
function isFist(landmarks) {
    const wrist = landmarks[0];
    let foldedCount = 0;
    const tips = [8, 12, 16, 20];
    const mcps = [5, 9, 13, 17];
    tips.forEach((tipIdx, i) => {
        const dTip = getDistance(landmarks[tipIdx], wrist);
        const dMcp = getDistance(landmarks[mcps[i]], wrist);
        if (dTip < dMcp * 1.1) foldedCount++;
    });
    return foldedCount >= 3;
}

// ===== 손 펼침 감지 =====
function isOpenHand(landmarks) {
    const wrist = landmarks[0];
    let extendedCount = 0;
    const tips = [8, 12, 16, 20];
    const mcps = [5, 9, 13, 17];
    tips.forEach((tipIdx, i) => {
        const dTip = getDistance(landmarks[tipIdx], wrist);
        const dMcp = getDistance(landmarks[mcps[i]], wrist);
        if (dTip > dMcp * 1.1) extendedCount++;
    });
    if (getDistance(landmarks[4], wrist) > getDistance(landmarks[2], wrist)) {
        extendedCount++;
    }
    return extendedCount >= 4;
}

// ===== 브이 감지 (소용돌이) =====
function isPeace(landmarks) {
    const wrist = landmarks[0];
    const idxExt = getDistance(landmarks[8], wrist) > getDistance(landmarks[5], wrist) * 1.1;
    const midExt = getDistance(landmarks[12], wrist) > getDistance(landmarks[9], wrist) * 1.1;
    const ringFold = getDistance(landmarks[16], wrist) < getDistance(landmarks[13], wrist) * 1.1;
    const pinkyFold = getDistance(landmarks[20], wrist) < getDistance(landmarks[17], wrist) * 1.1;
    return idxExt && midExt && ringFold && pinkyFold;
}

// ===== 삿대질 감지 (마법봉) =====
function isPointing(landmarks) {
    const wrist = landmarks[0];
    const idxExt = getDistance(landmarks[8], wrist) > getDistance(landmarks[5], wrist) * 1.1;
    const midFold = getDistance(landmarks[12], wrist) < getDistance(landmarks[9], wrist) * 1.1;
    const ringFold = getDistance(landmarks[16], wrist) < getDistance(landmarks[13], wrist) * 1.1;
    const pinkyFold = getDistance(landmarks[20], wrist) < getDistance(landmarks[17], wrist) * 1.1;
    return idxExt && midFold && ringFold && pinkyFold;
}

/**
 * useHomeTracking
 *
 * @param {RefObject} videoRef
 * @param {Function} cursorCallback - (x, y)
 * @param {Function} pinchCallback - (x, y)
 * @param {Function} gestureCallback - ('fist' | 'open' | 'neutral') 매 프레임 호출
 */
export function useHomeTracking(videoRef, cursorCallback, pinchCallback, gestureCallback) {
    const wasPinchingRef = useRef(false);
    const pinchCooldownRef = useRef(false);

    const cursorCbRef = useRef(cursorCallback);
    const pinchCbRef = useRef(pinchCallback);
    const gestureCbRef = useRef(gestureCallback);

    useEffect(() => {
        cursorCbRef.current = cursorCallback;
        pinchCbRef.current = pinchCallback;
        gestureCbRef.current = gestureCallback;
    }, [cursorCallback, pinchCallback, gestureCallback]);

    useEffect(() => {
        if (!videoRef.current) return;
        if (!window.Hands || !window.Camera) {
            console.error('MediaPipe CDN이 아직 로드되지 않았습니다.');
            return;
        }

        const videoElement = videoRef.current;

        const onResults = (results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];
                const indexTip = landmarks[8];

                // 커서 좌표 전달
                const cx = (1 - indexTip.x) * window.innerWidth;
                const cy = indexTip.y * window.innerHeight;
                if (cursorCbRef.current) cursorCbRef.current(cx, cy);

                // 핀치 감지
                const pinching = isPinching(landmarks);
                if (pinching && !wasPinchingRef.current && !pinchCooldownRef.current) {
                    if (pinchCbRef.current) pinchCbRef.current(cx, cy);
                    pinchCooldownRef.current = true;
                    setTimeout(() => { pinchCooldownRef.current = false; }, 1000);
                }
                wasPinchingRef.current = pinching;

                // 제스처 감지 (매 프레임)
                if (gestureCbRef.current) {
                    if (isPointing(landmarks)) {
                        gestureCbRef.current('point');
                    } else if (isPeace(landmarks)) {
                        gestureCbRef.current('peace');
                    } else if (isOpenHand(landmarks)) {
                        gestureCbRef.current('open');
                    } else if (isFist(landmarks)) {
                        gestureCbRef.current('fist');
                    } else {
                        gestureCbRef.current('neutral');
                    }
                }
            } else {
                // 손 미감지
                if (gestureCbRef.current) gestureCbRef.current('none');
            }
        };

        const hands = new window.Hands({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);

        let animationFrameId;
        let stream = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, facingMode: 'user' }
                });

                if (videoElement) {
                    videoElement.srcObject = stream;
                    // 메타데이터 로드 대기
                    await new Promise((resolve) => {
                        videoElement.onloadedmetadata = () => resolve();
                    });

                    videoElement.play();

                    const processFrame = async () => {
                        if (videoElement.readyState >= 2) {
                            try {
                                await hands.send({ image: videoElement });
                            } catch (e) {
                                // 파괴된 hands 객체에 비동기 프레임을 보낼 때 나는 에러 방지
                                console.warn("Hands tracking frame skipped/error:", e);
                            }
                        }
                        animationFrameId = requestAnimationFrame(processFrame);
                    };

                    processFrame();
                }
            } catch (error) {
                console.error("웹캠 접근 권한 거부 또는 하드웨어 오류:", error);
            }
        };

        startCamera();

        return () => {
            hands.close();
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (stream) {
                stream.getTracks().forEach(track => track.stop()); // 웹캠 하드웨어 완벽 종료 (새로고침 버그 수정)
            }
        };
    }, [videoRef]);
}
