import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeTracking } from './useHomeTracking';
import ThreeScene from '../components/ThreeScene';
import './Home.css';


const SHAPES = [
    { id: 'scatter', label: '✨', name: '은하수' },
    { id: 'heart', label: '💜', name: '하트' },
    { id: 'saturn', label: '🪐', name: '토성' },
    { id: 'dna', label: '🧬', name: 'DNA' },
    { id: 'spiral', label: '🌌', name: '나선은하' },
];

function Home() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [handDetected, setHandDetected] = useState(false);
    const [cursor, setCursor] = useState({ x: -100, y: -100 });
    const [activeShape, setActiveShape] = useState('scatter');
    const [gesture, setGesture] = useState('none');
    const [showDetectedFeedback, setShowDetectedFeedback] = useState(false);
    const [showGuide, setShowGuide] = useState(true);

    const shapeBtnRefs = useRef({});

    const handleCursor = useCallback((x, y) => {
        setCursor({ x, y });
        if (showGuide) setShowGuide(false);
    }, [showGuide]);

    // 핀치 → 형태 변경
    const handlePinch = useCallback((x, y) => {
        // 형태 버튼 핀치 체크
        Object.entries(shapeBtnRefs.current).forEach(([id, el]) => {
            if (!el) return;
            const rect = el.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                setActiveShape(id);
            }
        });
    }, []);

    // 제스처 상태 콜백 (매 프레임)
    const handleGesture = useCallback((g) => {
        setGesture(g);
    }, []);

    // 손 인식 상태 업데이트 (최초 -100 좌표 무시)
    useEffect(() => {
        if (cursor.x !== -100 && !handDetected) {
            setHandDetected(true);
            setShowDetectedFeedback(true);
            setTimeout(() => setShowDetectedFeedback(false), 3000); // 3초 유지
        }
    }, [cursor, handDetected]);

    useHomeTracking(videoRef, handleCursor, handlePinch, handleGesture);

    // 가이드 자동 숨김
    useEffect(() => {
        const timer = setTimeout(() => {
            if (showGuide) setShowGuide(false);
        }, 3000); // 3초 유지 (피드백 반영)
        return () => clearTimeout(timer);
    }, [showGuide]);

    return (
        <div className="home-fullscreen">
            {/* 손 인식 완료 스캔 피드백 */}
            {showDetectedFeedback && (
                <div className="hand-detected-overlay">
                    <div className="hand-detected-content">
                        <span className="scan-icon">🎯</span>
                        <h2>손 인식 완료!</h2>
                    </div>
                </div>
            )}

            {/* Three.js 파티클 시스템 */}
            <ThreeScene handPos={cursor} activeShape={activeShape} gesture={gesture} />

            {/* 숨겨진 웹캠 (MediaPipe 용) */}
            <video
                ref={videoRef}
                className="webcam-hidden"
                playsInline
                autoPlay
                muted
            />

            {/* 안내 오버레이 */}
            {showGuide && (
                <div className="guide-overlay">
                    <div className="guide-content glass-panel">
                        <div className="guide-hand-icon">🖐️</div>
                        <h2>손을 인식시켜주세요</h2>
                        <p>웹캠 접근 허용 후 파티클 인터랙션이 활성화됩니다</p>
                    </div>
                </div>
            )}

            {/* 상단 바 */}
            <header className="top-bar">
                <div className="title-area">
                    <h1 className="site-title text-glow">Aether Flow</h1>
                    <div className="gesture-guide">
                        <span>🖐️ 흩뿌리기</span>
                        <span>✊ 집중</span>
                        <span>✌️ 소용돌이</span>
                        <span>☝️ 밀어내기</span>
                        <span>🤏 핀치(선택)</span>
                    </div>
                </div>
                {handDetected && (
                    <div className="hand-status">
                        <span className="hand-status-dot"></span>
                        <span className="hand-status-text">
                            {gesture === 'fist' ? '✊ 집중 모드' :
                                gesture === 'open' ? '🖐️ 흩뿌리기' :
                                    gesture === 'peace' ? '✌️ 소용돌이' :
                                        gesture === 'point' ? '☝️ 밀어내기' : '🖐️ 손 추적 중'}
                        </span>
                    </div>
                )}
            </header>


            {/* 형태 버튼 — 하단 중앙 */}
            <div className="shape-buttons">
                {SHAPES.map((shape) => (
                    <button
                        key={shape.id}
                        ref={(el) => (shapeBtnRefs.current[shape.id] = el)}
                        className={`shape-btn glass-panel ${activeShape === shape.id ? 'shape-active' : ''
                            }`}
                        onClick={() => setActiveShape(shape.id)}
                    >
                        <span className="shape-emoji">{shape.label}</span>
                        <span className="shape-name">{shape.name}</span>
                    </button>
                ))}
            </div>

            {/* 네온 커서 */}
            {handDetected && (
                <div
                    className="neon-cursor"
                    style={{ left: cursor.x, top: cursor.y }}
                />
            )}
        </div>
    );
}

export default Home;
