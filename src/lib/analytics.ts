// ===========================================
// FILE: src/lib/analytics.ts
// PURPOSE: Analytics utility functions for cost and usage calculations
// PRD REFERENCE: PRD Section 7 - Analytics & Reporting
// USED BY: Analytics API routes, dashboard components
// ===========================================

/**
 * Application data for GPM-weighted calculations
 */
interface ApplicationData {
  id: string;
  gpm: number; // Gallons per minute from injector
  packages: Array<{
    packageId: string;
    packageName: string;
    carCount: number;
  }>;
}

/**
 * Chemical usage data from visit logs
 */
interface ChemicalUsageData {
  chemicalId: string;
  chemicalName: string;
  chemicalType: string;
  costPerGallon: number;
  totalUsageGallons: number;
  applications: ApplicationData[];
}

/**
 * Package cost allocation result
 */
interface PackageCostAllocation {
  packageId: string;
  packageName: string;
  carCount: number;
  totalCost: number;
  costPerCar: number;
  chemicalBreakdown: Array<{
    chemicalId: string;
    chemicalName: string;
    gallonsUsed: number;
    cost: number;
    costPerCar: number;
  }>;
}

/**
 * Calculate GPM-weighted cost allocation across packages
 *
 * WHY: When a chemical is used by multiple applications at different GPM rates,
 * we need to allocate the total usage proportionally based on work done.
 *
 * PRD REFERENCE: Implementation Guide - "GPM-Weighted Cost Allocation"
 *
 * ALGORITHM:
 * 1. Calculate work for each application: Work = GPM × Cars
 * 2. Sum total work across all applications
 * 3. Allocate usage to each application: AppGallons = TotalUsage × (AppWork / TotalWork)
 * 4. Further split to packages by their car count ratio
 *
 * @param chemicalData - Chemical with usage and application data
 * @returns Package cost allocations
 */
export function calculateGpmWeightedCosts(
  chemicalData: ChemicalUsageData
): PackageCostAllocation[] {
  const packageMap = new Map<string, PackageCostAllocation>();

  // Calculate total work across all applications
  let totalWork = 0;
  for (const app of chemicalData.applications) {
    const appCarCount = app.packages.reduce((sum, pkg) => sum + pkg.carCount, 0);
    const work = app.gpm * appCarCount;
    totalWork += work;
  }

  // If no work done, return empty allocations
  if (totalWork === 0) {
    return [];
  }

  // Allocate usage to each application based on work ratio
  for (const app of chemicalData.applications) {
    const appCarCount = app.packages.reduce((sum, pkg) => sum + pkg.carCount, 0);
    if (appCarCount === 0) continue;

    const work = app.gpm * appCarCount;
    const workRatio = work / totalWork;
    const appGallons = chemicalData.totalUsageGallons * workRatio;
    const appCost = appGallons * chemicalData.costPerGallon;

    // Further allocate to each package within the application
    for (const pkg of app.packages) {
      if (pkg.carCount === 0) continue;

      const pkgRatio = pkg.carCount / appCarCount;
      const pkgGallons = appGallons * pkgRatio;
      const pkgCost = appCost * pkgRatio;
      const costPerCar = pkgCost / pkg.carCount;

      // Get or create package allocation
      let allocation = packageMap.get(pkg.packageId);
      if (!allocation) {
        allocation = {
          packageId: pkg.packageId,
          packageName: pkg.packageName,
          carCount: pkg.carCount,
          totalCost: 0,
          costPerCar: 0,
          chemicalBreakdown: [],
        };
        packageMap.set(pkg.packageId, allocation);
      }

      // Add chemical cost to package
      allocation.totalCost += pkgCost;
      allocation.chemicalBreakdown.push({
        chemicalId: chemicalData.chemicalId,
        chemicalName: chemicalData.chemicalName,
        gallonsUsed: pkgGallons,
        cost: pkgCost,
        costPerCar: costPerCar,
      });
    }
  }

  // Calculate final cost per car for each package
  for (const allocation of packageMap.values()) {
    allocation.costPerCar = allocation.carCount > 0
      ? allocation.totalCost / allocation.carCount
      : 0;
  }

  return Array.from(packageMap.values());
}

/**
 * Calculate simple cost per car (non-weighted)
 *
 * WHY: Simpler calculation when GPM weighting isn't needed
 *
 * @param totalCost - Total chemical cost
 * @param carCount - Number of cars washed
 * @returns Cost per car
 */
