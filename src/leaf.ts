import { isObject, isArray, isNilVal } from 'ginlibs-type-check'
import { setKey, getKey } from 'ginlibs-set-key'
import { filterNilKey } from 'ginlibs-format'

export type AnyObj = Record<string, any>

export type LeafType = 'must' | 'filter' | 'must_not' | 'should'

export interface TermParamsItem {
  value: number | string | number[] | string[]
  keyword?: boolean
}

export interface TermParams {
  [p: string]: number | string | number[] | string[] | TermParamsItem
}

export const RangeSymbol = {
  gte: true,
  lte: true,
  lt: true,
  gt: true,
}

export type RangeParams = Record<
  string,
  Partial<
    {
      [p in keyof typeof RangeSymbol]: string | number
    }
  >
>

export class LeafClauses<T = any> {
  private _leafQueryKey = ''
  private _parent: T
  constructor(type: LeafType, parent: T) {
    this._leafQueryKey = `query.bool.${type}`
    this._parent = parent
  }
  public term(obj: TermParams) {
    const curQueryObj = this.getCurQueryObj()
    const newObj = filterNilKey(obj)
    for (const key of Object.keys(newObj)) {
      const value = newObj[key]
      let queryKey = key
      let queryValue = value
      let queryType = 'term'
      if (isObject<TermParamsItem>(value)) {
        if (value.keyword) {
          queryKey = `${queryKey}.keyword`
        }
        queryValue = value.value
      }
      if (isArray(queryValue)) {
        queryType = 'terms'
      }
      if (isNilVal(queryValue)) {
        continue
      }
      curQueryObj.push({
        [queryType]: {
          [queryKey]: queryValue,
        },
      })
    }
    this.setCurQueryObj(curQueryObj)
    return this._parent
  }

  public like(obj: AnyObj) {
    const curQueryObj = this.getCurQueryObj()
    const newObj = filterNilKey(obj)
    for (const key of Object.keys(newObj)) {
      const value = newObj[key]
      const queryKey = `${key}.keyword`
      const queryValue = `*${value}*`
      const queryType = 'wildcard'
      curQueryObj.push({
        [queryType]: {
          [queryKey]: queryValue,
        },
      })
    }
    this.setCurQueryObj(curQueryObj)
    return this._parent
  }

  public range(obj: RangeParams) {
    const curQueryObj = this.getCurQueryObj()
    const newObj = filterNilKey(obj)
    for (const key of Object.keys(newObj)) {
      const value = newObj[key]
      const isEmpty =
        Object.keys(value).filter((it) => RangeSymbol[it]).length <= 0
      if (isEmpty) {
        continue
      }
      curQueryObj.push({
        range: {
          [key]: value,
        },
      })
    }
    this.setCurQueryObj(curQueryObj)
    return this._parent
  }

  protected getCurQueryObj() {
    const key = this._leafQueryKey
    return getKey(key, (this._parent as any).queryDLS) || []
  }

  protected setCurQueryObj(obj: AnyObj) {
    const key = this._leafQueryKey
    return setKey(key, obj, (this._parent as any).queryDLS)
  }
}
