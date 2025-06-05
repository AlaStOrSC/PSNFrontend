import { useTranslation } from 'react-i18next';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

function JoinableMatchCard({ match, friends, onJoin }) {
  const { t } = useTranslation();
  const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });



  const players = [
    { player: match.player1, position: 'player1' },
    { player: match.player2, position: 'player2' },
    { player: match.player3, position: 'player3' },
    { player: match.player4, position: 'player4' },
  ];


  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg dark:shadow-dark-shadow p-6 w-96">
      <h3 className="text-lg font-bold text-primaryText dark:text-dark-text-accent mb-4 text-center">
        {formatDate(match.date)}, {match.time}, {match.city}
      </h3>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {players.slice(0, 2).map(({ player, position }) => (
            <div key={position} className="flex items-center mb-2">
              {player ? (
                <>
                  <img
                    src={player.profilePicture || `https://ui-avatars.com/api/?name=${player.username}&background=0f172a&color=fff&size=40`}
                    alt={player.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-primaryText dark:text-dark-text-primary">{player.username}</p>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{player.score.toFixed(2)}</p>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => onJoin(match._id)}
                  className="flex items-center"
                >
                  <PlusCircleIcon className="w-10 h-10 text-secondary dark:text-dark-primary mr-3" />
                  <p className="text-primaryText dark:text-dark-text-primary">{t('home.empty_slot')}</p>
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="w-px bg-gray-200 dark:bg-dark-border h-20 mx-4"></div>
        <div className="flex-1">
          {players.slice(2, 4).map(({ player, position }) => (
            <div key={position} className="flex items-center mb-2">
              {player ? (
                <>
                  <img
                    src={player.profilePicture || `https://ui-avatars.com/api/?name=${player.username}&background=0f172a&color=fff&size=40`}
                    alt={player.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-primaryText dark:text-dark-text-primary">{player.username}</p>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{player.score.toFixed(2)}</p>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => onJoin(match._id)}
                  className="flex items-center"
                >
                  <PlusCircleIcon className="w-10 h-10 text-secondary dark:text-dark-primary mr-3" />
                  <p className="text-primaryText dark:text-dark-text-primary">{t('home.empty_slot')}</p>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default JoinableMatchCard;