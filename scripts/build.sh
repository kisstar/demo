#!/bin/bash
 
work_dir=$(pwd)
vue_app_dir="packages/vue"

npm i -g pnpm

# 安装编译 Vue 应用
cd $vue_app_dir
pnpm i
npm run build

# 复制静态资源
cd $work_dir
cp -r packages/vue/dist dist
cp -r pages/ dist/
ls -l dist
