import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as $ from "jquery";
import { MapController } from "./MapController";
import { LocationDetail } from "./LocationDetail";

export class GoogleMapLocation
  implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  container: HTMLDivElement;
  mapHandler: MapController;
  context: ComponentFramework.Context<IInputs>;
  notifyOutputChanged: () => void;
  locationDetail: LocationDetail;

  /**
   * Empty constructor.
   */
  constructor() {}

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ) {
    this.notifyOutputChanged = notifyOutputChanged;
    this.context = context;
    this.container = container;
    $.getScript(
      `https://maps.googleapis.com/maps/api/js?key=${context.parameters.GoogleAPIKey.raw}&libraries=places&callback=initMap`,
      () => {
        context.mode.trackContainerResize(false);
        let buttonColor = context.parameters.ButtonColor.raw
          ? context.parameters.ButtonColor.raw
          : "";
        this.mapHandler = new MapController(
          container,
          buttonColor,
          this.context.mode.isControlDisabled,
          this.updateLocationPoint.bind(this)
        );
      }
    );
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this.context = context;
    let locationDetail = new LocationDetail();
    locationDetail.AddressName = context.parameters.AddressName.raw?.toString();
    locationDetail.City = context.parameters.City.raw?.toString();
    locationDetail.Country = context.parameters.Country.raw?.toString();
    locationDetail.PostalCode = context.parameters.PostalCode.raw?.toString();
    locationDetail.Telephone = context.parameters.Telephone.raw?.toString();
    locationDetail.Latitude = context.parameters.Latitude.raw
      ? context.parameters.Latitude.raw
      : undefined;
    locationDetail.Longitude = context.parameters.Longitude.raw
      ? context.parameters.Longitude.raw
      : undefined;
    this.mapHandler.updateLocationFromPointData(locationDetail, false);
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return this.locationDetail;
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
  }

  public updateLocationPoint(locationDetail: LocationDetail) {
    this.locationDetail = locationDetail;
    this.notifyOutputChanged();
  }
}
