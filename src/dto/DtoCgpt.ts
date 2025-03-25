import { Character } from "src/entity/Character";
import { Data } from "src/entity/Data";

export interface WorldBuildingOutput {
    threadId: string;
    runId: string;
    status: string;
    isDone: boolean;
    response: CgptWorldBuildingOutputFirstPhase | CgptWorldBuildingOutputSecondPhase | CgptWorldBuildingOutputThirdPhase | null;
}

export interface CgptWorldBuildingOutputFirstPhase {
    worldStory: string;
}

export interface CgptWorldBuildingOutputSecondPhase {
    mainCharacters: [Character];
}

export interface CgptWorldBuildingOutputThirdPhase {
    data: [Data];
}