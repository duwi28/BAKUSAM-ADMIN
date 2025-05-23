import { Driver, Order, InsertOrderAssignment, InsertDriverPriorityLog } from "../shared/schema";

interface DriverWithDistance extends Driver {
  distance: number; // Distance from pickup point in km
  isAvailable: boolean;
}

interface PriorityFactors {
  baseScore: number;
  priorityLevelBonus: number;
  advertisingBonus: number;
  ratingBonus: number;
  availabilityBonus: number;
  proximityBonus: number;
  recentActivityPenalty: number;
  rejectPenalty: number;
}

export class DriverPrioritySystem {
  /**
   * Calculate comprehensive priority score for a driver
   * Higher score = higher priority for order assignment
   */
  static calculatePriorityScore(driver: DriverWithDistance, order: Order): PriorityFactors {
    const factors: PriorityFactors = {
      baseScore: 0,
      priorityLevelBonus: 0,
      advertisingBonus: 0,
      ratingBonus: 0,
      availabilityBonus: 0,
      proximityBonus: 0,
      recentActivityPenalty: 0,
      rejectPenalty: 0
    };

    // 1. Priority Level Bonus (50 points untuk priority driver)
    if (driver.priorityLevel === "priority") {
      factors.priorityLevelBonus = 50;
    }

    // 2. Advertising Bonus (30 points untuk driver yang pasang iklan)
    if (driver.isAdvertising) {
      factors.advertisingBonus = 30;
    }

    // 3. Rating Bonus (max 25 points)
    const driverRating = parseFloat(driver.rating || "0");
    if (driverRating >= 4.9) {
      factors.ratingBonus = 25;
    } else if (driverRating >= 4.7) {
      factors.ratingBonus = 20;
    } else if (driverRating >= 4.5) {
      factors.ratingBonus = 15;
    } else if (driverRating >= 4.0) {
      factors.ratingBonus = 10;
    }

    // 4. Availability Bonus (20 points untuk driver yang sedang bebas)
    if (driver.isAvailable) {
      factors.availabilityBonus = 20;
    }

    // 5. Proximity Bonus (max 20 points, semakin dekat semakin tinggi)
    const maxDistance = 10; // km
    if (driver.distance <= maxDistance) {
      factors.proximityBonus = Math.max(0, 20 - (driver.distance * 2));
    }

    // 6. Recent Activity Penalty (driver yang baru dapat order dikurangi prioritas)
    const lastOrderHours = driver.lastOrderDate 
      ? (Date.now() - new Date(driver.lastOrderDate).getTime()) / (1000 * 60 * 60)
      : 24;
    
    if (lastOrderHours < 1) {
      factors.recentActivityPenalty = -15;
    } else if (lastOrderHours < 3) {
      factors.recentActivityPenalty = -10;
    }

    // 7. Consecutive Reject Penalty
    factors.rejectPenalty = -(driver.consecutiveRejects || 0) * 5;

    // Calculate total score
    factors.baseScore = 
      factors.priorityLevelBonus +
      factors.advertisingBonus +
      factors.ratingBonus +
      factors.availabilityBonus +
      factors.proximityBonus +
      factors.recentActivityPenalty +
      factors.rejectPenalty;

    return factors;
  }

