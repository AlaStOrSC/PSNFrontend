import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import Cookies from 'js-cookie';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

function Chat() {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const response = await api.get('/messages/conversations');
        setConversations(response.data);
      } catch (err) {
        console.error('Error al cargar conversaciones:', err);
      }
    };

    fetchConversations();

    const token = Cookies.get('token');
    if (!token) {
      console.error('No se encontró el token para WebSocket');
      return;
    }
    const websocket = new WebSocket(`wss://psn-backend-3dut.onrender.com?token=${token}`);
    websocket.onopen = () => {
      console.log('Conectado a WebSocket');
      setWs(websocket);
      const pingInterval = setInterval(() => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({ type: 'ping' }));
          console.log('Enviando ping al servidor WebSocket');
        }
      }, 30000);
      websocket.pingInterval = pingInterval;
    };
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'receiveMessage') {
        if (activeConversation?.userId === data.senderId) {
          setMessages((prev) => [...prev, {
            sender: data.senderId,
            receiver: user.userId,
            content: data.content,
            timestamp: data.timestamp,
          }]);
          websocket.send(JSON.stringify({
            type: 'markAsRead',
            userId: data.senderId,
          }));
        } else {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.userId === data.senderId ? { ...conv, hasUnread: true } : conv
            )
          );
        }
      } else if (data.type === 'messagesRead') {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.userId === data.userId ? { ...conv, hasUnread: false } : conv
          )
        );
      } else if (data.type === 'pong') {
        console.log('Recibido pong del servidor WebSocket');
      } else if (data.type === 'error') {
        console.error('Error en WebSocket:', data.message);
      }
    };
    websocket.onclose = (event) => {
      console.log('Desconectado de WebSocket', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      setWs(null);
      clearInterval(websocket.pingInterval);
    };
    websocket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };

    return () => {
      websocket.close();
      clearInterval(websocket.pingInterval);
    };
  }, [user, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        const response = await api.get('/users');
        const filteredUsers = response.data
          .filter((u) => u.userId !== user?.userId && u.username.toLowerCase().includes(searchQuery.toLowerCase())) // Cambiado de u.id
          .filter((u) => !conversations.some((conv) => conv.userId === u.userId));
        setSearchResults(filteredUsers);
      } catch (err) {
        console.error('Error al buscar usuarios:', err);
      }
    };

    searchUsers();
  }, [searchQuery, user, conversations]);

  const handleOpenChat = async (userId) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      setMessages(response.data);
      const conversation = conversations.find((conv) => conv.userId === userId) || {
        userId,
        username: selectedUser?.username,
        messages: [],
        hasUnread: false,
      };
      setActiveConversation(conversation);
      setConversations((prev) => {
        if (prev.some((conv) => conv.userId === userId)) {
          return prev.map((conv) =>
            conv.userId === userId ? { ...conv, hasUnread: false } : conv
          );
        }
        return [conversation, ...prev];
      });
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      if (ws) {
        ws.send(JSON.stringify({
          type: 'markAsRead',
          userId,
        }));
      }
    } catch (err) {
      console.error('Error al abrir chat:', err);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !ws) return;

    ws.send(JSON.stringify({
      type: 'message',
      receiverId: activeConversation.userId,
      content: newMessage,
    }));
    setMessages((prev) => [
      ...prev,
      {
        sender: user.userId,
        receiver: activeConversation.userId,
        content: newMessage,
        timestamp: new Date(),
      },
    ]);
    setNewMessage('');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-secondary transition-colors flex items-center dark:bg-dark-primary dark:hover:bg-dark-secondary"
      >
        Chat
        {isOpen ? (
          <XMarkIcon className="w-5 h-5 ml-2" />
        ) : (
          <MagnifyingGlassIcon className="w-5 h-5 ml-2" />
        )}
      </button>

      {isOpen && (
        <div className="bg-white rounded-lg shadow-lg w-80 h-96 mt-2 flex flex-col sm:w-96">
          <div className="p-4 border-b">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar usuario..."
                className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-2 top-2.5 text-gray-500" />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute bg-white border rounded-lg mt-1 w-72 max-h-40 overflow-y-auto z-10">
                {searchResults.map((result) => (
                  <div
                    key={result.userId}
                    onClick={() => {
                      setSelectedUser(result);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  >
                    <img
                      src={result.profilePicture || `https://ui-avatars.com/api/?name=${result.username}&background=05374d&color=fff&size=40`}
                      alt={result.username}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    {result.username}
                  </div>
                ))}
              </div>
            )}
            {selectedUser && (
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={selectedUser.profilePicture || `https://ui-avatars.com/api/?name=${selectedUser.username}&background=05374d&color=fff&size=40`}
                    alt={selectedUser.username}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span>{selectedUser.username}</span>
                </div>
                <button
                  onClick={() => handleOpenChat(selectedUser.userId)}
                  className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-secondary"
                >
                  Abrir chat
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeConversation ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center">
                  <img
                    src={activeConversation.profilePicture || `https://ui-avatars.com/api/?name=${activeConversation.username}&background=05374d&color=fff&size=40`}
                    alt={activeConversation.username}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="font-semibold">{activeConversation.username}</span>
                  <button onClick={() => setActiveConversation(null)} className="ml-auto">
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-2 flex ${msg.sender === user.userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-2 rounded-lg ${
                          msg.sender === user.userId
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="ml-2 bg-primary text-white p-2 rounded-lg hover:bg-secondary"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4">
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <div
                      key={conv.userId}
                      onClick={() => handleOpenChat(conv.userId)}
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <img
                        src={conv.profilePicture || `https://ui-avatars.com/api/?name=${conv.username}&background=05374d&color=fff&size=40`}
                        alt={conv.username}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span>{conv.username}</span>
                      {conv.hasUnread && (
                        <span className="ml-auto w-3 h-3 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center">No tienes conversaciones todavía.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;