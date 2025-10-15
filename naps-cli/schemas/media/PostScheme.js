/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import MediaScheme from "./MediaScheme";

class PostScheme {
    constructor(
        postId,
        creatorId,
        creatorUsername,
        creatorAvatarUrl,
        content,
        media,
        likesCount,
        commentsCount,
        isMy,
        isLiked,
        isSaved,
        createdAt
    ) {
        this.postId = postId;
        this.creatorId = creatorId;
        this.creatorUsername = creatorUsername;
        this.creatorAvatarUrl = creatorAvatarUrl || null;
        this.content = content;
        this.media = media || [];
        this.likesCount = likesCount;
        this.commentsCount = commentsCount;
        this.isMy = Boolean(isMy);
        this.isLiked = Boolean(isLiked);
        this.isSaved = Boolean(isSaved);
        this.createdAt = createdAt;
    }

    static fromApi(data) {
        if (!data) {
            console.error("PostScheme.fromApi received null/undefined data");
            return null;
        }

        try {
            console.log("PostScheme.fromApi data:", JSON.stringify(data, null, 2));

            return new PostScheme(
                data.post_id,
                data.creator_id,
                data.creator_username,
                data.creator_avatar_url || null,
                data.content || "",
                data.media ? MediaScheme.fromApiArray(data.media) : [],
                data.reactions_count || data.likes_count || 0,
                data.comments_count || 0,
                data.is_my || false,
                data.is_reacted || data.is_liked || false,
                data.is_saved || false,
                data.created_at ? new Date(data.created_at) : new Date()
            );
        } catch (error) {
            console.error("Error in PostScheme.fromApi:", error);
            console.error("Problematic data:", data);
            throw error;
        }
    }

    static fromApiArray(dataArray) {
        if (!Array.isArray(dataArray)) {
            console.error("PostScheme.fromApiArray expected array, got:", typeof dataArray);
            return [];
        }

        return dataArray
            .map(item => {
                try {
                    return PostScheme.fromApi(item);
                } catch (error) {
                    console.error("Failed to parse post item:", item, error);
                    return null;
                }
            })
            .filter(post => post !== null);
    }
}

export default PostScheme;