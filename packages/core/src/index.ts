import path from "path";
import fs from "fs";
import { createFilter } from "vite";
import { parse, compileTemplate } from "@vue/compiler-sfc";
const absolutePath = (...args: any[]) => path.resolve(process.cwd(), ...args);

/**
 * Description placeholder
 * @author 闰月飞鸟
 *
 * @export
 * @param {{ transfrom?: (svg: string, filename: string, filepath: string) => string; dir?: string }} [param0={}]
 * @param {(svg: string, filename: string, filepath: string) => string} param0.transfrom 可对svg文本内容进行修改
 * @param {string} param0.dir svg目录
 */
export default function MoonSvgPlugin({
  transfrom,
  dir,
  ctxable,
}: {
  transfrom?: (svg: string, filename: string, filepath: string) => string;
  dir?: string;
  ctxable?: boolean;
} = {}) {
  const filter = createFilter(/\.svg$/, undefined);

  return {
    name: "vite-plugin-moon-svg",

    resolveId(id: string) {
      if (id === "virtual:moon-svg-get") {
        return id;
      }
    },
    async transform(_: any, id: string) {
      // 只处理 SVG 文件
      if (!filter(id)) return null;
      // 读取 SVG 文件内容
      let svg = await fs.promises.readFile(id, "utf-8");
      let componentName = "";
      // 设置了目录，对于子目录中的文件，组件名为 {子目录名}-{文件名}
      if (dir) {
        const dirPath = dir.startsWith("/")
          ? absolutePath("." + dir)
          : absolutePath(dir);
        componentName = path
          .relative(dirPath, id)
          .replace(".svg", "")
          .replace(/\//g, "-");
      }
      const filename = path.basename(id, ".svg");
      // 若没有dir，这直接为文件名
      if (!componentName) componentName = filename;

      if (typeof transfrom == "function")
        svg = transfrom(svg, filename, componentName);
      const str = `
            <template> 
              ${svg} 
            </template>
            <script>
                  export default {}
            </script>
      `;
      const parseValue = parse(str);

      const { code: templateCode } = compileTemplate({
        id,
        filename,
        source: parseValue.descriptor.template!.content,
      });
      let code = templateCode;
      code = `import { markRaw } from 'vue'
            ${code}`;
      code = code.replace(/^export /gm, "");

      code += `
            export default markRaw({ name: '${componentName}', render })`;
      if (ctxable) {
        code += `
        export  const context= '${svg}';
        `;
      }
      return {
        code,
        map: null, // 可选：如果需要 sourcemap，可以在这里返回
      };
    },
    async load(id: string) {
      if (id === "virtual:moon-svg-get") {
        if (!dir) throw "请配置svg目录";
        if (dir && !dir.startsWith("/")) dir = "/" + dir;
        if (dir && !dir.endsWith("/")) dir += "/";
        return `
        const modulesCustomSvg = import.meta.glob('${dir}**/*.svg');
        export default async function ({ name='', all = false } = {}) {
          if (all) {
            const promises = Object.entries(modulesCustomSvg).map(async ([path, loadModule]) => {
              const mod  = await loadModule();
              const name = path.replace('${dir}', '').replace(/\\//g, '-').replace('.svg', '');
              return { component: mod.default, name,context:mod.context } ;
            });
            return await Promise.all(promises);
          }

          if (name) {
            for (const path in modulesCustomSvg) {
              const _name = path.replace('${dir}', '').replace(/\\//g, '-').replace('.svg', '');
              if (name === _name) {
                const mod  = await modulesCustomSvg[path]();
                return { component: mod.default, name: _name,context:mod.context }  ;
              }
            }
          }
          return null;
        }
      `;
      }
    },
  };
}
