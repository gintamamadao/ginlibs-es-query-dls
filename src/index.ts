import { isNumber } from 'ginlibs-type-check'
import { filterNoKeyObj } from 'ginlibs-format'
import { LeafClauses, AnyObj } from './leaf'
import { setKey, getKey } from 'ginlibs-set-key'

export interface PagingInfo {
  from?: number
  size?: number
}

export class EsQueryDls {
  public queryDLS: AnyObj = {}
  public esIndex = ''
  public filter: LeafClauses<EsQueryDls>
  public must: LeafClauses<EsQueryDls>
  public not: LeafClauses<EsQueryDls>
  public should: LeafClauses<EsQueryDls>
  protected pagingInfo: PagingInfo

  constructor(
    esIndex = '',
    queryDLS?: AnyObj,
    pagingInfo?: PagingInfo
  ) {
    this.esIndex = esIndex
    this.queryDLS = queryDLS ?? setKey('query.bool', {}, this.queryDLS)
    this.pagingInfo = pagingInfo ?? {}
    this.filter = new LeafClauses<EsQueryDls>('filter', this)
    this.must = new LeafClauses<EsQueryDls>('must', this)
    this.not = new LeafClauses<EsQueryDls>('must_not', this)
    this.should = new LeafClauses<EsQueryDls>('should', this)
  }

  public index(esIndex: string) {
    this.esIndex = esIndex
    return TouchList
  }

  public sort(key: string, order: 'desc' | 'asc') {
    const saveKey = 'sort'
    const curObj = getKey(saveKey, this.queryDLS) || []
    curObj.push({
      [key]: {
        order,
      },
    })
    setKey(saveKey, curObj, this.queryDLS)
    return this
  }

  public clone() {
    return this.newInst(this.esIndex, this.queryDLS, this.pagingInfo)
  }

  public pagination(cur: number, size: number) {
    this.pagingInfo = this.getESPagination(cur, size)
    return this
  }

  public setScrollSize(size: number) {
    this.pagingInfo = {
      size,
    }
    return this
  }

  public formatDLS(queryDLS: AnyObj) {
    const boolObj = getKey('query.bool', queryDLS)
    const filterBoolObj = filterNoKeyObj(boolObj)
    if (Object.keys(filterBoolObj).length <= 0) {
      return setKey('query.bool.must[0].match_all', {}, queryDLS)
    }
    return queryDLS
  }

  public toQuery(index: string = this.esIndex, type = 'type') {
    const query = {
      index,
      type,
      body: {
        ...this.formatDLS(this.queryDLS),
      },
      ...this.pagingInfo,
    }
    this.reset()
    return query
  }

  public reset() {
    this.queryDLS = setKey('query.bool', {})
    this.pagingInfo = {}
    return this
  }

  public newInst(esIndex: string, queryDLS?: AnyObj, pagingInfo?: PagingInfo) {
    return new EsQueryDls(esIndex, queryDLS, pagingInfo)
  }

  public getData(resp: any = {}) {
    const total: number =
      resp.body?.hits?.total?.value ?? resp.body?.hits?.total ?? 0
    const record =
      resp.body?.hits?.hits?.map((item) => item._source)?.filter?.((v) => v) ??
      []
    return {
      total,
      record,
    }
  }

  public getESPagination(cur: number, size: number) {
    const current = isNumber(cur) ? cur : 1
    const pageSize = isNumber(size) ? size : 10
    return {
      size: pageSize,
      from: (current - 1) * pageSize,
    }
  }
}

export default EsQueryDls
