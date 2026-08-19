export type { Ball, Brick, BrickType, EngineEvent, StepResult, WorldState } from './types';
export { createWorld, launchBall, resetBall, setPaddleX, step, ballSpeedForLevel } from './arkanoidEngine';
export { hitBrick, isCleared, loadLevel, aliveBricks } from './brickField';
export { createLives, onBallLost } from './livesSystem';
export { considerHighScore, onBrickDestroyed, resetRunScore } from './arkanoidScore';
export { isLastLevel, onLevelCleared } from './levelProgress';
