/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    Latitude: ComponentFramework.PropertyTypes.NumberProperty;
    Longitude: ComponentFramework.PropertyTypes.NumberProperty;
    AddressName: ComponentFramework.PropertyTypes.StringProperty;
    Country: ComponentFramework.PropertyTypes.StringProperty;
    City: ComponentFramework.PropertyTypes.StringProperty;
    Street: ComponentFramework.PropertyTypes.StringProperty;
    Telephone: ComponentFramework.PropertyTypes.StringProperty;
    PostalCode: ComponentFramework.PropertyTypes.StringProperty;
    GoogleAPIKey: ComponentFramework.PropertyTypes.StringProperty;
    ButtonColor: ComponentFramework.PropertyTypes.StringProperty;
}
export interface IOutputs {
    Latitude?: number;
    Longitude?: number;
    AddressName?: string;
    Country?: string;
    City?: string;
    Street?: string;
    Telephone?: string;
    PostalCode?: string;
}
