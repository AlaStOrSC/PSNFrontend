import { useState, useEffect } from 'react';
import { CalendarIcon, MapPinIcon, ClockIcon, SunIcon, CheckCircleIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import Modal from './Modal';

function MatchCard({ match, user, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [formData, setFormData] = useState({
    date: match.date.split('T')[0],
    time: match.time,
    city: match.city,
    player2: match.player2?.username || '',
    player3: match.player3?.username || '',
    player4: match.player4?.username || '',
    results: match.results,
    comments: match.comments,
  });

  const matchDateTime = new Date(
    `${isEditing ? formData.date : match.date.split('T')[0]}T${isEditing ? formData.time : match.time}`
  );
  const now = new Date();
  const isFinalized = matchDateTime <= now || match.result !== 'pending';

  useEffect(() => {
    if (isFinalized && !match.isSaved) {
      setIsEditing(true);
    }
  }, [isFinalized, match.isSaved]);

  const getCardStyle = () => {
    if (match.result === 'pending') return 'bg-white';
    if (match.result === 'won') return 'bg-green-100';
    if (match.result === 'lost') return 'bg-red-100';
    if (match.result === 'draw') return 'bg-blue-100';
    return 'bg-white';
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        date: formData.date,
        time: formData.time,
        city: formData.city,
        player2: formData.player2,
        player3: formData.player3,
        player4: formData.player4,
        results: formData.results,
        comments: formData.comments,
        isSaved: isFinalized || match.isSaved,
      };

      console.log('Guardando datos:', updatedData);
      const response = await api.put(`/matches/${match._id}`, updatedData);
      console.log('Partido actualizado:', response.data.match);
      
      onUpdate(response.data.match);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      setModalMessage(error.response?.data?.message || error.message);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este partido?')) return;
    
    try {
      console.log('Eliminando partido:', match._id);
      await api.delete(`/matches/${match._id}`);
      console.log('Partido eliminado');
      
      onDelete(match._id);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setModalMessage(error.response?.data?.message || error.message);
      setIsModalOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date' && !isFinalized) {
      const selectedDate = new Date(value);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (selectedDate < now) {
        setModalMessage('No puedes cambiar la fecha de un partido si esta ya ha pasado');
        setIsModalOpen(true);
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResultChange = (set, side, value) => {
    setFormData((prev) => ({
      ...prev,
      results: {
        ...prev.results,
        [set]: {
          ...prev.results[set],
          [side]: parseInt(value) || 0,
        },
      },
    }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  return (
    <div className={`rounded-lg shadow-lg p-6 ${getCardStyle()} mb-6 max-w-md mx-auto`}>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Error"
        message={modalMessage}
      />

      {isEditing && !isFinalized ? (
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className="text-2xl font-bold text-primary mb-4 w-full p-2 border rounded"
        />
      ) : (
        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
          <CalendarIcon className="h-6 w-6 mr-2" />
          {new Date(match.date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </h2>
      )}

      <p className="text-lg text-gray-700 mb-2">
        {isEditing ? (
          <>
            {user.username} /{' '}
            <input
              type="text"
              name="player2"
              value={formData.player2}
              onChange={handleInputChange}
              className="inline p-1 border rounded"
              placeholder="Compañero"
            />
          </>
        ) : (
          `${user.username} / ${match.player2?.username || 'Desconocido'}`
        )}
        {' vs '}
        {isEditing ? (
          <>
            <input
              type="text"
              name="player3"
              value={formData.player3}
              onChange={handleInputChange}
              className="inline p-1 border rounded"
              placeholder="Rival 1"
            />
            {' / '}
            <input
              type="text"
              name="player4"
              value={formData.player4}
              onChange={handleInputChange}
              className="inline p-1 border rounded"
              placeholder="Rival 2"
            />
          </>
        ) : (
          `${match.player3?.username || 'Desconocido'} / ${match.player4?.username || 'Desconocido'}`
        )}
      </p>

      <p className="text-gray-600 flex items-center mb-2">
        <MapPinIcon className="h-5 w-5 mr-2" />
        {isEditing ? (
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="p-1 border rounded w-full"
            placeholder="Ciudad"
          />
        ) : (
          match.city
        )}
      </p>

      <p className="text-gray-600 flex items-center mb-2">
        <ClockIcon className="h-5 w-5 mr-2" />
        {isEditing && !isFinalized ? (
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className="p-1 border rounded w-full"
          />
        ) : (
          match.time
        )}
      </p>

      <div className="mb-2">
        <p className="text-gray-600 flex items-center">
          <SunIcon className="h-5 w-5 mr-2" />
          {match.weather || 'Clima no disponible'}
        </p>
        {match.rainWarning && (
          <p className="text-yellow-600 flex items-center mt-1 text-sm">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Posibilidad de lluvia, recomendado reservar en cubierto
          </p>
        )}
      </div>

      <p className="text-gray-600 mb-4">
        Estado: <span className="font-semibold">{isFinalized ? 'Finalizado' : 'Pendiente'}</span>
      </p>

      {isFinalized && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primary mb-2">Resultado</h3>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Equipo 1</th>
                <th className="border p-2">Equipo 2</th>
              </tr>
            </thead>
            <tbody>
              {['set1', 'set2', 'set3'].map((set) => (
                <tr key={set}>
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.results[set].left}
                        onChange={(e) => handleResultChange(set, 'left', e.target.value)}
                        className="w-16 p-1 border rounded text-center"
                        min="0"
                        max="7"
                      />
                    ) : (
                      formData.results[set].left
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.results[set].right}
                        onChange={(e) => handleResultChange(set, 'right', e.target.value)}
                        className="w-16 p-1 border rounded text-center"
                        min="0"
                        max="7"
                      />
                    ) : (
                      formData.results[set].right
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFinalized && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primary mb-2">Comentarios</h3>
          {isEditing ? (
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows="4"
              placeholder="Describe el partido..."
            />
          ) : (
            <p className="text-gray-600">{formData.comments || 'Sin comentarios'}</p>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {isEditing && (
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Guardar
          </button>
        )}
        <button
          onClick={handleEdit}
          className="flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-orange-500 transition-colors"
        >
          <PencilIcon className="h-5 w-5 mr-2" />
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <TrashIcon className="h-5 w-5 mr-2" />
          Borrar
        </button>
      </div>
    </div>
  );
}

export default MatchCard;