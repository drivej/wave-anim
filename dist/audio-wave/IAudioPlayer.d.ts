export type WaveModel = Array<number>;
export declare enum PlayerStatus {
    NONE = 0,
    PLAYING = 1,
    PAUSED = 2,
    SEEKING = 3,
    LOADING = 4,
    LOADED = 5,
    STOPPED = 6,
    ERROR = 7,
    LOAD_ERROR = 8,
    PLAY_ERROR = 9,
    BLOCKED = 10,
    COMPLETED = 11
}
export declare enum AudioEvents {
    ABORT = "abort",
    CANPLAY = "canplay",
    CANPLAYTHROUGH = "canplaythrough",
    DURATIONCHANGE = "durationchange",
    EMPTIED = "emptied",
    ENDED = "ended",
    ERROR = "error",
    LOADEDDATA = "loadeddata",
    LOADEDMETADATA = "loadedmetadata",
    LOADSTART = "loadstart",
    PAUSE = "pause",
    PLAY = "play",
    PLAYING = "playing",
    PROGRESS = "progress",
    RATECHANGE = "ratechange",
    SEEKED = "seeked",
    SEEKING = "seeking",
    STALLED = "stalled",
    SUSPEND = "suspend",
    TIMEUPDATE = "timeupdate",
    VOLUMECHANGE = "volumechange",
    WAITING = "waiting"
}
export type AudioContextStateExt = 'closed' | 'running' | 'suspended' | 'interrupted';
export interface IAudioTrack<DataType> {
    id: string;
    src: string;
    data: DataType;
    duration: number;
    isPreloaded?: boolean;
    startPosition: number;
    isGroupHead?: boolean;
    groupIndex?: number;
}
export interface IAudioWave {
    setSource(src: string): void;
    play(): void;
    pause(): void;
    wave: WaveModel;
}
export interface IAudioPlayer<DataType, PlaylistDataType> {
    unlocked: boolean;
    isLoading: boolean;
    isSeeking: boolean;
    isCompleted: boolean;
    isPlaying: boolean;
    isPaused: boolean;
    canPlay: boolean;
    canPause: boolean;
    canToggle: boolean;
    canSeek: boolean;
    position: number;
    muted: boolean;
    volume: number;
    duration: number;
    status: PlayerStatus;
    playbackRate: number;
    progress: number;
    play(trackIndex?: number, position?: number, paused?: boolean): void;
    pause(): void;
    seek(position: number): void;
    stop(): void;
    togglePlay(): void;
    toggleMute(muted?: boolean): void;
    resume?(): void;
    playlistData?: PlaylistDataType;
    tracks: IAudioTrack<DataType>[];
    track: IAudioTrack<DataType>;
    trackIndex: number;
    playNext(): void;
    playPrev(): void;
    hasNext: boolean;
    hasPrev: boolean;
    playlistDuration: number;
    playlistProgress: number;
    playlistPosition: number;
    isPlaylistCompleted: boolean;
    playNextGroup(): void;
    playPrevGroup(): void;
    hasNextGroup: boolean;
    hasPrevGroup: boolean;
    wave: WaveModel;
    errors: Error[];
    getPlaylistProgressInfo(playlistProgress: number): {
        trackIndex: number;
        position: number;
    };
}
//# sourceMappingURL=IAudioPlayer.d.ts.map