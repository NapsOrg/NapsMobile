/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

class CommentScheme {
    constructor(
        commentId,
        userId,
        username,
        userHasStories,
        content,
        isMy,
        isReacted,
        createdAt,
        likesCount,
        reactionsCount,
        replyCount,
        avatarUrl,
        postId
    ) {
        this.commentId = commentId;
        this.userId = userId;
        this.username = username;
        this.userHasStories = userHasStories;
        this.content = content;
        this.isMy = Boolean(isMy);
        this.isReacted = Boolean(isReacted);
        this.createdAt = createdAt;
        this.likesCount = likesCount;
        this.reactionsCount = reactionsCount;
        this.replyCount = replyCount;
        this.avatarUrl = avatarUrl || null;
        this.postId = postId;
    }

    static fromApi(data) {
        if (!data) {
            console.error("CommentScheme.fromApi received null/undefined data");
            return null;
        }

        try {
            return new CommentScheme(
                data.comment_id,
                data.user_id,
                data.username,
                data.user_has_stories || false,
                data.content || "",
                data.is_my || false,
                data.is_reacted || false,
                data.created_at ? new Date(data.created_at) : new Date(),
                data.likes_count || data.reactions_count || 0,
                data.reactions_count || data.likes_count || 0,
                data.reply_count || 0,
                data.avatar_url || null,
                data.post_id
            );
        } catch (error) {
            console.error("Error in CommentScheme.fromApi:", error);
            console.error("Problematic data:", data);
            throw error;
        }
    }

    static fromApiArray(dataArray) {
        if (!Array.isArray(dataArray)) {
            console.error("CommentScheme.fromApiArray expected array, got:", typeof dataArray);
            return [];
        }

        return dataArray
            .map(item => {
                try {
                    return CommentScheme.fromApi(item);
                } catch (error) {
                    console.error("Failed to parse comment item:", item, error);
                    return null;
                }
            })
            .filter(comment => comment !== null);
    }
}

export default CommentScheme;