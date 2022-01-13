# ginlibs-es-query-dls

[![NPM version](https://badgen.net/npm/v/ginlibs-es-query-dls)](https://www.npmjs.com/package/ginlibs-es-query-dls)
[![NPM Weekly Downloads](https://badgen.net/npm/dw/ginlibs-es-query-dls)](https://www.npmjs.com/package/ginlibs-es-query-dls)
[![License](https://badgen.net/npm/license/ginlibs-es-query-dls)](https://www.npmjs.com/package/ginlibs-es-query-dls)

> 生成 es 查询 dls 的工具类

## 安装

```sh
npm i ginlibs-es-query-dls --save
```

## 使用例子

```js
import EsQueryDls from 'ginlibs-es-query-dls'

const dls = new EsQueryDls().must
  .term({
    name: {
      value: 'apple',
      keyword: true,
    },
  })
  .toQuery('fruit_es', 'fruit_type')

console.log(dls)

/**
{
  "index": "fruit_es",
  "type": "fruit_type",
  "body": {
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "name.keyword": "apple"
            }
          }
        ]
      }
    }
  }
}
**/
```

# 目录

<!-- TOC -->

- [API](#api)
  - [精确查找 term](#term-api)
  - [模糊查找 like](#like-api)
  - [范围查找 range](#range-api)

## API

- api 都有带有一个上层条件，意义如下
  - `must`: 对应 es 的 must 条件，对应 `与` 逻辑
  - `filter`: 对应 es 的 filter 条件，对应 `与` 逻辑，和 must 不同，filter 不进行评分，查询性能更好
  - `not`: 对应 es 的 must_not 条件，对应 `非` 逻辑
  - `should`: 对应 es 的 must 条件，对应 `或` 逻辑

### term api

- `.must.term(data)`
- `.filter.term(data)`
- `.not.term(data)`
- `.should.term(data)`

> 对应的 es 的 term 条件，表示全匹配

#### 参数：data

- Type: `Object`
- Desc:
  - data 的 键名 是要筛选的字段名，键值是要查询的 字段值
  - 键值 也可以是一个对象，{value: 'any', keyword: true}, value 是查询的 字段值， keyword 表示是否制定为 keyword 类型

#### 例子

```js
new EsQueryDls().not.term({
  name: {
    value: 'apple',
    keyword: true,
  },
})
```

生成的 dls:

```json
{
  "must_not": [
    {
      "term": {
        "name.keyword": "apple"
      }
    }
  ]
}
```

### like api

- `.must.like(data)`
- `.filter.like(data)`
- `.not.like(data)`
- `.should.like(data)`

> 对应的 es 的 wildcard 条件，表示模糊匹配

#### 参数：data

- Type: `Object`
- Desc:
  - data 的 键名 是要筛选的字段名，键值是要查询的 字段值

#### 例子

```js
new EsQueryDls().must.like({
  name: {
    value: 'apple',
  },
})
```

生成的 dls:

```json
{
  "must": [
    {
      "wildcard": {
        "name.keyword": "*apple*"
      }
    }
  ]
}
```

### range api

- `.must.range(data)`
- `.filter.range(data)`
- `.not.range(data)`
- `.should.range(data)`

> 对应的 es 的 range 条件，表示范围匹配

#### 参数：data

- Type: `Object`
- Desc:
  - data 的 键名 是要筛选的字段名，键值是对应的范围信息 rangeInfo
  - rangeInfo
    - Type: `Object`
    - Desc: 键名只能是 gte, lte, lt, gt, 键值是具体范围值

#### 例子

```js
new EsQueryDls().must.like({
  count: {
    gt: 0,
    lt: 10,
  },
})
```

生成的 dls:

```json
{
  "must": [
    {
      "range": {
        "count": {
          "gt": 0,
          "lt": 10
        }
      }
    }
  ]
}
```

# Test Report

> Tests are using jest, to run the tests use:

```sh
$ npm run test
```

report detail

```sh
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   75.51 |    22.62 |   52.38 |   76.84 |
 index.ts |   53.19 |     12.5 |   28.57 |   55.56 | 35-64,71,96-114
 leaf.ts  |   96.08 |    83.33 |     100 |      96 | 59,97
----------|---------|----------|---------|---------|-------------------
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        3.418 s
Ran all test suites.
```

---

# License (MIT)
