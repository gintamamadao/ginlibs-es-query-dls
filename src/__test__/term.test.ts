import EsQueryDls from '../index'

describe('es query dls build', () => {
  const getBaseDls = (data: any) => {
    return {
      index: 'test',
      type: 'type',
      body: {
        query: {
          bool: data,
        },
      },
    }
  }
  const getMustDls = (data) => {
    return getBaseDls({
      must: data,
    })
  }
  test('must.term', async () => {
    const dls = new EsQueryDls().must
      .term({
        a: 0,
        b: 1,
        c: [2, 3],
      })
      .toQuery('test')
    expect(dls).toStrictEqual(
      expect.objectContaining(
        getMustDls([
          {
            term: {
              a: 0,
            },
          },
          {
            term: {
              b: 1,
            },
          },
          {
            terms: {
              c: [2, 3],
            },
          },
        ])
      )
    )
  })
  test('must.term - object', async () => {
    const dls = new EsQueryDls().must
      .term({
        a: {
          value: '0',
        },
      })
      .toQuery('test')
    expect(dls).toStrictEqual(
      expect.objectContaining(
        getMustDls([
          {
            term: {
              a: '0',
            },
          },
        ])
      )
    )
  })
  test('must.term - keyword', async () => {
    const dls = new EsQueryDls().must
      .term({
        a: {
          value: '0',
          keyword: true,
        },
      })
      .toQuery('test')
    expect(dls).toStrictEqual(
      expect.objectContaining(
        getMustDls([
          {
            term: {
              'a.keyword': '0',
            },
          },
        ])
      )
    )
  })
  test('must.like', async () => {
    const dls = new EsQueryDls().must
      .like({
        a: 'a',
      })
      .toQuery('test')
    expect(dls).toStrictEqual(
      expect.objectContaining(
        getMustDls([
          {
            wildcard: {
              'a.keyword': '*a*',
            },
          },
        ])
      )
    )
  })
  test('must.range', async () => {
    const dls = new EsQueryDls().must
      .range({
        a: {
          gt: 0,
          lt: 10,
        },
      })
      .toQuery('test')
    expect(dls).toStrictEqual(
      expect.objectContaining(
        getMustDls([
          {
            range: {
              a: {
                gt: 0,
                lt: 10,
              },
            },
          },
        ])
      )
    )
  })
})
