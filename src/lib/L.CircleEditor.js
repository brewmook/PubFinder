L.CircleEditor = L.Circle.extend ({

    options: {
        icon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-editing-icon'
        })
    },

    onAdd: function (map) {
        L.Path.prototype.onAdd.call(this, map);
        if (this._map) {
            this._markerGroup = new L.LayerGroup();

            this._centerMarker = this._createMarker(this.getLatLng());
            this._centerMarker.on('drag', this._onCenterDrag, this);
            this._centerMarker.on('dragend', this._onCenterDragEnd, this);
            this._centerMarker._origLatLng = this.getLatLng();

            this._circumferenceMarker = this._createMarker(this._boundaryCoord());
            this._circumferenceMarker.on('drag', this._onCircumferenceDrag, this);
            this._circumferenceMarker.on('dragend', this._onCircumferenceDragEnd, this);

            this._map.addLayer(this._markerGroup);
        }
    },

    onRemove: function (map) {
        if (this._map) {
            this._map.removeLayer(this._markerGroup);
            delete this._markerGroup;
            delete this._centerMarker;
            delete this._circumferenceMarker;
        }
        L.Path.prototype.onRemove.call(this, map);
    },

    _boundaryCoord: function() {
        var circleBounds = this.getBounds();
        var swCoord = circleBounds.getSouthWest();
        var neCoord = circleBounds.getNorthEast();
        return new L.LatLng((neCoord.lat + swCoord.lat) / 2, neCoord.lng, true);
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
        this.setLatLng(e.target.getLatLng());
        this.redraw();
        this.fire('centerchange');
    },

    _onCenterDragEnd: function (e) {
        this._circumferenceMarker.setLatLng(this._boundaryCoord());
        this.fire('centerchange');
        this.fire('edit');
    },

    _onCircumferenceDrag: function (e) {
        var distance = this._centerMarker.getLatLng().distanceTo(e.target.getLatLng());
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
