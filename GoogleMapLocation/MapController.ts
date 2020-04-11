import * as $ from "jquery";
import { IInputs } from "./generated/ManifestTypes";
import { Util } from "./Util";
import { LocationDetail } from "./LocationDetail";

export class MapController {
  map: google.maps.Map<HTMLElement>;
  currentMarker: google.maps.Marker;
  markers = new Array<google.maps.Marker>();
  searchBox: google.maps.places.SearchBox;
  container: HTMLDivElement;
  ButtonColor: string;
  readOnly: boolean;
  notifyLocationChanged: (locationDetail: LocationDetail) => void;
  constructor(
    container: HTMLDivElement,
    ButtonColor: string,
    readOnly: boolean,
    notifyLocationChanged: (locationDetail: LocationDetail) => void
  ) {
    this.container = container;
    this.ButtonColor = ButtonColor;
    this.readOnly = readOnly;
    this.notifyLocationChanged = notifyLocationChanged;
    this.initMainControl();
  }

  private async initMainControl() {
    var baseLocation = await this.getCurrentPosition();
    var tboxSearch = $(document.createElement("input"));
    tboxSearch.attr("id", "pac-input");
    var mtMapWrapperDiv = $(document.createElement("div"));
    mtMapWrapperDiv.addClass("mt-map-wrapper");
    var mtMapDiv = $(document.createElement("div"));
    mtMapDiv.addClass("mt-map");
    var mapDiv = $(document.createElement("div"));
    mapDiv.attr("id", "map");
    $(mtMapDiv).append(mapDiv);
    $(mtMapWrapperDiv).append(mtMapDiv);
    $(this.container).append(mtMapWrapperDiv);

    var mapOptions = {
      zoom: 8,
      center: baseLocation,
    };
    this.map = new google.maps.Map(mapDiv.get(0), mapOptions);
    if (!this.readOnly) {
      $(this.container).append(tboxSearch);
      this.searchBox = new google.maps.places.SearchBox(tboxSearch.get(0));
      this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(
        tboxSearch.get(0)
      );
      var btnClear = $(document.createElement("button"));
      btnClear.attr("id", "btnClear");
      btnClear.text("Clear Location");
      btnClear.css("background-color", `#${this.ButtonColor}`);
      this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(
        btnClear.get(0)
      );
      var btnGetCurrentPosition = $(document.createElement("button"));
      btnGetCurrentPosition.attr("id", "btnCurrentLocation");
      btnGetCurrentPosition.text("Current Location");
      btnGetCurrentPosition.css("background-color", `#${this.ButtonColor}`);
      this.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(
        btnGetCurrentPosition.get(0)
      );
      this.initEvents();
    }
  }

  private initEvents() {
    this.map.addListener("click", (event) => {
      this.addMarker(event);
    });
    this.map.addListener("bounds_changed", () => {
      this.boundsChanged();
    });
    this.searchBox.addListener("places_changed", () => {
      this.placesChanged();
    });
    $(document).on("click", "#btnClear", () => {
      this.updateLocationFromPointData({
        Latitude: undefined,
        Longitude: undefined,
      });
    });
    $(document).on("click", "#btnCurrentLocation", async () => {
      this.currentMarker.setMap(null);
      var latLng = await this.getCurrentPosition();
      this.updateLocationFromPointData(
        await this.getPointDetail(latLng.lat, latLng.lng)
      );
    });
  }
  public updateLocationFromPointData(
    locationDetail: LocationDetail,
    notify: boolean = true
  ) {
    let Latitude = locationDetail.Latitude;
    let Longitude = locationDetail.Longitude;
    if (!Latitude || !Longitude) {
      this.currentMarker.setMap(null);
    } else {
      if (this.currentMarker) {
        this.currentMarker.setMap(null);
      }
      this.currentMarker = new google.maps.Marker({
        map: this.map,
        position: { lat: Latitude, lng: Longitude },
        draggable: true,
      });
    }
    if (notify) {
      this.notifyLocationChanged(locationDetail);
    }
  }

  private placesChanged() {
    var places = this.searchBox.getPlaces();
    if (places.length == 0) {
      return;
    }
    var bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var locationDetail = new LocationDetail();
      locationDetail.AddressName = place.name;
      locationDetail.Country = place.address_components?.find((component) =>
        component.types.find((componentType) => componentType == "country")
      )?.long_name;
      locationDetail.City = place.address_components?.find((component) =>
        component.types.find((componentType) => componentType == "locality")
      )?.long_name;
      locationDetail.Street = place.address_components?.find((component) =>
        component.types.find(
          (componentType) => componentType == "sublocality_level_1"
        )
      )?.long_name;
      locationDetail.Telephone = place.formatted_phone_number;
      locationDetail.PostalCode = place.address_components?.find((component) =>
        component.types.find((componentType) => componentType == "postal_code")
      )?.long_name;
      locationDetail.Latitude = place.geometry.location.lat();
      locationDetail.Longitude = place.geometry.location.lng();
      this.updateLocationFromPointData(locationDetail);
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    this.map.fitBounds(bounds);
  }
  private boundsChanged() {
    this.searchBox.setBounds(this.map.getBounds() as google.maps.LatLngBounds);
  }

  private async getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        });
      } else {
        resolve({
          lat: -25.344,
          lng: 131.036,
        });
      }
    });
  }
  private async addMarker(event: google.maps.MouseEvent) {
    this.updateLocationFromPointData(
      await this.getPointDetail(event.latLng.lat(), event.latLng.lng())
    );
  }

  private async getPointDetail(
    Latitude: number,
    Longitude: number
  ): Promise<LocationDetail> {
    return new Promise<LocationDetail>((resolve, reject) => {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat: Latitude, lng: Longitude } },
        (results, status) => {
          if (status === "OK") {
            if (results[0]) {
              var place = results[0];
              var locationDetail = new LocationDetail();
              locationDetail.Country = place.address_components?.find(
                (component) =>
                  component.types.find(
                    (componentType) => componentType == "country"
                  )
              )?.long_name;
              locationDetail.City = place.address_components?.find(
                (component) =>
                  component.types.find(
                    (componentType) => componentType == "locality"
                  )
              )?.long_name;
              locationDetail.Street = place.address_components?.find(
                (component) =>
                  component.types.find(
                    (componentType) => componentType == "sublocality_level_1"
                  )
              )?.long_name;
              locationDetail.PostalCode = place.address_components?.find(
                (component) =>
                  component.types.find(
                    (componentType) => componentType == "postal_code"
                  )
              )?.long_name;
              locationDetail.Latitude = Latitude;
              locationDetail.Longitude = Longitude;
              resolve(locationDetail);
            }
          } else {
            var locationDetail = new LocationDetail();
            locationDetail.Latitude = Latitude;
            locationDetail.Longitude = Longitude;
            resolve(locationDetail);
          }
        }
      );
    });
  }
}
