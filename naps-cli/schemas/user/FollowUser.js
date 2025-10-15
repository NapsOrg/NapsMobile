/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

class FollowUser {
  constructor(user_id, username, full_name, avatar_url, have_stories, is_following) {
    this.user_id = user_id;
    this.username = username || '';
    this.full_name = full_name || '';
    this.avatar_url = avatar_url || null;
    this.have_stories = !!have_stories;
    this.is_following = !!is_following;
  }

  update(data = {}) {
    for (const key in data) {
      if (this.hasOwnProperty(key) && data[key] !== undefined) {
        this[key] = data[key];
      }
    }
  }

  toJSON() {
    return { ...this };
  }
}

export default FollowUser;