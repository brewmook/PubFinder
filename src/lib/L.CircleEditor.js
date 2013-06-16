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

        this._centerMarker = this._createMarker(this._latlng);
        this._centerMarker.on('drag', this._onCenterDrag, this);
        this._centerMarker.on('dragend', this._onCenterDragEnd, this);
        this._centerMarker._origLatLng = this._latlng;

        this._circumferenceMarker = this._createMarker(this._boundaryCoord());
        this._circumferenceMarker.on('drag', this._onCircumferenceDrag, this);
        this._circumferenceMarker.on('dragend', this._onCircumferenceDragEnd, this);
    },

    _createMarker: function(latlng) {
        var marker = new L.Marker(latlng, {
            draggable: true,
            icon: this.options.icon
        });

        this._markerGroup.addLayer(marker);

        return marker;
    },

    _onCenterDrag: function (e) {
        var marker = e.target;

        L.Util.extend(marker._origLatLng, marker._latlng);

        this.redraw();
    },

    _onCenterDragEnd: function (e) {
        var marker = e.target;

        this._circumferenceMarker.setLatLng(this._boundaryCoord());

        this.fire('centerchange');
        this.fire('edit');
    },

    _onCircumferenceDrag: function (e) {
        var marker = e.target;
        var axis = marker._latlng;

        var distance = this._centerMarker.getLatLng().distanceTo(axis);

        this.setRadius(distance);

        this.redraw();

        this.fire('radiuschange');
    },

    _onCircumferenceDragEnd: function () {
        this.fire('radiuschange');
        this.fire('edit');
    },

    centerchange: function() {},
    radiuschange: function() {}
});
