/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

class UserClassic {
    constructor(data = {}) {
        this.user_id = data.user_id || null;
        this.username = data.username || "";
        this.full_name = data.full_name || "";
        this.bio = data.bio || "";
        this.avatar_url = data.avatar_url || "";
        this.profile_picture = data.profile_picture || "";
        this.media = Array.isArray(data.media) ? data.media : [];
        this.is_verified = !!data.is_verified;
        this.stories = !!data.stories;
        this.is_following = !!data.is_following;
        this.followers = Number(data.followers) || 0;
        this.following = Number(data.following) || 0;
        this.likes = Number(data.likes) || 0;
        this.city = data.city || "";
        this.register_date = data.register_date ? new Date(data.register_date) : null;
        this.online_status = data.online_status || "offline";
        this.is_private = !!data.is_private;
    }

    update(data = {}) {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(this, key) && data[key] !== undefined) {
                if (key === "register_date" && data[key]) {
                    this[key] = new Date(data[key]);
                } else {
                    this[key] = data[key];
                }
            }
        }
    }

    canFollow(currentUserId) {
        return this.user_id !== currentUserId;
    }

    toJSON() {
        return {
            ...this,
            register_date: this.register_date ? this.register_date.toISOString() : null
        };
    }

    get displayName() {
        return this.full_name || this.username || "Unknown";
    }

    get shortBio() {
        return this.bio ? (this.bio.length > 50 ? this.bio.slice(0, 50) + "…" : this.bio) : "";
    }
}

export default UserClassic;
