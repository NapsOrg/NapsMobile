/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

class UserSearchScheme {
  constructor(data) {
    this.user_id = data.user_id
    this.username = data.username || '';
    this.full_name = data.full_name || '';
    this.avatar_url = data.avatar_url || null;
    this.have_stories = data.have_stories || false;
    
    if (!this.username) {
      console.warn('UserSearchScheme: username is required but not provided');
    }
  }


  static fromApiArray(apiDataArray) {
    if (!Array.isArray(apiDataArray)) {
      console.error('UserSearchScheme.fromApiArray: Expected array, got:', typeof apiDataArray);
      return [];
    }

    return apiDataArray.map(item => new UserSearchScheme(item));
  }
}

export default UserSearchScheme;