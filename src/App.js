import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './App.css';

function Card({ card, onClick, isFlipped, isMatched }) {
    return (
        <button className={`card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`} 
            onClick={onClick} disabled={isFlipped}>
                {isFlipped ? card : "?"}
        </button>
    );
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function StartPage({ onStart }) {
    return (
        <div className="start-page">
            <h1>Welcome to the Memory Game!</h1>
            <button className="start-btn" onClick={onStart}>Start Game</button>
        </div>
    );
}

function GameOverPage({ onGoHome, score }) {
    return (
        <div className="game-over-page">
            <h1>Game Over! You've lost!</h1>
            <p>Your score: {score}</p>
            <button className="go-to-home" onClick={onGoHome}>Go to Home</button>
        </div>
    );
}

function GameWonPage({ onGoHome, score }) {
    return(
        <div className="game-won-page">
            <h1>Congratulations! You've Won!</h1>
            <p>Your score: {score}</p>
            <button className="go-to-home" onClick={onGoHome}>Go to Home</button>
        </div>
    );
}

export default function Game() {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);

    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(180);
    const [message, setMessage] = useState('');
    const [messageJump, setMessageJump] = useState(false);

    const cardValues = [
        '🌻','🔥','🍌','🧁','🎁','👑','🐬','🍀','🍇','🥊','🎨','✈','🎃','👻','🦄'
    ];

    const timerColor = timeLeft <= 10 ? 'red' : 'black';

    function triggerConfetti() {
        confetti({
          particleCount: 300,
          spread: 100,
          origin: { y: 0.6 }
        });
    }

    useEffect(() => {
        if (gameStarted) {
            const initialCards = shuffle([...cardValues, ...cardValues]);
            setCards(initialCards);
        }
    }, [gameStarted]);

    useEffect(() => {
        if (gameStarted && timeLeft > 0 && !gameOver && !gameWon) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setGameOver(true);
        }
    }, [timeLeft, gameOver, gameStarted, gameWon]);

    function handleReset() {
        const newCards = shuffle([...cardValues, ...cardValues]);
        setCards(newCards);
        setFlippedCards([]);
        setMatchedCards([]);

        setScore(0);
        setMessage('');
        setTimeLeft(180);
        
        setGameOver(false);
        setGameStarted(true);
        setGameWon(false);
    }

    function handleStartGame() {
        setGameStarted(true);
        setGameOver(false);
        setGameWon(false);
    }

    function handleGoToHome() {
        setGameStarted(false);
        setGameOver(false);
        setGameWon(false);
        setScore(0);
        setTimeLeft(180);
    }

    function handleCardClick(index) {
        if (flippedCards.length === 2 || flippedCards.includes(index)  || matchedCards.includes(index)) {
            return;
        }

        const newlyFlipped = [...flippedCards, index];
        setFlippedCards(newlyFlipped);

        if (newlyFlipped.length === 2) {
            const [firstIndex, secondIndex] = newlyFlipped;

            if (cards[firstIndex] === cards[secondIndex]) {
                setMatchedCards([...matchedCards, firstIndex, secondIndex]);
                setScore(score + 2);
                setMessage("It's a match!");
                setMessageJump(true);

                setTimeout(() => setMessageJump(false), 800);
                setTimeout(() => setMessage(''), 1700);

                if (score + 2 === 30) {
                    setGameWon(true);
                    triggerConfetti();
                }
            }

            setTimeout(() => { 
                setFlippedCards([]);
            }, 1200);
        }
    }

    return (
        <>
            {!gameStarted ? (
                    <StartPage onStart={handleStartGame} />
                ) : gameWon ? (
                    <GameWonPage onGoHome={handleGoToHome} score={score} />
                ) : gameOver ? (
                    <GameOverPage onGoHome={handleGoToHome} score={score} />
                ) : (
                        <>
                        <h1>Memory Game</h1>
                        <div className="top-line">
                            <div className='score'>Score: {score}</div>
                            <div className={`message ${messageJump ? 'jump' : ''}`}>{message}</div>
                            <div className="timer" style={{ color: timerColor }}>
                                Time left: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                            </div>
                        </div>
                        <div className="board">
                            <div className="main">
                                {cards.map((card, index) => (
                                    <Card key={index}
                                        card={card}
                                        onClick={() => handleCardClick(index)}
                                        isFlipped={flippedCards.includes(index) || matchedCards.includes(index)}
                                        isMatched={matchedCards.includes(index)}
                                    />
                                ))}
                            </div>
                            <button className='reset-btn' onClick={handleReset}>Reset board</button>
                        </div>
                        </>
                    )
            }
        </>
    );
}