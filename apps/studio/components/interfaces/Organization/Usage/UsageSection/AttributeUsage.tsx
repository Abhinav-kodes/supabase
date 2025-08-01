import { AlertTriangle, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

import AlertError from 'components/ui/AlertError'
import Panel from 'components/ui/Panel'
import ShimmeringLoader from 'components/ui/ShimmeringLoader'
import SparkBar from 'components/ui/SparkBar'
import type { OrgSubscription } from 'data/subscriptions/types'
import type { OrgMetricsUsage, OrgUsageResponse } from 'data/usage/org-usage-query'
import { USAGE_APPROACHING_THRESHOLD } from 'lib/constants'
import type { ResponseError } from 'types'
import { Button, cn, Tooltip, TooltipContent, TooltipTrigger } from 'ui'
import SectionContent from '../SectionContent'
import { CategoryAttribute } from '../Usage.constants'
import {
  ChartTooltipValueFormatter,
  ChartYFormatterCompactNumber,
  getUpgradeUrl,
} from '../Usage.utils'
import UsageBarChart from '../UsageBarChart'
import { ChartMeta } from './UsageSection'

export interface AttributeUsageProps {
  slug: string
  projectRef?: string
  attribute: CategoryAttribute
  usage?: OrgUsageResponse
  usageMeta?: OrgMetricsUsage
  chartMeta: ChartMeta
  subscription?: OrgSubscription

  error: ResponseError | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean

  currentBillingCycleSelected: boolean
}

const AttributeUsage = ({
  slug,
  projectRef,
  attribute,
  usage,
  usageMeta,
  chartMeta,
  subscription,

  error,
  isLoading,
  isError,
  isSuccess,
  currentBillingCycleSelected,
}: AttributeUsageProps) => {
  const upgradeUrl = getUpgradeUrl(slug ?? '', subscription, attribute.key)
  const usageRatio = (usageMeta?.usage ?? 0) / (usageMeta?.pricing_free_units ?? 0)
  const usageExcess = (usageMeta?.usage ?? 0) - (usageMeta?.pricing_free_units ?? 0)
  const usageBasedBilling = subscription?.usage_billing_enabled
  const exceededLimitStyle = !usageBasedBilling ? 'text-red-900' : 'text-amber-900'

  const chartData = useMemo(() => chartMeta[attribute.key]?.data ?? [], [attribute.key, chartMeta])

  const showUsageWarning =
    projectRef === undefined &&
    currentBillingCycleSelected &&
    usageBasedBilling === false &&
    usageRatio >= USAGE_APPROACHING_THRESHOLD

  const notAllValuesZero = useMemo(() => {
    return (
      attribute.attributes
        ?.map((attr) => {
          return chartData.some((dataPoint) => Number(dataPoint[attr.key]) !== 0)
        })
        .some((x) => !!x) ?? false
    )
  }, [attribute.attributes, chartData])

  return (
    <div id={attribute.anchor} className="scroll-my-12">
      <SectionContent section={attribute}>
        {isLoading && (
          <div className="space-y-2">
            <ShimmeringLoader />
            <ShimmeringLoader className="w-3/4" />
            <ShimmeringLoader className="w-1/2" />
          </div>
        )}

        {isError && <AlertError subject="Failed to retrieve usage data" error={error} />}

        {isSuccess && (
          <>
            {!usageMeta || usageMeta?.available_in_plan ? (
              <>
                {!projectRef && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <p className="text-sm">{attribute.name} usage</p>
                        {showUsageWarning && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {usageRatio >= 1 ? (
                                <div className="flex items-center space-x-2 min-w-[115px] cursor-help">
                                  <AlertTriangle
                                    size={14}
                                    strokeWidth={2}
                                    className={exceededLimitStyle}
                                  />
                                  <p className={`text-sm ${exceededLimitStyle}`}>Exceeded limit</p>
                                </div>
                              ) : (
                                usageRatio >= USAGE_APPROACHING_THRESHOLD && (
                                  <div className="flex items-center space-x-2 min-w-[115px] cursor-help">
                                    <AlertTriangle
                                      size={14}
                                      strokeWidth={2}
                                      className="text-amber-900"
                                    />
                                    <p className="text-sm text-amber-900">Approaching limit</p>
                                  </div>
                                )
                              )}
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>
                                Exceeding your plans included usage will lead to restrictions to
                                your project.
                              </p>
                              <p>
                                Upgrade to a usage-based plan or disable the spend cap to avoid
                                restrictions.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    {currentBillingCycleSelected && usageMeta && !usageMeta.unlimited && (
                      <SparkBar
                        type="horizontal"
                        barClass={cn(
                          usageRatio >= 1
                            ? usageBasedBilling
                              ? 'bg-foreground-light'
                              : 'bg-red-900'
                            : usageBasedBilling === false &&
                                usageRatio >= USAGE_APPROACHING_THRESHOLD
                              ? 'bg-amber-900'
                              : 'bg-foreground-light'
                        )}
                        bgClass="bg-surface-300"
                        value={usageMeta?.usage ?? 0}
                        max={usageMeta?.pricing_free_units || 1}
                      />
                    )}

                    <div>
                      {usageMeta && (
                        <div className="flex items-center justify-between border-b py-1">
                          <p className="text-xs text-foreground-light">
                            Included in {subscription?.plan?.name} Plan
                          </p>
                          {usageMeta.unlimited ? (
                            <p className="text-xs">Unlimited</p>
                          ) : (
                            <p className="text-xs">
                              {attribute.unit === 'bytes' || attribute.unit === 'gigabytes'
                                ? `${usageMeta.pricing_free_units ?? 0} GB`
                                : (usageMeta.pricing_free_units ?? 0).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                      {currentBillingCycleSelected && usageMeta && (
                        <div className="flex items-center justify-between py-1">
                          <p className="text-xs text-foreground-light">
                            {attribute.chartPrefix || 'Used '} in period
                          </p>
                          <p className="text-xs">
                            {attribute.unit === 'bytes' || attribute.unit === 'gigabytes'
                              ? `${(usageMeta?.usage ?? 0).toFixed(2)} GB`
                              : (usageMeta?.usage ?? 0).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {currentBillingCycleSelected && (usageMeta?.pricing_free_units ?? 0) > 0 && (
                        <div className="flex items-center justify-between border-t py-1">
                          <p className="text-xs text-foreground-light">Overage in period</p>
                          <p className="text-xs">
                            {(usageMeta?.pricing_free_units ?? 0) === -1 || usageExcess < 0
                              ? `0${attribute.unit === 'bytes' || attribute.unit === 'gigabytes' ? ' GB' : ''}`
                              : attribute.unit === 'bytes' || attribute.unit === 'gigabytes'
                                ? `${usageExcess.toFixed(2)} GB`
                                : usageExcess.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {attribute.additionalInfo?.(usage)}

                <div className="space-y-1">
                  <p className="text-sm">
                    {attribute.chartPrefix || ''} {attribute.name}{' '}
                    {attribute.chartSuffix || 'per day'}
                  </p>
                  {attribute.chartDescription.split('\n').map((paragraph, idx) => (
                    <p key={`para-${idx}`} className="text-sm text-foreground-light">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {chartMeta[attribute.key].isLoading ? (
                  <div className="space-y-2">
                    <ShimmeringLoader />
                    <ShimmeringLoader className="w-3/4" />
                    <ShimmeringLoader className="w-1/2" />
                  </div>
                ) : chartData.length > 0 && notAllValuesZero ? (
                  <UsageBarChart
                    name={`${attribute.chartPrefix || ''} ${attribute.name}`}
                    unit={attribute.unit}
                    attributes={attribute.attributes}
                    data={chartData}
                    yLeftMargin={chartMeta[attribute.key].margin}
                    yFormatter={(value) => ChartYFormatterCompactNumber(value, attribute.unit)}
                    tooltipFormatter={(value) => ChartTooltipValueFormatter(value, attribute.unit)}
                  />
                ) : (
                  <Panel>
                    <Panel.Content>
                      <div className="flex flex-col items-center justify-center">
                        <BarChart2 className="text-foreground-light mb-2" />
                        <p className="text-sm">No data in period</p>
                        <p className="text-sm text-foreground-light">
                          May take up to 24 hours to show
                        </p>
                      </div>
                    </Panel.Content>
                  </Panel>
                )}
              </>
            ) : (
              <Panel>
                <Panel.Content>
                  <div className="flex w-full items-center flex-col justify-center space-y-2 md:flex-row md:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm">Not included in plan</p>
                      <div>
                        <p className="text-sm text-foreground-light">
                          You need to be on a higher plan in order to use this feature.
                        </p>
                      </div>
                    </div>

                    <Button type="primary" asChild>
                      <Link href={upgradeUrl}>Upgrade plan</Link>
                    </Button>
                  </div>
                </Panel.Content>
              </Panel>
            )}
          </>
        )}
      </SectionContent>
    </div>
  )
}

export default AttributeUsage
