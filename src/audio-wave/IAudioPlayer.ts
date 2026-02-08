
export type WaveModel = Array<number>;

export enum PlayerStatus {
  NONE,
  PLAYING,
  PAUSED,
  SEEKING,
  LOADING,
  LOADED,
  STOPPED,
  ERROR,
  LOAD_ERROR,
  PLAY_ERROR,
  BLOCKED,
  COMPLETED,
}

export enum AudioEvents {
  ABORT = 'abort',
  CANPLAY = 'canplay',
  CANPLAYTHROUGH = 'canplaythrough',
  DURATIONCHANGE = 'durationchange',
  EMPTIED = 'emptied',
  ENDED = 'ended',
  ERROR = 'error',
  LOADEDDATA = 'loadeddata',
  LOADEDMETADATA = 'loadedmetadata',
  LOADSTART = 'loadstart',
  PAUSE = 'pause',
  PLAY = 'play',
  PLAYING = 'playing',
  PROGRESS = 'progress',
  RATECHANGE = 'ratechange',
  SEEKED = 'seeked',
  SEEKING = 'seeking',
  STALLED = 'stalled',
  SUSPEND = 'suspend',
  TIMEUPDATE = 'timeupdate',
  VOLUMECHANGE = 'volumechange',
  WAITING = 'waiting',
}

export type AudioContextStateExt = 'closed' | 'running' | 'suspended' | 'interrupted';

export interface IAudioTrack<DataType> {
  id: string;
  src: string;
  data: DataType;
  duration: number;
  isPreloaded?: boolean;
  startPosition: number; // time in seconds where track begins in the entire playlist
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
  resume?(): void; // deprecate

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
  //   audioWave: IAudioWave;
  errors: Error[];

  getPlaylistProgressInfo(playlistProgress: number): { trackIndex: number; position: number };
}
