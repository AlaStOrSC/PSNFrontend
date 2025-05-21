import axios from 'axios';

const testRegister = async () => {
  try {
    const data = {
      username: 'testuser120',
      email: 'testuser120@example.com',
      password: 'admin1234',
      phone: '+1234567890',
      city: 'Sevilla'
    };
    console.log('Enviando datos:', data);
    const response = await axios.post('https://psn-backend-3dut.onrender.com/api/users/register', data, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Respuesta:', response.data);
  } catch (error) {
    console.error('Error:', error);
    console.log('Detalles:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
};

testRegister();