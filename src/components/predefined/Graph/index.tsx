// ============================================================================
// Graph Component (Using Apache ECharts)
// ============================================================================

// Graph component content changes
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// Removed static import * as echarts from 'echarts';

type ChartType = 'line' | 'bar' | 'pie' | 'area';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface GraphProps {
  chartType?: ChartType;
  data?: DataPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  animated?: boolean;
  theme?: 'light' | 'dark';
  height?: number;
  dataSource?: {
    query: Record<string, unknown>;
    schema: Record<string, unknown>;
  };
  componentId?: string;
}

const Graph: React.FC<GraphProps> = ({
  // ... props
  chartType = 'line',
  data = [],
  title,
  xAxisLabel,
  yAxisLabel,
  showLegend = true,
  animated = true,
  theme = 'light',
  height = 300,
}) => {
  const { t } = useTranslation('components');
  const chartRef = useRef<HTMLDivElement>(null);
  // Type as any or specific EChartsType if available globally, but simple reference is enough
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstance = useRef<any>(null);

  // ... (options memoization remains the same, but we need EChartsOption type.
  // Since we remove import, we might need 'any' or import type only.)
  // Actually, let's keep `import type { EChartsOption } from 'echarts';` if possible,
  // or just use `any` for options to strictly avoid runtime bundle inclusion.

  // Let's use `import type` to be safe for types, but no value import.

  const options = useMemo(() => {
    // ... options logic (same as before)
    const colors = [
      'var(--color-primary)',
      'var(--color-secondary)',
      'var(--color-accent)',
      '#F59E0B',
      '#EF4444',
      '#EC4899',
    ];

    const baseOptions = {
      // ...
      animation: animated,
      animationDuration: 500,
      tooltip: {
        trigger: chartType === 'pie' ? 'item' : 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
        },
      },
      legend: showLegend
        ? {
          bottom: 0,
          textStyle: {
            color: theme === 'dark' ? '#e2e8f0' : '#475569',
          },
        }
        : undefined,
      title: title
        ? {
          text: title,
          left: 'center',
          textStyle: {
            color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
            fontSize: 16,
            fontWeight: 600,
          },
        }
        : undefined,
    };

    if (chartType === 'pie') {
      return {
        ...baseOptions,
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: data.map((d: any, i: number) => ({
              name: d.name,
              value: d.value,
              itemStyle: {
                color: d.color || colors[i % colors.length],
              },
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            label: {
              show: true,
              formatter: '{b}: {d}%',
            },
            labelLine: {
              show: true,
            },
          },
        ],
      };
    }

    return {
      ...baseOptions,
      grid: {
        left: '3%',
        right: '4%',
        bottom: showLegend ? '15%' : '10%',
        top: title ? '15%' : '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data.map((d: any) => d.name),
        name: xAxisLabel,
        axisLine: {
          lineStyle: {
            color: theme === 'dark' ? '#475569' : '#e2e8f0',
          },
        },
        axisLabel: {
          color: theme === 'dark' ? '#94a3b8' : '#64748b',
        },
      },
      yAxis: {
        type: 'value',
        name: yAxisLabel,
        axisLine: {
          lineStyle: {
            color: theme === 'dark' ? '#475569' : '#e2e8f0',
          },
        },
        axisLabel: {
          color: theme === 'dark' ? '#94a3b8' : '#64748b',
        },
        splitLine: {
          lineStyle: {
            color: theme === 'dark' ? '#334155' : '#f1f5f9',
          },
        },
      },
      series: [
        {
          type: chartType === 'area' ? 'line' : chartType,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: data.map((d: any) => d.value),
          smooth: chartType === 'line' || chartType === 'area',
          areaStyle: chartType === 'area' ? { opacity: 0.3 } : undefined,
          itemStyle: {
            color: colors[0],
            borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : undefined,
          },
          emphasis: {
            focus: 'series',
          },
        },
      ],
    };
  }, [chartType, data, title, xAxisLabel, yAxisLabel, showLegend, animated, theme]);

  useEffect(() => {
    if (!chartRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let echartsLib: any;

    const initChart = async () => {
      // Dynamic import
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      echartsLib = await import('echarts');

      if (!chartRef.current) return;

      if (!chartInstance.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chartInstance.current = echartsLib.init(chartRef.current);
      }

      if (!chartInstance.current.isDisposed()) {
        chartInstance.current.setOption(options);
      }
    };

    initChart();

    const handleResize = () => {
      if (chartInstance.current && !chartInstance.current.isDisposed()) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current && !chartInstance.current.isDisposed()) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [options]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xs border border-(--color-border) bg-(--color-surface)"
        style={{ height }}
      >
        <p className="text-sm text-(--color-text-muted)">
          {t('graph.noData')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xs border border-(--color-border) bg-(--color-surface) p-4">
      <div ref={chartRef} style={{ width: '100%', height }} />
    </div>
  );
};

export default Graph;
