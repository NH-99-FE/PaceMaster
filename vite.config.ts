/*
 * @Author: lianglonghui_i lianglonghui_i
 * @Date: 2025-11-26 10:58:45
 * @LastEditors: lianglonghui_i lianglonghui_i
 * @LastEditTime: 2025-11-26 18:03:26
 * @FilePath: /react-practice/vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
