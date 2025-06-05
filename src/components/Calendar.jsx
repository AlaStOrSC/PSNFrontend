import { useNavigate } from 'react-router-dom';
import ReactCalendar from 'react-calendar';
import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import 'react-calendar/dist/Calendar.css';
import { useTranslation } from 'react-i18next';



function Calendar({ matches, locale }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState(new Date());

  const handleDayClick = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const pendingMatches = matches.filter(
      (match) =>
        match.result === 'pending' && isSameDay(new Date(match.date), date)
    );
    if (pendingMatches.length > 0) {
      navigate(`/matches?date=${formattedDate}`);
    }
  };

  const tileClassName = ({ date }) => {
    const hasPendingMatch = matches.some(
      (match) =>
        match.result === 'pending' && isSameDay(new Date(match.date), date)
    );
    return hasPendingMatch
      ? 'bg-buttonsHover text-white rounded-full'
      : 'hover:bg-gray-200 dark:hover:bg-dark-bg-tertiary';
  };

  return (
      <div className="dark:text-neutral">   {t('calendar.nextmatches')}
    <div className="max-w-[300px] mx-auto my-8 p-4 bg-white dark:bg-neutral rounded-lg shadow-lg">
      <ReactCalendar
        onChange={setValue}
        value={value}
        onClickDay={handleDayClick}
        tileClassName={tileClassName}
        locale={locale}
        className="w-full text-primaryText dark:text-dark-text-primaryText border-none"
        navigationLabel={({ date }) =>
          `${format(date, 'MMMM yyyy', { locale: locale === 'es' ? es : enUS })}`
        }
        prevLabel="←"
        nextLabel="→"
        prev2Label={null}
        next2Label={null}
      />
    </div>
    </div>
  );
}

export default Calendar;