  /**
   * Get ranked list of drivers for order assignment
   * Implements Maxim-style priority system
   */
  static rankDriversForOrder(drivers: DriverWithDistance[], order: Order): Array<{
    driver: DriverWithDistance;
    priorityScore: number;
    factors: PriorityFactors;
    assignmentReason: string;
  }> {
    const rankedDrivers = drivers
      .filter(driver => 
        driver.status === "active" && 
        driver.vehicleType === this.getRequiredVehicleType(order) &&
        driver.distance <= 15 // Max 15km radius
      )
      .map(driver => {
        const factors = this.calculatePriorityScore(driver, order);
        const assignmentReason = this.getAssignmentReason(factors);
        
        return {
          driver,
          priorityScore: factors.baseScore,
          factors,
          assignmentReason
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);

    return rankedDrivers;
  }

  /**
   * Implement Maxim-style assignment logic:
   * 1. Priority drivers first
   * 2. Then inactive/free drivers  
   * 3. Then advertising drivers
   * 4. Finally by rating & trip count
   */
  static getOptimalDriverAssignment(drivers: DriverWithDistance[], order: Order): Array<{
    driver: DriverWithDistance;
    priorityScore: number;
    factors: PriorityFactors;
    assignmentReason: string;
  }> {
    const rankedDrivers = this.rankDriversForOrder(drivers, order);

    // Group by priority categories
    const priorityDrivers = rankedDrivers.filter(d => d.driver.priorityLevel === "priority");
    const advertisingDrivers = rankedDrivers.filter(d => d.driver.isAdvertising && d.driver.priorityLevel !== "priority");
    const availableDrivers = rankedDrivers.filter(d => d.driver.isAvailable && !d.driver.isAdvertising && d.driver.priorityLevel !== "priority");
    const otherDrivers = rankedDrivers.filter(d => !d.driver.isAvailable && !d.driver.isAdvertising && d.driver.priorityLevel !== "priority");

    // Return in Maxim priority order
    return [
      ...priorityDrivers,
      ...availableDrivers,
      ...advertisingDrivers,
      ...otherDrivers
    ];
  }

  /**
   * Auto-upgrade driver to priority based on performance
   */
  static shouldUpgradeToPriority(driver: Driver): { shouldUpgrade: boolean; reason: string } {
    const rating = parseFloat(driver.rating || "0");
    const totalOrders = driver.totalOrders || 0;
    const completionRate = driver.completionRate || 100;

    // Criteria for priority upgrade
    if (rating >= 4.9 && totalOrders >= 100 && completionRate >= 95) {
      return {
        shouldUpgrade: true,
        reason: "rating_and_trips_excellence"
      };
    }

    if (rating >= 4.8 && totalOrders >= 200 && completionRate >= 98) {
      return {
        shouldUpgrade: true,
        reason: "volume_and_quality"
      };
    }

    return {
      shouldUpgrade: false,
      reason: "criteria_not_met"
    };
  }

  /**
   * Generate assignment reason based on priority factors
   */
  private static getAssignmentReason(factors: PriorityFactors): string {
    if (factors.priorityLevelBonus > 0) return "priority_driver";
    if (factors.advertisingBonus > 0) return "advertising_driver";
    if (factors.availabilityBonus > 0) return "available_driver";
    if (factors.ratingBonus >= 20) return "high_rating";
    return "proximity_based";
  }

  /**
   * Determine required vehicle type for order
   */
  private static getRequiredVehicleType(order: Order): string {
    // Logic to determine vehicle type based on order characteristics
    // For now, default to motor, but can be enhanced with order size, distance, etc.
    const distance = parseFloat(order.distance || "0");
    
    if (distance > 20) return "pickup";
    if (distance > 10) return "mobil";
    return "motor";
  }

  /**
   * Update driver priority score in real-time
   */
  static updateDriverPriorityScore(driver: Driver): number {
    const rating = parseFloat(driver.rating || "0");
    const totalOrders = driver.totalOrders || 0;
    const completionRate = driver.completionRate || 100;
    const consecutiveRejects = driver.consecutiveRejects || 0;

    let score = 0;

    // Base score from rating (0-40 points)
    score += rating * 8;

    // Trip volume bonus (0-20 points)
    if (totalOrders >= 500) score += 20;
    else if (totalOrders >= 200) score += 15;
    else if (totalOrders >= 100) score += 10;
    else if (totalOrders >= 50) score += 5;

    // Completion rate bonus (0-20 points)
    score += (completionRate - 80) / 5;

    // Reject penalty
    score -= consecutiveRejects * 2;

    // Advertising bonus
    if (driver.isAdvertising) score += 15;

    // Priority level bonus
    if (driver.priorityLevel === "priority") score += 25;

    return Math.max(0, Math.min(100, score));
  }
}

export default DriverPrioritySystem;