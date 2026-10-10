import { useState, useCallback } from 'react'
import { products } from '@/data/menu'
import type { CartItem } from '@/types'

export interface DishOrderStat {
  monthlyOrderedCount: number
  totalOrderedCount: number
}

export type DishOrderStats = Record<string, DishOrderStat>

const STORAGE_KEY = 'dish-order-stats'
const SESSION_KEY = 'dish-order-stats-demo'

/** 为所有菜品生成 0~100 的随机点单数量（近一月 + 历史总两个口径）。 */
function generateDemoStats(): DishOrderStats {
  const stats: DishOrderStats = {}
  for (const product of products) {
    stats[product.id] = {
      monthlyOrderedCount: Math.floor(Math.random() * 101),
      totalOrderedCount: Math.floor(Math.random() * 101),
    }
  }
  return stats
}

/** 加载菜品点单统计：优先 localStorage（提交订单后的持久化数据），其次 sessionStorage（同会话 demo 随机数据），最后生成新 demo 数据。 */
function loadStats(): DishOrderStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as DishOrderStats
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch {
    // localStorage 不可用时降级
  }

  try {
    const demo = sessionStorage.getItem(SESSION_KEY)
    if (demo) {
      const parsed = JSON.parse(demo) as DishOrderStats
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch {
    // sessionStorage 不可用时降级
  }

  // 首次加载：生成 demo 随机数据，存入 sessionStorage 保持会话内固定
  const demo = generateDemoStats()
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(demo))
  } catch {
    // sessionStorage 不可用时仅保留内存态
  }
  return demo
}

/** 持久化统计数据到 localStorage，不可用时降级为内存态。 */
function persistStats(stats: DishOrderStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // localStorage 不可用时不报错
  }
}

/**
 * 菜品点单次数统计 hook。
 * - 页面加载时从 localStorage / sessionStorage 恢复统计数据
 * - 提交订单时递增对应菜品的近一月和历史总点单次数，并持久化到 localStorage
 * - demo 环境首次加载自动生成 0~100 随机值，会话内固定
 */
export function useDishOrderStats() {
  const [stats, setStats] = useState<DishOrderStats>(loadStats)

  const increment = useCallback((items: CartItem[]) => {
    setStats(prev => {
      const next = { ...prev }
      for (const item of items) {
        const current = next[item.productId] || { monthlyOrderedCount: 0, totalOrderedCount: 0 }
        next[item.productId] = {
          monthlyOrderedCount: current.monthlyOrderedCount + item.quantity,
          totalOrderedCount: current.totalOrderedCount + item.quantity,
        }
      }
      persistStats(next)
      return next
    })
  }, [])

  return { stats, increment }
}
