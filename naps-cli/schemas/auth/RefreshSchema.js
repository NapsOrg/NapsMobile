/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

class RefreshSchema {
    constructor(refresh_token) {
        this.refresh_token = refresh_token;
    }

    getRefreshToken() {
        return this.refresh_token;
    }

    toJSON() {
        return { ...this };
    }
}

export default RefreshSchema;