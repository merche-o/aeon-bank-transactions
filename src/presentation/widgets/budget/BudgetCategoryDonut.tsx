import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

export type BudgetDonutSlice = {
  category: string;
  total: number;
  percent: number;
  color: string;
};

export type BudgetCategoryDonutProps = {
  slices: BudgetDonutSlice[];
  centerLabel?: string;
};

const SIZE = 168;
const OUTER_R = 72;
const INNER_R = 48;
const CX = SIZE / 2;
const CY = SIZE / 2;

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function describeDonutSlice(
  startAngle: number,
  endAngle: number,
  outerR: number,
  innerR: number,
): string {
  if (endAngle - startAngle >= 359.99) {
    endAngle = startAngle + 359.99;
  }
  const outerStart = polarToCartesian(CX, CY, outerR, startAngle);
  const outerEnd = polarToCartesian(CX, CY, outerR, endAngle);
  const innerStart = polarToCartesian(CX, CY, innerR, endAngle);
  const innerEnd = polarToCartesian(CX, CY, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

export function BudgetCategoryDonut({ slices, centerLabel }: BudgetCategoryDonutProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const hasData = slices.length > 0 && slices.some((s) => s.percent > 0);

  let cursor = 0;
  const paths = hasData
    ? slices.map((slice) => {
        const start = cursor;
        const sweep = (slice.percent / 100) * 360;
        cursor += sweep;
        return {
          category: slice.category,
          d: describeDonutSlice(start, start + sweep, OUTER_R, INNER_R),
          color: slice.color,
        };
      })
    : [];

  return (
    <View style={styles.wrapper} testID="budget-donut">
      <Svg height={SIZE} width={SIZE}>
        <G>
          {hasData ? (
            paths.map((p) => (
              <Path d={p.d} fill={p.color} key={p.category} stroke={colors.surface} strokeWidth={1} />
            ))
          ) : (
            <Circle
              cx={CX}
              cy={CY}
              fill="transparent"
              r={(OUTER_R + INNER_R) / 2}
              stroke={colors.borderSubtle}
              strokeWidth={OUTER_R - INNER_R}
            />
          )}
        </G>
      </Svg>
      {centerLabel ? (
        <View pointerEvents="none" style={styles.centerLabel}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              paddingHorizontal: spacing.sm,
              textAlign: 'center',
            }}
          >
            {centerLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centerLabel: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
