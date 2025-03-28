import { Data } from "./Data";

export class Character implements Data {
    id: string;
    type: string;
    new: boolean;
    update: boolean;
    name: string;
    desc: string;
    status: {
        current: string;
        deathAt: string;
        deathInfo: string;
    };
}