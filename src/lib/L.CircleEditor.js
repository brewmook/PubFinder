/*
 * L.CircleEditor is an extension of L.Circle, just to add the edition part (remember, radius in meters).
 */

L.CircleEditor = L.Circle.extend ({

    options: {
        icon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-editing-icon'
        })
    },

    onAdd: function (map) {
        L.Path.prototype.onAdd.call(this, map);

        this.addHooks();
    },

    onRemove: function (map) {
        this.removeHooks();

        L.Path.prototype.onRemove.call(this, map);
    },

    addHooks: function () {
        if (this._map) {
            if (!this._markerGroup) {
                this._initMarkers();
            }
            this._map.addLayer(this._markerGroup);
        }
    },

    removeHooks: function () {
        if (this._map) {
            this._map.removeLayer(this._markerGroup);
            delete this._markerGroup;
            delete this._centerMarker;
            delete this._circumferenceMarker;
        }
    },

    updateMarkers: function () {
        this._markerGroup.clearLayers();
        this._initMarkers();
    },

    _boundaryCoord: function() {
        var circleBounds = this.getBounds();
        var swCoord = circleBounds.getSouthWest();
        var neCoord = circleBounds.getNorthEast();
        return new L.LatLng((neCoord.lat + swCoord.lat) / 2, neCoord.lng, true);
    },

    _initMarkers: function () {
        this._markerGroup = new L.LayerGroup();

        this.centerMarker = this._createMarker(this._latlng, 0, true);
        this.centerMarker.on('click', this._onCenterMarkerClick, this);

        this._circumferenceMarker = this._createMarker(this._boundaryCoord(), 1);
    },

    _createMarker: function (latlng, index, isCenter) {
        var marker = new L.Marker(latlng, {
            draggable: true,
            icon: this.options.icon
        });

        if (isCenter === undefined) {
            isCenter = false;
        }

        marker._origLatLng = latlng;
        marker._index = index;
        marker._isCenter = isCenter;

        if (isCenter) {
            marker.on('drag', this._onCenterMove, this);
            marker.on('dragend', this._onCenterMoveEnd, this);
        } else {
            marker.on('drag', this._onMarkerDrag, this);
        }
        marker.on('dragend', this._fireEdit, this);

        this._markerGroup.addLayer(marker);

        return marker;
    },

    _fireEdit: function () {
        this.fire('edit');
    },

    _onCenterMove: function (e) {
        var marker = e.target;

        L.Util.extend(marker._origLatLng, marker._latlng);

        this._circumferenceMarker.setOpacity(0.1);

        this.redraw();
    },

    _onCenterMoveEnd: function (e) {
        var marker = e.target;

        this._circumferenceMarker.setLatLng(this._boundaryCoord());
        this._circumferenceMarker.setOpacity(1);

        this.fire('centerchange');
    },

    _onMarkerDrag: function (e) {
        var marker = e.target;
        var axis = marker._latlng;

        var distance = this.centerMarker.getLatLng().distanceTo(axis);

        this.setRadius(distance);

        this.redraw();

        this.fire('radiuschange');
    },

    centerchange: function() {},
    radiuschange: function() {}
});
