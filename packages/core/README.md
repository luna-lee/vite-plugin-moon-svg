# vite-plugin-moon-svg

- svg文件可通过import直接作为组件使用
- import的svg文件，除了默认返回一个vue组件，还返回当前svg的文本内容context
- 可通过virtual:moon-svg-get模块，依据svg名获取svg对应的组件。或获取全部svg对应的组件

# 参数

| 名称      | 说明                                                                       | 参数 |
| --------- | -------------------------------------------------------------------------- | ---- |
| dir       | svg文件目录，相对于项目更目录。 当不使用virtual:moon-svg-get模块时可以不传 | -    |
| transfrom | 对svg文件进行操作，如替换修改属性等。                                      | -    |
| ctxable   | 是否同时返回svg文本                                                        | -    |

```javascript
// global.d.ts
/// <reference types="vite-plugin-moon-svg/types" />


// vite.config.ts

plugins:[
  MoonSvgPlugin({
        dir: 'src/assets/svg',
        transfrom: (svg,filename,filepath) =>
        // 亦可依据filename或filepath，指定修改svg
          svg
            .replace(/fill(\s*)=(\s*)"[^"]*"/g, '')
            .replace(/width(\s*)=(\s*)"[^"]*"/, '')
            .replace(/height(\s*)=(\s*)"[^"]*"/, '')
            .replace(/^<svg /, '<svg fill="currentColor" width="1em" height="1em" '),
      }),
]

// compontent.vue
// 组件使用
<templaget>
    <logOut ></logOut>
</templaget>
<script setup lang="ts">
    //logOut为logOut.svg的vue组件，context为logOut.svg的文本内容
    // context只有插件配置了ctxable:true 时才有。
    import logOut,{context} from '@/assets/svg/logOut.svg'

</script>

// 'virtual:moon-svg-get'
interface MoonSvgIconType {
  component: string; // 或者根据实际类型进行更精确的定义
  name: string;
  context: string;
}

<templaget>
    单个svg图标
  <component v-if="CustomSvg" :is="CustomSvg.component"></component>
  单个svg文本内容
  {{CustomSvg.context}}
    全部svg图标
  <component v-for="icon in customIcons" :key="icon.name" :is="icon.component" @click="iconName = icon.name"></component>

</templaget>
<script setup lang="ts">
 import getCustomSvg from 'virtual:moon-svg-get';
 const CustomSvg = ref<MoonSvgIconType | null>(null);
 CustomSvg.value = (await getCustomSvg({ name:'logOut' })) as MoonSvgIconType;

const customIcons = ref<MoonSvgIconType[]>([]);

getCustomSvg({ all: true }).then((arr) => {
    customIcons.value = arr as MoonSvgIconType[];
});
</script>
```
