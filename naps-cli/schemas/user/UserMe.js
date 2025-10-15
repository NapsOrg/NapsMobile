/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

class UserMe {
    constructor(data = {}) {
        this.user_id = data.user_id;
        this.username = data.username || "";
        this.full_name = data.full_name || "";
        this.bio = data.bio || "";
        this.profile_picture = data.avatar_url || data.profile_picture || "";
        this.avatar_url = data.avatar_url || data.profile_picture || "";
        this.media = Array.isArray(data.media) ? data.media : [];
        this.type = data.type || "";
        this.is_verified = Boolean(data.is_verified);
        this.stories = Boolean(data.stories);
        this.followers = Number(data.followers) || 0;
        this.following = Number(data.following) || 0;
        this.likes = Number(data.likes) || 0;
        this.notifications = Number(data.notifications) || 0;
        this.messages = Number(data.messages) || 0;
        this.status = data.online_status || data.status || "OFFLINE";
        this.online_status = data.online_status || data.status || "OFFLINE";
        this.city = data.city || "";
        this.register_date = data.register_date || "";
    }

    update(data = {}) {
        for (const key in data) {
            if (data[key] !== undefined && data[key] !== null) {
                if (key === 'avatar_url') {
                    this.profile_picture = data[key];
                    this.avatar_url = data[key];
                }
                else if (key === 'online_status') {
                    this.status = data[key];
                    this.online_status = data[key];
                }
                else if (key === 'status') {
                    this.status = data[key];
                    this.online_status = data[key];
                }
                else if (key === 'profile_picture') {
                    this.profile_picture = data[key];
                    this.avatar_url = data[key];
                }
                else if (this.hasOwnProperty(key)) {
                    this[key] = data[key];
                }
            }
        }
    }

    toJSON() {
        return { ...this };
    }
}

export default UserMe;