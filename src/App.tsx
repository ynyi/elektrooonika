import React, { useState, useEffect, useMemo, useRef } from 'react';
import { questions } from './questions';

export default function App() {
  const [shuffled, setShuffled] = useState([...questions].sort(() => Math.random() - 0.5));
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [isTimeOut, setIsTimeOut] = useState(false);

  const timerIntervalRef = useRef<number | null>(null);

  // Timer logic
  useEffect(() => {
    if (!quizFinished && !answered && timeLeft > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [quizFinished, answered, timeLeft]);

  const handleTimeOut = () => {
    setAnswered(true);
    setIsTimeOut(true);
    setStreak(0);
    setWrongCount((prev) => prev + 1);
  };

  const selectAnswer = (idx: number) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(idx);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const currentQuestion = shuffled[currentQ];
    const isCorrect = idx === currentQuestion.c;

    if (isCorrect) {
      const pts = Math.max(10, Math.round((timeLeft / 30) * 100));
      setScore((prev) => prev + pts + (streak >= 2 ? streak * 5 : 0));
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setCorrectCount((prev) => prev + 1);
    } else {
      setStreak(0);
      setWrongCount((prev) => prev + 1);
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= shuffled.length) {
      setQuizFinished(true);
    } else {
      setCurrentQ((prev) => prev + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(60);
      setIsTimeOut(false);
    }
  };

  const restart = () => {
    setShuffled([...questions].sort(() => Math.random() - 0.5));
    setCurrentQ(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setTimeLeft(60);
    setIsTimeOut(false);
    setQuizFinished(false);
  };

  if (quizFinished) {
    const pct = Math.round((correctCount / shuffled.length) * 100);
    let grade = '';
    if (pct >= 90) grade = '🏆 Znakomicie! Jesteś gotowy na kolosa!';
    else if (pct >= 75) grade = '💪 Dobry wynik! Powtórz słabsze tematy.';
    else if (pct >= 60) grade = '📚 Nieźle, ale warto powtórzyć materiał.';
    else if (pct >= 50) grade = '⚠️ Jeszcze trochę nauki i będzie lepiej!';
    else grade = '📖 Koniecznie powtórz cały materiał!';

    return (
      <>
        <div id="results" style={{ display: 'block' }}>
          <div className="results-card">
            <div className="big-score" id="res-score">{pct}%</div>
            <div className="results-label">wynik końcowy</div>
            <div className="results-grid">
              <div className="res-stat">
                <div className="n" style={{ color: 'var(--correct)' }} id="res-correct">{correctCount}</div>
                <div className="l">Poprawne</div>
              </div>
              <div className="res-stat">
                <div className="n" style={{ color: 'var(--wrong)' }} id="res-wrong">{wrongCount}</div>
                <div className="l">Błędne</div>
              </div>
              <div className="res-stat">
                <div className="n" style={{ color: '#f59e0b' }} id="res-best">{bestStreak}</div>
                <div className="l">Najl. seria</div>
              </div>
            </div>
            <div className="grade-text" id="res-grade">{grade}</div>
            <button id="restart-btn" onClick={restart}>🔄 Zagraj ponownie</button>
          </div>
        </div>
      </>
    );
  }

  const q = shuffled[currentQ];
  const timerPct = (timeLeft / 60) * 100;
  
  let timerBackground = 'linear-gradient(90deg, var(--correct), var(--accent2))';
  if (timeLeft <= 10) {
    timerBackground = 'linear-gradient(90deg, #ef4444, #f97316)';
  } else if (timeLeft <= 20) {
    timerBackground = 'linear-gradient(90deg, #f59e0b, #10b981)';
  }

  const progressPct = (currentQ / shuffled.length) * 100;

  return (
    <>
      <header>
        <div className="chip">⚡ KOLOS PRZYGOTOWANIE</div>
        <h1>Podstawy Elektroniki</h1>
        <p className="subtitle">Quiz z materiału — rezystory, kondensatory, półprzewodniki, diody, tranzystory</p>
      </header>

      <div id="scoreboard">
        <div className="score-pill">
          <div className="num" id="num-score">{score}</div>
          <div className="label">Punkty</div>
        </div>
        <div className="score-pill">
          <div className="num" id="num-streak" style={{ color: '#f59e0b' }}>
            {streak}{streak >= 2 ? '🔥' : ''}
          </div>
          <div className="label">Seria</div>
        </div>
        <div className="score-pill">
          <div className="num" id="num-correct" style={{ color: 'var(--correct)' }}>{correctCount}</div>
          <div className="label">Poprawne</div>
        </div>
      </div>

      <div id="progress-wrap">
        <div id="progress-text">Pytanie {currentQ + 1} / {shuffled.length}</div>
        <div id="progress-bar-track">
          <div id="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>

      <div id="timer-wrap">
        <div id="timer-bar-track">
          <div id="timer-bar-fill" style={{ width: `${timerPct}%`, background: timerBackground }}></div>
        </div>
        <div id="timer-text">{timeLeft}</div>
      </div>

      <div id="quiz-container">
        <div className={`question-card ${isShake ? 'shake' : ''}`} id="question-card">
          <div className="q-meta">
            <span className="q-num" id="q-num">P.{String(currentQ + 1).padStart(2, '0')}</span>
            <span className="q-topic" id="q-topic">{q.topic}</span>
          </div>
          <div className="question-text" id="q-text">{q.q}</div>
          <div className="answers" id="answers">
            {q.a.map((ans, i) => {
              let btnClass = 'answer-btn';
              if (answered) {
                if (i === q.c) {
                  btnClass += ' correct';
                } else if (i === selectedAnswer) {
                  btnClass += ' wrong';
                }
              }
              return (
                <button
                  key={i}
                  className={btnClass}
                  onClick={() => selectAnswer(i)}
                  disabled={answered}
                >
                  <span className="letter">{['A', 'B', 'C', 'D'][i]}</span>{ans}
                </button>
              );
            })}
          </div>
          {answered && (
            <div
              id="feedback"
              className={isTimeOut || selectedAnswer !== q.c ? 'wrong' : 'correct'}
              style={{ display: 'block' }}
            >
              {isTimeOut ? (
                <>
                  ⏰ <strong>Czas minął!</strong> Odpowiedź: <strong>{['A', 'B', 'C', 'D'][q.c]}</strong>. {q.ex}
                </>
              ) : selectedAnswer === q.c ? (
                <>
                  ✅ <strong>Dobrze! +{Math.max(10, Math.round((timeLeft / 30) * 100))} pkt{streak >= 2 ? ` (+${streak * 5} za serię ${streak}🔥)` : ''}</strong><br />{q.ex}
                </>
              ) : (
                <>
                  ❌ <strong>Błąd.</strong> Poprawna: <strong>{['A', 'B', 'C', 'D'][q.c]}. {q.a[q.c]}</strong><br />{q.ex}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {answered && (
        <button id="next-btn" onClick={nextQuestion} style={{ display: 'block' }}>
          Następne pytanie →
        </button>
      )}
    </>
  );
}
