declare module '*.svg' {
  const Component: DefineComponent<{}, {}, any>;

  export default Component;
  export const context: string;
}

declare interface MoonSvgIconType {
  component: string; // 或者根据实际类型进行更精确的定义
  name: string;
  context?: string; //需要再插件配置开启ctxable，
}
declare module 'virtual:moon-svg-get' {
  const result: (args: { name?: string; all?: boolean }) => Promise<MoonSvgIconType | MoonSvgIconType[] | null>;
  export default result;
}
