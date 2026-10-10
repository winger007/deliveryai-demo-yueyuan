import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronRight, Flame, MapPin, QrCode, Sparkles, Users } from 'lucide-react'
import hotpot from '@/assets/hotpot.jpg'
import { Button } from '@/components/ui/button'
import { products } from '@/data/menu'
import type { DishOrderStats } from '@/hooks/useDishOrderStats'

const tableOptions = [
  { code: 'A08', areaKey: 'bind.area.hall', seats: 4 },
  { code: 'B12', areaKey: 'bind.area.booth', seats: 6 },
  { code: 'C06', areaKey: 'bind.area.room', seats: 4 },
  { code: 'D03', areaKey: 'bind.area.window', seats: 6 },
]

interface HomeViewProps {
  onBind: (table: string) => void
  dishOrderStats: DishOrderStats
}

export function HomeView({ onBind, dishOrderStats }: HomeViewProps) {
  const { t } = useTranslation()

  const popularDishes = useMemo(() => {
    return [...products]
      .map(p => ({
        ...p,
        monthlyOrderedCount: dishOrderStats[p.id]?.monthlyOrderedCount ?? p.monthlyOrderedCount ?? 0,
      }))
      .sort((a, b) => b.monthlyOrderedCount - a.monthlyOrderedCount)
      .slice(0, 3)
  }, [dishOrderStats])

  return (
    <main className="relative min-h-screen overflow-hidden bg-rice-100 paper-noise">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-chili-100 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-amber-100 blur-3xl" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:px-10">
        <section className="animate-rise">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-chili-500/20 bg-white/80 px-3 py-2 text-xs font-bold text-chili-600 shadow-sm">
            <Sparkles size={14} /> {t('common.concept_badge')}
          </div>
          <p className="mb-3 text-sm font-bold tracking-widest text-chili-500">{t('common.concept_en')}</p>
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-charcoal-900 sm:text-5xl lg:text-6xl">
            {t('bind.title_l1')}<br /><span className="text-chili-500">{t('bind.title_l2')}</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-charcoal-500">{t('bind.desc')}</p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm text-charcoal-700">
            {[t('bind.feature1'), t('bind.feature2'), t('bind.feature3')].map((item) => (
              <span key={item} className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm"><Check size={15} className="text-chili-500" />{item}</span>
            ))}
          </div>
        </section>

        <section className="animate-rise rounded-3xl border border-white/80 bg-white/90 p-4 shadow-float backdrop-blur sm:p-6">
          <div className="relative mb-6 h-48 overflow-hidden rounded-2xl sm:h-56">
            <img src={hotpot} alt={t('bind.img_alt')} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
              <div><p className="text-xs opacity-80">{t('common.simulated_store')}</p><h2 className="text-xl font-bold">{t('common.store_name')}</h2></div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">{t('common.open')}</span>
            </div>
          </div>
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-rice-100 p-4">
            <span className="rounded-xl bg-white p-3 text-chili-500 shadow-sm"><QrCode /></span>
            <div className="min-w-0 flex-1"><p className="font-bold text-charcoal-900">{t('bind.qr_title')}</p><p className="text-sm text-charcoal-500">{t('bind.qr_desc')}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {tableOptions.map(({ code, areaKey, seats }, index) => (
              <button key={code} onClick={() => onBind(code)} className="group rounded-2xl border border-charcoal-900/10 bg-white p-4 text-left transition hover:-translate-y-1 hover:border-chili-500 hover:shadow-card">
                <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-rice-100 text-sm font-extrabold text-chili-500">{index + 1}</span>
                <p className="font-bold text-charcoal-900">{code} · {t(areaKey)}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-charcoal-500"><Users size={13} /> {t('bind.seats', { count: seats })}</p>
                <ChevronRight size={17} className="ml-auto mt-2 text-charcoal-500 transition group-hover:translate-x-1 group-hover:text-chili-500" />
              </button>
            ))}
          </div>
          <Button onClick={() => onBind('A08')} className="mt-4 w-full"><MapPin size={17} />{t('bind.quick_enter')}</Button>

          {/* 最近一个月最受欢迎菜品 */}
          <div className="mt-6 border-t border-charcoal-900/5 pt-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-charcoal-900">
              <Flame size={16} className="text-chili-500" /> {t('home.popular_title')}
            </h3>
            <div className="space-y-2">
              {popularDishes.map((product, index) => {
                const stat = dishOrderStats[product.id] || { monthlyOrderedCount: 0, totalOrderedCount: 0 }
                return (
                  <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-charcoal-900/5 bg-rice-50 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-chili-500 text-xs font-bold text-white">{index + 1}</span>
                    <img src={product.image} alt={t(product.name)} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-charcoal-900">{t(product.name)}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-charcoal-500">
                        <span className="font-semibold text-chili-600">{t('home.popular_monthly', { count: stat.monthlyOrderedCount })}</span>
                        <span className="text-charcoal-900/20">·</span>
                        <span>{t('home.popular_total', { count: stat.totalOrderedCount })}</span>
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
