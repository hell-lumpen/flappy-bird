import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const gameWidth = window.innerWidth < 500 ? window.innerWidth * 0.9 : 400;
  const gameHeight = gameWidth * 1.5;
  const birdWidth = gameWidth * 0.085;
  const birdHeight = birdWidth * 0.7;
  const gravity = gameHeight * 0.003;
  const jumpHeight = gameHeight * 0.12;
  const pipeWidth = gameWidth * 0.15;
  const pipeGap = gameHeight * 0.35;

  const [birdPosition, setBirdPosition] = useState(gameHeight / 2);
  const [pipePosition, setPipePosition] = useState(gameWidth);
  const [pipeHeight, setPipeHeight] = useState(gameHeight / 2);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('highScore')) || 0
  );
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [birdFrame, setBirdFrame] = useState(0);

  // Анимация птички
  useEffect(() => {
    const birdAnimation = setInterval(() => {
      setBirdFrame((prevFrame) => (prevFrame + 1) % 3);
    }, 100);
    return () => clearInterval(birdAnimation);
  }, []);

  // Падение птички
  useEffect(() => {
    let timeId;
    if (isGameStarted && !isGameOver && birdPosition < gameHeight - birdHeight) {
      timeId = setInterval(() => {
        setBirdPosition((birdPosition) => birdPosition + gravity);
      }, 24);
    }
    return () => clearInterval(timeId);
  }, [birdPosition, isGameStarted, isGameOver, gravity, gameHeight, birdHeight]);

  // Движение труб
  useEffect(() => {
    let pipeId;
    if (isGameStarted && !isGameOver && pipePosition >= -pipeWidth) {
      pipeId = setInterval(() => {
        setPipePosition((pipePosition) => pipePosition - gameWidth * 0.015);
      }, 24);
    } else if (pipePosition < -pipeWidth) {
      setPipePosition(gameWidth);
      setPipeHeight(Math.floor(Math.random() * (gameHeight - pipeGap)));
      setScore((score) => score + 1);
    }
    return () => clearInterval(pipeId);
  }, [pipePosition, isGameStarted, isGameOver, gameWidth, gameHeight, pipeGap, pipeWidth]);

  // Прыжок птички
  const handleJump = useCallback(() => {
    if (isGameStarted && !isGameOver && birdPosition > jumpHeight) {
      setBirdPosition((birdPosition) => birdPosition - jumpHeight);
    }
  }, [isGameStarted, isGameOver, birdPosition, jumpHeight]);

  // Старт игры
  const startGame = () => {
    setIsGameStarted(true);
  };

  // Проверка столкновений
  useEffect(() => {
    const birdLeft = gameWidth * 0.12;
    const birdRight = birdLeft + birdWidth;
    const birdTop = birdPosition;
    const birdBottom = birdTop + birdHeight;

    const pipeLeft = pipePosition;
    const pipeRight = pipeLeft + pipeWidth;
    const topPipeBottom = pipeHeight;
    const bottomPipeTop = pipeHeight + pipeGap;

    const hasCollidedWithTopPipe =
      birdTop < topPipeBottom && birdRight > pipeLeft && birdLeft < pipeRight;
    const hasCollidedWithBottomPipe =
      birdBottom > bottomPipeTop && birdRight > pipeLeft && birdLeft < pipeRight;

    if (hasCollidedWithTopPipe || hasCollidedWithBottomPipe) {
      setIsGameOver(true);
      setIsGameStarted(false);
    }

    if (birdPosition >= gameHeight - birdHeight) {
      setIsGameOver(true);
      setIsGameStarted(false);
    }
  }, [birdPosition, pipeHeight, pipePosition, gameWidth, birdWidth, birdHeight, pipeWidth, pipeGap]);

  // Перезапуск игры
  const restartGame = () => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score);
    }
    setBirdPosition(gameHeight / 2);
    setPipePosition(gameWidth);
    setPipeHeight(gameHeight / 2);
    setScore(0);
    setIsGameOver(false);
    setIsGameStarted(false);
  };

  return (
    <div className="game" onClick={handleJump} style={{ width: gameWidth, height: gameHeight }}>
      {!isGameStarted && !isGameOver && (
        <div className="start-screen" onClick={startGame}>
          <h1>Flappy Bird</h1>
          <p>Нажми, чтобы начать</p>
          <p>Рекорд: {highScore}</p>
        </div>
      )}
      <div className="score">Счет: {score}</div>
      <div
        className="bird"
        style={{
          top: birdPosition,
          width: birdWidth,
          height: birdHeight,
          backgroundImage: `url(/bird${birdFrame}.png)`,
        }}
      />
      <div
        className="pipe"
        style={{
          left: pipePosition,
          height: pipeHeight,
          width: pipeWidth,
        }}
      />
      <div
        className="pipe pipe-bottom"
        style={{
          left: pipePosition,
          top: pipeHeight + pipeGap,
          height: gameHeight - pipeHeight - pipeGap,
          width: pipeWidth,
        }}
      />
      {isGameOver && (
        <div className="game-over">
          <h2>Игра окончена!</h2>
          <p>Счет: {score}</p>
          <p>Рекорд: {highScore}</p>
          <button onClick={restartGame}>Играть снова</button>
        </div>
      )}
    </div>
  );
}

export default App;