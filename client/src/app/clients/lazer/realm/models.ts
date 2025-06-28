import { Types } from "realm";

export type RealmBeatmapSet = {
  ID: Types.UUID;
  OnlineID: Types.Int;
  DateAdded: Date;
  DateSubmitted?: Date;
  DateRanked?: Date;
  Beatmaps: Types.List;
  Files: Types.List;
  Status: Types.Int;
  DeletePending: Types.Bool;
  Protected: Types.Bool;
  Hash?: Types.String;
};

export type RealmCollection = {
  ID: Types.UUID;
  Name?: Types.String;
  BeatmapMD5Hashes: Types.List<Types.String>;
  LastModified: Types.Date;
};
