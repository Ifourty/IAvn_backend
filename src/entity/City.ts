import { Data } from "./Data";

export class City implements Data {
    id: string;
    type: string;
    new: boolean;
    update: boolean;
    name: string;
    positionCenter: {
        x: number;
        y: number;
    };
    desc: string;
}