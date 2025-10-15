/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

class MediaScheme {
    constructor(mediaId, postId, userId, mediaUrl, mediaType, createdAt) {
        this.mediaId = mediaId;
        this.postId = postId;
        this.userId = userId;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.createdAt = createdAt;
    }

    static fromApi(data) {
        return new MediaScheme(
            data.media_id,
            data.post_id,
            data.user_id,
            data.media_url,
            data.media_type,
            new Date(data.created_at)
        );
    }

    static fromApiArray(dataArray) {
        return dataArray.map(item => MediaScheme.fromApi(item));
    }
}

export default MediaScheme;