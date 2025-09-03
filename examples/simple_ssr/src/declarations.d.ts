declare const PATH_SEP: string;

declare module 'better-spawn' {
  const exp: (command: string, options?: any) => { close: () => void; stdout: any; stderr: any } =
    () => {
      return void 0;
    };

  export default exp;
}
interface Window {
  INITIAL_DATA: any;
}
