# vite-plugin-moon-svg

## 功能

1. svg 文件可通过 import 直接作为组件使用
2. import 的 svg 文件，除了默认返回一个 vue 组件，还返回当前 svg 的文本内容 context
3. 可通过 virtual:moon-svg-get 模块，依据 svg 名获取 svg 对应的组件。或获取全部 svg 对应的组件
4. virtual:moon-svg-get 中 依据 svg 名获取 svg 对应的组件，为按需引入，不会导致页面一次加载全部的 svg 文件。

## 安装

```javascript
npm i vite-plugin-moon-svg -S
```

## **配置**

### TS 类型支持

#### 在公共的 d.ts 文件中添加下面的代码

```typescript
/// <reference types="vite-plugin-moon-svg/types" />
```

#### 或者在 tsconfig.json 文件添加

```typescript
"types": ["vite-plugin-moon-svg/types"],
```

#### 类型内容

```typescript
declare module "*.svg" {
  const Component: DefineComponent<{}, {}, any>;

  export default Component;

  export const context: string;
}

declare interface MoonSvgIconType {
  component: string; // 或者根据实际类型进行更精确的定义

  name: string;

  context?: string; //需要再插件配置开启ctxable，
}

declare module "virtual:moon-svg-get" {
  const result: (args: {
    name?: string;
    all?: boolean;
  }) => Promise<MoonSvgIconType | MoonSvgIconType[] | null>;

  export default result;
}
```

## vite.config.ts 文件

### 参数

| 名称      | 说明                                                                           | 参数                |
| --------- | ------------------------------------------------------------------------------ | ------------------- |
| dir       | 必填， svg文件目录， <br />子目录中的文件，svg 组件名为 ：{子目录名}-{文件名} | -                   |
| transfrom | 对 svg 文件进行操作，如替换修改属性等。                                        | (svg,filepath)=>svg |
| ctxable   | import 文件时，是否同时返回 svg 的文本内容                                     | -                   |

##### dir 说明

- 相对于项目更目录。只会对改路径下的 svg 文件引用做修改。
- 该路径下的 svg 不能通过 img 元素直接使用。
- 组件名为 ：{子目录名}-{文件名}，支持多个子目录。

##

```typescript
//添加插件
import MoonSvgPlugin from "vite-plugin-moon-svg";
plugins: [
  MoonSvgPlugin({
    dir: "src/assets/svg",
    transfrom: (svg, filepath) =>
      // 亦可依据filename或filepath，指定修改svg
      svg
        .replace(/fill(\s*)=(\s*)"[^"]*"/g, "")
        .replace(/width(\s*)=(\s*)"[^"]*"/, "")
        .replace(/height(\s*)=(\s*)"[^"]*"/, "")
        .replace(
          /^<svg /,
          '<svg fill="currentColor" width="1em" height="1em" '
        ),
  }),
];
```

## 组件使用

### 直接引入 svg 文件使用

```vue
<templaget>
    <logOut ></logOut>
</templaget>

<script setup lang="ts">
//logOut为logOut.svg的vue组件，context为logOut.svg的文本内容
// context只有插件配置了ctxable:true 时才有。
import logOut, { context } from "@/assets/svg/logOut.svg";
</script>
```

### 通过 virtual:moon-svg-get 模块，依据文件名按需动态获取 svg 文件

```vue
<templaget>
    单个svg图标
  <component v-if="CustomSvg" :is="CustomSvg.component"></component>
  单个svg文本内容
  {{CustomSvg.context}}
    全部svg图标
  <component v-for="icon in customIcons" :key="icon.name" :is="icon.component" @click="iconName = icon.name"></component>

</templaget>

<script setup lang="ts">
import getCustomSvg from "virtual:moon-svg-get";

const CustomSvg = ref<MoonSvgIconType | null>(null);
CustomSvg.value = (await getCustomSvg({ name: "logOut" })) as MoonSvgIconType;

const customIcons = ref<MoonSvgIconType[]>([]);

getCustomSvg({ all: true }).then((arr) => {
  customIcons.value = arr as MoonSvgIconType[];
});
</script>
```
