import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { isWishOwned, SkyWishText } from './SharedSkySection'


describe('Shared Sky wish text', () => {
  it('escapes untrusted wish text instead of rendering HTML', () => {
    const maliciousText = '<img src=x onerror="alert(1)">'

    const html = renderToStaticMarkup(<SkyWishText text={maliciousText} />)

    expect(html).not.toContain('<img')
    expect(html).toBe('<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>')
  })

  it('allows deletion only for wishes owned by this browser', () => {
    expect(isWishOwned('owned-wish', ['owned-wish'])).toBe(true)
    expect(isWishOwned('someone-elses-wish', ['owned-wish'])).toBe(false)
  })
})
