/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

const ContentType = {
    MEDIA: "MEDIA",
    POST: "POST"
};

class SavedScheme {
    constructor({
        saved_id,
        content_id,
        author,
        media_content = null,
        text_content = null,
        media_id = null,
        post_id = null,
        created_at,
        content_type
    }) {
        this.saved_id = saved_id;
        this.content_id = content_id;
        this.author = author;
        this.media_content = media_content;
        this.text_content = text_content;
        this.media_id = media_id;
        this.post_id = post_id;
        this.created_at = new Date(created_at);
        this.content_type = content_type;
    }

    static fromApi(data) {
        return new SavedScheme({
            saved_id: data.saved_id,
            content_id: data.content_id,
            author: data.author,
            media_content: data.media_content ?? null,
            text_content: data.text_content ?? null,
            media_id: data.media_id ?? null,
            post_id: data.post_id ?? null,
            created_at: data.created_at,
            content_type: data.content_type
        });
    }

    static fromApiArray(dataArray) {
        return dataArray.map(item => SavedScheme.fromApi(item));
    }
}

export { SavedScheme, ContentType };