export function calculateCostPerCar(totalCost: number, carCount: number): number {
  if (carCount === 0) return 0;
  return totalCost / carCount;
}

/**
 * Calculate usage between two visits
 *
 * WHY: Determine how much chemical was used between visits
 *
 * @param previousOnHand - Previous total on hand gallons
 * @param currentOnHand - Current total on hand gallons
 * @param deliveryGallons - Gallons delivered between visits
 * @returns Usage in gallons
 */
export function calculateUsageBetweenVisits(
  previousOnHand: number,
  currentOnHand: number,
  deliveryGallons: number = 0
): number {
  // Usage = Previous + Delivery - Current
  const usage = previousOnHand + deliveryGallons - currentOnHand;
  return Math.max(0, usage); // Can't have negative usage
}

/**
 * Calculate average daily usage
 *
 * WHY: Project when chemical will run out
 *
 * @param totalUsage - Total gallons used
 * @param daysBetween - Number of days in period
 * @returns Average daily usage in gallons
 */
export function calculateDailyUsage(totalUsage: number, daysBetween: number): number {
  if (daysBetween === 0) return 0;
  return totalUsage / daysBetween;
}

/**
 * Calculate days until empty
 *
 * WHY: Alert users before chemical runs out
 *
 * @param currentOnHand - Current gallons on hand
 * @param dailyUsage - Average daily usage
 * @returns Estimated days until empty
 */
export function calculateDaysUntilEmpty(
  currentOnHand: number,
  dailyUsage: number
): number {
  if (dailyUsage === 0) return Infinity;
  return Math.floor(currentOnHand / dailyUsage);
}

/**
 * Aggregate chemical usage by period
 *
 * WHY: Create usage trend data for charts
 *
 * @param entries - Array of usage entries with dates
 * @param period - Aggregation period ('day' | 'week' | 'month')
 * @returns Aggregated usage by period
 */
export function aggregateUsageByPeriod(
  entries: Array<{ date: Date; usage: number }>,
  period: 'day' | 'week' | 'month'
): Array<{ periodStart: Date; periodEnd: Date; totalUsage: number }> {
  if (entries.length === 0) return [];

  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  const result: Array<{ periodStart: Date; periodEnd: Date; totalUsage: number }> = [];

  let currentPeriodStart = getPeriodStart(sorted[0].date, period);
  let currentPeriodEnd = getPeriodEnd(currentPeriodStart, period);
  let currentTotal = 0;

  for (const entry of sorted) {
    if (entry.date > currentPeriodEnd) {
      // Save current period and start new one
      result.push({
        periodStart: currentPeriodStart,
        periodEnd: currentPeriodEnd,
        totalUsage: currentTotal,
      });

      currentPeriodStart = getPeriodStart(entry.date, period);
      currentPeriodEnd = getPeriodEnd(currentPeriodStart, period);
      currentTotal = 0;
    }
    currentTotal += entry.usage;
  }

  // Add final period
  result.push({
    periodStart: currentPeriodStart,
    periodEnd: currentPeriodEnd,
    totalUsage: currentTotal,
  });

  return result;
}

/**
 * Get period start date
 */
function getPeriodStart(date: Date, period: 'day' | 'week' | 'month'): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  switch (period) {
    case 'day':
      return result;
    case 'week':
      const day = result.getDay();
      result.setDate(result.getDate() - day);
      return result;
    case 'month':
      result.setDate(1);
      return result;
  }
}

/**
 * Get period end date
 */
function getPeriodEnd(periodStart: Date, period: 'day' | 'week' | 'month'): Date {
  const result = new Date(periodStart);

  switch (period) {
    case 'day':
      result.setDate(result.getDate() + 1);
      break;
    case 'week':
      result.setDate(result.getDate() + 7);
      break;
    case 'month':
      result.setMonth(result.getMonth() + 1);
      break;
  }

  result.setMilliseconds(result.getMilliseconds() - 1);
  return result;
}

/**
 * Calculate percentage change between two values
 *
 * WHY: Show trend direction in analytics
 *
 * @param previous - Previous value
 * @param current - Current value
 * @returns Percentage change (positive = increase, negative = decrease)
 */
export function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Format a number for analytics display
 *
 * @param value - Number to format
 * @param decimals - Decimal places (default 2)
 * @returns Formatted string with appropriate suffix (K, M, etc.)
 */
export function formatAnalyticsNumber(value: number, decimals: number = 2): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(decimals) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(decimals) + 'K';
  }
  return value.toFixed(decimals);
}
