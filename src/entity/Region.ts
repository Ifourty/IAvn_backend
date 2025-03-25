import { City } from "./City";
import { Data } from "./Data";

export class Region implements Data {
    id: string;
    type: string;
    new: boolean;
    update: boolean;
    name: string;
    cityList: City[];
    positionCenter: {
        x: number;
        y: number;
    };
}