/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React from 'react';
import {View} from 'react-native';

import MapContainer from "../../components/map/MapContainer";

const MapScreen = () => {
    return (
        <View style={{ flex: 1, height: '100%', width: '100%' }}>
            <MapContainer />
        </View>
    );
};

export default MapScreen;
