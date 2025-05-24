import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LuckyWheel = ({ options, onFinish, primaryColor, textColor }) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const segmentAngle = 360 / options.length;
  const vividColors = ['#FF69B4', '#FFFF00', '#00FF00', '#00B7EB', '#FF0000', '#FFA500', '#800080'];

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * options.length);
    const spins = 5;
    const randomAngle = randomIndex * segmentAngle + (Math.random() * segmentAngle) / 2;
    const finalRotation = rotation + (spins * 360) + randomAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onFinish(options[randomIndex]);
    }, 6000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-80 h-80">
        <div
          className="w-full h-full rounded-full overflow-hidden shadow-lg"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 6s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
            background: `conic-gradient(
              ${options
                .map(
                  (_, i) =>
                    `${vividColors[i % vividColors.length]} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
                )
                .join(', ')}
            )`,
          }}
        >
          {options.map((option, index) => (
            <div
              key={index}
              className="absolute w-full h-full flex items-center justify-center"
              style={{
                transform: `rotate(${index * segmentAngle}deg)`,
                transformOrigin: 'center center',
                width: '100%',
                height: '100%',
              }}
            >
              <span
                style={{
                  transform: `translateY(-120%) rotate(${-index * segmentAngle - 90}deg)`,
                  color: textColor,
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '60px',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  lineHeight: '1.1',
                  position: 'absolute',
                  top: '50%',
                }}
              >
                {option}
              </span>
            </div>
          ))}
        </div>
        <div
          className="absolute top-0 left-1/2 w-6 h-10 bg-yellow-300 rounded-b-full border-2 border-gray-800"
          style={{ transform: 'translateX(-50%)' }}
        />
      </div>
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className={`mt-6 px-6 py-2 text-white font-semibold rounded-lg shadow-md transition-all duration-300
          bg-gradient-to-r from-[#FF69B4] to-[#00B7EB] hover:from-[#FF1493] hover:to-[#009ACD]
          dark:from-[#FF69B4] dark:to-[#00B7EB] dark:hover:from-[#FF1493] dark:hover:to-[#009ACD]
          ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {t('redeem.spin')}
      </button>
    </div>
  );
};

export default LuckyWheel;