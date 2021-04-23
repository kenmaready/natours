import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  console.log({ email, password });
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: { email, password },
    });

    if (result.data.success) {
      showAlert('success', 'Logged in successfully.');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    console.log({ result });
  } catch (err) {
    console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const result = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    if (result.data.success) {
      showAlert('success', 'You have been logged out.');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
