
import * as userServiceModule from './userService';

export const userService = userServiceModule;
export const {
  getCurrentUserEmail,
  updateCurrentUserEmail,
  initializeUserData
} = userServiceModule;
