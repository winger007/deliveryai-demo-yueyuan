import { test, expect, type Page } from '@playwright/test'

/** 从首页进入并等待页面加载完成（首页即热门菜品模块所在视图）。 */
async function goToHome(page: Page) {
  await page.goto('/')
  await expect(page).toHaveURL(/#\/home$/)
}

/** 解析热门菜品列表中的点单数量文本，返回 { rank, name, monthly, total } 数组。 */
async function readPopularDishes(page: Page) {
  const section = page.locator('h3', { hasText: /最近一个月最受欢迎|Most Popular This Month/ })
  await expect(section).toBeVisible()
  const container = section.locator('..')
  const dishRows = container.locator('div.flex.items-center.gap-3.rounded-2xl')
  const count = await dishRows.count()

  const dishes: { rank: number; name: string; monthly: number; total: number }[] = []
  for (let i = 0; i < count; i++) {
    const row = dishRows.nth(i)
    const rankText = await row.locator('span').first().textContent()
    const nameText = await row.locator('p.truncate').textContent()
    const monthlyText = await row.locator('span.font-semibold').textContent()
    const totalText = await row.locator('span').last().textContent()

    const rank = parseInt((rankText || '').trim(), 10)
    const name = (nameText || '').trim()
    const monthly = parseInt((monthlyText || '').replace(/[^0-9]/g, ''), 10)
    const total = parseInt((totalText || '').replace(/[^0-9]/g, ''), 10)

    dishes.push({ rank, name, monthly, total })
  }
  return dishes
}

test.describe('首页热门菜品展示 - E2E 验收测试', () => {
  test('REQ-001.1: 首页右侧卡片内桌台绑定下方可见热门菜品展示模块', async ({ page }) => {
    await goToHome(page)
    // 验证模块标题可见
    const title = page.locator('h3', { hasText: /最近一个月最受欢迎|Most Popular This Month/ })
    await expect(title).toBeVisible()
    // 验证桌台绑定区域在热门菜品模块上方（桌台按钮仍可见且可用）
    await expect(page.getByRole('button', { name: /A08/ }).first()).toBeVisible()
  })

  test('REQ-001.2: 热门菜品展示前 3 道', async ({ page }) => {
    await goToHome(page)
    const dishes = await readPopularDishes(page)
    expect(dishes.length).toBe(3)
    // 验证排名序号为 1, 2, 3
    expect(dishes.map(d => d.rank)).toEqual([1, 2, 3])
  })

  test('REQ-001.3: 每道菜品同时显示近一月和历史总点单数量', async ({ page }) => {
    await goToHome(page)
    const dishes = await readPopularDishes(page)
    expect(dishes.length).toBeGreaterThan(0)
    for (const dish of dishes) {
      // 近一月数量文本包含"近一月"或"Last month"
      // 历史总数量文本包含"历史"或"Total"
      // 验证数值为有效数字
      expect(dish.monthly).toBeGreaterThanOrEqual(0)
      expect(dish.total).toBeGreaterThanOrEqual(0)
      expect(dish.name.length).toBeGreaterThan(0)
    }
  })

  test('REQ-001.4: 热门菜品按近一月点单次数从高到低排列', async ({ page }) => {
    await goToHome(page)
    const dishes = await readPopularDishes(page)
    expect(dishes.length).toBe(3)
    // 验证降序排列
    for (let i = 1; i < dishes.length; i++) {
      expect(dishes[i - 1].monthly).toBeGreaterThanOrEqual(dishes[i].monthly)
    }
  })

  test('REQ-001.5: 热门菜品模块不影响既有桌台绑定功能', async ({ page }) => {
    await goToHome(page)
    // 点击桌台按钮仍可正常绑定并进入 welcome 视图
    await page.getByRole('button', { name: /A08/ }).first().click()
    await expect(page).toHaveURL(/#\/welcome$/)
  })

  test('REQ-003.1: Demo 环境下点单数量为 0~100 之间的随机值', async ({ page }) => {
    await goToHome(page)
    const dishes = await readPopularDishes(page)
    for (const dish of dishes) {
      expect(dish.monthly).toBeGreaterThanOrEqual(0)
      expect(dish.monthly).toBeLessThanOrEqual(100)
      expect(dish.total).toBeGreaterThanOrEqual(0)
      expect(dish.total).toBeLessThanOrEqual(100)
    }
  })

  test('REQ-003.2: 不会出现所有菜品点单数量均为 0', async ({ page }) => {
    await goToHome(page)
    const dishes = await readPopularDishes(page)
    const allZero = dishes.every(d => d.monthly === 0 && d.total === 0)
    expect(allZero).toBe(false)
  })

  test('REQ-003.3: 同一会话内多次进入首页，热门菜品点单数量保持不变', async ({ page }) => {
    await goToHome(page)
    const firstVisit = await readPopularDishes(page)

    // 离开首页再回来
    await page.getByRole('button', { name: /A08/ }).first().click()
    await expect(page).toHaveURL(/#\/welcome$/)
    await page.goBack()
    await expect(page).toHaveURL(/#\/home$/)

    const secondVisit = await readPopularDishes(page)
    expect(secondVisit.map(d => `${d.name}:${d.monthly}:${d.total}`))
      .toEqual(firstVisit.map(d => `${d.name}:${d.monthly}:${d.total}`))
  })
})
