// declare module '*.aac';
// declare module '*.ejs';
// declare module '*.eot';
// declare module '*.gif';
// declare module '*.jpeg';
// declare module '*.jpg';
// declare module '*.m4a';
// declare module '*.mp3';
// declare module '*.mp4';
declare module '*.m4a';
// declare module '*.oga';
// declare module '*.otf';
// declare module '*.png';
// declare module '*.ttf';
// declare module '*.wav';
// declare module '*.webm';
// declare module '*.webp';
// declare module '*.woff';
// declare module '*.woff2';
// declare module '*.ico';

// declare module '*.html' {
//   const value: string;
//   export default value;
// }

declare module '*.svg' {
  const src: React.FC<React.SVGProps<SVGSVGElement>>;
  export default src;
}

// declare module '*.json' {
//   const content: string;
//   export default content;
// }

// declare module '*.txt' {
//   const content: string;
//   export default content;
// }

// // Need this so typescript doesn't faint over querystrings in import paths
// declare module '*?url' {
//   const value: string;
//   export default value;
// }

// interface Window {
//   webkitAudioContext: typeof AudioContext;
//   dataLayer: unknown[];
//   SwellWidget?: { init(): void };
//   SwellAppChannel: {
//     postMessage(s: string): void;
//   };
//   __REACT_QUERY_STATE__: DehydratedState;
//   swell_showTOS(): void;
//   sw_ia(): Promise<boolean>;
//   sw_ah(): Promise<string>;
//   sw_gu(): Promise<userInfo>;
//   sw_ta(info: IAuthTrack): void;
//   sw_phub(): Promise<boolean>;
//   sw_cw(wave: number[]): Promise<number[]>;
//   sw_react(props: { swellId: string; replyId?: string; pressedState?: string }): Promise<'PRESSED' | 'NOTPRESSED' | null>;
//   sw_notfn(): Promise<boolean>;
// }
