import { Data } from "./Data";

export class Faction implements Data {
    id: string;
    type: string;
    new: boolean;
    update: boolean;
    name: string;
    desc: string;
}