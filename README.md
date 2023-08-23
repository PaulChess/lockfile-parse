# @king-fisher/lockfile-parse

此包主要用于解析 lock 文件。`package-lock.json`、`yarn.lock`、`pnpm-lock.yaml` 均支持。

### Install

```bash
npm install @king-fisher/lockfile-parse
```

### Usage

```javascript
import { parseLockFiles, parseSingleLockFile } from '@king-fisher/lockfile-parse'

parseLockFiles()
```

### API

`parseSingleLockFile(filePath)`

**入参**
* `filePath` lock 文件路径

**返回值**
* `<Object>` lock 文件解析出来的对象信息
  * `dependenceList` 从 lock 文件中解析出来的依赖版本信息对象数组
  * `dependenceMap` 由 dependenceList 转换而来，转成了一个对象，并且对相同名称但版本不同的依赖进行了版本合并处理

**`parseLockFiles([root])`**

**入参**
* `root` 根路径（可选）

**返回值**
* `<Array>` 一个对象数组，一个对象代表一个子项目对应的信息
  * `projectName` 项目名
  * `lockFilePath` lock 文件地址
  * `packageJsonFilePath` 同级 package.json 文件地址
  * `dependenceNameList` dependence 依赖名称数组
  * `devDependenceNameList` devDependence 依赖名称数组
  * `dependenceList` 从 lock 文件中解析出来的依赖版本信息对象数组
  * `dependenceMap` 由 dependenceList 转换而来，转成了一个对象，并且对相同名称但版本不同的依赖进行了版本合并处理
  * `firstLevelDependenceMap` 一级依赖（dependencies & devDependencies) 版本关系 Map

**说明**
匹配所有的 `lock` 文件，并解析成指定返回格式。默认从当前命令执行的路径开始向内层匹配，如果传了 `root` 参数，则从指定的路径开始进行匹配。返回格式示例：

```json
[
  {
    "projectName": "parent-project",
    "lockFilePath": "/Users/paulchess/Desktop/Home/@paulchess/parent-project/pnpm-lock.yaml",
    "packageJsonFilePath": "/Users/paulchess/Desktop/Home/@paulchess/parent-project/package.json",
    "dependenceNameList": ["@atom/atom-ui", "@king-fisher/utils"],
    "devDependenceNameList": ["@king-fisher/cli", "@babel/cli"],
    "dependenceList": [{
      "name": "@atom/atom-ui",
      "version": "1.12.3"
    }, {
      "name": "@babel/core-frame",
      "version": "7.12.11"
    }, {
      "name": "@babel/core-frame",
      "version": "7.12.10"
    }],
    "dependenceMap": {
      "@atom/atom-ui": ["1.12.3"],
      "@babel/core-frame": ["7.12.11", "7.12.10"]
    },
    "firstLevelDependenceMap": {
      "@atom/atom-ui": ["1.12.3"],
      "@babel/core-frame": ["7.12.11", "7.12.10"]
    }
  },
  {
    "projectName": "child-project",
    "lockFilePath": "/Users/paulchess/Desktop/Home/@paulchess/parent-project/child-project/yarn.lock",
    "packageJsonFilePath": "/Users/paulchess/Desktop/Home/@paulchess/parent-project/child-project/package.json",
    "dependenceNameList": ["@atom/atom-ui", "@king-fisher/utils"],
    "devDependenceNameList": ["@king-fisher/cli", "@babel/cli"],
    "dependenceList": [{
      "name": "@atom/atom-ui",
      "version": "1.12.3"
    }, {
      "name": "@babel/core-frame",
      "version": "7.12.11"
    }, {
      "name": "@babel/core-frame",
      "version": "7.12.10"
    }],
    "dependenceMap": {
      "@atom/atom-ui": ["1.12.3"],
      "@babel/core-frame": ["7.12.11", "7.12.10"]
    },
    "firstLevelDependenceMap": {
      "@atom/atom-ui": ["1.12.3"],
      "@babel/core-frame": ["7.12.11", "7.12.10"]
    }
  }
]
```

上面返回的示例一般是一个多包项目，正常来讲，单项目的话数组里只有一项。

### Changelog

`0.0.1-alpha.1`

第一版，用于调试。

`0.0.1-beta.1`

优化代码，发一版 beta。

`0.0.1-beta.2`

把 `types/index.ts` 改成 `types/index.d.ts`，使用户使用时可以拿到导出的类型。

`0.0.1-beta.3`

从 `index.ts` 中导出类型

`0.0.1-beta.4`

解析结果中增加 `firstLevelDependenceMap` 属性，表示一级依赖（dependencies & devDependencies) 版本关系 Map