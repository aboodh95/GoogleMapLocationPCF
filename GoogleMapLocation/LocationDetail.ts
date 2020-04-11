import { IOutputs } from "./generated/ManifestTypes";

export class LocationDetail implements IOutputs {
  AddressName?: string;
  Country?: string;
  City?: string;
  Street?: string;
  Telephone?: string;
  PostalCode?: string;
  Latitude?: number;
  Longitude?: number;
}
